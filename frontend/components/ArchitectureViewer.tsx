/**
 * ArchitectureViewer Component
 *
 * Main container for architecture-first visualization with bidirectional highlighting.
 * Layout: 60% graph (top) + 40% action cards (bottom).
 *
 * Features:
 * - Fetches architecture graph and review data
 * - Manages shared state between graph and cards
 * - Bidirectional highlighting (click service ↔ click card)
 * - Smooth scrolling between sections
 * - Backward compatible (falls back to generic graph if no topology)
 */

"use client";

import { useState, useEffect, useRef } from "react";
import GraphViewer from "./GraphViewer";
import ActionFindingCard from "./ActionFindingCard";
import { ReviewResponse } from "@/lib/api";
import {
  fetchArchitectureGraph,
  ArchitectureGraphResponse,
} from "@/lib/graphApi";

interface ArchitectureViewerProps {
  review: ReviewResponse;
}

export default function ArchitectureViewer({
  review,
}: ArchitectureViewerProps) {
  const [architectureData, setArchitectureData] =
    useState<ArchitectureGraphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Shared state for bidirectional highlighting
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(
    null
  );

  // Refs for smooth scrolling
  const graphRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Fetch architecture graph data
  useEffect(() => {
    const loadArchitectureData = async () => {
      try {
        setLoading(true);
        const data = await fetchArchitectureGraph(review.review_id);
        setArchitectureData(data);
      } catch (err) {
        console.error("Failed to fetch architecture graph:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load architecture"
        );
      } finally {
        setLoading(false);
      }
    };

    loadArchitectureData();
  }, [review.review_id]);

  // Build service → findings mapping
  const serviceToFindings = new Map<string, string[]>();
  review.risks.forEach((risk) => {
    // Extract service names from finding text (basic extraction)
    const findingText = `${risk.finding} ${risk.impact} ${risk.remediation}`;
    architectureData?.services.forEach((service) => {
      if (findingText.includes(service.service_name)) {
        const findingIds = serviceToFindings.get(service.service_name) || [];
        findingIds.push(risk.id);
        serviceToFindings.set(service.service_name, findingIds);
      }
    });
  });

  // Build finding → services mapping
  const findingToServices = new Map<string, string[]>();
  review.risks.forEach((risk) => {
    const affectedServices: string[] = [];
    const findingText = `${risk.finding} ${risk.impact} ${risk.remediation}`;
    architectureData?.services.forEach((service) => {
      if (findingText.includes(service.service_name)) {
        affectedServices.push(service.service_name);
      }
    });
    findingToServices.set(risk.id, affectedServices);
  });

  // Handle service selection (from graph or card badge)
  const handleServiceClick = (serviceName: string) => {
    const newSelection =
      selectedServiceId === serviceName ? null : serviceName;
    setSelectedServiceId(newSelection);
    setSelectedFindingId(null);

    // Scroll to cards section if service selected
    if (newSelection && cardsRef.current) {
      cardsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Handle finding card selection
  const handleFindingClick = (findingId: string) => {
    const newSelection = selectedFindingId === findingId ? null : findingId;
    setSelectedFindingId(newSelection);
    setSelectedServiceId(null);

    // Scroll to graph if finding selected
    if (newSelection && graphRef.current) {
      graphRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Sort risks by severity
  const sortedRisks = [...review.risks].sort((a, b) => {
    const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    return (
      (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
    );
  });

  // Check if card should be highlighted
  const isCardHighlighted = (riskId: string): boolean => {
    if (selectedFindingId === riskId) return true;
    if (selectedServiceId) {
      const services = findingToServices.get(riskId) || [];
      return services.includes(selectedServiceId);
    }
    return false;
  };

  // Check if service should be highlighted
  const isServiceHighlighted = (serviceName: string): boolean => {
    if (selectedServiceId === serviceName) return true;
    if (selectedFindingId) {
      const services = findingToServices.get(selectedFindingId) || [];
      return services.includes(serviceName);
    }
    return false;
  };

  // Fallback to generic graph if no architecture data
  if (error || !architectureData) {
    return (
      <div className="w-full h-screen bg-background">
        <GraphViewer nodes={[]} edges={[]} className="h-full" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      {/* Graph Section (60% height) */}
      <div ref={graphRef} className="h-[60%] border-b border-border">
        <GraphViewer
          nodes={[]}
          edges={[]}
          architectureServices={architectureData.services}
          architectureConnections={architectureData.connections}
          architecturePattern={architectureData.architecture_pattern}
          className="h-full"
          // Pass selection handlers
          selectedServiceId={
            selectedServiceId ||
            (selectedFindingId
              ? findingToServices.get(selectedFindingId)?.[0]
              : null)
          }
          onServiceClick={handleServiceClick}
        />
      </div>

      {/* Action Cards Section (40% height) */}
      <div
        ref={cardsRef}
        className="h-[40%] overflow-y-auto bg-background p-6"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Action Items
            <span className="text-sm text-muted-foreground ml-3 font-normal">
              {sortedRisks.length} findings sorted by severity
            </span>
          </h2>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedRisks.map((risk) => {
              const affectedServices = findingToServices.get(risk.id) || [];
              return (
                <ActionFindingCard
                  key={risk.id}
                  risk={risk}
                  affectedServices={affectedServices}
                  isSelected={isCardHighlighted(risk.id)}
                  onSelectCard={() => handleFindingClick(risk.id)}
                  onSelectService={handleServiceClick}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
