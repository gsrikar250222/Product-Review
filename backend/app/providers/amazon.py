"""Amazon data extraction from SerpApi shopping results."""

import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class AmazonProvider:
    """Extract Amazon-specific data from Google Shopping/Lens results."""

    AMAZON_DOMAINS = [
        "amazon.in", "amazon.com", "amazon.co.uk", "amazon.de",
        "amazon.fr", "amazon.co.jp", "amazon.ca", "amazon.com.au",
    ]

    MARKETPLACE_MAP = {
        "amazon.in": "IN",
        "amazon.com": "US",
        "amazon.co.uk": "UK",
        "amazon.de": "DE",
        "amazon.fr": "FR",
        "amazon.co.jp": "JP",
        "amazon.ca": "CA",
        "amazon.com.au": "AU",
    }

    def is_amazon_url(self, url: str) -> bool:
        """Check if a URL is from Amazon."""
        return any(domain in url for domain in self.AMAZON_DOMAINS)

    def extract_asin(self, url: str) -> Optional[str]:
        """Extract ASIN from an Amazon URL."""
        patterns = [
            r"/dp/([A-Z0-9]{10})",
            r"/gp/product/([A-Z0-9]{10})",
            r"/product/([A-Z0-9]{10})",
            r"asin=([A-Z0-9]{10})",
        ]
        for pattern in patterns:
            match = re.search(pattern, url, re.IGNORECASE)
            if match:
                return match.group(1).upper()
        return None

    def extract_marketplace(self, url: str) -> str:
        """Determine Amazon marketplace from URL."""
        for domain, code in self.MARKETPLACE_MAP.items():
            if domain in url:
                return code
        return "US"

    def enrich_candidate(self, candidate: dict) -> dict:
        """Add Amazon-specific metadata to a candidate."""
        url = candidate.get("link", "")
        if self.is_amazon_url(url):
            candidate["amazon_asin"] = self.extract_asin(url)
            candidate["amazon_marketplace"] = self.extract_marketplace(url)
            candidate["is_amazon"] = True
        else:
            candidate["is_amazon"] = False
        return candidate


amazon_provider = AmazonProvider()
