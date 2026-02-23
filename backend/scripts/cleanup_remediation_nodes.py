"""
Cleanup script to remove redundant Remediation nodes from Neo4j.
Run this ONCE to clean up old data.
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.graph.neo4j_client import Neo4jClient
from app.core.config import settings


async def cleanup_remediation_nodes():
    """Remove all Remediation nodes from Neo4j database."""
    client = Neo4jClient()

    try:
        await client.connect()
        print("Connected to Neo4j")

        # Count Remediation nodes before deletion
        with client.driver.session() as session:
            count_result = session.run("MATCH (r:Remediation) RETURN count(r) as count")
            count = count_result.single()["count"]
            print(f"\nFound {count} Remediation nodes to delete")

            if count == 0:
                print("No Remediation nodes found. Database is already clean.")
                return

            # Ask for confirmation
            confirm = input(f"\nDelete {count} Remediation nodes? (yes/no): ")
            if confirm.lower() != "yes":
                print("Cleanup cancelled.")
                return

            # Delete all Remediation nodes and their relationships
            result = session.run(
                """
                MATCH (r:Remediation)
                DETACH DELETE r
                RETURN count(r) as deleted
                """
            )
            deleted = result.single()["deleted"]
            print(f"✅ Successfully deleted {deleted} Remediation nodes")

            # Verify cleanup
            verify_result = session.run("MATCH (r:Remediation) RETURN count(r) as count")
            remaining = verify_result.single()["count"]
            print(f"✅ Remaining Remediation nodes: {remaining} (should be 0)")

    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        raise
    finally:
        await client.close()
        print("\nDisconnected from Neo4j")


if __name__ == "__main__":
    asyncio.run(cleanup_remediation_nodes())
