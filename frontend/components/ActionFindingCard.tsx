/**
 * ActionFindingCard Component
 *
 * Premium finding card for architecture-first visualization.
 * Features:
 * - Severity-based styling (CRITICAL/HIGH/MEDIUM/LOW)
 * - Affected services badges (clickable to highlight in graph)
 * - Collapsible remediation section
 * - Selection state for bidirectional highlighting
 * - Hover effects and smooth animations
 */

"use client";

import { useState } from "react";
import { RiskItem } from "@/lib/api";
import {
  AlertTriangle,
  Shield,
  Activity,
  Zap,
  DollarSign,
  Leaf,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

interface ActionFindingCardProps {
  risk: RiskItem;
  affectedServices: string[];
  isSelected: boolean;
  onSelectCard: () => void;
  onSelectService: (serviceName: string) => void;
}

const severityConfig = {
  CRITICAL: {
    color: "text-red-600",
    bg: "bg-red-600/10",
    border: "border-red-600/20",
    icon: XCircle,
  },
  HIGH: {
    color: "text-orange-600",
    bg: "bg-orange-600/10",
    border: "border-orange-600/20",
    icon: AlertCircle,
  },
  MEDIUM: {
    color: "text-yellow-600",
    bg: "bg-yellow-600/10",
    border: "border-yellow-600/20",
    icon: AlertTriangle,
  },
  LOW: {
    color: "text-gray-500",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
    icon: Info,
  },
};

const pillarIcons = {
  operational_excellence: Activity,
  security: Shield,
  reliability: CheckCircle2,
  performance_efficiency: Zap,
  cost_optimization: DollarSign,
  sustainability: Leaf,
};

export default function ActionFindingCard({
  risk,
  affectedServices,
  isSelected,
  onSelectCard,
  onSelectService,
}: ActionFindingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const severityInfo = severityConfig[risk.severity];
  const SeverityIcon = severityInfo.icon;
  const PillarIcon = pillarIcons[risk.pillar];

  return (
    <div
      className={`
        bg-card border rounded-xl p-6
        transition-all duration-300 cursor-pointer
        hover:shadow-2xl
        ${isSelected ? "ring-2 ring-primary shadow-2xl" : ""}
        ${severityInfo.border}
      `}
      onClick={onSelectCard}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${severityInfo.bg} ${severityInfo.color}`}
            >
              {risk.severity}
            </span>
            <span className="text-xs text-muted-foreground">{risk.id}</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {risk.title}
          </h3>
        </div>
        <SeverityIcon
          className={`h-6 w-6 ${severityInfo.color} flex-shrink-0`}
        />
      </div>

      {/* Pillar */}
      <div className="flex items-center gap-2 mb-4">
        <PillarIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground capitalize">
          {risk.pillar.replace(/_/g, " ")}
        </span>
      </div>

      {/* Affected Services */}
      {affectedServices.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Affected Services:
          </p>
          <div className="flex flex-wrap gap-2">
            {affectedServices.map((serviceName) => (
              <button
                key={serviceName}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectService(serviceName);
                }}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                {serviceName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Finding */}
      <div className="mb-4">
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Finding:
        </p>
        <p className="text-sm text-foreground">{risk.finding}</p>
      </div>

      {/* Impact */}
      <div className="mb-4">
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Impact:
        </p>
        <p className="text-sm text-foreground">{risk.impact}</p>
      </div>

      {/* Remediation (Collapsible) */}
      <details
        open={isExpanded}
        onToggle={(e) => {
          e.stopPropagation();
          setIsExpanded((e.target as HTMLDetailsElement).open);
        }}
        className="group"
      >
        <summary className="flex items-center gap-2 cursor-pointer list-none text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
          View Remediation
        </summary>
        <div className="mt-3 pl-6 space-y-2">
          <p className="text-sm text-foreground">{risk.remediation}</p>
          {risk.references && risk.references.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                📚 References:
              </p>
              <ul className="space-y-1">
                {risk.references.map((ref, index) => (
                  <li key={index}>
                    <a
                      href={ref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      AWS Documentation
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </details>

      {/* Selection Hint */}
      {!isSelected && (
        <p className="text-xs text-muted-foreground mt-4 italic">
          Click to highlight affected services in architecture
        </p>
      )}
    </div>
  );
}
