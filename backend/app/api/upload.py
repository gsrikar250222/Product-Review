"""
Main upload endpoint — the core pipeline.

POST /api/v1/products/analyze-image
  multipart/form-data: image=<file>

Pipeline:
  Image → validate → compress → SerpApi Image API → Google Lens
  → candidate ranking → product match → Immersive Product
  → review retrieval → LLM analysis → evidence validation
  → full intelligence report
"""

import os
import uuid
import hashlib
import logging
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.product import SearchRequest
from app.services.image_search import visual_product_search, compute_image_hash
from app.services.product_matcher import rank_candidates, extract_brand, extract_model
from app.services.product_service import create_or_update_product, fetch_product_details
from app.services.review_service import collect_reviews
from app.services.aggregation import aggregate_reviews
from app.services.llm_analysis import analyze_reviews_with_llm
from app.services.evidence import validate_evidence, build_evidence_map

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory cache for recent analyses
_cache = {}


def _validate_image(file: UploadFile):
    """Validate uploaded image file type and extension."""
    # Check content type
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Allowed: {settings.ALLOWED_IMAGE_TYPES}"
        )

    # Check extension
    ext = Path(file.filename or "").suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension: {ext}. Allowed: {settings.ALLOWED_EXTENSIONS}"
        )


@router.post("/analyze-image")
async def analyze_image(
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Main endpoint: Upload a product image → get full review intelligence report.

    Returns product info, review data, AI analysis with evidence links.
    """
    # 1. Validate file
    _validate_image(image)

    # 2. Read and check size
    content = await image.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File too large: {size_mb:.1f} MB. Maximum: {settings.MAX_FILE_SIZE_MB} MB"
        )

    # 3. Save to disk
    upload_dir = settings.ensure_upload_dir()
    file_ext = Path(image.filename or "image.jpg").suffix
    file_name = f"{uuid.uuid4().hex}{file_ext}"
    file_path = str(upload_dir / file_name)

    with open(file_path, "wb") as f:
        f.write(content)

    # 4. Compute hash for caching
    image_hash = hashlib.sha256(content).hexdigest()

    # Check cache
    if image_hash in _cache:
        logger.info(f"Cache hit for image {image_hash[:16]}")
        return _cache[image_hash]

    # 5. Create search request record
    search_req = SearchRequest(
        image_hash=image_hash,
        image_path=file_path,
        status="processing",
    )
    db.add(search_req)
    await db.flush()

    try:
        # 6. Visual product search (compress + SerpApi Image API + Google Lens)
        search_result = await visual_product_search(file_path)
        candidates = search_result["candidates"]

        if not candidates:
            search_req.status = "failed"
            search_req.error_message = "No products found"
            await db.flush()
            return {
                "status": "not_found",
                "message": "Unable to identify this product. Try uploading a clearer image showing the front and product name/model.",
                "product": None,
                "match": {"match_status": "not_found", "confidence": 0},
                "reviews": None,
                "analysis": None,
            }

        # 7. Rank candidates
        match = rank_candidates(candidates)

        # If not confident enough, return candidates for user selection
        if match.match_status == "not_found":
            search_req.status = "failed"
            search_req.error_message = "Low confidence match"
            await db.flush()
            return {
                "status": "not_found",
                "message": "Product identification is uncertain. Please upload a clearer image.",
                "product": None,
                "match": match.model_dump(),
                "reviews": None,
                "analysis": None,
            }

        if match.match_status == "ambiguous":
            return {
                "status": "ambiguous",
                "message": "We found several possible matches. Please select the correct product.",
                "product": None,
                "match": match.model_dump(),
                "candidates": [c.model_dump() for c in match.all_candidates],
                "reviews": None,
                "analysis": None,
            }

        # 8. Create/update product in database
        best = match.selected_candidate
        product = await create_or_update_product(
            db,
            name=match.product_name,
            brand=match.brand,
            model_name=match.model_name,
            image_url=best.thumbnail if best else "",
        )

        # 9. Fetch detailed product info (Immersive Product + Shopping)
        best_raw = candidates[0] if candidates else {}
        product_detail = await fetch_product_details(db, product, best_raw)

        # 10. Collect reviews
        reviews = await collect_reviews(
            db,
            product_id=product.id,
            product_name=product.name,
            brand=product.brand,
            candidates=candidates[:5],
        )

        # 11. Aggregate reviews
        aggregation = aggregate_reviews(
            reviews,
            product_rating=product_detail.rating,
            product_review_count=product_detail.review_count,
        )

        # 12. LLM analysis (only with real data)
        analysis = await analyze_reviews_with_llm(
            reviews,
            product_name=product.name,
            brand=product.brand,
        )

        # 13. Validate evidence
        analysis = validate_evidence(analysis, reviews)
        evidence_map = build_evidence_map(analysis)

        # 14. Build final response
        now = datetime.now(timezone.utc).isoformat()
        response = {
            "status": "success",
            "product": product_detail.model_dump(),
            "match": match.model_dump(),
            "sources": product_detail.sources,
            "reviews": {
                "aggregation": aggregation.model_dump(),
                "items": [r.model_dump() for r in reviews],
                "total": aggregation.total_reviews,
            },
            "analysis": analysis.model_dump(),
            "prices": [p.model_dump() for p in product_detail.prices],
            "evidence_map": evidence_map,
            "metadata": {
                "analyzed_at": now,
                "image_hash": image_hash,
                "search_id": search_req.id,
            },
        }

        # Update search request
        search_req.status = "completed"
        search_req.product_id = product.id
        search_req.completed_at = datetime.now(timezone.utc)
        await db.flush()

        # Cache result
        _cache[image_hash] = response

        return response

    except Exception as e:
        logger.error(f"Analysis pipeline failed: {e}", exc_info=True)
        search_req.status = "failed"
        search_req.error_message = str(e)
        await db.flush()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/select-candidate")
async def select_candidate(
    candidate_index: int,
    image_hash: str,
    db: AsyncSession = Depends(get_db),
):
    """
    User selects a specific candidate from an ambiguous match.
    Re-runs the pipeline with the selected candidate.
    """
    # This would be implemented to accept the user's choice
    # and re-run from step 8 onwards
    return {"status": "not_implemented", "message": "Candidate selection coming soon"}
