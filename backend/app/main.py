"""
Product Review Intelligence — FastAPI Application.

Image → Real Product → Real Customer Reviews → Evidence-Based AI Summary
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pathlib import Path

from app.config import settings
from app.database import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("Starting Product Review Intelligence...")
    await init_db()
    settings.ensure_upload_dir()
    logger.info("Database initialized, upload directory ready.")

    # Log configuration (never log secrets)
    logger.info(f"SerpApi configured: {'YES' if settings.SERPAPI_API_KEY else 'NO'}")
    logger.info(f"HuggingFace configured: {'YES' if settings.HUGGINGFACE_API_KEY else 'NO'}")
    logger.info(f"Database: {settings.DATABASE_URL}")

    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="Product Review Intelligence",
    description="Image → Real Product → Real Customer Reviews → Evidence-Based AI Summary",
    version="1.0.0",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — allow frontend dev server and deployed origins
import os
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]
# Add any custom frontend URL set via environment variable
if os.getenv("FRONTEND_URL"):
    CORS_ORIGINS.append(os.getenv("FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploaded images
uploads_dir = Path(settings.UPLOAD_DIR)
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Import and include routers
from app.api.upload import router as upload_router
from app.api.products import router as products_router
from app.api.reviews import router as reviews_router
from app.api.analysis import router as analysis_router

app.include_router(upload_router, prefix="/api/v1/products", tags=["Upload & Analysis"])
app.include_router(products_router, prefix="/api/v1/products", tags=["Products"])
app.include_router(reviews_router, prefix="/api/v1/products", tags=["Reviews"])
app.include_router(analysis_router, prefix="/api/v1/products", tags=["Analysis"])


@app.get("/")
async def root():
    """Health check."""
    return {
        "name": "Product Review Intelligence",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/api/v1/health")
async def health():
    """API health check with configuration status."""
    return {
        "status": "healthy",
        "serpapi_configured": bool(settings.SERPAPI_API_KEY),
        "llm_configured": bool(settings.HUGGINGFACE_API_KEY),
        "database": "sqlite",
    }
