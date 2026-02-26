"use client";

import { Play, GitCompare, RotateCcw, Save, ChevronDown } from "lucide-react";
import { useState } from "react";
import ExampleSelector from "./ExampleSelector";
import ArchitectureInput from "./ArchitectureInput";
import TokenEstimator from "./TokenEstimator";
import type { ExampleArchitecture } from "@/lib/example-architectures";

interface ConfigPanelProps {
  architectureText: string;
  onArchitectureChange: (text: string) => void;
  tone: "standard" | "roast";
  onToneChange: (tone: "standard" | "roast") => void;
  onAnalyze: () => void;
  onCompareBothTones: () => void;
  onReset: () => void;
  onSaveConfig: () => void;
  isAnalyzing: boolean;
  selectedExample: string;
  onSelectExample: (example: ExampleArchitecture) => void;
}

export default function ConfigPanel({
  architectureText,
  onArchitectureChange,
  tone,
  onToneChange,
  onAnalyze,
  onCompareBothTones,
  onReset,
  onSaveConfig,
  isAnalyzing,
  selectedExample,
  onSelectExample,
}: ConfigPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const canAnalyze = architectureText.trim().length > 0 && !isAnalyzing;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold">Configuration</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your architecture analysis
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Example selector */}
        <ExampleSelector
          selectedExample={selectedExample}
          onSelectExample={onSelectExample}
        />

        {/* Architecture input */}
        <ArchitectureInput
          value={architectureText}
          onChange={onArchitectureChange}
        />

        {/* Tone selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Analysis Tone
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onToneChange("standard")}
              className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                tone === "standard"
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border hover:border-primary/50 hover:bg-muted"
              }`}
            >
              <div className="font-semibold">Standard</div>
              <div className="text-xs opacity-90 mt-1">
                Professional analysis
              </div>
            </button>
            <button
              type="button"
              onClick={() => onToneChange("roast")}
              className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                tone === "roast"
                  ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                  : "border-border hover:border-orange-500/50 hover:bg-muted"
              }`}
            >
              <div className="font-semibold">Roast Mode</div>
              <div className="text-xs opacity-90 mt-1">
                Brutally honest
              </div>
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {tone === "standard"
              ? "Professional, constructive feedback aligned with AWS Well-Architected Framework"
              : "Brutally honest, personally attacking analysis that makes you question your career choices"}
          </p>
        </div>

        {/* Advanced options (collapsible) */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors"
          >
            <span>Advanced Options</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
          </button>
          {showAdvanced && (
            <div className="space-y-4 p-4 rounded-lg bg-muted/50 border border-border">
              {/* Provider (disabled for v1) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Provider
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                    AWS (only supported provider)
                  </div>
                  <a
                    href="/roadmap"
                    className="text-xs text-primary hover:underline whitespace-nowrap"
                  >
                    Multi-cloud roadmap
                  </a>
                </div>
              </div>

              {/* Token estimation */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Cost Estimation
                </label>
                <div className="p-3 rounded-md bg-background border border-border">
                  <TokenEstimator text={architectureText} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons (sticky footer) */}
      <div className="p-6 border-t border-border space-y-3 bg-background">
        {/* Primary actions */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={!canAnalyze}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            <Play className="h-4 w-4" />
            {isAnalyzing ? "Analyzing..." : "Analyze Architecture"}
          </button>
          <button
            type="button"
            onClick={onCompareBothTones}
            disabled={!canAnalyze}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <GitCompare className="h-4 w-4" />
            Try Both Tones
          </button>
        </div>

        {/* Secondary actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
          <button
            type="button"
            onClick={onSaveConfig}
            disabled={!architectureText}
            className="flex-1 flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-3 w-3" />
            Save
          </button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="text-xs text-muted-foreground text-center">
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono">Cmd+Enter</kbd>
          {" "}to analyze
          {" • "}
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono">Cmd+K</kbd>
          {" "}to focus input
        </div>
      </div>
    </div>
  );
}
