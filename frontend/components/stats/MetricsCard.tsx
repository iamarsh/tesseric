"use client";

import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  loading?: boolean;
}

export function MetricsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  loading = false,
}: MetricsCardProps) {
  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 bg-muted/50 rounded" />
          <div className="h-8 w-32 bg-muted/50 rounded" />
          <div className="h-3 w-20 bg-muted/50 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative space-y-3">
        {/* Header with icon */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>

        {/* Value */}
        <div className="space-y-1">
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Trend indicator */}
        {trend && (
          <div
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              trend.positive
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            <span className={trend.positive ? "↑" : "↓"}>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
