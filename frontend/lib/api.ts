export interface ReviewRequest {
  design_text: string;
  format: "markdown" | "text";
  tone: "standard" | "roast";
}

export interface RiskItem {
  id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  pillar:
    | "operational_excellence"
    | "security"
    | "reliability"
    | "performance_efficiency"
    | "cost_optimization"
    | "sustainability";
  impact: string;
  likelihood?: string;
  finding: string;
  remediation: string;
  references: string[];
}

export interface ReviewResponse {
  review_id: string;
  architecture_score: number;
  risks: RiskItem[];
  summary: string;
  tone: string;
  created_at: string;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function submitReview(
  request: ReviewRequest | FormData
): Promise<ReviewResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Determine if request is FormData (image) or JSON (text)
  const isFormData = request instanceof FormData;

  try {
    const response = await fetch(`${apiUrl}/review`, {
      method: "POST",
      // Only set Content-Type for JSON; browser sets multipart boundary for FormData
      headers: isFormData ? {} : { "Content-Type": "application/json" },
      body: isFormData ? request : JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Unknown error" }));
      throw new ApiError(
        error.detail || `API error: ${response.statusText}`,
        response.status
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError && error.status < 500) {
      throw error;
    }

    // Backend unavailable - only use fallback for text requests
    if (!isFormData) {
      console.warn("Backend unavailable, using client-side fallback analyzer:", error);

      // Dynamically import fallback to reduce initial bundle size
      const { analyzeFallback } = await import("./fallback-analyzer");
      return analyzeFallback(request as ReviewRequest);
    } else {
      // Image uploads require backend - cannot fallback
      throw new Error("Image analysis requires backend connection. Please try again later.");
    }
  }
}

export async function checkHealth(): Promise<{ status: string; version: string; service: string }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const response = await fetch(`${apiUrl}/health`);

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }

  return response.json();
}

export interface MetricsResponse {
  total_reviews: number;
  unique_aws_services: number;
  severity_breakdown: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  avg_review_time_seconds: number;
  last_updated: string;
}

export async function getMetrics(): Promise<MetricsResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const response = await fetch(`${apiUrl}/api/metrics/stats`);

  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.statusText}`);
  }

  return response.json();
}
