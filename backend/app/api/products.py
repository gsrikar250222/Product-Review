"""Product API endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.product import Product, ProductSource, PriceSnapshot

router = APIRouter()


@router.get("/{product_id}")
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Get product details by ID."""
    stmt = select(Product).where(Product.id == product_id)
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return {
        "id": product.id,
        "name": product.name,
        "brand": product.brand,
        "model": product.model,
        "category": product.category,
        "image_url": product.image_url,
        "specifications": product.specifications,
        "identifiers": product.identifiers,
    }


@router.get("/{product_id}/sources")
async def get_product_sources(product_id: int, db: AsyncSession = Depends(get_db)):
    """Get all data sources for a product."""
    stmt = select(ProductSource).where(ProductSource.product_id == product_id)
    result = await db.execute(stmt)
    sources = result.scalars().all()

    return [
        {
            "source": s.source,
            "source_url": s.source_url,
            "title": s.title,
            "retrieved_at": str(s.retrieved_at),
        }
        for s in sources
    ]


@router.get("/{product_id}/prices")
async def get_product_prices(product_id: int, db: AsyncSession = Depends(get_db)):
    """Get latest price snapshots for a product."""
    stmt = select(PriceSnapshot).where(
        PriceSnapshot.product_id == product_id
    ).order_by(PriceSnapshot.retrieved_at.desc())
    result = await db.execute(stmt)
    prices = result.scalars().all()

    return [
        {
            "source": p.source,
            "price": p.price,
            "currency": p.currency,
            "in_stock": p.in_stock,
            "source_url": p.source_url,
            "retrieved_at": str(p.retrieved_at),
        }
        for p in prices
    ]
