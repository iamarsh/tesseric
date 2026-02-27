"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { fetchAnalysisGraph, fetchArchitectureGraph, fetchGlobalGraph, GraphResponse, ArchitectureGraphResponse } from "@/lib/graphApi";
import { Loader2, AlertCircle, Home } from "lucide-react";
import Link from "next/link";
import { getReviewIdFromContext } from "@/lib/session";
import SessionBanner from "@/components/layout/SessionBanner";

// Dynamically import GraphViewer to avoid SSR issues with React-Flow
const GraphViewer = dynamic(() => import("@/components/GraphViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
});

function GraphPageContent() {
  const searchParams = useSearchParams();
  const urlAnalysisId = searchParams.get("id");

  // Auto-load from session if no URL param provided
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphResponse | null>(null);
  const [architectureData, setArchitectureData] = useState<ArchitectureGraphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"analysis" | "global">("global");

  // Determine analysis ID from URL or session on mount
  useEffect(() => {
    const contextReviewId = getReviewIdFromContext();
    const finalAnalysisId = urlAnalysisId || contextReviewId;

    setAnalysisId(finalAnalysisId);
    setMode(finalAnalysisId ? "analysis" : "global");
  }, [urlAnalysisId]);

  useEffect(() => {
    async function loadGraph() {
      setLoading(true);
      setError(null);

      try {
        if (mode === "analysis" && analysisId) {
          // Try to load architecture topology first (Phase 2-4 feature)
          try {
            const archData = await fetchArchitectureGraph(analysisId);
            console.log("[GRAPH DEBUG] Architecture data fetched:", {
              services: archData.services?.length || 0,
              connections: archData.connections?.length || 0,
              pattern: archData.architecture_pattern,
              servicesPreview: archData.services?.slice(0, 3).map(s => s.service_name),
            });
            setArchitectureData(archData);
            // Also load traditional graph data for fallback
            const graphData = await fetchAnalysisGraph(analysisId);
            setGraphData(graphData);
          } catch (archError) {
            console.warn("Architecture topology not available, falling back to traditional graph:", archError);
            // Fallback to traditional knowledge graph
            const graphData = await fetchAnalysisGraph(analysisId);
            setGraphData(graphData);
            setArchitectureData(null);
          }
        } else {
          // Global graph mode
          const data = await fetchGlobalGraph(100);
          setGraphData(data);
          setArchitectureData(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load graph");
        console.error("Graph loading error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadGraph();
  }, [mode, analysisId]);

  const handleToggleMode = (newMode: "analysis" | "global") => {
    setMode(newMode);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          {/* Animated skeleton */}
          <div className="relative w-96 h-64 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 400 250">
              {/* Skeleton nodes */}
              <g className="animate-pulse">
                <rect x="20" y="100" width="80" height="50" rx="8" fill="currentColor" className="text-muted opacity-20" />
                <rect x="160" y="50" width="80" height="50" rx="8" fill="currentColor" className="text-muted opacity-20" />
                <rect x="160" y="150" width="80" height="50" rx="8" fill="currentColor" className="text-muted opacity-20" />
                <rect x="300" y="100" width="80" height="50" rx="8" fill="currentColor" className="text-muted opacity-20" />
                {/* Skeleton edges */}
                <line x1="100" y1="125" x2="160" y2="75" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-muted opacity-20" />
                <line x1="100" y1="125" x2="160" y2="175" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-muted opacity-20" />
                <line x1="240" y1="75" x2="300" y2="125" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-muted opacity-20" />
                <line x1="240" y1="175" x2="300" y2="125" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-muted opacity-20" />
              </g>
            </svg>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading knowledge graph...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md text-center shadow-xl">
          <AlertCircle className="h-12 w-12 text-critical mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Graph Unavailable</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Home className="h-4 w-4" />
            Return to Analysis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <SiteLayout showFooter={false}>
      {/* Session banner (shows if user has active review) */}
      <SessionBanner />

      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Architecture Knowledge Graph
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Visualize relationships between analyses, findings, AWS services, and remediations
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <button
                onClick={() => handleToggleMode("analysis")}
                disabled={!analysisId}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "analysis"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                } ${!analysisId ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                This Analysis
              </button>
              <button
                onClick={() => handleToggleMode("global")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "global"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Global Graph
              </button>
            </div>
          </div>

          {/* Technology badges */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 text-xs font-medium text-primary">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335c-.072.048-.144.072-.208.072-.08 0-.16-.04-.239-.112-.12-.128-.216-.263-.296-.416-.08-.152-.16-.32-.248-.512-.631.744-1.423 1.116-2.383 1.116-.68 0-1.224-.193-1.624-.583-.4-.39-.6-.91-.6-1.558 0-.692.247-1.253.743-1.678.495-.424 1.15-.64 1.967-.64.272 0 .552.024.847.064.296.04.6.104.92.176v-.583c0-.608-.127-1.032-.375-1.279-.255-.248-.687-.368-1.295-.368-.28 0-.567.031-.863.104-.296.072-.583.16-.863.255-.128.056-.224.095-.28.111-.056.016-.096.024-.12.024-.104 0-.16-.072-.16-.224v-.352c0-.12.016-.208.056-.264.04-.056.12-.112.239-.168.28-.144.615-.264 1.007-.36.391-.096.808-.136 1.247-.136.952 0 1.647.216 2.095.648.44.432.663 1.08.663 1.943v2.56zm-3.287 1.23c.264 0 .536-.048.824-.143.288-.096.543-.271.768-.52.136-.16.232-.336.28-.535.048-.2.08-.424.08-.672v-.32c-.224-.064-.463-.12-.712-.159-.248-.04-.504-.056-.76-.056-.543 0-.943.104-1.207.319-.264.216-.392.52-.392.911 0 .368.095.64.287.816.191.183.48.271.831.271zm6.447.848c-.128 0-.216-.024-.272-.064-.056-.048-.104-.144-.152-.272l-1.599-5.263c-.048-.16-.072-.264-.072-.312 0-.12.064-.184.184-.184h.759c.136 0 .224.024.272.064.056.048.096.144.144.272l1.143 4.504 1.063-4.504c.04-.128.088-.224.144-.272.056-.048.144-.064.28-.064h.615c.136 0 .224.024.28.064.056.048.104.144.144.272l1.079 4.56 1.175-4.56c.048-.128.096-.224.152-.272.056-.048.136-.064.272-.064h.719c.12 0 .184.064.184.184 0 .072-.008.152-.024.232-.016.08-.04.176-.088.32l-1.647 5.263c-.048.16-.096.256-.152.272-.056.048-.144.064-.272.064h-.663c-.136 0-.224-.024-.28-.064-.056-.048-.104-.144-.144-.272l-1.055-4.384-1.047 4.384c-.04.128-.088.224-.144.272-.056.048-.144.064-.28.064h-.663zm10.735.272c-.4 0-.799-.047-1.191-.143-.392-.095-.695-.224-.903-.384-.104-.08-.176-.168-.2-.264-.024-.096-.04-.2-.04-.304v-.368c0-.152.056-.224.16-.224.064 0 .128.016.2.04.072.024.176.072.304.12.264.104.535.184.815.232.288.048.567.072.855.072.455 0 .807-.08 1.055-.232.248-.152.376-.368.376-.656 0-.192-.064-.36-.184-.488-.12-.128-.336-.248-.64-.359l-1.903-.6c-.543-.168-.943-.424-1.191-.76-.248-.336-.368-.728-.368-1.175 0-.336.072-.632.216-.888.144-.256.336-.472.576-.648.24-.176.52-.304.839-.392.32-.088.664-.12 1.023-.12.168 0 .344.008.52.032.176.024.336.056.488.088.144.04.28.08.4.127.12.048.216.096.272.144.08.048.136.096.168.16.032.063.048.144.048.24v.336c0 .152-.056.232-.16.232-.064 0-.168-.032-.32-.088-.487-.216-1.031-.32-1.631-.32-.415 0-.743.072-.975.216-.232.144-.344.36-.344.648 0 .192.072.36.208.488.136.128.368.256.695.368l1.863.592c.536.168.927.408 1.167.728.24.32.36.688.36 1.103 0 .344-.072.656-.216.928-.144.272-.344.512-.6.704-.256.192-.56.336-.928.448-.367.104-.767.16-1.199.16z"/>
              </svg>
              <span>Powered by AWS Bedrock</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M23.05 10.43L13.56 1.92a2.24 2.24 0 00-3.13 0L1.94 10.43a2.24 2.24 0 000 3.13l9.49 9.51a2.24 2.24 0 003.13 0l9.49-9.51a2.24 2.24 0 000-3.13zm-9.9 5.4L8.4 11.09l3.25-3.26L15.4 11.6l-2.25 2.24zm-3.13 3.13l-4.76-4.76L8.4 11.1l3.14 3.14-2.52 2.53zm7.64 0l-2.53-2.53 3.14-3.14 3.14 3.14-3.75 3.76zm-6.13-7.64L8.4 8.19l3.25-3.26 3.13 3.13-3.25 3.26z"/>
              </svg>
              <span>Graph by Neo4j</span>
            </div>
          </div>
        </div>

        {/* Graph container */}
        <div className="flex-1 relative">
          {graphData && (
            <GraphViewer
              nodes={graphData.nodes}
              edges={graphData.edges}
              architectureServices={architectureData?.services}
              architectureConnections={architectureData?.connections}
              architecturePattern={architectureData?.architecture_pattern || null}
              className="w-full h-full"
            />
          )}
        </div>
      </div>
    </SiteLayout>
  );
}

export default function GraphPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <GraphPageContent />
    </Suspense>
  );
}
