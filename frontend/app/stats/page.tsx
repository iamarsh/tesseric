"use client";

import { useEffect, useState } from "react";
import { getMetrics, MetricsResponse } from "@/lib/api";
import { MetricsCard } from "@/components/stats/MetricsCard";
import { SeverityChart } from "@/components/stats/SeverityChart";
import { SiteLayout } from "@/components/layout/SiteLayout";
import {
  BarChart3,
  Clock,
  FileSearch,
  RefreshCw,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function StatsPage() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMetrics();
      setMetrics(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRefresh = () => {
    fetchMetrics();
  };

  return (
    <SiteLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Live Metrics
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Real-time insights from production usage (updated every 5
                minutes)
              </p>
            </div>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-all hover:border-primary/50 hover:shadow-lg disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Last updated */}
          <p className="text-sm text-muted-foreground">
            Last updated:{" "}
            {lastRefresh.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>

          {/* Privacy Notice */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-1.5">
                <svg
                  className="h-4 w-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">
                  Privacy-First Analytics
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  All metrics are fully anonymized. We <strong>never</strong>{" "}
                  store architecture descriptions, IP addresses, or any
                  personally identifiable information. Only aggregated
                  statistics (counts, averages, processing times) are collected
                  for analytics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-8 rounded-xl border border-red-500/50 bg-red-500/10 p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-sm font-medium underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricsCard
            title="Total Reviews Analyzed"
            value={metrics?.total_reviews.toLocaleString() ?? "—"}
            subtitle="Architecture reviews completed"
            icon={FileSearch}
            loading={loading}
          />

          <MetricsCard
            title="Unique AWS Services"
            value={metrics?.unique_aws_services ?? "—"}
            subtitle="Services recognized across reviews"
            icon={TrendingUp}
            loading={loading}
          />

          <MetricsCard
            title="Average Processing Time"
            value={
              metrics
                ? `${metrics.avg_review_time_seconds.toFixed(1)}s`
                : "—"
            }
            subtitle="Average response time"
            icon={Zap}
            loading={loading}
          />

          <MetricsCard
            title="Total Findings"
            value={
              metrics
                ? Object.values(metrics.severity_breakdown)
                    .reduce((sum, val) => sum + val, 0)
                    .toLocaleString()
                : "—"
            }
            subtitle="Issues identified and remediated"
            icon={Clock}
            loading={loading}
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Severity Distribution Chart */}
          {metrics && (
            <SeverityChart
              data={metrics.severity_breakdown}
              loading={loading}
            />
          )}

          {/* Coming Soon Cards */}
          <div className="space-y-6">
            <ComingSoonCard
              title="Most Common AWS Services"
              description="Top 10 services with usage counts"
            />
            <ComingSoonCard
              title="Reviews Over Time"
              description="Daily review trends for the last 30 days"
            />
          </div>
        </div>

        {/* Additional Coming Soon Section */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <ComingSoonCard
            title="Well-Architected Pillar Breakdown"
            description="Average scores across 6 pillars with radar chart"
          />
          <ComingSoonCard
            title="Recent High-Severity Findings"
            description="Last 10 critical and high severity issues"
          />
        </div>

        {/* Privacy Notice */}
        <div className="mt-12 rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm">
          <h3 className="mb-2 text-sm font-semibold">Privacy Notice</h3>
          <p className="text-sm text-muted-foreground">
            All metrics are anonymized and aggregated. We do not store
            architecture descriptions or any personally identifiable information.
            Only metadata (scores, processing times, service counts) is
            collected for analytics.
          </p>
        </div>
      </div>
      </div>
    </SiteLayout>
  );
}

function ComingSoonCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-border bg-card/30 p-6 backdrop-blur-sm">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Coming Soon
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
