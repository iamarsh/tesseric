"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

interface RiskItem {
  id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  pillar: string;
  finding: string;
  remediation: string;
}

interface MetaAnalysis {
  review_id: string;
  architecture_score: number;
  risks: RiskItem[];
  summary: string;
  metadata: {
    analysis_method: string;
    processing_time_ms: number;
    cost_usd: number;
  };
}

export function MetaAnalysisSection() {
  const [analysis, setAnalysis] = useState<MetaAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load meta-analysis from static JSON file
    fetch("/tesseric-self-analysis.json")
      .then((res) => res.json())
      .then((data) => {
        setAnalysis(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load meta-analysis:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section id="meta-analysis" className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-12"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!analysis) {
    return null;
  }

  const severityColors = {
    CRITICAL: "text-destructive",
    HIGH: "text-warning",
    MEDIUM: "text-warning",
    LOW: "text-muted-foreground",
  };

  const severityBgColors = {
    CRITICAL: "bg-destructive/10 border-destructive/20",
    HIGH: "bg-warning/10 border-warning/20",
    MEDIUM: "bg-warning/10 border-warning/20",
    LOW: "bg-muted border-border",
  };

  // Calculate score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  return (
    <section
      id="meta-analysis"
      className="container mx-auto px-4 py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            Meta-Analysis
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Eating Our Own Dog Food: <br />
            <span className="text-primary">Tesseric Reviews Tesseric</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We ran Tesseric on its own architecture. Here's what we found.
          </p>
        </div>

        {/* Architecture Score Card */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-2">
              Architecture Score
            </p>
            <p
              className={`text-7xl font-bold ${getScoreColor(
                analysis.architecture_score
              )}`}
            >
              {analysis.architecture_score}
              <span className="text-3xl text-muted-foreground">/100</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {analysis.summary}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground border-t border-border pt-6">
            <div>
              <span className="font-semibold">Analysis Method:</span>{" "}
              {analysis.metadata.analysis_method.replace(/_/g, " ")}
            </div>
            <div>
              <span className="font-semibold">Processing Time:</span>{" "}
              {(analysis.metadata.processing_time_ms / 1000).toFixed(2)}s
            </div>
            <div>
              <span className="font-semibold">Cost:</span> $
              {analysis.metadata.cost_usd.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Key Findings */}
          <div>
            <h3 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-warning" />
              Key Findings
            </h3>
            <div className="space-y-4">
              {analysis.risks.map((risk, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    severityBgColors[risk.severity]
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-foreground text-sm">
                      {risk.title}
                    </h4>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${severityColors[risk.severity]}`}
                    >
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {risk.finding}
                  </p>
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer hover:text-foreground transition-colors font-medium">
                      View Remediation
                    </summary>
                    <p className="mt-2 pl-4 border-l-2 border-primary">
                      {risk.remediation}
                    </p>
                  </details>
                </div>
              ))}
            </div>
          </div>

          {/* Right: What We're Doing Well */}
          <div>
            <h3 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-success" />
              What We're Doing Well
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-sm font-semibold text-foreground mb-1">
                  ✅ Zero Data Persistence
                </p>
                <p className="text-xs text-muted-foreground">
                  Ephemeral sessions with immediate discard. Architecture
                  descriptions never touch a database.
                </p>
              </div>
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-sm font-semibold text-foreground mb-1">
                  ✅ Type Safety Everywhere
                </p>
                <p className="text-xs text-muted-foreground">
                  TypeScript strict mode + Pydantic v2 = runtime and compile-time
                  guarantees.
                </p>
              </div>
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-sm font-semibold text-foreground mb-1">
                  ✅ Security-First Architecture
                </p>
                <p className="text-xs text-muted-foreground">
                  HTTPS everywhere, CORS whitelist, IAM roles (no hardcoded keys),
                  Pydantic validation.
                </p>
              </div>
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-sm font-semibold text-foreground mb-1">
                  ✅ Cost-Effective AI
                </p>
                <p className="text-xs text-muted-foreground">
                  ~$0.001/review using Claude 3.5 Haiku with inline context (no
                  Knowledge Base costs).
                </p>
              </div>
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-sm font-semibold text-foreground mb-1">
                  ✅ Graceful Degradation
                </p>
                <p className="text-xs text-muted-foreground">
                  Pattern matching fallback if Bedrock unavailable. Never leave
                  users stranded.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Roadmap Items */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Our Roadmap Items (from findings)
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">
                <span className="font-semibold">Cost Optimization:</span> Already
                using the most cost-effective model (Haiku). Exploring batch
                processing for non-urgent reviews.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">
                <span className="font-semibold">Performance:</span> Neo4j latency
                is mitigated by async background writes. Considering read
                replicas for graph queries.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">
                <span className="font-semibold">Reliability:</span> Graceful
                fallback already implemented. Future: multi-region Bedrock with
                automatic failover.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link
            href="/#review"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="h-5 w-5" />
            Try It Yourself
          </Link>
          <p className="text-xs text-muted-foreground mt-4 italic">
            "If we didn't trust our own analysis, why should you?"
          </p>
        </div>
      </div>
    </section>
  );
}
