import asyncio
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password
from app.constants import UserRole

async def seed():
    print("Seeding database...")
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.username == "Admin").first()
        if admin:
            print("Admin user already exists. Updating password...")
            admin.hashed_password = hash_password("Admin@123")
            admin.role = UserRole.ADMIN
        else:
            print("Creating Admin user...")
            admin = User(
                username="Admin",
                email="admin@example.com",
                hashed_password=hash_password("Admin@123"),
                full_name="System Admin",
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)
        db.commit()
        print("✅ Admin user seeded successfully! Username: Admin | Password: Admin@123")
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(seed())
