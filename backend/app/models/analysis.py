"""Analysis-related ORM models."""

from sqlalchemy import Column, Integer, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.database import Base


class ReviewAnalysis(Base):
    """Stored LLM analysis of reviews for a product."""
    __tablename__ = "review_analysis"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, nullable=False, index=True)
    analysis_json = Column(JSON, nullable=False)       # full structured analysis
    evidence_json = Column(JSON, nullable=True)        # evidence linkages
    review_count_at_analysis = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())


class ReviewEvidence(Base):
    """Individual evidence link: AI claim → supporting review IDs."""
    __tablename__ = "review_evidence"

    id = Column(Integer, primary_key=True, autoincrement=True)
    analysis_id = Column(Integer, nullable=False, index=True)
    claim = Column(Text, nullable=False)
    supporting_review_ids = Column(JSON, default=list)  # [review.id, ...]
