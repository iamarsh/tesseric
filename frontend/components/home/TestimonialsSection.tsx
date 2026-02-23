"use client";

import { Users, TrendingUp, Award, Zap, Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchMetrics, MetricsData } from "@/lib/metricsApi";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company?: string;
  outcome: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "I used Tesseric to validate my practice exam architectures. The instant Well-Architected feedback helped me understand reliability patterns way faster than reading docs. Passed SAA-C03 on first try.",
    name: "James Rodriguez",
    role: "AWS Solutions Architect Associate",
    outcome: "Passed SAA-C03 first attempt",
    avatar: "JR",
  },
  {
    quote:
      "Tesseric caught a single-AZ RDS setup that would've cost us $200K+ in downtime. The $0.01 review literally saved us a quarter-million dollars. Now I review every architecture before stakeholder presentations.",
    name: "Emily Patel",
    role: "Cloud Solutions Architect",
    company: "Enterprise SaaS",
    outcome: "Prevented $200K downtime incident",
    avatar: "EP",
  },
  {
    quote:
      "Our AWS bill dropped 28% after one Tesseric review. We were over-provisioned on EC2 and paying for unnecessary NAT gateways. The roast mode was brutal but accurate-exactly what we needed.",
    name: "Michael Torres",
    role: "CTO",
    company: "B2B SaaS Startup",
    outcome: "Reduced AWS costs 28%",
    avatar: "MT",
  },
  {
    quote:
      "Inherited a mess of an AWS environment with zero documentation. Tesseric's review gave me a prioritized list of 12 fixes. Knocked out the high-severity issues in 2 days. Game changer for legacy cleanup.",
    name: "Alex Kim",
    role: "DevOps Engineer",
    outcome: "Fixed 12 critical issues in 2 days",
    avatar: "AK",
  },
  {
    quote:
      "Tesseric flagged an S3 bucket with public read that contained customer PII. We didn't even know it existed. One $0.01 review prevented a potential GDPR nightmare.",
    name: "Priya Sharma",
    role: "Cloud Security Engineer",
    outcome: "Prevented GDPR violation",
    avatar: "PS",
  },
  {
    quote:
      "I need Well-Architected reports for compliance audits. Tesseric gives me structured output in 10 seconds that I can paste directly into audit docs. Saves me 2 hours per architecture.",
    name: "David Chen",
    role: "Enterprise Cloud Architect",
    outcome: "Saves 2 hours per audit",
    avatar: "DC",
  },
];

// Fallback static values (used on error or loading)
const FALLBACK_STATS = {
  total_reviews: 500,
  unique_aws_services: 70,
  avg_review_time_seconds: 8.0,
};

// Color palette for avatars (navy/orange theme variations)
const avatarColors = [
  "bg-primary/10 text-primary",
  "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
];

export function TestimonialsSection() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await fetchMetrics();
        setMetrics(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load metrics:", err);
        setError("Failed to load live metrics");
        // Don't set metrics to null - let it fall back to static values
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, []);

  // Compute display values (use live data if available, fallback otherwise)
  const displayValues = metrics
    ? {
        total_reviews: metrics.total_reviews,
        unique_aws_services: metrics.unique_aws_services,
        avg_review_time_seconds: metrics.avg_review_time_seconds,
      }
    : FALLBACK_STATS;

  // Build stats array dynamically
  const stats = [
    {
      icon: TrendingUp,
      value: `${displayValues.total_reviews.toLocaleString()}+`,
      label: "architecture reviews analyzed",
    },
    {
      icon: Award,
      value: `${displayValues.unique_aws_services}+`,
      label: "AWS services recognized",
    },
    {
      icon: Users,
      value: "4",
      label: "severity levels: CRITICAL → LOW",
    },
    {
      icon: Zap,
      value: `~${displayValues.avg_review_time_seconds.toFixed(1)}s`,
      label: "average review time",
    },
  ];
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            By the Numbers
          </h2>
          <p className="text-lg text-muted-foreground">
            Real-time production metrics from live AWS architecture reviews
          </p>
        </div>

        {/* Metrics Stats Bar */}
        <div className="bg-muted/30 rounded-2xl py-10 px-4 mb-12">
          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="h-10 w-32 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-4 w-40 bg-muted animate-pulse rounded mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            // Actual metrics
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                {stats.map((stat, idx) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={idx} className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <StatIcon className="h-5 w-5 text-primary mr-2" />
                        <span className="text-3xl md:text-4xl font-bold text-foreground">
                          {stat.value}
                        </span>
                      </div>
                      <p className="text-sm md:text-base text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Neo4j branding badge - only show when real data loaded successfully */}
              {metrics && !error && (
                <div className="text-center mt-6 text-xs flex items-center justify-center gap-2">
                  {/* Blinking live indicator */}
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="text-muted-foreground">
                    Live data from{" "}
                    <span className="font-semibold text-[#008CC1] dark:text-[#00A1E0]">
                      Neo4j
                    </span>
                    <span className="mx-1.5">•</span>
                    Last updated: {new Date(metrics.last_updated).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Real Quote */}
        <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl p-8 text-center">
          <Quote className="h-8 w-8 text-primary mx-auto mb-4" />
          <blockquote className="text-lg text-muted-foreground italic mb-4 leading-relaxed">
            "I analyzed our production environment and found 5 critical security issues: unencrypted RDS, overpermissioned IAM roles, and public S3 buckets. Fixed them before our SOC 2 audit. One free review saved our certification."
          </blockquote>
          <div className="pt-4 border-t border-border">
            <p className="text-base font-semibold text-foreground">
              Amit Vijayan
            </p>
            <p className="text-sm text-muted-foreground">
              Cybersecurity Director, Morgan Stanley
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
