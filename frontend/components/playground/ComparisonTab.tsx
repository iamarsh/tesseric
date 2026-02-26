"use client";

import { AlertTriangle } from "lucide-react";
import type { ReviewResponse } from "@/lib/api";

interface ComparisonTabProps {
  standardResponse: ReviewResponse;
  roastResponse: ReviewResponse;
}

export default function ComparisonTab({ standardResponse, roastResponse }: ComparisonTabProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Score comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Standard */}
        <div className="p-6 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Standard Tone
          </div>
          <div className={`text-4xl font-bold ${getScoreColor(standardResponse.architecture_score)}`}>
            {standardResponse.architecture_score}
            <span className="text-xl text-muted-foreground">/100</span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {standardResponse.risks.length} findings
          </div>
        </div>

        {/* Roast */}
        <div className="p-6 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Roast Tone
          </div>
          <div className={`text-4xl font-bold ${getScoreColor(roastResponse.architecture_score)}`}>
            {roastResponse.architecture_score}
            <span className="text-xl text-muted-foreground">/100</span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {roastResponse.risks.length} findings
          </div>
        </div>
      </div>

      {/* Summary comparison */}
      <div className="space-y-4">
        <div className="text-lg font-semibold">Summary Comparison</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="text-sm font-medium mb-2 text-blue-600 dark:text-blue-400">
              Standard
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {standardResponse.summary}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="text-sm font-medium mb-2 text-orange-600 dark:text-orange-400">
              Roast
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {roastResponse.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Sample findings comparison */}
      <div className="space-y-4">
        <div className="text-lg font-semibold">Sample Findings (First 3)</div>
        <div className="space-y-3">
          {standardResponse.risks.slice(0, 3).map((standardRisk, idx) => {
            const roastRisk = roastResponse.risks.find(
              (r) => r.severity === standardRisk.severity && r.pillar === standardRisk.pillar
            ) || roastResponse.risks[idx];

            return (
              <div key={standardRisk.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Standard finding */}
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {standardRisk.severity}
                    </span>
                  </div>
                  <div className="font-semibold text-sm mb-1">{standardRisk.title}</div>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {standardRisk.finding}
                  </p>
                </div>

                {/* Roast finding */}
                {roastRisk && (
                  <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                        {roastRisk.severity}
                      </span>
                    </div>
                    <div className="font-semibold text-sm mb-1">{roastRisk.title}</div>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {roastRisk.finding}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Key differences callout */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-orange-500/10 border border-border">
        <div className="text-sm font-medium mb-2">Key Differences</div>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>
            <strong>Standard:</strong> Professional, constructive feedback with actionable remediation steps
          </li>
          <li>
            <strong>Roast:</strong> Brutally honest, personally attacking analysis that questions your competence
          </li>
          <li>
            Both modes analyze the same architecture patterns and provide identical technical accuracy
          </li>
          <li>
            Only the tone and delivery differ - the underlying security/reliability findings are the same
          </li>
        </ul>
      </div>
    </div>
  );
}
