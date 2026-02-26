"use client";

import { useEffect, useState } from "react";
import { X, Eye } from "lucide-react";
import { getCurrentReview, clearCurrentReview, type ReviewSession } from "@/lib/session";

/**
 * Session Banner Component
 *
 * Displays current review context at top of pages (graph, architecture, etc.)
 * Allows users to see what they're currently viewing and clear session.
 */
export default function SessionBanner() {
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Load session on mount
    const currentSession = getCurrentReview();
    setSession(currentSession);
  }, []);

  if (!session || !isVisible) return null;

  const handleClear = () => {
    clearCurrentReview();
    setSession(null);
    setIsVisible(false);
    // Optionally reload page or update graph to show global view
    window.location.reload();
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const timeAgo = getTimeAgo(session.timestamp);
  const scoreColor = session.score
    ? session.score >= 80
      ? "text-green-600 dark:text-green-400"
      : session.score >= 50
      ? "text-yellow-600 dark:text-yellow-400"
      : "text-red-600 dark:text-red-400"
    : "";

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Viewing your architecture review
                {session.score && (
                  <span className={`ml-2 font-bold ${scoreColor}`}>
                    ({session.score}/100)
                  </span>
                )}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 truncate mt-0.5">
                {session.architecturePreview}... • {timeAgo} • {session.inputMethod === "image" ? "📷 Image" : "📝 Text"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors"
              title="Dismiss (session remains active)"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-md transition-colors"
            >
              Clear Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
