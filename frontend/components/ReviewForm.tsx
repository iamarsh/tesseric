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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    // Reset errors
    setUploadError(null);

    // Validate file type
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'application/pdf'
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only PNG, JPG, WebP, GIF, BMP, TIFF, and PDF files are supported');
      return;
    }

    // Validate file size (< 5 MB)
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadError(`File must be smaller than ${maxSizeMB} MB`);
      return;
    }

    setUploadedFile(file);

    // Generate preview for images (not PDFs)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null); // No preview for PDFs
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate based on input mode
    if (inputMode === "text") {
      if (!designText.trim()) {
        alert("Please provide an architecture description");
        return;
      }

      if (designText.length < 50) {
        alert("Please provide a more detailed description (at least 50 characters)");
        return;
      }
    }

    if (inputMode === "image") {
      if (!uploadedFile) {
        alert("Please upload an architecture diagram");
        return;
      }
    }

    // Build request based on input mode
    if (inputMode === "image" && uploadedFile) {
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('tone', tone);
      formData.append('provider', 'aws');

      await onSubmit(formData as any); // Type assertion for compatibility
    } else {
      // Create JSON request for text
      await onSubmit({
        design_text: designText,
        format: "text",
        tone,
      });
    }
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
        <div className="space-y-4">
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
              or click to browse (PNG, JPG, WebP, GIF, BMP, TIFF, PDF - max 5 MB)
            </p>
            <input
              type="file"
              id="file-upload"
              accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,image/tiff,application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Browse Files
            </label>
          </div>

          {/* Image Preview */}
          {uploadedFile && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFile(null);
                    setImagePreview(null);
                    setUploadError(null);
                  }}
                  className="text-sm text-destructive hover:underline"
                >
                  Remove
                </button>
              </div>

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Architecture diagram preview"
                  className="w-full max-h-64 object-contain rounded-lg border border-border"
                />
              )}
            </div>
          )}

          {/* Upload Error */}
          {uploadError && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm text-destructive">{uploadError}</p>
            </div>
          )}
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
        disabled={loading || (inputMode === "text" && designText.length < 50) || (inputMode === "image" && !uploadedFile)}
        className="w-full px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            Analyzing Architecture...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5" />
            Get My Architecture Score
          </span>
        )}
      </button>
    </form>
  );
}
