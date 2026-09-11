"""Import every model so Base.metadata.create_all() / Alembic autogenerate sees them all."""
from app.models.category import Category  # noqa: F401
from app.models.order import Order, OrderItem  # noqa: F401
from app.models.product import Product  # noqa: F401
from app.models.user import User  # noqa: F401
