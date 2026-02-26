"use client";

import { Terminal, BarChart3, Network, Building2, BookOpen, FileCode } from "lucide-react";
import FeatureCard from "../features/FeatureCard";

// Mini preview components for each feature
const PlaygroundPreview = () => (
  <div className="h-32 flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4">
    <div className="text-center">
      <div className="text-xs font-mono text-muted-foreground mb-2">POST /review</div>
      <div className="text-xs text-primary font-semibold">{"{ }"} → {"{ status: 200 }"}</div>
    </div>
  </div>
);

const MetricsPreview = () => (
  <div className="h-32 flex items-center justify-center bg-gradient-to-br from-green-500/10 to-teal-500/10 p-4">
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">31</div>
        <div className="text-xs text-muted-foreground">Reviews</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">20</div>
        <div className="text-xs text-muted-foreground">Services</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-2xl font-bold text-red-600 dark:text-red-400">8</div>
        <div className="text-xs text-muted-foreground">Critical</div>
      </div>
    </div>
  </div>
);

const GraphPreview = () => (
  <div className="h-32 flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4">
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary/20 border-2 border-primary" />
        <div className="h-px w-8 bg-border" />
        <div className="h-8 w-8 rounded-full bg-orange-500/20 border-2 border-orange-500" />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className="h-8 w-8 rounded-full bg-green-500/20 border-2 border-green-500" />
        <div className="h-px w-8 bg-border" />
        <div className="h-8 w-8 rounded-full bg-blue-500/20 border-2 border-blue-500" />
      </div>
    </div>
  </div>
);

const ArchitecturePreview = () => (
  <div className="h-32 flex items-center justify-center bg-gradient-to-br from-orange-500/10 to-red-500/10 p-4">
    <div className="flex flex-col gap-2 w-full max-w-[200px]">
      <div className="h-6 bg-primary/20 rounded" />
      <div className="flex gap-2">
        <div className="h-6 flex-1 bg-orange-500/20 rounded" />
        <div className="h-6 flex-1 bg-green-500/20 rounded" />
      </div>
      <div className="h-6 bg-blue-500/20 rounded" />
    </div>
  </div>
);

const CaseStudiesPreview = () => (
  <div className="h-32 flex items-center justify-center bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-4">
    <div className="text-center space-y-2">
      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">28%</div>
      <div className="text-xs text-muted-foreground">Cost Reduction</div>
      <div className="text-xs text-primary font-semibold">42 → 89 score</div>
    </div>
  </div>
);

const DocsPreview = () => (
  <div className="h-32 flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-blue-500/10 p-4">
    <div className="space-y-1 w-full max-w-[180px]">
      <div className="h-3 bg-primary/20 rounded w-full" />
      <div className="h-3 bg-muted-foreground/20 rounded w-3/4" />
      <div className="h-3 bg-muted-foreground/20 rounded w-5/6" />
      <div className="h-3 bg-muted-foreground/20 rounded w-2/3" />
    </div>
  </div>
);

export default function FeatureShowcaseSection() {
  const features = [
    {
      title: "API Playground",
      description: "Interactive testing environment with 7 pre-filled examples, live cost tracking, and syntax-highlighted responses. Try both Standard and Roast tone modes.",
      icon: <Terminal className="h-6 w-6" />,
      href: "/playground",
      badge: "Popular",
      badgeColor: "primary" as const,
      stats: "7 examples • Live cost tracking",
      preview: <PlaygroundPreview />,
    },
    {
      title: "Live Metrics",
      description: "Real-time production insights powered by Neo4j knowledge graph. View severity breakdown, AWS services tracked, and average review times.",
      icon: <BarChart3 className="h-6 w-6" />,
      href: "/stats",
      badge: "Real-Time",
      badgeColor: "success" as const,
      stats: "31 reviews • 20 services tracked",
      preview: <MetricsPreview />,
    },
    {
      title: "Knowledge Graph",
      description: "Visualize architecture topology with interactive network diagrams. See service relationships, findings, and patterns across reviews.",
      icon: <Network className="h-6 w-6" />,
      href: "/graph",
      badge: "New",
      badgeColor: "info" as const,
      stats: "200K nodes • 400K relationships",
      preview: <GraphPreview />,
    },
    {
      title: "System Architecture",
      description: "Deep dive into how Tesseric is built. Meta-analysis of our own architecture (92/100 score), tech stack decisions, and engineering challenges solved.",
      icon: <Building2 className="h-6 w-6" />,
      href: "/architecture",
      badge: "Meta",
      badgeColor: "warning" as const,
      stats: "7 sections • Tesseric reviews itself",
      preview: <ArchitecturePreview />,
    },
    {
      title: "Case Studies",
      description: "Real-world architecture improvements with before/after diagrams. Cost reductions, security fixes, and performance optimizations.",
      icon: <BookOpen className="h-6 w-6" />,
      href: "/#case-studies",
      stats: "4 case studies • 28% avg cost reduction",
      preview: <CaseStudiesPreview />,
    },
    {
      title: "Tech Challenges",
      description: "6 complex engineering problems and their elegant solutions. Data privacy, vision API integration, cost optimization, and type safety.",
      icon: <FileCode className="h-6 w-6" />,
      href: "/#technical-challenges",
      stats: "6 challenges • Code examples included",
      preview: <DocsPreview />,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore Tesseric's Tools
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Premium features to analyze, visualize, and understand AWS architectures.
            Each tool demonstrates production-ready engineering.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            All tools are live in production.{" "}
            <a
              href="/#review"
              className="text-primary hover:underline font-medium"
            >
              Start analyzing →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
