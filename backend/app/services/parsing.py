"""
Architecture description parsing utilities.

v0.1: Not implemented (accept text/markdown as-is)
v1.1+: Will add parsers for:
- Terraform HCL → resource extraction
- Image/diagram → text extraction (via Bedrock vision)
- n8n workflow JSON → component identification
"""

# TODO(v1.1): Implement specialized parsers

# Example structure:
# class TerraformParser:
#     @staticmethod
#     def parse_hcl(terraform_code: str) -> dict:
#         """Parse Terraform HCL and extract resources."""
#         # Use python-hcl2 or regex to extract resource definitions
#         # Return dict with: resources, modules, data_sources, etc.
#         pass
#
# class DiagramParser:
#     @staticmethod
#     async def extract_text_from_image(image_bytes: bytes) -> str:
#         """Extract architecture description from diagram image."""
#         # Use Bedrock vision model (Claude 3 with vision) or AWS Textract
#         pass
