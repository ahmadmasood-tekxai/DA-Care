"""
Vercel serverless entry point for the FastAPI backend.
Vercel Python runtime calls this file — it imports the `app` object
and serves it as an ASGI application.
"""
import sys
import os

# Add the backend root to sys.path so `app.*` imports resolve
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app  # noqa: F401, E402 — re-exported for Vercel

# Vercel looks for a symbol named `app` in this file.
__all__ = ["app"]
