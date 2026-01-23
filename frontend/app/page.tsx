"use client";

import { useState } from "react";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewResults } from "@/components/ReviewResults";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { ReviewRequest, ReviewResponse, submitReview } from "@/lib/api";
import { Layers } from "lucide-react";

export default function Home() {
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTone, setCurrentTone] = useState<"standard" | "roast">("standard");
  const [lastRequest, setLastRequest] = useState<ReviewRequest | null>(null);

  const handleSubmit = async (request: ReviewRequest) => {
    setLoading(true);
    setError(null);
    setCurrentTone(request.tone);
    setLastRequest(request);

    try {
      const result = await submitReview(request);
      setReview(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze architecture");
      console.error("Error submitting review:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTone = async () => {
    if (!lastRequest) return;

    const newTone: "standard" | "roast" = currentTone === "standard" ? "roast" : "standard";
    setCurrentTone(newTone);

    const updatedRequest: ReviewRequest = {
      ...lastRequest,
      tone: newTone,
    };

    await handleSubmit(updatedRequest);
  };

  return (
    <main className="min-h-screen bg-background">
      <ThemeSwitcher />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Layers className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold text-foreground">Tesseric</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-2">Architecture, piece by piece.</p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            AI-powered AWS architecture review service that analyzes your designs and returns
            structured, Well-Architected-aligned feedback.
          </p>
        </div>

        {/* Review Form */}
        {!review && <ReviewForm onSubmit={handleSubmit} loading={loading} />}

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mt-8 p-4 bg-destructive/10 border border-destructive rounded-lg animate-fade-in">
            <p className="text-destructive font-medium">Error: {error}</p>
            <button
              onClick={() => {
                setError(null);
                setReview(null);
              }}
              className="mt-3 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Review Results */}
        {review && !error && (
          <div className="mt-12">
            <ReviewResults
              review={review}
              onToggleTone={handleToggleTone}
              currentTone={currentTone}
              loading={loading}
            />
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setReview(null);
                  setLastRequest(null);
                  setError(null);
                }}
                className="px-8 py-3 bg-card border border-border hover:bg-accent text-foreground rounded-lg font-medium transition-colors"
              >
                Review Another Architecture
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built for AWS Solutions Architect preparation and real-world use.</p>
          <p className="mt-2">
            <a
              href="https://github.com/iamarsh/tesseric"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View on GitHub
            </a>
            {" · "}
            <a
              href="/roadmap"
              className="text-primary hover:underline"
            >
              Roadmap
            </a>
            {" · "}
            <span>v0.1.0-alpha</span>
          </p>
        </div>
      </footer>
    </main>
  );
}
