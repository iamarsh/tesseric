"""
Analytics service for aggregated production metrics.

Provides advanced analytics queries for the /stats dashboard.
All queries are privacy-first: no architecture details, IPs, or PII.
"""

import logging
from typing import Dict, List, Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class AnalyticsService:
    """
    Analytics service for aggregating review data from Neo4j.

    Provides:
    - Time-series data (reviews over time)
    - Percentile metrics (processing time p50, p95, p99)
    - Top AWS services
    - Score trends by day/week
    - Input method breakdown (text vs image)
    - Analysis method breakdown (AI vs pattern matching)
    """

    def __init__(self, neo4j_client):
        """Initialize analytics service with Neo4j client."""
        self.client = neo4j_client

    async def get_reviews_over_time(self, days: int = 30) -> List[Dict[str, Any]]:
        """
        Get review count by day for the last N days.

        Args:
            days: Number of days to look back (default 30)

        Returns:
            List of dicts with 'date' and 'count' keys
        """
        if not self.client._is_connected():
            logger.warning("Neo4j not connected. Returning empty time series.")
            return []

        try:
            with self.client.driver.session() as session:
                result = session.run(
                    """
                    MATCH (a:Analysis)
                    WHERE a.timestamp > datetime() - duration({days: $days})
                    RETURN date(a.timestamp) as review_date, count(a) as review_count
                    ORDER BY review_date DESC
                    """,
                    days=days
                )

                return [
                    {
                        "date": record["review_date"].iso_format(),
                        "count": record["review_count"]
                    }
                    for record in result
                ]
        except Exception as e:
            logger.error(f"Failed to fetch reviews over time: {e}")
            return []

    async def get_processing_time_percentiles(self) -> Dict[str, float]:
        """
        Get processing time percentiles (p50, p95, p99) in milliseconds.

        Returns:
            Dict with p50, p95, p99 keys (in milliseconds)
        """
        if not self.client._is_connected():
            return {"p50": 0, "p95": 0, "p99": 0}

        try:
            with self.client.driver.session() as session:
                result = session.run(
                    """
                    MATCH (a:Analysis)
                    WHERE a.processing_time_ms IS NOT NULL
                    RETURN
                        percentileCont(a.processing_time_ms, 0.5) as p50,
                        percentileCont(a.processing_time_ms, 0.95) as p95,
                        percentileCont(a.processing_time_ms, 0.99) as p99
                    """
                )
                record = result.single()

                if record:
                    return {
                        "p50": round(record["p50"] or 0, 2),
                        "p95": round(record["p95"] or 0, 2),
                        "p99": round(record["p99"] or 0, 2),
                    }
                return {"p50": 0, "p95": 0, "p99": 0}
        except Exception as e:
            logger.error(f"Failed to fetch processing time percentiles: {e}")
            return {"p50": 0, "p95": 0, "p99": 0}

    async def get_top_aws_services(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get most commonly used AWS services across all reviews.

        Args:
            limit: Number of services to return (default 10)

        Returns:
            List of dicts with 'service' and 'count' keys
        """
        if not self.client._is_connected():
            return []

        try:
            with self.client.driver.session() as session:
                result = session.run(
                    """
                    MATCH (s:AWSService)
                    RETURN s.name as service, s.occurrence_count as count
                    ORDER BY count DESC
                    LIMIT $limit
                    """,
                    limit=limit
                )

                return [
                    {"service": record["service"], "count": record["count"]}
                    for record in result
                ]
        except Exception as e:
            logger.error(f"Failed to fetch top AWS services: {e}")
            return []

    async def get_score_trends(self, days: int = 30) -> List[Dict[str, Any]]:
        """
        Get average architecture score by day for the last N days.

        Args:
            days: Number of days to look back (default 30)

        Returns:
            List of dicts with 'date' and 'avg_score' keys
        """
        if not self.client._is_connected():
            return []

        try:
            with self.client.driver.session() as session:
                result = session.run(
                    """
                    MATCH (a:Analysis)
                    WHERE a.timestamp > datetime() - duration({days: $days})
                    RETURN date(a.timestamp) as review_date, avg(a.score) as avg_score
                    ORDER BY review_date DESC
                    """,
                    days=days
                )

                return [
                    {
                        "date": record["review_date"].iso_format(),
                        "avg_score": round(record["avg_score"] or 0, 1)
                    }
                    for record in result
                ]
        except Exception as e:
            logger.error(f"Failed to fetch score trends: {e}")
            return []

    async def get_input_method_breakdown(self) -> Dict[str, int]:
        """
        Get count of reviews by input method (text vs image).

        Returns:
            Dict with 'text' and 'image' counts
        """
        if not self.client._is_connected():
            return {"text": 0, "image": 0}

        try:
            with self.client.driver.session() as session:
                result = session.run(
                    """
                    MATCH (a:Analysis)
                    RETURN a.input_method as method, count(a) as count
                    """
                )

                breakdown = {"text": 0, "image": 0}
                for record in result:
                    method = record["method"] or "text"  # Default to text if missing
                    breakdown[method] = record["count"]

                return breakdown
        except Exception as e:
            logger.error(f"Failed to fetch input method breakdown: {e}")
            return {"text": 0, "image": 0}

    async def get_analysis_method_breakdown(self) -> Dict[str, int]:
        """
        Get count of reviews by analysis method (AI vs pattern matching).

        Returns:
            Dict with method names and counts
        """
        if not self.client._is_connected():
            return {}

        try:
            with self.client.driver.session() as session:
                result = session.run(
                    """
                    MATCH (a:Analysis)
                    WHERE a.analysis_method IS NOT NULL
                    RETURN a.analysis_method as method, count(a) as count
                    ORDER BY count DESC
                    """
                )

                return {
                    record["method"]: record["count"]
                    for record in result
                }
        except Exception as e:
            logger.error(f"Failed to fetch analysis method breakdown: {e}")
            return {}

    async def get_aggregated_stats(self) -> Dict[str, Any]:
        """
        Get comprehensive aggregated statistics for /stats dashboard.

        Returns:
            Dict with all analytics data:
            - Basic metrics (total reviews, services, severity breakdown, avg time)
            - Time-series data (reviews over time, score trends)
            - Percentiles (p50, p95, p99 processing time)
            - Top services
            - Input/analysis method breakdowns
        """
        # Get basic metrics (reuse existing method)
        basic_metrics = await self.client.get_metrics()

        # Get advanced analytics
        reviews_over_time = await self.get_reviews_over_time(days=30)
        processing_percentiles = await self.get_processing_time_percentiles()
        top_services = await self.get_top_aws_services(limit=10)
        score_trends = await self.get_score_trends(days=30)
        input_breakdown = await self.get_input_method_breakdown()
        analysis_breakdown = await self.get_analysis_method_breakdown()

        return {
            # Basic metrics (existing)
            "total_reviews": basic_metrics["total_reviews"],
            "unique_aws_services": basic_metrics["unique_aws_services"],
            "severity_breakdown": basic_metrics["severity_breakdown"],
            "avg_review_time_ms": basic_metrics["avg_time_ms"],

            # Advanced analytics (new)
            "reviews_over_time": reviews_over_time,
            "processing_percentiles": processing_percentiles,
            "top_aws_services": top_services,
            "score_trends": score_trends,
            "input_method_breakdown": input_breakdown,
            "analysis_method_breakdown": analysis_breakdown,
        }
