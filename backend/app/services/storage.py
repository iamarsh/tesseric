"""
Storage service for review history.

v0.1: Not implemented (stateless API)
v1.0: Will implement DynamoDB or SQLite for review storage
"""

# TODO(v1.0): Implement storage for review history
# - DynamoDB table: reviews (PK: review_id, attributes: user_id, design_text, response_json, created_at)
# - GSI: user_id-created_at-index for querying user's reviews
# - Methods: save_review(), get_review(), list_reviews()

# Example structure:
# class ReviewStore:
#     def __init__(self):
#         import boto3
#         self.dynamodb = boto3.resource('dynamodb')
#         self.table = self.dynamodb.Table('tesseric-reviews-dev')
#
#     async def save_review(self, review: ReviewResponse, design_text: str, user_id: str = "anonymous"):
#         """Save review to DynamoDB."""
#         pass
#
#     async def get_review(self, review_id: str) -> dict | None:
#         """Get review by ID."""
#         pass
#
#     async def list_reviews(self, user_id: str, limit: int = 10) -> list[dict]:
#         """List user's recent reviews."""
#         pass
