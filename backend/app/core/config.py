"""
Central application configuration. All environment-driven values live
here — nowhere else should call os.environ / os.getenv directly.
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "OQIRA API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/oqira_db"
    TEST_DATABASE_URL: str = "sqlite:///./test_oqira.db"

    SECRET_KEY: str = "insecure-dev-secret-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "https://okira-backend.vercel.app/api/v1/auth/google/callback"

    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    STORE_WHATSAPP_NUMBER_1: str = "923247508462"
    STORE_WHATSAPP_NUMBER_2: str = "923021735137"

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # SMTP — emails are skipped (logged) when username/password are empty.
    # Gmail: use an App Password (Google Account → Security → App passwords).
    # Port 587 uses STARTTLS; port 465 uses implicit SSL.
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_TIMEOUT_SECONDS: int = 20
    FROM_EMAIL: str = ""
    FROM_NAME: str = "OQIRA"
    ADMIN_EMAIL: str = ""

    # Public storefront — used for links and contact details inside emails.
    SITE_URL: str = "https://okira.vercel.app"
    SUPPORT_PHONE: str = "+92 324 7508462"

    # Bank transfer details shown at checkout and in emails.
    BANK_ACCOUNT_TITLE: str = "Muhammad Ahmad"
    BANK_NAME: str = "Mashriq Bank"
    BANK_ACCOUNT_NUMBER: str = "089010046367"
    BANK_IBAN: str = "PK45MSHQ0000089010046367"
    # Optional second account (leave BANK2_ACCOUNT_NUMBER empty to hide it).
    BANK2_ACCOUNT_TITLE: str = "Muhammad Daud"
    BANK2_NAME: str = "Meezan Bank"
    BANK2_ACCOUNT_NUMBER: str = "11560114539564"
    BANK2_IBAN: str = ""

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = ""

    @property
    def smtp_enabled(self) -> bool:
        return bool(self.SMTP_USERNAME and self.SMTP_PASSWORD)

    @property
    def smtp_password_clean(self) -> str:
        # Google shows app passwords as "abcd efgh ijkl mnop" — the spaces aren't part of it.
        return self.SMTP_PASSWORD.replace(" ", "")

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
