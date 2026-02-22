"use client";

import { CheckCircle2, Circle, Clock, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";

interface Phase {
  version: string;
  title: string;
  status: "completed" | "current" | "planned";
  date?: string;
  features: string[];
  description: string;
}

const phases: Phase[] = [
  {
    version: "v0.1",
    title: "Foundation & MVP",
    status: "completed",
    date: "January 2026",
    description:
      "Bootstrap project with full-stack architecture and stubbed RAG service for local testing.",
    features: [
      "Full-stack Next.js + FastAPI architecture",
      "AWS-focused architecture analysis with pattern matching",
      "Dual input modes (text + drag-drop UI)",
      "Theme switcher (light/dark mode)",
      "Professional and Roast tone modes",
      "Structured JSON output with 6 AWS Well-Architected pillars",
      "Beautiful risk visualization with severity badges",
    ],
  },
  {
    version: "Phase 1",
    title: "AI-Powered AWS Analysis",
    status: "completed",
    date: "January 2026",
    description:
      "Real AI-powered AWS architecture review using Claude 3.5 Haiku via Amazon Bedrock with inline context.",
    features: [
      "Amazon Bedrock integration with Claude 3.5 Haiku",
      "Comprehensive AWS Well-Architected Framework context (~6K tokens)",
      "Cost tracking: ~$0.011 per review",
      "Graceful fallback to pattern matching",
      "AWS service-specific recommendations",
      "Token usage logging and cost analysis",
      "Provider validation (AWS-only for v1)",
    ],
  },
  {
    version: "Phase 2",
    title: "Production Deployment",
    status: "completed",
    date: "January 2026",
    description:
      "Production API deployed to Railway with Bedrock AI integration and nuclear-level roast mode.",
    features: [
      "Railway production deployment (tesseric-production.up.railway.app)",
      "Docker containerization with multi-stage builds",
      "Environment variable management for production",
      "Production CORS configuration",
      "Nuclear-level roast mode (devastating and memorable)",
      "Bedrock AI verified working in production",
      "Cost: ~$0.011/review + Railway $5-10/month",
    ],
  },
  {
    version: "Phase 2.5",
    title: "Frontend Redesign & Brand Identity",
    status: "completed",
    date: "January 2026",
    description:
      "Complete frontend redesign with new brand identity, professional layout, and comprehensive SEO optimization.",
    features: [
      "New logo and refreshed color palette",
      "Sticky navigation with mobile-responsive menu",
      "Professional footer with trust badges and social proof",
      "Enhanced marketing sections with clear value proposition",
      "Comprehensive SEO optimization (metadata, sitemap, structured data)",
      "PWA capabilities with web manifest",
      "Mobile-first responsive design",
      "Improved user experience and conversion flow",
    ],
  },
  {
    version: "Phase 2.1",
    title: "AWS Diagram Parsing",
    status: "completed",
    date: "February 2026",
    description:
      "Accept AWS architecture diagrams and drawings as input using Bedrock vision capabilities.",
    features: [
      "Image upload support (PNG, JPG, PDF up to 5MB)",
      "Bedrock vision API integration (Claude 3 Sonnet with vision)",
      "Architecture component extraction from diagrams",
      "Visual element to text conversion",
      "Feed extracted text to existing RAG pipeline",
      "Cost: ~$0.015-0.023 per diagram analysis",
    ],
  },
  {
    version: "Phase 3",
    title: "Knowledge Graph & Production Polish",
    status: "completed",
    date: "February 2026",
    description:
      "Neo4j knowledge graph integration for visualizing architecture insights, frontend deployed to Vercel with custom domain.",
    features: [
      "Neo4j knowledge graph backend integration",
      "Interactive graph visualization at /graph",
      "Automatic analysis-to-graph persistence",
      "Relationship mapping (Analyses → Findings → AWS Services → Remediations)",
      "Deploy frontend to Vercel (tesseric.ca)",
      "Custom domain setup with Vercel",
      "Production-ready error handling and loading states",
      "CI/CD workflows (GitHub Actions for backend/frontend/integration tests)",
    ],
  },
  {
    version: "Phase 4",
    title: "Review History & Advanced Features",
    status: "current",
    date: "Q1 2026",
    description:
      "Add persistent review history, rate limiting, monitoring, and enhanced knowledge graph capabilities.",
    features: [
      "Review history storage (DynamoDB or Neo4j time-series)",
      "User session tracking (anonymous for now)",
      "Rate limiting on backend API (prevent abuse)",
      "Monitoring and analytics (Vercel Analytics, backend metrics)",
      "Graph query API (search findings, AWS services)",
      "Performance optimization (caching, query optimization)",
      "Enhanced graph visualization (filtering, search, zoom controls)",
    ],
  },
  {
    version: "Phase 5",
    title: "Multi-Cloud Expansion",
    status: "planned",
    date: "Q2 2026",
    description:
      "Expand beyond AWS to support Azure, GCP, n8n workflows, and generic system design analysis.",
    features: [
      "Azure Well-Architected Framework support",
      "GCP Cloud Architecture Framework support",
      "n8n workflow automation analysis",
      "Generic SaaS architecture patterns",
      "Provider abstraction layer",
      "Auto-detection of cloud platform",
      "Multi-cloud best practices knowledge base",
    ],
  },
  {
    version: "Phase 6",
    title: "IaC Analysis",
    status: "planned",
    date: "Q2-Q3 2026",
    description:
      "Infrastructure as Code analysis: CloudFormation and Terraform template review.",
    features: [
      "AWS CloudFormation template analysis",
      "Terraform HCL parsing and review",
      "IaC-specific security checks",
      "Resource relationship mapping",
      "Cost estimation from infrastructure code",
      "Drift detection and compliance checking",
    ],
  },
  {
    version: "Phase 7",
    title: "SaaS & Multi-Tenancy",
    status: "planned",
    date: "Q4 2026",
    description:
      "Transform into full SaaS product with team accounts, billing, and enterprise features.",
    features: [
      "User authentication (Cognito or Auth0)",
      "Team accounts and collaboration",
      "Pricing tiers (Free, Pro, Enterprise)",
      "Stripe integration for payments",
      "Usage tracking and limits",
      "Admin dashboard for analytics",
      "Slack/Discord integration",
      "CLI tool for developers",
    ],
  },
];

export default function RoadmapPage() {
  return (
    <SiteLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Header */}
        <div className="border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Roadmap
              </h1>
            </div>
            <p className="text-muted-foreground">
              From AWS-first architecture review to multi-cloud SaaS platform
            </p>
          </div>
        </div>

      {/* Timeline */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-purple-600 to-gray-300 dark:from-blue-400 dark:via-purple-400 dark:to-gray-700"></div>

          {/* Phases */}
          <div className="space-y-12">
            {phases.map((phase, index) => (
              <div key={phase.version} className="relative pl-20">
                {/* Status icon */}
                <div className="absolute left-5 -ml-3 mt-1.5">
                  {phase.status === "completed" && (
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 bg-white dark:bg-gray-950 rounded-full" />
                  )}
                  {phase.status === "current" && (
                    <div className="relative">
                      <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-950 rounded-full" />
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                      </span>
                    </div>
                  )}
                  {phase.status === "planned" && (
                    <Circle className="w-6 h-6 text-gray-400 dark:text-gray-600 bg-white dark:bg-gray-950 rounded-full" />
                  )}
                </div>

                {/* Card */}
                <div
                  className={`rounded-xl border transition-all duration-300 ${
                    phase.status === "completed"
                      ? "border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20"
                      : phase.status === "current"
                      ? "border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 shadow-lg shadow-blue-500/10"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50"
                  } hover:shadow-xl hover:scale-[1.02] transition-all`}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${
                              phase.status === "completed"
                                ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                                : phase.status === "current"
                                ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {phase.version}
                          </span>
                          {phase.status === "current" && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-600 text-white dark:bg-blue-500 animate-pulse">
                              IN PROGRESS
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {phase.title}
                        </h2>
                      </div>
                      {phase.date && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {phase.date}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {phase.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Key Features:
                      </h3>
                      <ul className="space-y-1.5">
                        {phase.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                          >
                            <span className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">
                              •
                            </span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-16 text-center">
          <div className="inline-block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              <strong className="text-gray-900 dark:text-white">
                Current Focus:
              </strong>{" "}
              Review history, rate limiting, and advanced graph features
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Multi-cloud support (Azure, GCP, n8n) coming in Phase 5 after AWS path is
              proven and feature-complete.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <a
                href="/"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Try Tesseric
              </a>
              <a
                href="https://github.com/iamarsh/tesseric"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
      </div>
    </SiteLayout>
  );
}
