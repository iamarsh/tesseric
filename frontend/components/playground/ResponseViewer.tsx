"use client";

import { FileText, Braces, Terminal, GitCompare, Loader2 } from "lucide-react";
import { useState } from "react";
import type { ReviewResponse } from "@/lib/api";
import ResultsTab from "./ResultsTab";
import JsonTab from "./JsonTab";
import CurlTab from "./CurlTab";
import ComparisonTab from "./ComparisonTab";

interface ResponseViewerProps {
  response: ReviewResponse | null;
  comparisonResponse?: ReviewResponse | null;
  architectureText: string;
  tone: "standard" | "roast";
  isLoading: boolean;
}

type TabType = "results" | "json" | "curl" | "comparison";

export default function ResponseViewer({
  response,
  comparisonResponse,
  architectureText,
  tone,
  isLoading,
}: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("results");

  const tabs = [
    { id: "results" as TabType, label: "Results", icon: FileText },
    { id: "json" as TabType, label: "JSON", icon: Braces },
    { id: "curl" as TabType, label: "cURL", icon: Terminal },
  ];

  // Add comparison tab if we have both responses
  if (comparisonResponse) {
    tabs.push({ id: "comparison" as TabType, label: "Comparison", icon: GitCompare });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with tabs */}
      <div className="border-b border-border">
        <div className="p-6 pb-0">
          <h2 className="text-lg font-semibold">Response</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {response ? "Analysis results" : "Submit an architecture to see results"}
          </p>
        </div>

        {response && (
          <div className="flex gap-1 px-6 pt-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-background text-foreground border-x border-t border-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.id === "comparison" && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-orange-500 text-white">
                      NEW
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          /* Loading state */
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <div className="text-lg font-medium">Analyzing architecture...</div>
              <div className="text-sm text-muted-foreground mt-1">
                This typically takes 2-4 seconds
              </div>
            </div>
          </div>
        ) : !response ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <div className="text-lg font-medium">No results yet</div>
              <div className="text-sm text-muted-foreground mt-1 max-w-md">
                Select an example architecture or write your own, then click "Analyze Architecture" to see results.
              </div>
            </div>
          </div>
        ) : (
          /* Response content */
          <div>
            {activeTab === "results" && <ResultsTab response={response} />}
            {activeTab === "json" && <JsonTab response={response} />}
            {activeTab === "curl" && (
              <CurlTab architectureText={architectureText} tone={tone} />
            )}
            {activeTab === "comparison" && comparisonResponse && (
              <ComparisonTab
                standardResponse={tone === "standard" ? response : comparisonResponse}
                roastResponse={tone === "roast" ? response : comparisonResponse}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
