/**
 * Session Management for Tesseric
 *
 * Maintains user's current review context across pages using localStorage.
 * Enables seamless navigation between review results, graph, and other pages
 * without losing context.
 */

export interface ReviewSession {
  reviewId: string;
  timestamp: number; // Unix timestamp
  architecturePreview: string; // First 100 chars of description
  provider: string; // "aws" | "azure" | "gcp"
  score?: number; // Architecture score if available
  inputMethod: "text" | "image"; // How the review was submitted
}

const SESSION_KEY = "tesseric_current_review";
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Save current review to session
 */
export function setCurrentReview(session: ReviewSession): void {
  if (typeof window === "undefined") return; // SSR safety

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.warn("Failed to save review session:", error);
  }
}

/**
 * Get current review from session (if not expired)
 */
export function getCurrentReview(): ReviewSession | null {
  if (typeof window === "undefined") return null; // SSR safety

  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    const session: ReviewSession = JSON.parse(stored);

    // Check if session is expired (older than 24 hours)
    const now = Date.now();
    if (now - session.timestamp > SESSION_TTL) {
      clearCurrentReview();
      return null;
    }

    return session;
  } catch (error) {
    console.warn("Failed to read review session:", error);
    return null;
  }
}

/**
 * Clear current review session
 */
export function clearCurrentReview(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.warn("Failed to clear review session:", error);
  }
}

/**
 * Check if a review session exists
 */
export function hasActiveSession(): boolean {
  return getCurrentReview() !== null;
}

/**
 * Get review ID from URL params or session (in that order)
 */
export function getReviewIdFromContext(): string | null {
  if (typeof window === "undefined") return null;

  // Priority 1: URL parameter (for direct links)
  const urlParams = new URLSearchParams(window.location.search);
  const urlReviewId = urlParams.get("reviewId") || urlParams.get("id");
  if (urlReviewId) return urlReviewId;

  // Priority 2: Session storage (for navigation within app)
  const session = getCurrentReview();
  return session?.reviewId || null;
}

/**
 * Update URL with review ID (without page reload)
 */
export function setReviewIdInUrl(reviewId: string): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.searchParams.set("reviewId", reviewId);
  window.history.pushState({}, "", url.toString());
}

/**
 * Remove review ID from URL
 */
export function clearReviewIdFromUrl(): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.searchParams.delete("reviewId");
  url.searchParams.delete("id");
  window.history.pushState({}, "", url.toString());
}

/**
 * Get session summary for UI display
 */
export function getSessionSummary(): string | null {
  const session = getCurrentReview();
  if (!session) return null;

  const timeAgo = getTimeAgo(session.timestamp);
  return `${session.architecturePreview}... (${timeAgo})`;
}

/**
 * Helper: Format timestamp to relative time
 */
function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
