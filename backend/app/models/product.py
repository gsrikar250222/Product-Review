"""Product-related ORM models."""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.database import Base


class Product(Base):
    """Core product entity."""
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(500), nullable=False)
    brand = Column(String(200), default="")
    model = Column(String(200), default="")
    category = Column(String(200), default="")
    image_url = Column(String(1000), default="")
    identifiers = Column(JSON, default=dict)     # {"asin": "...", "gtin": "..."}
    specifications = Column(JSON, default=dict)   # {"weight": "250g", ...}
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class ProductSource(Base):
    """A specific source of product data (retains provenance)."""
    __tablename__ = "product_sources"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, nullable=False, index=True)
    source = Column(String(100), nullable=False)          # "Amazon", "Google Shopping", etc.
    source_url = Column(String(1000), default="")
    title = Column(String(500), default="")
    data = Column(JSON, default=dict)                     # raw provider data
    retrieved_at = Column(DateTime, server_default=func.now())


class PriceSnapshot(Base):
    """Point-in-time price from a specific retailer."""
    __tablename__ = "price_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, nullable=False, index=True)
    source = Column(String(200), nullable=False)
    price = Column(Float, nullable=True)
    currency = Column(String(10), default="INR")
    in_stock = Column(Boolean, nullable=True)
    source_url = Column(String(1000), default="")
    retrieved_at = Column(DateTime, server_default=func.now())


class SearchRequest(Base):
    """Track each image analysis request."""
    __tablename__ = "search_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    image_hash = Column(String(64), index=True)  # SHA-256
    image_path = Column(String(500), default="")
    status = Column(String(50), default="pending")  # pending, processing, completed, failed
    product_id = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
