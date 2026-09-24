"""
Image search service — orchestrates the visual product search pipeline.

Pipeline:
  User image (≤10MB)
    → Resize/compress to ≤500KB
    → SerpApi Image API → image_id
    → Google Lens (type=products) → candidates
"""

import hashlib
import logging
from pathlib import Path
from io import BytesIO
from PIL import Image
from app.config import settings
from app.providers.serpapi import serpapi
from app.providers.amazon import amazon_provider

logger = logging.getLogger(__name__)


def compute_image_hash(image_path: str) -> str:
    """SHA-256 hash of the image file for caching."""
    sha256 = hashlib.sha256()
    with open(image_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def compress_image_for_serpapi(image_path: str) -> str:
    """
    Resize/compress image to ≤500KB for SerpApi Image API.
    Returns path to the compressed image.
    """
    max_bytes = settings.SERPAPI_MAX_IMAGE_KB * 1024  # 500KB
    file_size = Path(image_path).stat().st_size

    if file_size <= max_bytes:
        return image_path

    logger.info(f"Compressing image from {file_size/1024:.0f}KB to ≤{settings.SERPAPI_MAX_IMAGE_KB}KB")

    img = Image.open(image_path)

    # Convert RGBA to RGB if needed
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGB")

    # Progressively reduce quality and size
    compressed_path = str(Path(image_path).parent / f"compressed_{Path(image_path).name}")

    # Start with quality reduction
    for quality in [85, 75, 60, 45, 30]:
        buf = BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True)
        if buf.tell() <= max_bytes:
            with open(compressed_path, "wb") as f:
                f.write(buf.getvalue())
            logger.info(f"Compressed to {buf.tell()/1024:.0f}KB at quality={quality}")
            return compressed_path

    # If still too large, resize dimensions
    width, height = img.size
    for scale in [0.75, 0.5, 0.35, 0.25]:
        new_w, new_h = int(width * scale), int(height * scale)
        resized = img.resize((new_w, new_h), Image.LANCZOS)
        buf = BytesIO()
        resized.save(buf, format="JPEG", quality=60, optimize=True)
        if buf.tell() <= max_bytes:
            with open(compressed_path, "wb") as f:
                f.write(buf.getvalue())
            logger.info(f"Resized to {new_w}x{new_h}, {buf.tell()/1024:.0f}KB")
            return compressed_path

    # Last resort: very small
    resized = img.resize((400, 300), Image.LANCZOS)
    buf = BytesIO()
    resized.save(buf, format="JPEG", quality=40, optimize=True)
    with open(compressed_path, "wb") as f:
        f.write(buf.getvalue())
    logger.warning(f"Aggressively compressed to {buf.tell()/1024:.0f}KB")
    return compressed_path


async def visual_product_search(image_path: str) -> dict:
    """
    Full visual search pipeline:
    1. Compress image to ≤500KB
    2. Upload to SerpApi Image API
    3. Run Google Lens product search
    4. Parse and enrich candidates

    Returns:
        {
            "image_hash": str,
            "image_id": str,
            "candidates": list[dict],
            "raw_response": dict,
        }
    """
    # Step 1: Hash for caching
    image_hash = compute_image_hash(image_path)
    logger.info(f"Image hash: {image_hash[:16]}...")

    # Step 2: Compress for SerpApi
    compressed_path = compress_image_for_serpapi(image_path)

    # Step 3: Upload to SerpApi Image API
    image_id = await serpapi.upload_image(compressed_path)

    # Step 4: Google Lens visual product search
    lens_data = await serpapi.google_lens_search(image_id)

    # Step 5: Parse candidates
    candidates = serpapi.parse_lens_candidates(lens_data)

    # Step 6: Enrich with Amazon data
    for candidate in candidates:
        amazon_provider.enrich_candidate(candidate)

    logger.info(f"Found {len(candidates)} product candidates")

    return {
        "image_hash": image_hash,
        "image_id": image_id,
        "candidates": candidates,
        "raw_response": lens_data,
    }
