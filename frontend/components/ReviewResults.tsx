"use client";

import { useState } from "react";
import { ReviewResponse, RiskItem } from "@/lib/api";
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
  ExternalLink,
  Sparkles,
  Network,
} from "lucide-react";
import Link from "next/link";

interface ReviewResultsProps {
  review: ReviewResponse;
  onToggleTone: () => void;
  currentTone: "standard" | "roast";
  loading: boolean;
}

const severityConfig = {
  CRITICAL: { color: "text-critical", bg: "bg-critical/10", icon: XCircle },
  HIGH: { color: "text-warning", bg: "bg-warning/10", icon: AlertCircle },
  MEDIUM: { color: "text-warning", bg: "bg-warning/5", icon: AlertTriangle },
  LOW: { color: "text-muted-foreground", bg: "bg-muted", icon: Info },
};

const pillarIcons = {
  operational_excellence: Activity,
  security: Shield,
  reliability: CheckCircle2,
  performance_efficiency: Zap,
  cost_optimization: DollarSign,
  sustainability: Leaf,
};

const pillarColors = {
  operational_excellence: "text-muted-foreground",
  security: "text-muted-foreground",
  reliability: "text-muted-foreground",
  performance_efficiency: "text-muted-foreground",
  cost_optimization: "text-muted-foreground",
  sustainability: "text-muted-foreground",
};

function ScoreGauge({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    if (score >= 40) return "text-warning";
    return "text-critical";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Work";
    return "Critical Issues";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted opacity-20"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 56}`}
            strokeDashoffset={`${2 * Math.PI * 56 * (1 - score / 100)}`}
            className={`${getScoreColor(score)} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className={`font-semibold ${getScoreColor(score)}`}>{getScoreLabel(score)}</p>
        <p className="text-xs text-muted-foreground mt-1">Architecture Score</p>
      </div>
    </div>
  );
}

function RiskCard({ risk }: { risk: RiskItem }) {
  const severityInfo = severityConfig[risk.severity];
  const SeverityIcon = severityInfo.icon;
  const PillarIcon = pillarIcons[risk.pillar];
  const pillarColor = pillarColors[risk.pillar];

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-2xl transition-all duration-300 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${severityInfo.bg} ${severityInfo.color}`}>
              {risk.severity}
            </span>
            <span className="text-xs text-muted-foreground">{risk.id}</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground">{risk.title}</h3>
        </div>
        <SeverityIcon className={`h-6 w-6 ${severityInfo.color} flex-shrink-0`} />
      </div>

      {/* Pillar */}
      <div className="flex items-center gap-2 mb-4">
        <PillarIcon className={`h-4 w-4 ${pillarColor}`} />
        <span className={`text-sm font-medium ${pillarColor} capitalize`}>
          {risk.pillar.replace(/_/g, " ")}
        </span>
      </div>

      {/* Finding */}
      <div className="mb-4">
        <p className="text-sm font-medium text-muted-foreground mb-1">Finding:</p>
        <p className="text-sm text-foreground">{risk.finding}</p>
      </div>

      {/* Impact */}
      <div className="mb-4">
        <p className="text-sm font-medium text-muted-foreground mb-1">Impact:</p>
        <p className="text-sm text-foreground">{risk.impact}</p>
      </div>

      {/* Remediation */}
      <div className="mb-4 p-3 bg-muted rounded-lg">
        <p className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Remediation:
        </p>
        <p className="text-sm text-muted-foreground">{risk.remediation}</p>
      </div>

      {/* References */}
      {risk.references.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">References:</p>
          <div className="space-y-1">
            {risk.references.map((ref, idx) => (
              <a
                key={idx}
                href={ref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                AWS Documentation
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ReviewResults({ review, onToggleTone, currentTone, loading }: ReviewResultsProps) {
  const [showAllRisks, setShowAllRisks] = useState(false);
  const displayedRisks = showAllRisks ? review.risks : review.risks.slice(0, 3);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header with Tone Toggle */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Architecture Review</h2>
          <p className="text-sm text-muted-foreground">Review ID: {review.review_id}</p>
        </div>
        <button
          onClick={onToggleTone}
          disabled={loading}
          className="px-6 py-2.5 rounded-lg font-medium transition-all border border-border bg-card text-foreground hover:bg-muted disabled:opacity-50"
        >
          {loading ? (
            <span>Switching to {currentTone === "standard" ? "Roast" : "Professional"}...</span>
          ) : (
            <span>Switch to {currentTone === "standard" ? "Roast" : "Professional"} Mode</span>
          )}
        </button>
      </div>

      {/* Score and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex justify-center">
          <ScoreGauge score={review.architecture_score} />
        </div>
        <div className="md:col-span-2 flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-foreground mb-3">Summary</h3>
          <p className="text-muted-foreground leading-relaxed">{review.summary}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
              {currentTone === "standard" ? "Professional Tone" : "Roast Mode"}
            </span>
            {/* Technology badges */}
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335c-.072.048-.144.072-.208.072-.08 0-.16-.04-.239-.112-.12-.128-.216-.263-.296-.416-.08-.152-.16-.32-.248-.512-.631.744-1.423 1.116-2.383 1.116-.68 0-1.224-.193-1.624-.583-.4-.39-.6-.91-.6-1.558 0-.692.247-1.253.743-1.678.495-.424 1.15-.64 1.967-.64.272 0 .552.024.847.064.296.04.6.104.92.176v-.583c0-.608-.127-1.032-.375-1.279-.255-.248-.687-.368-1.295-.368-.28 0-.567.031-.863.104-.296.072-.583.16-.863.255-.128.056-.224.095-.28.111-.056.016-.096.024-.12.024-.104 0-.16-.072-.16-.224v-.352c0-.12.016-.208.056-.264.04-.056.12-.112.239-.168.28-.144.615-.264 1.007-.36.391-.096.808-.136 1.247-.136.952 0 1.647.216 2.095.648.44.432.663 1.08.663 1.943v2.56zm-3.287 1.23c.264 0 .536-.048.824-.143.288-.096.543-.271.768-.52.136-.16.232-.336.28-.535.048-.2.08-.424.08-.672v-.32c-.224-.064-.463-.12-.712-.159-.248-.04-.504-.056-.76-.056-.543 0-.943.104-1.207.319-.264.216-.392.52-.392.911 0 .368.095.64.287.816.191.183.48.271.831.271zm6.447.848c-.128 0-.216-.024-.272-.064-.056-.048-.104-.144-.152-.272l-1.599-5.263c-.048-.16-.072-.264-.072-.312 0-.12.064-.184.184-.184h.759c.136 0 .224.024.272.064.056.048.096.144.144.272l1.143 4.504 1.063-4.504c.04-.128.088-.224.144-.272.056-.048.144-.064.28-.064h.615c.136 0 .224.024.28.064.056.048.104.144.144.272l1.079 4.56 1.175-4.56c.048-.128.096-.224.152-.272.056-.048.136-.064.272-.064h.719c.12 0 .184.064.184.184 0 .072-.008.152-.024.232-.016.08-.04.176-.088.32l-1.647 5.263c-.048.16-.096.256-.152.272-.056.048-.144.064-.272.064h-.663c-.136 0-.224-.024-.28-.064-.056-.048-.104-.144-.144-.272l-1.055-4.384-1.047 4.384c-.04.128-.088.224-.144.272-.056.048-.144.064-.28.064h-.663zm10.735.272c-.4 0-.799-.047-1.191-.143-.392-.095-.695-.224-.903-.384-.104-.08-.176-.168-.2-.264-.024-.096-.04-.2-.04-.304v-.368c0-.152.056-.224.16-.224.064 0 .128.016.2.04.072.024.176.072.304.12.264.104.535.184.815.232.288.048.567.072.855.072.455 0 .807-.08 1.055-.232.248-.152.376-.368.376-.656 0-.192-.064-.36-.184-.488-.12-.128-.336-.248-.64-.359l-1.903-.6c-.543-.168-.943-.424-1.191-.76-.248-.336-.368-.728-.368-1.175 0-.336.072-.632.216-.888.144-.256.336-.472.576-.648.24-.176.52-.304.839-.392.32-.088.664-.12 1.023-.12.168 0 .344.008.52.032.176.024.336.056.488.088.144.04.28.08.4.127.12.048.216.096.272.144.08.048.136.096.168.16.032.063.048.144.048.24v.336c0 .152-.056.232-.16.232-.064 0-.168-.032-.32-.088-.487-.216-1.031-.32-1.631-.32-.415 0-.743.072-.975.216-.232.144-.344.36-.344.648 0 .192.072.36.208.488.136.128.368.256.695.368l1.863.592c.536.168.927.408 1.167.728.24.32.36.688.36 1.103 0 .344-.072.656-.216.928-.144.272-.344.512-.6.704-.256.192-.56.336-.928.448-.367.104-.767.16-1.199.16z"/>
              </svg>
              <span>AWS Bedrock</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                <path d="M23.05 10.43L13.56 1.92a2.24 2.24 0 00-3.13 0L1.94 10.43a2.24 2.24 0 000 3.13l9.49 9.51a2.24 2.24 0 003.13 0l9.49-9.51a2.24 2.24 0 000-3.13zm-9.9 5.4L8.4 11.09l3.25-3.26L15.4 11.6l-2.25 2.24zm-3.13 3.13l-4.76-4.76L8.4 11.1l3.14 3.14-2.52 2.53zm7.64 0l-2.53-2.53 3.14-3.14 3.14 3.14-3.75 3.76zm-6.13-7.64L8.4 8.19l3.25-3.26 3.13 3.13-3.25 3.26z"/>
              </svg>
              <span>Neo4j</span>
            </span>
          </div>
        </div>
      </div>

      {/* Risks */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Identified Risks ({review.risks.length})
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayedRisks.map((risk, idx) => (
            <RiskCard key={`${risk.id}-${idx}`} risk={risk} />
          ))}
        </div>
        {review.risks.length > 3 && !showAllRisks && (
          <button
            onClick={() => setShowAllRisks(true)}
            className="mt-6 w-full px-6 py-3 bg-muted hover:bg-accent text-foreground rounded-lg font-medium transition-colors"
          >
            Show {review.risks.length - 3} More Risks
          </button>
        )}
      </div>

      {/* Knowledge Graph CTA */}
      {review.review_id && (
        <div className="mt-8">
          <Link
            href={`/graph?id=${review.review_id}`}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            <Network className="h-6 w-6" />
            <span>Explore in Knowledge Graph</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Visualize how your architecture connects to findings, AWS services, and remediations
          </p>
        </div>
      )}

      {/* Metadata */}
      <div className="text-center text-sm text-muted-foreground pt-6 border-t border-border">
        <p>Review completed at {new Date(review.created_at).toLocaleString()}</p>
      </div>
    </div>
  );
}
