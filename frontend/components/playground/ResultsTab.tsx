"use client";

import { AlertTriangle, Info, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { ReviewResponse } from "@/lib/api";

interface ResultsTabProps {
  response: ReviewResponse;
}

export default function ResultsTab({ response }: ResultsTabProps) {
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "HIGH":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "MEDIUM":
        return <Info className="h-5 w-5 text-yellow-500" />;
      case "LOW":
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityBgClass = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-500/10 border-red-500/20";
      case "HIGH":
        return "bg-orange-500/10 border-orange-500/20";
      case "MEDIUM":
        return "bg-yellow-500/10 border-yellow-500/20";
      case "LOW":
        return "bg-blue-500/10 border-blue-500/20";
      default:
        return "bg-gray-500/10 border-gray-500/20";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  // Group risks by severity
  const groupedRisks = response.risks.reduce((acc, risk) => {
    if (!acc[risk.severity]) {
      acc[risk.severity] = [];
    }
    acc[risk.severity].push(risk);
    return acc;
  }, {} as Record<string, typeof response.risks>);

  const severityOrder = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

  return (
    <div className="space-y-6">
      {/* Architecture Score */}
      <div className="flex items-center justify-between p-6 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
        <div>
          <div className="text-sm font-medium text-muted-foreground">Architecture Score</div>
          <div className={`text-5xl font-bold mt-2 ${getScoreColor(response.architecture_score)}`}>
            {response.architecture_score}
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-muted-foreground mb-2">Findings</div>
          <div className="flex gap-2">
            {severityOrder.map((severity) => {
              const count = groupedRisks[severity]?.length || 0;
              if (count === 0) return null;
              return (
                <div
                  key={severity}
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    severity === "CRITICAL"
                      ? "bg-red-500 text-white"
                      : severity === "HIGH"
                      ? "bg-orange-500 text-white"
                      : severity === "MEDIUM"
                      ? "bg-yellow-500 text-white"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {count} {severity}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <div className="text-sm font-medium mb-2">Summary</div>
        <p className="text-sm text-muted-foreground leading-relaxed">{response.summary}</p>
      </div>

      {/* Risks by severity */}
      <div className="space-y-4">
        <div className="text-lg font-semibold">Findings</div>
        {severityOrder.map((severity) => {
          const risks = groupedRisks[severity];
          if (!risks || risks.length === 0) return null;

          return (
            <div key={severity} className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                {getSeverityIcon(severity)}
                <span>
                  {severity} ({risks.length})
                </span>
              </div>
              <div className="space-y-2 ml-7">
                {risks.map((risk) => (
                  <div
                    key={risk.id}
                    className={`rounded-lg border p-4 ${getSeverityBgClass(risk.severity)}`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedFinding(expandedFinding === risk.id ? null : risk.id)
                      }
                      className="w-full flex items-start justify-between text-left"
                    >
                      <div className="flex-1">
                        <div className="font-semibold">{risk.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {risk.pillar.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ml-2 ${
                          expandedFinding === risk.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expandedFinding === risk.id && (
                      <div className="mt-4 space-y-3 text-sm">
                        <div>
                          <div className="font-medium mb-1">Finding</div>
                          <p className="text-muted-foreground">{risk.finding}</p>
                        </div>
                        <div>
                          <div className="font-medium mb-1">Impact</div>
                          <p className="text-muted-foreground">{risk.impact}</p>
                        </div>
                        <div>
                          <div className="font-medium mb-1">Remediation</div>
                          <p className="text-muted-foreground whitespace-pre-line">
                            {risk.remediation}
                          </p>
                        </div>
                        {risk.references && risk.references.length > 0 && (
                          <div>
                            <div className="font-medium mb-1">References</div>
                            <ul className="space-y-1">
                              {risk.references.map((ref, idx) => (
                                <li key={idx}>
                                  <a
                                    href={ref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-xs"
                                  >
                                    {ref}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
