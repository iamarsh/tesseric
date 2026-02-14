"use client";

import { useState } from "react";
import { ReviewRequest, ReviewResponse, submitReview } from "@/lib/api";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { LiveReviewSection } from "@/components/home/LiveReviewSection";
import { ComparisonSection } from "@/components/home/ComparisonSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { PersonasSection } from "@/components/home/PersonasSection";
import { FAQSection } from "@/components/home/FAQSection";
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

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Tesseric",
    "applicationCategory": "DeveloperApplication",
    "offers": {
      "@type": "Offer",
      "price": "0.01",
      "priceCurrency": "USD",
      "description": "Pay per review, no subscription required"
    },
    "description": "Instant AWS architecture reviews that deliver a Well-Architected-aligned score, risks, and remediations",
    "operatingSystem": "Web",
    "url": "https://tesseric.ca",
    "author": {
      "@type": "Person",
      "name": "Arsh Singh",
      "url": "https://iamarsh.com"
    },
    "featureList": [
      "AWS Well-Architected Framework alignment",
      "Powered by Amazon Bedrock and Claude 3.5 Haiku",
      "Architecture score from 0 to 100",
      "Structured risk identification with severity levels",
      "Remediation recommendations",
      "Professional and Roast tone modes",
      "No signup required",
      "Cost: ~$0.01 per review"
    ]
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

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
          <TestimonialsSection />
          <HowItWorksSection />
          <PersonasSection />
          <FAQSection />
          <RoadmapTeaser />
        </>
      )}

      <FinalCTA />
      </SiteLayout>
    </>
  );
}
