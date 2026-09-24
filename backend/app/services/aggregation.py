"""
Aggregation service — multi-source review aggregation.

Keeps source-level information separate.
Never blindly averages across different sources.
"""

import logging
from collections import defaultdict
from app.schemas.review import ReviewItem, ReviewSourceSummary, ReviewAggregation

logger = logging.getLogger(__name__)


def aggregate_reviews(reviews: list[ReviewItem], product_rating: float = None, product_review_count: int = None) -> ReviewAggregation:
    """
    Aggregate reviews by source, keeping source-level stats separate.
    """
    if not reviews:
        return ReviewAggregation()

    # Group by source
    source_groups = defaultdict(list)
    for r in reviews:
        source_groups[r.source or "Unknown"].append(r)

    sources = []
    total_reviews = 0
    all_ratings = []
    combined_stars = defaultdict(int)

    for source_name, source_reviews in source_groups.items():
        ratings = [r.rating for r in source_reviews if r.rating is not None]
        avg_rating = sum(ratings) / len(ratings) if ratings else None

        # Star distribution for this source
        star_dist = defaultdict(int)
        for r in source_reviews:
            if r.rating is not None:
                star = str(round(r.rating))
                star_dist[star] += 1
                combined_stars[star] += 1

        sources.append(ReviewSourceSummary(
            name=source_name,
            rating=round(avg_rating, 1) if avg_rating else None,
            review_count=len(source_reviews),
            star_distribution=dict(star_dist),
            source_url=source_reviews[0].source_url if source_reviews else "",
        ))

        total_reviews += len(source_reviews)
        all_ratings.extend(ratings)

    # Overall weighted rating (weight by review count per source)
    weighted_rating = None
    if all_ratings:
        weighted_rating = round(sum(all_ratings) / len(all_ratings), 1)

    # Use product-level rating if available and we have few individual review ratings
    if product_rating and (not weighted_rating or len(all_ratings) < 3):
        weighted_rating = product_rating

    # Use product-level review count if larger
    if product_review_count and product_review_count > total_reviews:
        total_reviews = product_review_count

    return ReviewAggregation(
        total_reviews=total_reviews,
        weighted_rating=weighted_rating,
        sources=sources,
        star_distribution=dict(combined_stars),
        reviews=reviews,
    )
