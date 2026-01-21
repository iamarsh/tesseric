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
} from "lucide-react";

interface ReviewResultsProps {
  review: ReviewResponse;
  onToggleTone: () => void;
  currentTone: "standard" | "roast";
  loading: boolean;
}

const severityConfig = {
  CRITICAL: { color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", icon: XCircle },
  HIGH: { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", icon: AlertCircle },
  MEDIUM: { color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20", icon: AlertTriangle },
  LOW: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", icon: Info },
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
  operational_excellence: "text-purple-600 dark:text-purple-400",
  security: "text-red-600 dark:text-red-400",
  reliability: "text-green-600 dark:text-green-400",
  performance_efficiency: "text-blue-600 dark:text-blue-400",
  cost_optimization: "text-yellow-600 dark:text-yellow-400",
  sustainability: "text-emerald-600 dark:text-emerald-400",
};

function ScoreGauge({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
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
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow animate-fade-in">
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
          className={`px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl ${
            currentTone === "roast"
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⚙️</span>
              Switching to {currentTone === "standard" ? "Roast" : "Professional"}...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {currentTone === "standard" ? "🔥" : "✨"}
              Switch to {currentTone === "standard" ? "Roast" : "Professional"} Mode
            </span>
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
          <div className="mt-4 flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentTone === "roast"
                ? "bg-destructive/20 text-destructive"
                : "bg-primary/20 text-primary"
            }`}>
              {currentTone === "standard" ? "Professional Tone" : "Roast Mode"}
            </span>
          </div>
        </div>
      </div>

      {/* Risks */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
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

      {/* Metadata */}
      <div className="text-center text-sm text-muted-foreground pt-6 border-t border-border">
        <p>Review completed at {new Date(review.created_at).toLocaleString()}</p>
      </div>
    </div>
  );
}
