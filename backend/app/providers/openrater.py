"""
OpenRater provider — stub for future integration.
Can be activated once an actual API endpoint/key is available.
"""

import logging

logger = logging.getLogger(__name__)


class OpenRaterProvider:
    """Stub: OpenRater is an optional provider for product data and reviews."""

    def __init__(self):
        self.enabled = False
        logger.info("OpenRater provider initialized (disabled — no API endpoint configured)")

    async def search_product(self, query: str) -> dict:
        """Search for a product by name."""
        return {"status": "provider_not_configured", "results": []}

    async def get_reviews(self, product_id: str) -> dict:
        """Get reviews for a product."""
        return {"status": "provider_not_configured", "reviews": []}

    async def get_alternatives(self, product_id: str) -> list:
        """Get alternative products."""
        return []

    async def get_safety_alerts(self, product_id: str) -> list:
        """Get safety alerts for a product."""
        return []


openrater = OpenRaterProvider()
