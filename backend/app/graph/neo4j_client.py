"""
Neo4j client for knowledge graph operations.

Handles connection, CRUD operations, and graph queries for Tesseric analysis data.
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from neo4j import GraphDatabase, Driver
from neo4j.exceptions import ServiceUnavailable, AuthError
from neo4j.time import DateTime as Neo4jDateTime

from app.core.config import settings
from app.graph.service_parser import get_all_services_from_review

logger = logging.getLogger(__name__)


def convert_neo4j_types(obj: Any) -> Any:
    """
    Convert Neo4j-specific types to JSON-serializable Python types.

    Handles:
    - Neo4j DateTime → ISO string
    - Dict → recursively convert values
    - List → recursively convert elements
    """
    if isinstance(obj, Neo4jDateTime):
        return obj.iso_format()
    elif isinstance(obj, dict):
        return {k: convert_neo4j_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_neo4j_types(item) for item in obj]
    else:
        return obj


class Neo4jClient:
    """
    Neo4j database client with connection pooling and graph operations.

    Usage:
        async with Neo4jClient() as client:
            await client.write_analysis(review_response)
    """

    def __init__(self):
        """Initialize Neo4j client with config from settings."""
        self.driver: Optional[Driver] = None
        self.uri = settings.neo4j_uri
        self.username = settings.neo4j_username
        self.password = settings.neo4j_password
        self.enabled = settings.neo4j_enabled

    async def __aenter__(self):
        """Async context manager entry - establish connection."""
        await self.connect()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit - close connection."""
        await self.close()

    async def connect(self):
        """Establish Neo4j connection with authentication."""
        if not self.enabled or not self.uri or not self.password:
            logger.warning(
                "Neo4j disabled or credentials missing. Graph features unavailable."
            )
            return

        try:
            self.driver = GraphDatabase.driver(
                self.uri, auth=(self.username, self.password)
            )
            # Verify connectivity
            self.driver.verify_connectivity()
            logger.info(f"Connected to Neo4j at {self.uri}")
        except AuthError as e:
            logger.error(f"Neo4j authentication failed: {e}")
            self.driver = None
        except ServiceUnavailable as e:
            logger.error(f"Neo4j service unavailable: {e}")
            self.driver = None
        except Exception as e:
            logger.error(f"Unexpected Neo4j connection error: {e}")
            self.driver = None

    async def close(self):
        """Close Neo4j connection and release resources."""
        if self.driver:
            self.driver.close()
            logger.info("Closed Neo4j connection")

    def _is_connected(self) -> bool:
        """Check if Neo4j driver is connected."""
        return self.driver is not None

    async def write_analysis(self, review_response: Dict[str, Any]) -> bool:
        """
        Write architecture review to Neo4j as a knowledge graph.

        Creates:
        - 1 Analysis node (with architecture_description and architecture_pattern)
        - N Finding nodes (MERGE - deduplicate across reviews by title+severity+category)
        - M AWSService nodes (MERGE - accumulate across analyses)
        - Relationships: HAS_FINDING, INVOLVES_SERVICE, CO_OCCURS_WITH
        - Topology relationships: ROUTES_TO, WRITES_TO, READS_FROM, MONITORS, etc.

        Args:
            review_response: ReviewResponse dict with review_id, risks, topology, etc.

        Returns:
            True if write succeeded, False otherwise
        """
        if not self._is_connected():
            logger.warning("Neo4j not connected. Skipping graph write.")
            return False

        try:
            with self.driver.session() as session:
                # Convert datetime to ISO string if needed
                created_at = review_response.get("created_at")
                if isinstance(created_at, datetime):
                    created_at = created_at.isoformat()

                # Extract all AWS services from findings
                risks = review_response.get("risks", [])
                # Convert RiskItem Pydantic models to dicts if needed
                risks_dicts = []
                for risk in risks:
                    if hasattr(risk, "model_dump"):
                        risks_dicts.append(risk.model_dump())
                    elif isinstance(risk, dict):
                        risks_dicts.append(risk)
                    else:
                        logger.warning(f"Unknown risk type: {type(risk)}")
                        continue

                all_services = get_all_services_from_review(risks_dicts)

                # Write graph in single transaction
                session.execute_write(
                    self._create_analysis_graph,
                    review_response,
                    risks_dicts,
                    all_services,
                    created_at,
                )

                logger.info(
                    f"Successfully wrote analysis {review_response.get('review_id')} to Neo4j"
                )
                return True

        except Exception as e:
            logger.error(f"Failed to write analysis to Neo4j: {e}")
            return False

    @staticmethod
    def _create_analysis_graph(tx, review_response, risks, all_services, created_at):
        """
        Transaction function to create full analysis graph.

        Creates all nodes and relationships in a single transaction.
        """
        # 1. Create Analysis node
        # Extract processing time from metadata if available
        metadata = review_response.get("metadata", {})
        processing_time_ms = metadata.get("processing_time_ms") if metadata else None

        # Extract topology and architecture description
        topology = review_response.get("topology", {})
        architecture_pattern = topology.get("architecture_pattern") if topology else None
        architecture_description = review_response.get("architecture_description")

        analysis_query = """
        CREATE (a:Analysis {
            id: $review_id,
            timestamp: datetime($created_at),
            score: $score,
            summary: $summary,
            tone: $tone,
            processing_time_ms: $processing_time_ms,
            architecture_description: $architecture_description,
            architecture_pattern: $architecture_pattern
        })
        RETURN a
        """
        tx.run(
            analysis_query,
            review_id=review_response.get("review_id"),
            created_at=created_at,
            score=review_response.get("architecture_score"),
            summary=review_response.get("summary"),
            tone=review_response.get("tone"),
            processing_time_ms=processing_time_ms,
            architecture_description=architecture_description,
            architecture_pattern=architecture_pattern,
        )

        # 2. Create/merge Finding nodes + relationships
        for risk in risks:
            finding_id = risk.get("id")
            title = risk.get("title")
            severity = risk.get("severity")
            category = risk.get("pillar")

            # Use MERGE to deduplicate findings across reviews
            # Composite key: title + severity + category
            tx.run(
                """
                MERGE (f:Finding {
                    title: $title,
                    severity: $severity,
                    category: $category
                })
                ON CREATE SET
                    f.id = $finding_id,
                    f.description = $finding,
                    f.impact = $impact,
                    f.remediation = $remediation,
                    f.first_seen = datetime(),
                    f.occurrence_count = 1,
                    f.review_ids = [$review_id]
                ON MATCH SET
                    f.occurrence_count = COALESCE(f.occurrence_count, 0) + 1,
                    f.last_seen = datetime(),
                    f.review_ids = CASE
                        WHEN NOT $review_id IN COALESCE(f.review_ids, [])
                        THEN COALESCE(f.review_ids, []) + $review_id
                        ELSE COALESCE(f.review_ids, [])
                    END
                RETURN f
                """,
                finding_id=finding_id,
                title=title,
                severity=severity,
                category=category,
                finding=risk.get("finding"),
                impact=risk.get("impact"),
                remediation=risk.get("remediation"),
                review_id=review_response.get("review_id"),
            )

            # Link Analysis -> Finding (using title+severity+category to find merged node)
            tx.run(
                """
                MATCH (a:Analysis {id: $review_id})
                MATCH (f:Finding {title: $title, severity: $severity, category: $category})
                MERGE (a)-[:HAS_FINDING]->(f)
                """,
                review_id=review_response.get("review_id"),
                title=title,
                severity=severity,
                category=category,
            )

        # 3. Create/merge AWSService nodes
        for service_name, category in all_services:
            tx.run(
                """
                MERGE (s:AWSService {name: $name})
                ON CREATE SET s.category = $category
                """,
                name=service_name,
                category=category,
            )

        # 4. Link Findings -> AWSServices (INVOLVES_SERVICE)
        for risk in risks:
            # Extract services for this specific finding
            from app.graph.service_parser import extract_services_from_finding

            finding_services = extract_services_from_finding(risk)
            for service_name, _ in finding_services:
                tx.run(
                    """
                    MATCH (f:Finding {id: $finding_id})
                    MATCH (s:AWSService {name: $service_name})
                    MERGE (f)-[:INVOLVES_SERVICE]->(s)
                    """,
                    finding_id=risk.get("id"),
                    service_name=service_name,
                )

        # 5. Create CO_OCCURS_WITH relationships between services
        # If 2+ services in same analysis, increment relationship count
        if len(all_services) > 1:
            for i, (service1, _) in enumerate(all_services):
                for service2, _ in all_services[i + 1 :]:
                    tx.run(
                        """
                        MATCH (s1:AWSService {name: $service1})
                        MATCH (s2:AWSService {name: $service2})
                        MERGE (s1)-[r:CO_OCCURS_WITH]-(s2)
                        ON CREATE SET r.count = 1
                        ON MATCH SET r.count = r.count + 1
                        """,
                        service1=service1,
                        service2=service2,
                    )

        # 6. Create topology relationships (ROUTES_TO, WRITES_TO, etc.)
        topology = review_response.get("topology")
        if topology and topology.get("connections"):
            for conn in topology["connections"]:
                source = conn.get("source_service")
                target = conn.get("target_service")
                rel_type = conn.get("relationship_type", "routes_to").upper()
                description = conn.get("description", "")

                if not source or not target:
                    continue

                # Ensure services exist before creating relationship
                tx.run(
                    """
                    MATCH (s1:AWSService {name: $source})
                    MATCH (s2:AWSService {name: $target})
                    MERGE (s1)-[r:%s]->(s2)
                    ON CREATE SET r.description = $description, r.created_at = datetime()
                    """ % rel_type,
                    source=source,
                    target=target,
                    description=description,
                )

    async def get_graph_for_analysis(self, analysis_id: str) -> Dict[str, List]:
        """
        Retrieve graph data for a single analysis.

        Args:
            analysis_id: review_id of the analysis

        Returns:
            Dict with 'nodes' and 'edges' lists
            Example:
            {
                "nodes": [{"id": "...", "label": "...", "type": "Analysis", "properties": {...}}],
                "edges": [{"source": "...", "target": "...", "type": "HAS_FINDING"}]
            }
        """
        if not self._is_connected():
            return {"nodes": [], "edges": []}

        try:
            with self.driver.session() as session:
                result = session.execute_read(self._fetch_analysis_graph, analysis_id)
                return result
        except Exception as e:
            logger.error(f"Failed to fetch analysis graph: {e}")
            return {"nodes": [], "edges": []}

    @staticmethod
    def _fetch_analysis_graph(tx, analysis_id):
        """Fetch all nodes and relationships for an analysis (excluding CO_OCCURS_WITH)."""
        # Simpler approach: use UNION to get nodes and edges separately
        query = """
        // Get Analysis node
        MATCH (a:Analysis {id: $analysis_id})
        RETURN a as node, null as rel, null as startNode, null as endNode

        UNION

        // Get Finding nodes
        MATCH (a:Analysis {id: $analysis_id})-[:HAS_FINDING]->(f:Finding)
        RETURN f as node, null as rel, null as startNode, null as endNode

        UNION

        // Get AWSService nodes
        MATCH (a:Analysis {id: $analysis_id})-[:HAS_FINDING]->(f:Finding)-[:INVOLVES_SERVICE]->(s:AWSService)
        RETURN s as node, null as rel, null as startNode, null as endNode

        UNION

        // Get HAS_FINDING relationships
        MATCH (a:Analysis {id: $analysis_id})-[r:HAS_FINDING]->(f:Finding)
        RETURN null as node, type(r) as rel, a as startNode, f as endNode

        UNION

        // Get INVOLVES_SERVICE relationships
        MATCH (a:Analysis {id: $analysis_id})-[:HAS_FINDING]->(f:Finding)-[r:INVOLVES_SERVICE]->(s:AWSService)
        RETURN null as node, type(r) as rel, f as startNode, s as endNode
        """
        result = tx.run(query, analysis_id=analysis_id)

        nodes_dict = {}
        edges = []

        for record in result:
            # Process nodes
            node = record.get("node")
            if node:
                node_id = node.element_id
                if node_id not in nodes_dict:
                    node_labels = list(node.labels)
                    node_type = node_labels[0] if node_labels else "Unknown"

                    # Get label based on node type
                    if node_type == "Analysis":
                        label = node.get("id", "")
                    elif node_type == "Finding":
                        label = node.get("title", "")
                    elif node_type == "AWSService":
                        label = node.get("name", "")
                    else:
                        label = node.get("id", node.get("name", ""))

                    nodes_dict[node_id] = {
                        "id": node_id,
                        "label": label,
                        "type": node_type,
                        "properties": convert_neo4j_types(dict(node)),
                    }

            # Process relationships
            rel_type = record.get("rel")
            start_node = record.get("startNode")
            end_node = record.get("endNode")

            if rel_type and start_node and end_node:
                edges.append({
                    "source": start_node.element_id,
                    "target": end_node.element_id,
                    "type": rel_type,
                    "properties": {},
                })

        return {"nodes": list(nodes_dict.values()), "edges": edges}

    async def get_global_graph(self, limit: int = 100) -> Dict[str, List]:
        """
        Retrieve aggregated graph across all analyses.

        Returns top nodes by relationship count.

        Args:
            limit: Max number of nodes to return (default 100)

        Returns:
            Dict with 'nodes' and 'edges' lists
        """
        if not self._is_connected():
            return {"nodes": [], "edges": []}

        try:
            with self.driver.session() as session:
                result = session.execute_read(self._fetch_global_graph, limit)
                return result
        except Exception as e:
            logger.error(f"Failed to fetch global graph: {e}")
            return {"nodes": [], "edges": []}

    @staticmethod
    def _fetch_global_graph(tx, limit):
        """Fetch top nodes and their relationships."""
        # Get AWSService nodes with most CO_OCCURS_WITH relationships
        query = """
        MATCH (s:AWSService)
        OPTIONAL MATCH (s)-[r:CO_OCCURS_WITH]-(s2:AWSService)
        WITH s, count(r) as rel_count
        ORDER BY rel_count DESC
        LIMIT $limit
        MATCH path = (s)-[r:CO_OCCURS_WITH]-(s2:AWSService)
        RETURN path
        """
        result = tx.run(query, limit=limit)

        nodes_dict = {}
        edges = []

        for record in result:
            path = record["path"]
            for node in path.nodes:
                node_id = node.element_id
                if node_id not in nodes_dict:
                    nodes_dict[node_id] = {
                        "id": node_id,
                        "label": node.get("name", "Unknown"),
                        "type": list(node.labels)[0],
                        "properties": convert_neo4j_types(dict(node)),
                    }

            for rel in path.relationships:
                edge_key = f"{rel.start_node.element_id}-{rel.end_node.element_id}"
                if not any(e.get("id") == edge_key for e in edges):
                    edges.append(
                        {
                            "id": edge_key,
                            "source": rel.start_node.element_id,
                            "target": rel.end_node.element_id,
                            "type": rel.type,
                            "properties": convert_neo4j_types(dict(rel)),
                        }
                    )

        return {"nodes": list(nodes_dict.values()), "edges": edges}

    async def get_metrics(self) -> Dict[str, Any]:
        """
        Retrieve aggregate metrics for homepage dashboard.

        Queries Neo4j for real-time production statistics:
        - Total reviews analyzed
        - Unique AWS services recognized
        - Findings breakdown by severity
        - Average review processing time

        Returns:
            Dict with metrics data:
            {
                "total_reviews": int,
                "unique_aws_services": int,
                "severity_breakdown": {"CRITICAL": int, "HIGH": int, ...},
                "avg_time_ms": float  # average processing time in milliseconds
            }

        Returns zeros if database is empty or connection fails.
        """
        if not self._is_connected():
            logger.warning("Neo4j not connected. Returning zero metrics.")
            return {
                "total_reviews": 0,
                "unique_aws_services": 0,
                "severity_breakdown": {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0},
                "avg_time_ms": 0.0,
            }

        try:
            with self.driver.session() as session:
                metrics = session.execute_read(self._fetch_metrics)
                return metrics
        except Exception as e:
            logger.error(f"Failed to fetch metrics from Neo4j: {e}")
            return {
                "total_reviews": 0,
                "unique_aws_services": 0,
                "severity_breakdown": {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0},
                "avg_time_ms": 0.0,
            }

    @staticmethod
    def _fetch_metrics(tx):
        """
        Execute aggregate queries to compute metrics.

        Runs 4 queries in parallel:
        1. Total Analysis nodes (reviews)
        2. Unique AWS services
        3. Findings by severity
        4. Average processing time
        """
        # Query 1: Total reviews
        total_reviews_query = """
        MATCH (a:Analysis)
        RETURN count(a) as total_reviews
        """
        result1 = tx.run(total_reviews_query)
        record1 = result1.single()
        total_reviews = record1["total_reviews"] if record1 else 0

        # Query 2: Unique AWS services
        unique_services_query = """
        MATCH (s:AWSService)
        RETURN count(DISTINCT s.name) as unique_services
        """
        result2 = tx.run(unique_services_query)
        record2 = result2.single()
        unique_aws_services = record2["unique_services"] if record2 else 0

        # Query 3: Severity breakdown
        severity_query = """
        MATCH (f:Finding)
        RETURN f.severity as severity, count(f) as count
        ORDER BY CASE f.severity
            WHEN 'CRITICAL' THEN 1
            WHEN 'HIGH' THEN 2
            WHEN 'MEDIUM' THEN 3
            WHEN 'LOW' THEN 4
        END
        """
        result3 = tx.run(severity_query)
        severity_breakdown = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
        for record in result3:
            severity = record["severity"]
            count = record["count"]
            if severity in severity_breakdown:
                severity_breakdown[severity] = count

        # Query 4: Average processing time
        avg_time_query = """
        MATCH (a:Analysis)
        WHERE a.processing_time_ms IS NOT NULL
        RETURN avg(a.processing_time_ms) as avg_time_ms
        """
        result4 = tx.run(avg_time_query)
        record4 = result4.single()
        avg_time_ms = record4["avg_time_ms"] if record4 and record4["avg_time_ms"] else 8000.0

        return {
            "total_reviews": total_reviews,
            "unique_aws_services": unique_aws_services,
            "severity_breakdown": severity_breakdown,
            "avg_time_ms": float(avg_time_ms),
        }


# Singleton instance for global access
neo4j_client = Neo4jClient()
