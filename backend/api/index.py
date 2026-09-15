import sys
from pathlib import Path

# index.py is at backend/api/index.py
# app/main.py is at backend/app/main.py
# So we just need to add "backend/" (one level up from api/) to the path.
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.main import app  # noqa: E402