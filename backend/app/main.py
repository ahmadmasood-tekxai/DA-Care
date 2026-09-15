import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import auth, categories, dashboard, orders, products, chat
from app.core.config import settings
from app.core.database import Base, engine

logging.basicConfig(level=logging.INFO if not settings.DEBUG else logging.DEBUG)
logger = logging.getLogger("oqira")

UPLOAD_ROOT = Path(__file__).resolve().parent.parent / "uploads"
try:
    UPLOAD_ROOT.mkdir(exist_ok=True)
    (UPLOAD_ROOT / "products").mkdir(exist_ok=True)
    (UPLOAD_ROOT / "receipts").mkdir(exist_ok=True)
except OSError:
    # On Vercel serverless, filesystem is read-only — skip silently
    pass


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Quick local/dev bootstrapping. Use Alembic migrations in production.
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ensured (create_all).")
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for OQIRA — premium skin care, jewellery, apparel & baby essentials.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded product images — only works in non-serverless environments
try:
    if UPLOAD_ROOT.exists():
        app.mount("/uploads", StaticFiles(directory=str(UPLOAD_ROOT)), name="uploads")
except Exception:
    logger.warning("Uploads directory not available — static file serving disabled.")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = [{"field": ".".join(str(x) for x in e["loc"][1:]), "message": e["msg"]} for e in exc.errors()]
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content={"detail": "Validation failed", "errors": errors})


@app.get("/", tags=["Health"])
def root():
    return {"service": settings.APP_NAME, "status": "ok"}


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}


API_PREFIX = settings.API_V1_PREFIX
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(categories.router, prefix=API_PREFIX)
app.include_router(products.router, prefix=API_PREFIX)
app.include_router(orders.router, prefix=API_PREFIX)
app.include_router(dashboard.router, prefix=API_PREFIX)
app.include_router(chat.router, prefix=API_PREFIX)
