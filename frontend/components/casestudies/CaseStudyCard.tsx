"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface Finding {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  text: string;
}

export interface Result {
  label: string;
  before: string;
  after: string;
}

export interface CaseStudy {
  title: string;
  category: string;
  scoreBefore: number;
  scoreAfter: number;
  diagramBefore?: string;
  diagramAfter?: string;
  findings: Finding[];
  solution: string[];
  results: Result[];
  techStack: string[];
}

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
}

export function CaseStudyCard({ caseStudy }: CaseStudyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const scoreImprovement = caseStudy.scoreAfter - caseStudy.scoreBefore;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "text-red-600 dark:text-red-400 bg-red-500/10";
      case "HIGH":
        return "text-orange-600 dark:text-orange-400 bg-orange-500/10";
      case "MEDIUM":
        return "text-amber-600 dark:text-amber-400 bg-amber-500/10";
      case "LOW":
        return "text-blue-600 dark:text-blue-400 bg-blue-500/10";
      default:
        return "text-muted-foreground bg-muted/50";
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      {/* Collapsed Header (Always Visible) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {caseStudy.category}
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold">{caseStudy.title}</h3>

            {/* Score Badges */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Before:</span>
                <div className="rounded-lg bg-red-500/10 px-3 py-1 text-sm font-bold text-red-600 dark:text-red-400">
                  {caseStudy.scoreBefore}/100
                </div>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">After:</span>
                <div className="rounded-lg bg-green-500/10 px-3 py-1 text-sm font-bold text-green-600 dark:text-green-400">
                  {caseStudy.scoreAfter}/100
                </div>
              </div>
              <div className="rounded-lg bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                +{scoreImprovement} points
              </div>
            </div>

            {/* Tech Stack Badges */}
            <div className="flex flex-wrap gap-2">
              {caseStudy.techStack.map((tech) => (
                <div
                  key={tech}
                  className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground"
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="h-6 w-6 text-muted-foreground transition-transform group-hover:text-foreground" />
            ) : (
              <ChevronDown className="h-6 w-6 text-muted-foreground transition-transform group-hover:text-foreground" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border px-6 pb-6">
          {/* Architecture Diagrams */}
          {(caseStudy.diagramBefore || caseStudy.diagramAfter) && (
            <div className="mb-6 mt-6">
              <h4 className="mb-4 text-sm font-semibold text-muted-foreground">
                Architecture Transformation
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                {caseStudy.diagramBefore && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">
                      BEFORE
                    </p>
                    <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs leading-relaxed">
                      {caseStudy.diagramBefore}
                    </pre>
                  </div>
                )}
                {caseStudy.diagramAfter && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-green-600 dark:text-green-400">
                      AFTER
                    </p>
                    <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs leading-relaxed">
                      {caseStudy.diagramAfter}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Findings */}
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold">Tesseric Findings</h4>
            <div className="space-y-2">
              {caseStudy.findings.map((finding, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <div
                    className={`rounded px-2 py-1 text-xs font-semibold ${getSeverityColor(
                      finding.severity
                    )}`}
                  >
                    {finding.severity}
                  </div>
                  <p className="flex-1 text-sm text-foreground">{finding.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Solution */}
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold">Solution Applied</h4>
            <ul className="space-y-2">
              {caseStudy.solution.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                    {index + 1}
                  </span>
                  <span className="text-foreground">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Results */}
          <div>
            <h4 className="mb-3 text-sm font-semibold">Results</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {caseStudy.results.map((result, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  <p className="mb-1 text-xs text-muted-foreground">
                    {result.label}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      {result.before}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {result.after}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
