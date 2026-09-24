"""Review-related ORM models."""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class Review(Base):
    """A single customer review, stored unmodified."""
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, nullable=False, index=True)
    source = Column(String(100), nullable=False)        # "Amazon", "Google Shopping"
    source_review_id = Column(String(200), default="")  # original ID from source
    rating = Column(Float, nullable=True)                # 1-5
    title = Column(String(500), default="")
    content = Column(Text, default="")                   # NEVER modified
    review_date = Column(String(50), default="")         # ISO string or raw date
    verified_purchase = Column(Boolean, nullable=True)
    helpful_votes = Column(Integer, nullable=True)
    variant = Column(String(200), default="")             # product variant
    language = Column(String(10), default="en")
    source_url = Column(String(1000), default="")
    retrieved_at = Column(DateTime, server_default=func.now())
    content_hash = Column(String(64), unique=True, index=True)  # SHA-256 dedup
