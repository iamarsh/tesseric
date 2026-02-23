/**
 * Metrics API client for fetching real-time production statistics.
 *
 * Communicates with backend metrics endpoint to retrieve live data
 * from Neo4j knowledge graph.
 */

/**
 * Real-time metrics data from production database.
 *
 * Aggregated statistics across all architecture reviews,
 * findings, and AWS services in the system.
 */
export interface MetricsData {
  /** Total number of architecture reviews analyzed */
  total_reviews: number;

  /** Number of unique AWS services recognized across all reviews */
  unique_aws_services: number;

  /** Count of findings by severity level (CRITICAL, HIGH, MEDIUM, LOW) */
  severity_breakdown: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };

  /** Average review processing time in seconds */
  avg_review_time_seconds: number;

  /** ISO 8601 timestamp of when metrics were last computed */
  last_updated: string;
}

/**
 * Fetch real-time metrics from the backend API.
 *
 * Retrieves aggregated production statistics powered by Neo4j.
 * Data is cached on the backend for 5 minutes for performance.
 *
 * @returns Promise resolving to MetricsData
 * @throws Error if fetch fails or response is invalid
 *
 * @example
 * ```typescript
 * try {
 *   const metrics = await fetchMetrics();
 *   console.log(`Total reviews: ${metrics.total_reviews}`);
 * } catch (error) {
 *   console.error('Failed to load metrics:', error);
 *   // Fallback to default values
 * }
 * ```
 */
export async function fetchMetrics(): Promise<MetricsData> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const endpoint = `${apiUrl}/api/metrics/stats`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Always fetch fresh data (backend handles caching)
    });

    if (!response.ok) {
      throw new Error(
        `Metrics API returned ${response.status}: ${response.statusText}`
      );
    }

    const data: MetricsData = await response.json();

    // Validate response structure
    if (
      typeof data.total_reviews !== "number" ||
      typeof data.unique_aws_services !== "number" ||
      typeof data.avg_review_time_seconds !== "number" ||
      !data.severity_breakdown ||
      typeof data.last_updated !== "string"
    ) {
      throw new Error("Invalid metrics response structure");
    }

    return data;
  } catch (error) {
    // Log error for debugging but don't expose internal details
    console.error("Failed to fetch metrics:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch metrics"
    );
  }
}
