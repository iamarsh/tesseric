"use client";

import { XCircle } from "lucide-react";
import { ReviewForm } from "../ReviewForm";
import { ReviewResults } from "../ReviewResults";
import { ReviewRequest, ReviewResponse } from "@/lib/api";

interface LiveReviewSectionProps {
  review: ReviewResponse | null;
  loading: boolean;
  error: string | null;
  currentTone: "standard" | "roast";
  onSubmit: (request: ReviewRequest) => Promise<void>;
  onToggleTone: () => void;
  onReset: () => void;
}

export function LiveReviewSection({
  review,
  loading,
  error,
  currentTone,
  onSubmit,
  onToggleTone,
  onReset
}: LiveReviewSectionProps) {
  return (
    <section id="review" className="container mx-auto px-4 py-16 md:py-24">
      {/* Section Header */}
      <div className="text-center mb-12 max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-foreground mb-4">
          Try It Now
        </h2>
        <p className="text-lg text-muted-foreground">
          Paste your AWS architecture description and get instant, AI-powered feedback
          aligned with the Well-Architected Framework.
        </p>
      </div>

      {/* Review Form (only show if no review) */}
      {!review && <ReviewForm onSubmit={onSubmit} loading={loading} />}

      {/* Error Display */}
      {error && (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-critical/10 border border-critical rounded-xl animate-fade-in">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-critical flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-critical font-semibold mb-1">Analysis Failed</p>
              <p className="text-sm text-critical/80">{error}</p>
            </div>
          </div>
          <button
            onClick={onReset}
            className="mt-4 px-4 py-2 bg-critical text-white rounded-lg hover:bg-critical/90 transition-colors font-medium"
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
            onToggleTone={onToggleTone}
            currentTone={currentTone}
            loading={loading}
          />
          <div className="text-center mt-8">
            <button
              onClick={onReset}
              className="px-8 py-3 bg-card border border-border hover:bg-muted text-foreground rounded-lg font-medium transition-colors"
            >
              Review Another Architecture
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
