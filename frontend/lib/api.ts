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

export async function submitReview(request: ReviewRequest): Promise<ReviewResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  try {
    const response = await fetch(`${apiUrl}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(error.detail || `API error: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    // Backend unavailable - use client-side fallback
    console.warn("Backend unavailable, using client-side fallback analyzer:", error);

    // Dynamically import fallback to reduce initial bundle size
    const { analyzeFallback } = await import("./fallback-analyzer");
    return analyzeFallback(request);
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
