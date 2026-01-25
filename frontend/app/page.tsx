"use client";

import { useState } from "react";
import { ReviewRequest, ReviewResponse, submitReview } from "@/lib/api";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { LiveReviewSection } from "@/components/home/LiveReviewSection";
import { ComparisonSection } from "@/components/home/ComparisonSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { PersonasSection } from "@/components/home/PersonasSection";
import { RoadmapTeaser } from "@/components/home/RoadmapTeaser";
import { FinalCTA } from "@/components/home/FinalCTA";

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

  const handleReset = () => {
    setReview(null);
    setLastRequest(null);
    setError(null);
  };

  return (
    <SiteLayout>
      <HeroSection />

      <LiveReviewSection
        review={review}
        loading={loading}
        error={error}
        currentTone={currentTone}
        onSubmit={handleSubmit}
        onToggleTone={handleToggleTone}
        onReset={handleReset}
      />

      {/* Only show marketing sections if no active review */}
      {!review && (
        <>
          <ComparisonSection />
          <HowItWorksSection />
          <PersonasSection />
          <RoadmapTeaser />
        </>
      )}

      <FinalCTA />
    </SiteLayout>
  );
}
