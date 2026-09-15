"""
Vercel serverless entry point for the OKIRA FastAPI backend.

On Vercel, Python functions run from /var/task/.
The backend root is at /var/task/ when deployed with Root Directory = backend.
So `app.*` imports resolve directly without path manipulation.
"""
import os
import sys

# Ensure the directory containing this file's parent is on the path.
# When Vercel deploys from the `backend/` root, /var/task/ is already on sys.path,
# but we add it explicitly to be safe in all environments.
_backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)

from app.main import app  # noqa: E402

# Vercel's Python runtime looks for a symbol named `app` in this module.
__all__ = ["app"]
