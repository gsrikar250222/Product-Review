"""Google Shopping provider — wraps SerpApi shopping engine."""

import logging
from app.providers.serpapi import serpapi

logger = logging.getLogger(__name__)


class ShoppingProvider:
    """Price comparison via Google Shopping through SerpApi."""

    async def search_prices(self, product_name: str, gl: str = "in") -> list[dict]:
        """Search Google Shopping for product prices."""
        try:
            data = await serpapi.google_shopping_search(product_name, gl=gl)
            return serpapi.parse_shopping_results(data)
        except Exception as e:
            logger.error(f"Shopping search failed: {e}")
            return []

    async def get_product_detail(self, product_id: str) -> dict:
        """Get detailed product info via Immersive Product API."""
        try:
            data = await serpapi.get_immersive_product(product_id, more_stores=True)
            return serpapi.parse_immersive_product(data)
        except Exception as e:
            logger.error(f"Immersive product lookup failed: {e}")
            return {}


shopping_provider = ShoppingProvider()
