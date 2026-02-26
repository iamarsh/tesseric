# Session Management Integration Guide

## Overview

The session management system allows users to seamlessly navigate between pages without losing context of their current architecture review. This guide shows how to integrate session management into existing pages.

---

## 🎯 User Flow

1. **User submits review** (text or image) → Review results displayed
2. **Session automatically saved** with review_id and metadata
3. **User navigates to `/graph`** → Automatically shows their architecture graph
4. **User navigates to `/architecture`** → Banner shows "Viewing your review"
5. **Session persists** for 24 hours or until user clears it

---

## 📦 Files Added

- `frontend/lib/session.ts` - Session management utilities
- `frontend/components/layout/SessionBanner.tsx` - Visual session indicator

---

## 🔧 Integration Steps

### **Step 1: Save Session After Review Submission**

In your review submission component (e.g., `app/page.tsx` or review form component):

```typescript
import { setCurrentReview } from "@/lib/session";

// After successful review submission
async function handleReviewSubmit(architectureText: string) {
  const response = await fetch("/api/review", {
    method: "POST",
    body: JSON.stringify({
      design_text: architectureText,
      provider: "aws",
      tone: "standard",
    }),
  });

  const data = await response.json();

  // Save session for cross-page context
  setCurrentReview({
    reviewId: data.review_id,
    timestamp: Date.now(),
    architecturePreview: architectureText.substring(0, 100), // First 100 chars
    provider: "aws",
    score: data.architecture_score,
    inputMethod: "text", // or "image"
  });

  // Display results or navigate
  router.push(`/results?reviewId=${data.review_id}`);
}
```

**For image uploads:**

```typescript
async function handleImageUpload(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("provider", "aws");
  formData.append("tone", "standard");

  const response = await fetch("/api/review", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  // Save session with image indicator
  setCurrentReview({
    reviewId: data.review_id,
    timestamp: Date.now(),
    architecturePreview: `Architecture diagram: ${file.name}`,
    provider: "aws",
    score: data.architecture_score,
    inputMethod: "image",
  });

  router.push(`/results?reviewId=${data.review_id}`);
}
```

---

### **Step 2: Auto-Load Session on Graph Page**

In `app/graph/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getCurrentReview, getReviewIdFromContext } from "@/lib/session";
import SessionBanner from "@/components/layout/SessionBanner";

export default function GraphPage() {
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    // Auto-load review ID from URL params or session
    const contextReviewId = getReviewIdFromContext();

    if (contextReviewId) {
      setReviewId(contextReviewId);
      loadArchitectureGraph(contextReviewId);
    } else {
      // No session - show global graph
      loadGlobalGraph();
    }
  }, []);

  async function loadArchitectureGraph(id: string) {
    const response = await fetch(`/api/graph/${id}/architecture`);
    const data = await response.json();
    setGraphData(data);
  }

  async function loadGlobalGraph() {
    const response = await fetch("/api/graph/global/all");
    const data = await response.json();
    setGraphData(data);
  }

  return (
    <div>
      {/* Show session banner if user has active review */}
      <SessionBanner />

      {/* Graph visualization */}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          {reviewId ? "Your Architecture Graph" : "Global Knowledge Graph"}
        </h1>

        {/* Render graph data */}
        {graphData && <GraphVisualization data={graphData} />}

        {/* Option to switch views */}
        <div className="mt-4">
          {reviewId ? (
            <button onClick={() => loadGlobalGraph()}>
              View Global Graph
            </button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Submit a review to see your personalized architecture graph
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### **Step 3: Add Session Banner to Relevant Pages**

Add the `<SessionBanner />` component to pages where context matters:

**Example: Architecture Page**

```typescript
// app/architecture/page.tsx
import SessionBanner from "@/components/layout/SessionBanner";

export default function ArchitecturePage() {
  return (
    <div>
      <SessionBanner />

      {/* Rest of architecture page content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1>System Architecture</h1>
        {/* ... */}
      </div>
    </div>
  );
}
```

**Example: Results Page**

```typescript
// app/results/page.tsx
import SessionBanner from "@/components/layout/SessionBanner";

export default function ResultsPage() {
  return (
    <div>
      <SessionBanner />

      {/* Review results display */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ... */}
      </div>
    </div>
  );
}
```

---

### **Step 4: Optional - Add "View Graph" CTA After Review**

In your results page, add a prominent button to view the graph:

```typescript
import { useRouter } from "next/navigation";

function ResultsPage() {
  const router = useRouter();

  return (
    <div>
      {/* Review results */}
      <div className="review-results">
        <h2>Architecture Score: {score}/100</h2>
        {/* Findings, summary, etc. */}
      </div>

      {/* Quick navigation to graph */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => router.push("/graph")}
          className="btn-primary"
        >
          📊 View Architecture Graph
        </button>

        <button
          onClick={() => router.push("/architecture")}
          className="btn-secondary"
        >
          🏗️ See How Tesseric Works
        </button>
      </div>
    </div>
  );
}
```

---

## 🧪 Testing

### **Test Session Persistence**

1. Submit a review with text or image
2. Navigate to `/graph` → Should auto-load your review's graph
3. Navigate to `/architecture` → Should show session banner
4. Close browser and reopen → Session should persist (24h TTL)
5. Click "Clear Session" → Should reset to default view

### **Test URL Parameters**

1. Share a direct link: `https://tesseric.ca/graph?reviewId=abc123`
2. Link should work even without active session
3. URL parameter takes priority over session storage

### **Test Edge Cases**

- [ ] Submit review → immediately navigate to graph (should work)
- [ ] Session expired (>24h) → should auto-clear and show global graph
- [ ] localStorage disabled → should gracefully degrade
- [ ] Multiple tabs → session should sync across tabs
- [ ] SSR/SSG pages → session should only load client-side

---

## 🎨 UI/UX Considerations

### **Session Banner Design**

The `SessionBanner` component shows:
- 👁️ Icon + "Viewing your architecture review"
- Architecture preview (first 100 chars)
- Score badge (color-coded)
- Time ago ("5m ago", "2h ago")
- Input method indicator (📷 Image or 📝 Text)
- Dismiss button (hides banner but keeps session)
- Clear Session button (removes session and reloads)

### **Color Coding**

- Score ≥80: Green (good)
- Score 50-79: Yellow (needs improvement)
- Score <50: Red (critical issues)

### **Banner Placement**

Show session banner on:
- ✅ `/graph` - Most important (main use case)
- ✅ `/architecture` - For context
- ✅ `/results` - Shows what you're viewing
- ❌ `/` (homepage) - Not needed, clutters CTA

---

## 🔒 Privacy Considerations

### **What's Stored in LocalStorage**

```json
{
  "reviewId": "abc123",
  "timestamp": 1234567890,
  "architecturePreview": "Multi-AZ deployment across us-east-1a and us-east-1b...",
  "provider": "aws",
  "score": 85,
  "inputMethod": "text"
}
```

### **What's NOT Stored**

- ❌ Full architecture description (privacy)
- ❌ Findings details (stored in backend only)
- ❌ User personal information
- ❌ Sensitive configuration data

### **Data Retention**

- **Client-side**: 24 hours (localStorage TTL)
- **Backend**: Ephemeral (no persistence by design)
- **Neo4j**: Only metadata (review_id, score, services, findings)

---

## 📊 Analytics (Optional)

Track session usage for product insights:

```typescript
// In handleReviewSubmit
setCurrentReview({
  // ... session data
});

// Optional: Track session creation
if (typeof window !== "undefined" && window.gtag) {
  window.gtag("event", "session_created", {
    review_id: data.review_id,
    input_method: "text",
    score: data.architecture_score,
  });
}
```

---

## 🚀 Future Enhancements

1. **Session History** - Store last 5 reviews, let user switch between them
2. **Named Sessions** - Allow users to name/tag reviews ("Production", "Staging")
3. **Share Sessions** - Generate shareable links with review_id
4. **Export Sessions** - Download review data as JSON/PDF
5. **Multi-Tab Sync** - Use `localStorage` events to sync across tabs

---

## 🐛 Troubleshooting

### Session Not Persisting

**Issue**: Session clears on page reload
**Solution**: Check localStorage permissions in browser, ensure session.ts is imported correctly

### Session Not Loading on Graph Page

**Issue**: Graph page shows global view instead of user's review
**Solution**: Verify `getReviewIdFromContext()` is called in `useEffect`, check browser console for errors

### Banner Not Showing

**Issue**: SessionBanner component not visible
**Solution**: Ensure component is added to page layout, check if session is actually set (inspect localStorage)

### Stale Session Data

**Issue**: Old review data showing after new submission
**Solution**: Call `clearCurrentReview()` before `setCurrentReview()` to ensure fresh data

---

## 📚 API Reference

### `setCurrentReview(session: ReviewSession)`

Saves review session to localStorage.

**Parameters**:
- `reviewId`: Unique review identifier
- `timestamp`: Unix timestamp (milliseconds)
- `architecturePreview`: First 100 chars of description
- `provider`: Cloud provider ("aws" | "azure" | "gcp")
- `score`: Architecture score (0-100)
- `inputMethod`: How review was submitted ("text" | "image")

### `getCurrentReview(): ReviewSession | null`

Retrieves active session if not expired (24h TTL).

### `clearCurrentReview(): void`

Removes session from localStorage.

### `hasActiveSession(): boolean`

Checks if valid session exists.

### `getReviewIdFromContext(): string | null`

Gets review ID from URL params (priority) or session (fallback).

### `setReviewIdInUrl(reviewId: string): void`

Adds review ID to URL without page reload (for sharing).

---

## ✅ Integration Checklist

- [ ] `session.ts` added to `frontend/lib/`
- [ ] `SessionBanner.tsx` added to `frontend/components/layout/`
- [ ] Review submission saves session with `setCurrentReview()`
- [ ] Graph page auto-loads from session with `getReviewIdFromContext()`
- [ ] SessionBanner added to relevant pages
- [ ] "View Graph" CTA added to results page
- [ ] Testing completed (persistence, URL params, edge cases)
- [ ] Privacy considerations reviewed
- [ ] Documentation updated

---

**Questions?** See [frontend/lib/session.ts](lib/session.ts) for implementation details or check [components/layout/SessionBanner.tsx](components/layout/SessionBanner.tsx) for UI reference.
