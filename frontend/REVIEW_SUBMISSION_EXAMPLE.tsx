/**
 * Example: Review Submission with Session Management
 *
 * This example shows how to integrate session management into your
 * existing review submission form.
 *
 * Location: Wherever you handle review submission
 * (e.g., app/page.tsx, components/ReviewForm.tsx)
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCurrentReview } from "@/lib/session";

export default function ReviewFormExample() {
  const router = useRouter();
  const [architectureText, setArchitectureText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState<"standard" | "roast">("standard");

  /**
   * Handle text-based review submission
   */
  async function handleTextReview() {
    if (!architectureText.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch("https://tesseric-production.up.railway.app/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          design_text: architectureText,
          provider: "aws",
          tone: tone,
          format: "text",
        }),
      });

      if (!response.ok) {
        throw new Error("Review failed");
      }

      const data = await response.json();

      // 🔥 KEY STEP: Save session for cross-page context
      setCurrentReview({
        reviewId: data.review_id,
        timestamp: Date.now(),
        architecturePreview: architectureText.substring(0, 100),
        provider: "aws",
        score: data.architecture_score,
        inputMethod: "text",
      });

      // Navigate to results page with review ID
      router.push(`/results?reviewId=${data.review_id}`);

      // Or display results inline
      // setReviewResults(data);
    } catch (error) {
      console.error("Review submission failed:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Handle image-based review submission
   */
  async function handleImageReview(file: File) {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("provider", "aws");
      formData.append("tone", tone);

      const response = await fetch("https://tesseric-production.up.railway.app/review", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Image review failed");
      }

      const data = await response.json();

      // 🔥 KEY STEP: Save session with image indicator
      setCurrentReview({
        reviewId: data.review_id,
        timestamp: Date.now(),
        architecturePreview: `Architecture diagram: ${file.name}`,
        provider: "aws",
        score: data.architecture_score,
        inputMethod: "image",
      });

      // Navigate to results
      router.push(`/results?reviewId=${data.review_id}`);
    } catch (error) {
      console.error("Image review failed:", error);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Submit Architecture Review</h1>

      {/* Tone selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Tone</label>
        <div className="flex gap-4">
          <button
            onClick={() => setTone("standard")}
            className={`px-4 py-2 rounded ${
              tone === "standard" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setTone("roast")}
            className={`px-4 py-2 rounded ${
              tone === "roast" ? "bg-orange-600 text-white" : "bg-gray-200"
            }`}
          >
            Roast Mode 🔥
          </button>
        </div>
      </div>

      {/* Text input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Architecture Description
        </label>
        <textarea
          value={architectureText}
          onChange={(e) => setArchitectureText(e.target.value)}
          placeholder="Describe your AWS architecture..."
          className="w-full h-40 p-3 border rounded-lg"
          disabled={isLoading}
        />
      </div>

      {/* Submit button */}
      <button
        onClick={handleTextReview}
        disabled={isLoading || !architectureText.trim()}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? "Analyzing..." : "Analyze Architecture"}
      </button>

      {/* Image upload option */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">
          Or upload an architecture diagram
        </label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageReview(file);
          }}
          disabled={isLoading}
          className="w-full"
        />
      </div>
    </div>
  );
}

/**
 * INTEGRATION NOTES:
 *
 * 1. Replace this example form with your actual review submission logic
 * 2. The key integration is calling setCurrentReview() after successful submission
 * 3. Make sure to include all required fields in the session object
 * 4. Navigate to results page or display inline - session persists either way
 * 5. Users can then navigate to /graph and it will auto-load their review
 *
 * TESTING:
 *
 * 1. Submit a review
 * 2. Check browser localStorage - should see "tesseric_current_review"
 * 3. Navigate to /graph - should auto-load your review's graph
 * 4. Refresh page - session should persist
 * 5. Wait 24 hours - session should auto-expire
 */
