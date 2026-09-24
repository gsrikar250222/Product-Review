"""
Evidence engine — validates and links AI claims to supporting reviews.

Every AI conclusion must reference real review IDs.
Claims without evidence are stripped.
"""

import logging
from app.schemas.analysis import AnalysisResult, EvidenceItem
from app.schemas.review import ReviewItem

logger = logging.getLogger(__name__)


def validate_evidence(analysis: AnalysisResult, reviews: list[ReviewItem]) -> AnalysisResult:
    """
    Validate that all evidence references in the analysis point to real reviews.
    Strip any claims that reference non-existent review IDs.
    """
    valid_ids = {r.review_id for r in reviews}

    # Validate top-level evidence
    validated_evidence = []
    for e in analysis.evidence:
        valid_refs = [rid for rid in e.supporting_review_ids if rid in valid_ids]
        if valid_refs or e.supporting_excerpts:
            validated_evidence.append(EvidenceItem(
                claim=e.claim,
                supporting_review_ids=valid_refs,
                supporting_excerpts=e.supporting_excerpts,
            ))
        else:
            logger.warning(f"Stripped unsupported claim: {e.claim[:60]}...")
    analysis.evidence = validated_evidence

    # Validate theme evidence
    for theme in analysis.positive_themes:
        validated = []
        for e in theme.evidence:
            valid_refs = [rid for rid in e.supporting_review_ids if rid in valid_ids]
            if valid_refs or e.supporting_excerpts:
                validated.append(EvidenceItem(
                    claim=e.claim,
                    supporting_review_ids=valid_refs,
                    supporting_excerpts=e.supporting_excerpts,
                ))
        theme.evidence = validated

    for theme in analysis.negative_themes:
        validated = []
        for e in theme.evidence:
            valid_refs = [rid for rid in e.supporting_review_ids if rid in valid_ids]
            if valid_refs or e.supporting_excerpts:
                validated.append(EvidenceItem(
                    claim=e.claim,
                    supporting_review_ids=valid_refs,
                    supporting_excerpts=e.supporting_excerpts,
                ))
        theme.evidence = validated

    # Validate conflicting opinion references
    for conflict in analysis.conflicting_opinions:
        conflict.positive_review_ids = [
            rid for rid in conflict.positive_review_ids if rid in valid_ids
        ]
        conflict.negative_review_ids = [
            rid for rid in conflict.negative_review_ids if rid in valid_ids
        ]

    return analysis


def build_evidence_map(analysis: AnalysisResult) -> dict:
    """
    Build a mapping from review_id → list of claims it supports.
    Used by the UI to highlight relevant reviews when user clicks evidence.
    """
    evidence_map = {}

    for e in analysis.evidence:
        for rid in e.supporting_review_ids:
            if rid not in evidence_map:
                evidence_map[rid] = []
            evidence_map[rid].append(e.claim)

    for theme in analysis.positive_themes + analysis.negative_themes:
        for e in theme.evidence:
            for rid in e.supporting_review_ids:
                if rid not in evidence_map:
                    evidence_map[rid] = []
                evidence_map[rid].append(f"[{theme.theme}] {e.claim}")

    return evidence_map
