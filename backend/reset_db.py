from app.core.database import Base, engine
from app.models import *
from sqlalchemy import text

def reset_database():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS alembic_version;"))
        conn.commit()

    print("All tables (including alembic_version) dropped successfully.")
    print("You can now run 'alembic upgrade head' to recreate the tables and apply the latest migrations.")

if __name__ == "__main__":
    reset_database()
