"""
Performance baseline tests for speed optimization tracking.

Run before and after optimizations to measure improvements.
"""

import asyncio
import time
import json
from pathlib import Path
from typing import Dict, List

import pytest
from fastapi import UploadFile
from io import BytesIO

from app.services.rag import analyze_design_from_image
from app.models.request import ReviewRequest
from app.services.rag import analyze_design


class TestPerformanceBaseline:
    """Baseline performance tests for image and text reviews."""

    @pytest.mark.asyncio
    async def test_image_review_performance(self):
        """
        Test image review performance with 3 test images.

        Measures:
        - Total processing time
        - Individual phase times (if available in metadata)
        - Cost per review
        """
        # Test images are in parent directory
        base_path = Path(__file__).parent.parent.parent
        test_images = [
            base_path / "test-images/AWS_Architecture_Diagram-thumb-web.png",
            base_path / "test-images/aws-architecture.png",
            base_path / "test-images/typical-microservices-application.png",
        ]

        results = []

        for image_path in test_images:
            image_file = Path(image_path)
            if not image_file.exists():
                print(f"⚠️  Skipping {image_path} - file not found")
                continue

            print(f"\n📷 Testing: {image_file.name}")

            # Read image bytes
            with open(image_file, "rb") as f:
                image_bytes = f.read()

            # Create UploadFile mock with proper content_type
            # Detect content type from file extension
            content_type = "image/png" if image_file.suffix.lower() == ".png" else "image/jpeg"

            # Create file-like object
            file_obj = BytesIO(image_bytes)

            # UploadFile needs headers to set content_type correctly
            from starlette.datastructures import Headers
            headers = Headers({"content-type": content_type})

            upload_file = UploadFile(
                filename=image_file.name,
                file=file_obj,
                size=len(image_bytes),
                headers=headers
            )

            # Measure performance
            start_time = time.time()

            try:
                review = await analyze_design_from_image(
                    file=upload_file,
                    tone="standard",
                    provider="aws"
                )

                elapsed_ms = int((time.time() - start_time) * 1000)

                result = {
                    "image": image_file.name,
                    "size_kb": len(image_bytes) / 1024,
                    "total_time_ms": elapsed_ms,
                    "score": review.architecture_score,
                    "num_risks": len(review.risks),
                    "metadata": review.metadata or {},
                }

                results.append(result)

                # Print results
                print(f"  ✅ Total time: {elapsed_ms}ms ({elapsed_ms/1000:.2f}s)")
                print(f"  📊 Score: {review.architecture_score}/100")
                print(f"  🔍 Risks found: {len(review.risks)}")

                if review.metadata:
                    if "vision_cost_usd" in review.metadata:
                        print(f"  💰 Vision cost: ${review.metadata['vision_cost_usd']:.6f}")
                    if "total_cost_usd" in review.metadata:
                        print(f"  💰 Total cost: ${review.metadata['total_cost_usd']:.6f}")
                    if "processing_time_ms" in review.metadata:
                        print(f"  ⏱️  Processing time: {review.metadata['processing_time_ms']}ms")

            except Exception as e:
                print(f"  ❌ Failed: {str(e)[:100]}")
                results.append({
                    "image": image_file.name,
                    "size_kb": len(image_bytes) / 1024,
                    "error": str(e)[:200],
                })

        # Summary statistics
        if results:
            print("\n" + "="*60)
            print("📊 BASELINE PERFORMANCE SUMMARY")
            print("="*60)

            successful_results = [r for r in results if "total_time_ms" in r]

            if successful_results:
                times = [r["total_time_ms"] for r in successful_results]
                avg_time = sum(times) / len(times)
                min_time = min(times)
                max_time = max(times)

                print(f"Total tests: {len(results)}")
                print(f"Successful: {len(successful_results)}")
                print(f"Failed: {len(results) - len(successful_results)}")
                print(f"\nImage Review Times:")
                print(f"  Average: {avg_time:.0f}ms ({avg_time/1000:.2f}s)")
                print(f"  Min: {min_time}ms ({min_time/1000:.2f}s)")
                print(f"  Max: {max_time}ms ({max_time/1000:.2f}s)")

                # Cost analysis
                costs = [r["metadata"].get("total_cost_usd", 0) for r in successful_results if r.get("metadata")]
                if costs:
                    avg_cost = sum(costs) / len(costs)
                    print(f"\nCost Analysis:")
                    print(f"  Average cost per review: ${avg_cost:.6f}")
                    print(f"  Total cost: ${sum(costs):.6f}")

        # Save results to file for comparison
        output_file = Path("tests/performance_baseline.json")
        with open(output_file, "w") as f:
            json.dump({
                "timestamp": time.time(),
                "results": results,
            }, f, indent=2)

        print(f"\n💾 Results saved to: {output_file}")

    @pytest.mark.asyncio
    async def test_text_review_performance(self):
        """
        Test text review performance (baseline - should not regress).
        """
        test_architectures = [
            "API Gateway routes traffic to Lambda functions. Lambda functions read/write to DynamoDB tables. CloudWatch monitors all services. All deployed in us-east-1a (single AZ).",
            "CloudFront CDN distributes traffic to ALB. ALB routes to EC2 Auto Scaling Group across 2 AZs. EC2 instances query RDS Multi-AZ database with encryption enabled. S3 stores static assets with versioning.",
        ]

        results = []

        for i, design_text in enumerate(test_architectures, 1):
            print(f"\n📝 Testing text review {i}")

            request = ReviewRequest(
                design_text=design_text,
                format="text",
                tone="standard",
                provider="aws"
            )

            start_time = time.time()

            try:
                review = await analyze_design(request)
                elapsed_ms = int((time.time() - start_time) * 1000)

                result = {
                    "test": f"text_{i}",
                    "total_time_ms": elapsed_ms,
                    "score": review.architecture_score,
                    "num_risks": len(review.risks),
                }

                results.append(result)

                print(f"  ✅ Total time: {elapsed_ms}ms ({elapsed_ms/1000:.2f}s)")
                print(f"  📊 Score: {review.architecture_score}/100")
                print(f"  🔍 Risks found: {len(review.risks)}")

            except Exception as e:
                print(f"  ❌ Failed: {str(e)[:100]}")

        # Summary
        if results:
            print("\n" + "="*60)
            print("📊 TEXT REVIEW BASELINE")
            print("="*60)

            times = [r["total_time_ms"] for r in results if "total_time_ms" in r]
            if times:
                avg_time = sum(times) / len(times)
                print(f"Average text review time: {avg_time:.0f}ms ({avg_time/1000:.2f}s)")


if __name__ == "__main__":
    """Run baseline tests directly."""
    import sys

    print("\n" + "="*60)
    print("🏁 PERFORMANCE BASELINE TEST")
    print("="*60)
    print("Running baseline performance tests before optimizations...")
    print("This will measure current image and text review speeds.\n")

    # Run tests
    pytest.main([__file__, "-v", "-s"])
