#!/usr/bin/env python3
"""
Test script for rate limiting functionality.

Tests the rate limiting middleware by sending multiple requests
to different endpoints and verifying HTTP 429 responses.

Usage:
    python test_rate_limit.py [--base-url URL]

Examples:
    # Test local development server
    python test_rate_limit.py

    # Test production API
    python test_rate_limit.py --base-url https://tesseric-production.up.railway.app
"""

import requests
import time
import sys
from typing import Dict, List


def test_rate_limit(
    endpoint: str,
    base_url: str = "http://localhost:8000",
    limit: int = 10,
    test_count: int = 15,
) -> Dict[str, any]:
    """
    Test rate limiting on a specific endpoint.

    Args:
        endpoint: API endpoint to test (e.g., "/review")
        base_url: Base URL of the API
        limit: Expected rate limit
        test_count: Number of requests to send (should exceed limit)

    Returns:
        Dict with test results
    """
    print(f"\n{'='*60}")
    print(f"Testing: {endpoint}")
    print(f"Expected limit: {limit} requests/minute")
    print(f"Sending: {test_count} requests")
    print(f"{'='*60}\n")

    url = f"{base_url}{endpoint}"
    success_count = 0
    rate_limited_count = 0
    responses: List[Dict] = []

    for i in range(1, test_count + 1):
        try:
            if endpoint == "/review":
                # POST request with minimal data
                response = requests.post(
                    url,
                    json={
                        "design_text": "Test architecture",
                        "provider": "aws",
                        "tone": "standard",
                    },
                    timeout=10,
                )
            else:
                # GET request
                response = requests.get(url, timeout=10)

            status = response.status_code
            responses.append({"request": i, "status": status, "body": response.json()})

            if status == 200:
                success_count += 1
                print(f"✅ Request {i}: {status} OK")
            elif status == 429:
                rate_limited_count += 1
                data = response.json()
                retry_after = data.get("retry_after", "unknown")
                print(f"⛔ Request {i}: {status} RATE LIMITED (retry after {retry_after}s)")
            else:
                print(f"⚠️  Request {i}: {status} {response.text[:100]}")

            # Small delay to avoid overwhelming the server
            time.sleep(0.1)

        except requests.exceptions.RequestException as e:
            print(f"❌ Request {i}: ERROR - {str(e)}")

    print(f"\n{'='*60}")
    print(f"Results for {endpoint}:")
    print(f"  ✅ Successful: {success_count}")
    print(f"  ⛔ Rate limited: {rate_limited_count}")
    print(f"  📊 Total: {test_count}")
    print(f"{'='*60}\n")

    # Verify rate limiting is working
    if rate_limited_count > 0:
        print(f"✅ Rate limiting is WORKING for {endpoint}")
        # Check if we got rate limit headers
        if responses and rate_limited_count > 0:
            for resp in responses:
                if resp["status"] == 429:
                    print(f"   Rate limit response: {resp['body']}")
                    break
    else:
        print(f"⚠️  WARNING: No rate limiting detected for {endpoint}")
        print(f"   This is expected if testing from localhost (bypassed in dev)")

    return {
        "endpoint": endpoint,
        "success": success_count,
        "rate_limited": rate_limited_count,
        "total": test_count,
    }


def main():
    """Main test runner."""
    import argparse

    parser = argparse.ArgumentParser(description="Test Tesseric rate limiting")
    parser.add_argument(
        "--base-url",
        default="http://localhost:8000",
        help="Base URL of the API (default: http://localhost:8000)",
    )
    args = parser.parse_args()

    base_url = args.base_url

    print("\n🧪 Tesseric Rate Limit Test Suite")
    print(f"Testing API: {base_url}\n")

    # Check if server is running
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code != 200:
            print(f"❌ Server health check failed: {response.status_code}")
            sys.exit(1)
        print("✅ Server is running\n")
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to server: {e}")
        print(f"   Make sure the server is running at {base_url}")
        sys.exit(1)

    # Test each endpoint
    results = []

    # Test /api/metrics/stats (60/minute limit)
    results.append(
        test_rate_limit(
            endpoint="/api/metrics/stats",
            base_url=base_url,
            limit=60,
            test_count=65,  # Exceed limit by 5
        )
    )

    # Test /api/graph/health (30/minute limit)
    results.append(
        test_rate_limit(
            endpoint="/api/graph/health",
            base_url=base_url,
            limit=30,
            test_count=35,  # Exceed limit by 5
        )
    )

    # Note: /review requires valid input and costs money, so we test with fewer requests
    print("\n⚠️  NOTE: Skipping /review endpoint test to avoid AI costs")
    print("   To test /review manually:")
    print(f"   for i in {{1..15}}; do curl -X POST {base_url}/review -H 'Content-Type: application/json' -d '{{\"design_text\":\"test\",\"provider\":\"aws\"}}'; echo; done")

    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    for result in results:
        print(f"\n{result['endpoint']}:")
        print(f"  ✅ Successful: {result['success']}/{result['total']}")
        print(f"  ⛔ Rate limited: {result['rate_limited']}/{result['total']}")

    print("\n✅ Rate limiting tests completed!")
    print("\n💡 IMPORTANT NOTES:")
    print("   1. Localhost requests bypass rate limiting for dev convenience")
    print("   2. To test from external IP, deploy to production or use VPN")
    print("   3. Rate limits reset after 1 minute")
    print("   4. Redis backend provides persistent rate limiting across restarts")


if __name__ == "__main__":
    main()
