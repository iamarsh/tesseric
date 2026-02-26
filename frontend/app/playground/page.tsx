"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfigPanel from "@/components/playground/ConfigPanel";
import ResponseViewer from "@/components/playground/ResponseViewer";
import { submitReview, type ReviewRequest, type ReviewResponse } from "@/lib/api";
import { exampleArchitectures, type ExampleArchitecture } from "@/lib/example-architectures";

interface SavedConfig {
  architectureText: string;
  tone: "standard" | "roast";
  timestamp: number;
}

export default function PlaygroundPage() {
  // State
  const [architectureText, setArchitectureText] = useState("");
  const [tone, setTone] = useState<"standard" | "roast">("standard");
  const [selectedExample, setSelectedExample] = useState("Blank");
  const [response, setResponse] = useState<ReviewResponse | null>(null);
  const [comparisonResponse, setComparisonResponse] = useState<ReviewResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Refs for keyboard shortcuts
  const architectureInputRef = useRef<HTMLTextAreaElement>(null);

  // Load saved config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("playground-config");
    if (saved) {
      try {
        const config: SavedConfig = JSON.parse(saved);
        // Only load if less than 24 hours old
        if (Date.now() - config.timestamp < 24 * 60 * 60 * 1000) {
          setArchitectureText(config.architectureText);
          setTone(config.tone);
        }
      } catch (error) {
        console.error("Failed to load saved config:", error);
      }
    }
  }, []);

  // Handle example selection
  const handleSelectExample = useCallback((example: ExampleArchitecture) => {
    setSelectedExample(example.name);
    setArchitectureText(example.description);
    setTone(example.tone);
    setResponse(null);
    setComparisonResponse(null);
  }, []);

  // Handle analyze
  const handleAnalyze = useCallback(async () => {
    if (!architectureText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setResponse(null);
    setComparisonResponse(null);

    try {
      const request: ReviewRequest = {
        design_text: architectureText,
        format: "markdown",
        tone,
      };

      const result = await submitReview(request);
      setResponse(result);
      toast.success("Analysis complete!");

      // Confetti for high scores (>90)
      if (result.architecture_score > 90) {
        toast.success("🎉 Excellent architecture!", { autoClose: 5000 });
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to analyze architecture. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [architectureText, tone, isAnalyzing]);

  // Handle compare both tones
  const handleCompareBothTones = useCallback(async () => {
    if (!architectureText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setResponse(null);
    setComparisonResponse(null);

    try {
      // Run both requests in parallel
      const [standardResult, roastResult] = await Promise.all([
        submitReview({
          design_text: architectureText,
          format: "markdown",
          tone: "standard",
        }),
        submitReview({
          design_text: architectureText,
          format: "markdown",
          tone: "roast",
        }),
      ]);

      // Set responses based on current tone
      if (tone === "standard") {
        setResponse(standardResult);
        setComparisonResponse(roastResult);
      } else {
        setResponse(roastResult);
        setComparisonResponse(standardResult);
      }

      toast.success("Both tone analyses complete!");
    } catch (error) {
      console.error("Comparison failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to compare tones. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [architectureText, tone, isAnalyzing]);

  // Handle reset
  const handleReset = useCallback(() => {
    setArchitectureText("");
    setTone("standard");
    setSelectedExample("Blank");
    setResponse(null);
    setComparisonResponse(null);
    toast.info("Configuration reset");
  }, []);

  // Handle save config
  const handleSaveConfig = useCallback(() => {
    if (!architectureText) {
      toast.warning("Nothing to save");
      return;
    }

    const config: SavedConfig = {
      architectureText,
      tone,
      timestamp: Date.now(),
    };

    localStorage.setItem("playground-config", JSON.stringify(config));
    toast.success("Configuration saved!");
  }, [architectureText, tone]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter: Analyze
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleAnalyze();
      }

      // Cmd/Ctrl + K: Focus architecture input
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const textarea = document.querySelector<HTMLTextAreaElement>(
          'textarea[placeholder*="Describe your AWS architecture"]'
        );
        textarea?.focus();
      }

      // Cmd/Ctrl + R: Reset
      if ((e.metaKey || e.ctrlKey) && e.key === "r") {
        e.preventDefault();
        handleReset();
      }

      // Esc: Clear focus
      if (e.key === "Escape") {
        (document.activeElement as HTMLElement)?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAnalyze, handleReset]);

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="dark:invert"
      />

      {/* Header */}
      <div className="border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">API Playground</h1>
          <p className="text-muted-foreground mt-2">
            Explore Tesseric's architecture analysis with interactive examples, live previews, and cURL commands.
          </p>
        </div>
      </div>

      {/* Main content - Split screen */}
      <div className="h-[calc(100vh-140px)]">
        <div className="container mx-auto px-4 py-6 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
            {/* Left panel - Config (60% on desktop) */}
            <div className="lg:col-span-3 h-full">
              <div className="h-full rounded-lg border border-border bg-card shadow-lg">
                <ConfigPanel
                  architectureText={architectureText}
                  onArchitectureChange={setArchitectureText}
                  tone={tone}
                  onToneChange={setTone}
                  onAnalyze={handleAnalyze}
                  onCompareBothTones={handleCompareBothTones}
                  onReset={handleReset}
                  onSaveConfig={handleSaveConfig}
                  isAnalyzing={isAnalyzing}
                  selectedExample={selectedExample}
                  onSelectExample={handleSelectExample}
                />
              </div>
            </div>

            {/* Right panel - Response (40% on desktop) */}
            <div className="lg:col-span-2 h-full">
              <div className="h-full rounded-lg border border-border bg-card shadow-lg">
                <ResponseViewer
                  response={response}
                  comparisonResponse={comparisonResponse}
                  architectureText={architectureText}
                  tone={tone}
                  isLoading={isAnalyzing}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
