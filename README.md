# Da Baby Care — Storefront + Admin Panel

Full-stack e-commerce site for a baby occasion-wear store: a public storefront (Home, About, Products, individual Product pages, Cart) plus an authenticated Admin Panel (Categories, Products with image upload, Orders & Revenue dashboard).

**Stack:** FastAPI (Python) backend · React + TypeScript frontend · PostgreSQL database (`dababycare_db`) · Lucide icons throughout (no emoji/text icons anywhere)

---

## What it does

**Storefront (public):**
- Home page — hero, occasions, "why us", shop-by-category, featured products, testimonials, FAQ
- About page — brand story
- Products page — full catalogue with category filter + search
- Product detail page — every product gets its own page (`/products/:slug`), with quantity picker, add-to-cart, and a direct "Order on WhatsApp" link
- Cart — add/remove/adjust quantity, persisted in the browser, checkout form that logs the order to the backend **and** opens a pre-filled WhatsApp message

**Admin panel (authenticated):**
- Dashboard — total revenue, order counts, low-stock alerts, top-selling products by revenue
- Categories — create/edit/delete, each with a Lucide icon picker
- Products — create/edit/delete, **image upload** (drag-and-drop or click), stock, pricing, featured/active toggles
- Orders — view every order, update status (Pending → Confirmed → Shipped → Delivered / Cancelled)

**Revenue logic that's actually correct:**
- Order totals are always computed from line items — never entered manually
- Each order item **snapshots** the product's price at order time, so editing a product's price later never changes historical revenue
- Cancelled orders are excluded from revenue totals automatically

All of this is covered by automated backend tests.

---

## Project structure

```
dababycare/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── core/                 # config, database session, security (JWT/bcrypt)
│   │   ├── models/                 # SQLAlchemy models: User, Category, Product, Order, OrderItem
│   │   ├── schemas/                  # Pydantic request/response schemas
│   │   ├── api/routes/                 # auth, categories, products (+ image upload), orders, dashboard
│   │   ├── services/                     # slug generation, stock/revenue logic, image upload handling
│   │   └── constants.py                    # enums & fixed values (mirrored in frontend)
│   ├── uploads/products/         # uploaded product images (served at /uploads/products/...)
│   ├── alembic/                  # database migrations
│   ├── tests/                    # pytest suite (12 tests)
│   └── Dockerfile
├── frontend/                   # React + TypeScript (Vite)
│   ├── src/
│   │   ├── types/                 # global TypeScript types (mirrors backend schemas)
│   │   ├── constants/               # routes, icon registry (name → Lucide component), WhatsApp config
│   │   ├── api/                       # typed API client modules (incl. image upload)
│   │   ├── components/common/           # Button, Input, Select, Card, Table, Modal, Badge, ImageUpload, ProductImage, ProductCard...
│   │   ├── components/layout/             # public/ (Header, Footer, Layout) and admin/ (Sidebar, Header, Layout, ProtectedRoute)
│   │   ├── context/                         # AuthContext, CartContext (cart persisted to localStorage)
│   │   ├── pages/Public/                      # Home, About, Products, ProductDetail, Cart
│   │   ├── pages/Admin/                         # Login, Dashboard, Categories, Products, Orders
│   │   └── utils/                                 # currency/date formatting, image URL resolution, WhatsApp link builder
│   └── Dockerfile
└── docker-compose.yml           # postgres + backend + frontend, one command
```

---

## Quick start (Docker — recommended)

```bash
docker compose up --build
```

- Storefront: http://localhost:3000
- Admin panel: http://localhost:3000/admin/login
- Backend API docs (Swagger): http://localhost:8000/docs
- Postgres runs internally as database `dababycare_db`

Public sign-up (`POST /api/v1/auth/register`) only ever creates **customer** accounts. Create the first admin with:

```bash
cd backend && python seed_admin.py     # then change the password from /account → Password
```

Log in at `/admin/login`. Further admins/staff can be added from **Admin → Customers & Staff → Add staff**.

---

## Manual setup (without Docker)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                  # edit DATABASE_URL & SECRET_KEY
alembic upgrade head                                    # create tables via migration


```

API at `http://localhost:8000`, docs at `/docs`. Uploaded product images are served from `/uploads/products/...`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env      # set VITE_API_BASE_URL / VITE_UPLOADS_BASE_URL if backend isn't on localhost:8000
npm run dev
```

App at `http://localhost:5173`.

---

## Customer accounts

- `/signup`, `/login` — email + password, or **Continue with Google** (shown when `GOOGLE_CLIENT_ID` is set on the backend)
- `/account` — order history with a live Placed → Confirmed → Shipped → Delivered tracker, profile, password
- `/wishlist` — saved products (works for guests too, stored in the browser)
- Orders placed while signed in are linked to the account; checkout is pre-filled
- Roles: `CUSTOMER` (storefront only), `STAFF` (catalogue + orders), `ADMIN` (everything, incl. user management). Customers get `403` on every admin endpoint.

**Admin → Customers & Staff** lists every account with orders count and total spent, lets you deactivate/reactivate accounts, change roles, add staff, and view a customer's purchases.

---

## Email notifications (Gmail SMTP)

Set these in `backend/.env` locally **and** in the backend's Vercel project → Settings → Environment Variables:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=<store gmail address>
SMTP_PASSWORD=<16-character Gmail App Password>
FROM_EMAIL=<store gmail address>
FROM_NAME=OQIRA
ADMIN_EMAIL=<inbox that receives new-order alerts>
SITE_URL=https://okira.vercel.app
```

The App Password comes from Google Account → Security → 2-Step Verification → App passwords. Leave `SMTP_PASSWORD` empty to disable email (messages are logged instead).

| When | Customer gets | Store inbox gets |
|---|---|---|
| Order placed (COD) | Order received + summary | New-order alert |
| Order placed (bank transfer) | Payment instructions with bank details | New-order alert |
| Customer submits transfer | "Verifying your payment" | Verify-payment alert with ref + receipt |
| Admin confirms / rejects payment | Payment confirmed / action needed (with reason) | — |
| Status → Confirmed / Shipped / Delivered / Cancelled | Matching follow-up (delivered asks for a star rating) | — |
| New account | Welcome email | — |
| Stock crosses 5 / sells out | — | Low-stock alert |

Admins can **Send test email** from the dashboard, and re-send the right follow-up for any order with the **Email** button on the Orders page (e.g. a payment reminder). All templates live in `backend/app/services/email_service.py` — table-based, inline-styled HTML with a plain-text alternative.

---

## Running tests

**Backend** (12 tests — auth, category slugs, product visibility, order revenue math, price snapshotting):

```bash
cd backend
pytest
```

**Frontend** (formatting, image URL resolution, WhatsApp link building):

```bash
cd frontend
npm run test
```

---

## Icons

Every icon in this project — landing page, admin panel, product cards — is a [Lucide](https://lucide.dev) React component. There are no emoji or image-based icon fonts anywhere in the UI. Category icons are stored as a **string name** in the database (e.g. `"PartyPopper"`) and resolved to the actual component client-side via `frontend/src/constants/index.ts → resolveIcon()`, with a safe fallback (`Shirt`) if an unrecognized name is ever entered.

---

## Product images

- Admin uploads go through `POST /api/v1/products/{id}/image` (multipart/form-data), validated for type (JPEG/PNG/WEBP/GIF) and size (max 5MB)
- Stored under `backend/uploads/products/` and served statically at `/uploads/products/<filename>`
- The frontend's `ProductImage` component shows the uploaded photo everywhere a product appears (cards, detail page, cart, admin table) and gracefully falls back to a tinted icon placeholder if no image has been uploaded yet — never a broken image icon
- For production at scale, swap `backend/app/services/upload_service.py`'s local-disk implementation for S3/cloud storage — no route code needs to change

---

## Security notes

- Passwords hashed with bcrypt; JWT access tokens (60 min default) + refresh tokens
- Public routes (browsing, checkout) require no auth; all admin mutations (create/edit/delete categories & products, order status updates) require a valid JWT
- **Before production:** change `SECRET_KEY`, restrict `CORS_ORIGINS` to your real domain, put the API behind HTTPS, and consider rate-limiting the public `/orders` and `/auth/login` endpoints

---

## Database migrations (Alembic)

```bash
cd backend
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

The initial migration (`alembic/versions/0001_initial_schema.py`) covers all 6 tables: `users`, `categories`, `products`, `orders`, `order_items`.

After pulling the accounts/email update, run `alembic upgrade head` against the production database — `0005`–`0007` add Google sign-in fields, the `CUSTOMER` role, `orders.customer_email` and `users.phone`.
