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
        - 1 Analysis node
        - N Finding nodes (one per risk)
        - N Remediation nodes
        - M AWSService nodes (MERGE - accumulate across analyses)
        - Relationships: HAS_FINDING, REMEDIATED_BY, INVOLVES_SERVICE, CO_OCCURS_WITH

        Args:
            review_response: ReviewResponse dict with review_id, risks, score, etc.

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
        analysis_query = """
        CREATE (a:Analysis {
            id: $review_id,
            timestamp: datetime($created_at),
            score: $score,
            summary: $summary,
            tone: $tone
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
        )

        # 2. Create Finding and Remediation nodes + relationships
        for risk in risks:
            # Create Finding node
            finding_query = """
            CREATE (f:Finding {
                id: $finding_id,
                title: $title,
                severity: $severity,
                category: $category,
                description: $finding,
                impact: $impact,
                remediation: $remediation
            })
            RETURN f
            """
            tx.run(
                finding_query,
                finding_id=risk.get("id"),
                title=risk.get("title"),
                severity=risk.get("severity"),
                category=risk.get("pillar"),
                finding=risk.get("finding"),
                impact=risk.get("impact"),
                remediation=risk.get("remediation"),
            )

            # Link Analysis -> Finding
            tx.run(
                """
                MATCH (a:Analysis {id: $review_id})
                MATCH (f:Finding {id: $finding_id})
                CREATE (a)-[:HAS_FINDING]->(f)
                """,
                review_id=review_response.get("review_id"),
                finding_id=risk.get("id"),
            )

            # Create Remediation node and link Finding -> Remediation
            references = risk.get("references", [])
            if references:
                remediation_id = f"{risk.get('id')}-remediation"
                tx.run(
                    """
                    CREATE (r:Remediation {
                        id: $remediation_id,
                        steps: $steps,
                        aws_doc_url: $doc_url
                    })
                    """,
                    remediation_id=remediation_id,
                    steps=risk.get("remediation"),
                    doc_url=references[0] if references else "",
                )

                tx.run(
                    """
                    MATCH (f:Finding {id: $finding_id})
                    MATCH (r:Remediation {id: $remediation_id})
                    CREATE (f)-[:REMEDIATED_BY]->(r)
                    """,
                    finding_id=risk.get("id"),
                    remediation_id=remediation_id,
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
        """Fetch all nodes and relationships for an analysis."""
        query = """
        MATCH path = (a:Analysis {id: $analysis_id})-[*1..3]->(n)
        RETURN path
        """
        result = tx.run(query, analysis_id=analysis_id)

        nodes_dict = {}
        edges = []

        for record in result:
            path = record["path"]
            # Extract nodes from path
            for node in path.nodes:
                node_id = node.element_id
                if node_id not in nodes_dict:
                    nodes_dict[node_id] = {
                        "id": node_id,
                        "label": node.get("title") or node.get("name") or node.get("id"),
                        "type": list(node.labels)[0],
                        "properties": convert_neo4j_types(dict(node)),
                    }

            # Extract relationships
            for rel in path.relationships:
                edges.append(
                    {
                        "source": rel.start_node.element_id,
                        "target": rel.end_node.element_id,
                        "type": rel.type,
                        "properties": convert_neo4j_types(dict(rel)),
                    }
                )

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


# Singleton instance for global access
neo4j_client = Neo4jClient()
