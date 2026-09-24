"""
Product service — CRUD operations and data normalization.
"""

import logging
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product import Product, ProductSource, PriceSnapshot
from app.providers.serpapi import serpapi
from app.providers.shopping import shopping_provider
from app.schemas.product import ProductDetail, PriceInfo

logger = logging.getLogger(__name__)


async def create_or_update_product(
    db: AsyncSession,
    name: str,
    brand: str = "",
    model_name: str = "",
    category: str = "",
    image_url: str = "",
    identifiers: dict = None,
    specifications: dict = None,
) -> Product:
    """Create a new product or return existing one if matched."""
    # Check for existing product with same name+brand
    stmt = select(Product).where(
        Product.name == name,
        Product.brand == brand,
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()

    if existing:
        # Update fields if new data is richer
        if model_name and not existing.model:
            existing.model = model_name
        if category and not existing.category:
            existing.category = category
        if image_url and not existing.image_url:
            existing.image_url = image_url
        if specifications:
            old_specs = existing.specifications or {}
            old_specs.update(specifications)
            existing.specifications = old_specs
        await db.flush()
        return existing

    product = Product(
        name=name,
        brand=brand,
        model=model_name,
        category=category,
        image_url=image_url,
        identifiers=identifiers or {},
        specifications=specifications or {},
    )
    db.add(product)
    await db.flush()
    return product


async def add_product_source(
    db: AsyncSession,
    product_id: int,
    source: str,
    source_url: str = "",
    title: str = "",
    data: dict = None,
) -> ProductSource:
    """Add a source of product data."""
    ps = ProductSource(
        product_id=product_id,
        source=source,
        source_url=source_url,
        title=title,
        data=data or {},
    )
    db.add(ps)
    await db.flush()
    return ps


async def add_price_snapshot(
    db: AsyncSession,
    product_id: int,
    source: str,
    price: float = None,
    currency: str = "INR",
    in_stock: bool = None,
    source_url: str = "",
) -> PriceSnapshot:
    """Record a price observation from a retailer."""
    snap = PriceSnapshot(
        product_id=product_id,
        source=source,
        price=price,
        currency=currency,
        in_stock=in_stock,
        source_url=source_url,
    )
    db.add(snap)
    await db.flush()
    return snap


async def fetch_product_details(
    db: AsyncSession,
    product: Product,
    candidate: dict,
) -> ProductDetail:
    """
    Fetch additional product details via Immersive Product + Shopping APIs.
    Stores sources and prices in the database.
    """
    prices = []
    sources = []
    now = datetime.now(timezone.utc).isoformat()

    # Try Immersive Product API if we have a product_id from Shopping
    immersive_data = {}
    product_link = candidate.get("link", "")
    shopping_results = []

    try:
        # Search Google Shopping for more price data
        search_query = f"{product.brand} {product.name}" if product.brand else product.name
        shopping_results = await shopping_provider.search_prices(search_query)

        # Try to get immersive product details from first shopping result with product_id
        for sr in shopping_results:
            pid = sr.get("product_id")
            if pid:
                try:
                    immersive_data = await shopping_provider.get_product_detail(pid)
                    break
                except Exception as e:
                    logger.debug(f"Immersive product failed for {pid}: {e}")
                    continue

    except Exception as e:
        logger.warning(f"Could not fetch additional product details: {e}")

    # Process immersive product stores
    if immersive_data.get("stores"):
        for store in immersive_data["stores"]:
            price_val = store.get("price")
            if isinstance(price_val, str):
                # Extract numeric value
                import re
                nums = re.findall(r"[\d,]+\.?\d*", price_val.replace(",", ""))
                price_val = float(nums[0]) if nums else None

            if price_val is not None:
                await add_price_snapshot(
                    db, product.id,
                    source=store.get("source", "Unknown"),
                    price=price_val,
                    in_stock=store.get("in_stock"),
                    source_url=store.get("link", ""),
                )
                prices.append(PriceInfo(
                    source=store.get("source", "Unknown"),
                    price=price_val,
                    currency="INR",
                    price_display=store.get("price_display", f"₹{price_val:,.0f}"),
                    in_stock=store.get("in_stock"),
                    source_url=store.get("link", ""),
                    retrieved_at=now,
                ))

        # Update product with immersive data
        if immersive_data.get("specifications"):
            product.specifications = immersive_data["specifications"]
        if immersive_data.get("category"):
            product.category = immersive_data["category"]

    # Process shopping results for additional prices
    for sr in shopping_results[:8]:
        price_val = sr.get("price")
        if price_val is not None and not any(p.source == sr.get("source") for p in prices):
            await add_price_snapshot(
                db, product.id,
                source=sr.get("source", "Unknown"),
                price=price_val,
                source_url=sr.get("link", ""),
            )
            prices.append(PriceInfo(
                source=sr.get("source", "Unknown"),
                price=price_val,
                currency="INR",
                price_display=sr.get("price_display", f"₹{price_val:,.0f}"),
                source_url=sr.get("link", ""),
                retrieved_at=now,
            ))

    # Add source records
    await add_product_source(
        db, product.id,
        source="Google Lens",
        source_url=product_link,
        title=product.name,
        data=candidate,
    )
    sources.append({"source": "Google Lens", "source_url": product_link, "retrieved_at": now})

    if immersive_data:
        await add_product_source(
            db, product.id,
            source="Google Immersive Product",
            title=product.name,
            data=immersive_data,
        )
        sources.append({"source": "Google Immersive Product", "retrieved_at": now})

    await db.flush()

    return ProductDetail(
        id=product.id,
        name=product.name,
        brand=product.brand,
        model_name=product.model or "",
        category=product.category or "",
        image_url=product.image_url or candidate.get("thumbnail", ""),
        rating=immersive_data.get("rating") or candidate.get("rating"),
        review_count=immersive_data.get("review_count") or candidate.get("reviews"),
        prices=prices,
        specifications=product.specifications or {},
        identifiers=product.identifiers or {},
        sources=sources,
        match_confidence=candidate.get("_score", 0.0),
    )
