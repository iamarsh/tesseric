"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Sparkles } from "lucide-react";
import { ReviewRequest } from "@/lib/api";

interface ReviewFormProps {
  onSubmit: (request: ReviewRequest) => Promise<void>;
  loading: boolean;
}

export function ReviewForm({ onSubmit, loading }: ReviewFormProps) {
  const [inputMode, setInputMode] = useState<"text" | "image">("text");
  const [designText, setDesignText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [tone, setTone] = useState<"standard" | "roast">("standard");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      // TODO(Phase 3): Implement image upload and OCR
      alert(
        "Image upload feature coming in v1.1! For now, please describe your architecture using text."
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!designText.trim()) {
      alert("Please provide an architecture description");
      return;
    }

    if (designText.length < 50) {
      alert("Please provide a more detailed description (at least 50 characters)");
      return;
    }

    await onSubmit({
      design_text: designText,
      format: "text",
      tone,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Input Mode Selector */}
      <div className="flex gap-4 justify-center">
        <button
          type="button"
          onClick={() => setInputMode("text")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all border ${
            inputMode === "text"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border hover:bg-muted"
          }`}
        >
          <FileText className="h-4 w-4" />
          Text Description
        </button>
        <button
          type="button"
          onClick={() => setInputMode("image")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all border ${
            inputMode === "image"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border hover:bg-muted"
          }`}
        >
          <Upload className="h-4 w-4" />
          Upload Screenshot
        </button>
      </div>

      {/* Text Input Mode */}
      {inputMode === "text" && (
        <div className="space-y-4">
          <label htmlFor="design-text" className="block text-sm font-medium text-muted-foreground">
            Describe your AWS architecture
          </label>
          <textarea
            id="design-text"
            value={designText}
            onChange={(e) => setDesignText(e.target.value)}
            placeholder="Example: Multi-AZ deployment with EC2 instances behind an ALB. RDS MySQL database with Multi-AZ enabled. S3 buckets for static assets. CloudWatch monitoring enabled."
            rows={8}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            disabled={loading}
          />
          <p className="text-sm text-muted-foreground">
            {designText.length}/10000 characters (minimum 50)
          </p>
        </div>
      )}

      {/* Drag & Drop Mode */}
      {inputMode === "image" && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Drag & drop your architecture diagram</p>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse (PNG, JPG, PDF)
          </p>
          <button
            type="button"
            onClick={() =>
              alert(
                "Image upload feature coming in v1.1! For now, please use text description."
              )
            }
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse Files
          </button>
          <p className="text-xs text-muted-foreground mt-4">
            Feature coming in v1.1 - For now, please use text input
          </p>
        </div>
      )}

      {/* Tone Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-muted-foreground">Feedback Tone</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setTone("standard")}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all border ${
              tone === "standard"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:bg-muted"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Professional</span>
            </div>
            <p className="text-xs mt-1 opacity-70">Clear, actionable feedback</p>
          </button>
          <button
            type="button"
            onClick={() => setTone("roast")}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all border ${
              tone === "roast"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:bg-muted"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>Roast Mode</span>
            </div>
            <p className="text-xs mt-1 opacity-70">Direct, no-nonsense critique</p>
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || (inputMode === "text" && designText.length < 50)}
        className="w-full px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            Analyzing Architecture...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5" />
            Review My Architecture
          </span>
        )}
      </button>
    </form>
  );
}
