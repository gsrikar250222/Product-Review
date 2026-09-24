"""
Review service — retrieval, normalization, and deduplication.

Never modifies original review text.
Uses content_hash for deduplication.
"""

import hashlib
import logging
import uuid
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.review import Review
from app.schemas.review import ReviewItem
from app.providers.serpapi import serpapi

logger = logging.getLogger(__name__)


def compute_content_hash(content: str, source: str = "") -> str:
    """SHA-256 hash of review content for deduplication."""
    text = f"{source}:{content}".strip().lower()
    return hashlib.sha256(text.encode()).hexdigest()


def normalize_review(raw: dict, source: str, product_id: int) -> ReviewItem:
    """
    Normalize a raw review from any source into our standard schema.
    NEVER modifies the original review text.
    """
    content = raw.get("content", raw.get("snippet", raw.get("text", "")))
    title = raw.get("title", raw.get("headline", ""))
    rating = raw.get("rating")
    if rating is not None:
        try:
            rating = float(rating)
        except (ValueError, TypeError):
            rating = None

    date_str = raw.get("date", raw.get("review_date", raw.get("published_date", "")))
    review_id = raw.get("id", raw.get("review_id", str(uuid.uuid4())[:8]))

    return ReviewItem(
        review_id=f"{source.lower().replace(' ', '_')}_{review_id}",
        source=source,
        source_url=raw.get("link", raw.get("source_url", "")),
        rating=rating,
        title=title,
        content=content,
        date=str(date_str),
        verified_purchase=raw.get("verified_purchase"),
        helpful_votes=raw.get("helpful_votes", raw.get("helpful_count")),
        product_variant=raw.get("variant", ""),
        language=raw.get("language", "en"),
    )


async def retrieve_reviews_from_immersive(product_name: str, brand: str = "") -> list[dict]:
    """
    Retrieve review data from Google Immersive Product.
    This gets review snippets, highlights, and star breakdowns.
    """
    reviews = []

    try:
        # Search shopping to find product_id
        query = f"{brand} {product_name}" if brand else product_name
        shopping_data = await serpapi.google_shopping_search(query)
        shopping_results = serpapi.parse_shopping_results(shopping_data)

        for sr in shopping_results[:3]:
            pid = sr.get("product_id")
            if not pid:
                continue

            try:
                immersive_data = await serpapi.get_immersive_product(pid)
                parsed = serpapi.parse_immersive_product(immersive_data)

                # Extract reviews from immersive product
                for raw_review in parsed.get("reviews_raw", []):
                    raw_review["_product_id"] = pid
                    raw_review["_source_name"] = sr.get("source", "Google Shopping")
                    reviews.append(raw_review)

                # Extract review highlights as pseudo-reviews
                for highlight in parsed.get("review_highlights", []):
                    if isinstance(highlight, dict):
                        reviews.append({
                            "content": highlight.get("text", highlight.get("snippet", "")),
                            "rating": highlight.get("rating"),
                            "source": highlight.get("source", sr.get("source", "")),
                            "_is_highlight": True,
                            "_source_name": sr.get("source", "Google Shopping"),
                        })
                    elif isinstance(highlight, str):
                        reviews.append({
                            "content": highlight,
                            "_is_highlight": True,
                            "_source_name": sr.get("source", "Google Shopping"),
                        })

                # If we got reviews, break (don't over-query)
                if reviews:
                    break

            except Exception as e:
                logger.debug(f"Failed to get reviews from immersive product {pid}: {e}")
                continue

    except Exception as e:
        logger.warning(f"Review retrieval failed: {e}")

    return reviews


async def collect_reviews(
    db: AsyncSession,
    product_id: int,
    product_name: str,
    brand: str = "",
    candidates: list = None,
) -> list[ReviewItem]:
    """
    Collect reviews from all available sources.
    Normalizes and deduplicates.
    """
    all_reviews = []
    seen_hashes = set()

    # Check DB for existing reviews
    stmt = select(Review).where(Review.product_id == product_id)
    result = await db.execute(stmt)
    existing = result.scalars().all()
    for r in existing:
        seen_hashes.add(r.content_hash)
        all_reviews.append(ReviewItem(
            review_id=f"db_{r.id}",
            source=r.source,
            source_url=r.source_url,
            rating=r.rating,
            title=r.title,
            content=r.content,
            date=r.review_date or "",
            verified_purchase=r.verified_purchase,
            helpful_votes=r.helpful_votes,
            product_variant=r.variant,
            language=r.language,
        ))

    if all_reviews:
        logger.info(f"Found {len(all_reviews)} cached reviews in DB")
        return all_reviews

    # Retrieve from Immersive Product
    raw_reviews = await retrieve_reviews_from_immersive(product_name, brand)

    # Also extract reviews from candidate data
    if candidates:
        for c in candidates:
            if c.get("reviews") and c.get("rating") and c.get("title"):
                # Create a review entry from the shopping result snippet
                raw_reviews.append({
                    "content": c.get("snippet", f"Rated {c['rating']}/5"),
                    "rating": c.get("rating"),
                    "source": c.get("source", ""),
                    "link": c.get("link", ""),
                    "_source_name": c.get("source", "Google Shopping"),
                })

    # Normalize and deduplicate
    for raw in raw_reviews:
        source = raw.get("_source_name", raw.get("source", "Google Shopping"))
        normalized = normalize_review(raw, source, product_id)

        if not normalized.content:
            continue

        content_hash = compute_content_hash(normalized.content, normalized.source)
        if content_hash in seen_hashes:
            continue
        seen_hashes.add(content_hash)

        # Store in database
        review_model = Review(
            product_id=product_id,
            source=normalized.source,
            source_review_id=normalized.review_id,
            rating=normalized.rating,
            title=normalized.title,
            content=normalized.content,
            review_date=normalized.date,
            verified_purchase=normalized.verified_purchase,
            helpful_votes=normalized.helpful_votes,
            variant=normalized.product_variant,
            language=normalized.language,
            source_url=normalized.source_url,
            content_hash=content_hash,
        )
        db.add(review_model)
        all_reviews.append(normalized)

    await db.flush()
    logger.info(f"Collected {len(all_reviews)} reviews total")
    return all_reviews
