"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface TechCard {
  name: string;
  icon: string;
  tagline: string;
  whyChosen: string;
  alternatives: string[];
  tradeoffs: string[];
  deepDive?: string;
}

const technologies: TechCard[] = [
  {
    name: "Next.js 14 + TypeScript",
    icon: "⚛️",
    tagline: "React framework with server components and full-stack capabilities",
    whyChosen:
      "Server Components reduce bundle size, App Router provides intuitive routing, built-in TypeScript support catches errors at compile time, and exceptional developer experience with fast refresh. Vercel deployment is seamless.",
    alternatives: ["Remix", "SvelteKit", "Vue 3 + Nuxt"],
    tradeoffs: [
      "Learning curve for App Router (paradigm shift from Pages Router)",
      "Server Components introduce new mental models",
      "Some libraries don't support React Server Components yet",
    ],
    deepDive:
      "We use Server Components for static sections (homepage, architecture page) and Client Components for interactive features (review form, graph visualization). This hybrid approach reduces JavaScript sent to the browser by ~40%.",
  },
  {
    name: "FastAPI + Python 3.11",
    icon: "🐍",
    tagline: "High-performance async Python framework with automatic OpenAPI docs",
    whyChosen:
      "Async by default (handles concurrent requests efficiently), automatic OpenAPI documentation at /docs, Pydantic v2 for request/response validation (type-safe at runtime), excellent AWS SDK support (boto3), and fast development iteration.",
    alternatives: ["Flask", "Django", "Express (Node.js)"],
    tradeoffs: [
      "Smaller ecosystem than Django (no built-in admin, ORM)",
      "Python's GIL limits true parallelism (mitigated by async I/O)",
      "Slightly higher memory usage than compiled languages",
    ],
    deepDive:
      "All endpoints are async (async def) to prevent blocking. We use background tasks (asyncio.create_task) for Neo4j writes, ensuring review responses return in 2-4s while graph writes happen in parallel.",
  },
  {
    name: "AWS Bedrock (Claude 3.5 Haiku)",
    icon: "🤖",
    tagline: "AWS-native AI service with Claude models for architecture analysis",
    whyChosen:
      "AWS-native integration (lowest latency from Railway), cost-effective at ~$0.001 per text review (~$0.012 with vision), inline context approach avoids $700/month Knowledge Base costs, and Claude 3.5 Haiku provides excellent quality-to-cost ratio.",
    alternatives: ["OpenAI API (GPT-4)", "Azure OpenAI", "Self-hosted LLM"],
    tradeoffs: [
      "Locked into AWS ecosystem (acceptable for AWS-focused tool)",
      "Bedrock API has slightly different interface than Anthropic API",
      "Limited model selection compared to OpenAI (but sufficient for our needs)",
    ],
    deepDive:
      "We use inference profiles (arn:aws:bedrock:...) instead of direct model IDs. Inline AWS Well-Architected context (~6K tokens) is passed with every request. Vision analysis uses Claude 3 Sonnet (Haiku doesn't support vision yet).",
  },
  {
    name: "Neo4j AuraDB",
    icon: "🕸️",
    tagline: "Native graph database for AWS service relationships and pattern analysis",
    whyChosen:
      "Native graph relationships (not SQL joins), Cypher query language is expressive for pattern matching, visual topology extraction (Phase 2.3), accumulates knowledge across reviews (CO_OCCURS_WITH relationships), and free tier (200K nodes, 400K edges) is generous.",
    alternatives: ["PostgreSQL with pg_graph", "DynamoDB", "In-memory graph"],
    tradeoffs: [
      "Extra infrastructure dependency (another service to monitor)",
      "Cypher has learning curve vs SQL",
      "Write latency ~200-500ms (mitigated by async background writes)",
    ],
    deepDive:
      "Graph schema: (Analysis)-[:HAS_FINDING]->(Finding)-[:INVOLVES_SERVICE]->(AWSService). Services accumulate CO_OCCURS_WITH relationships (e.g., 'ALB and EC2 appear together 23 times'). This powers the global graph view at /graph.",
  },
  {
    name: "Railway (Backend) + Vercel (Frontend)",
    icon: "🚂",
    tagline: "Simple deployment platforms with generous free tiers and Git integration",
    whyChosen:
      "Railway: Dockerfile support, automatic deployments from GitHub, built-in secrets management, $5-10/month backend hosting. Vercel: Serverless Next.js hosting, instant CDN, zero-config deployments, $0/month for hobby projects.",
    alternatives: ["AWS-only (ECS/Lambda + CloudFront)", "Fly.io", "Render"],
    tradeoffs: [
      "Less control than raw AWS (can't customize networking, no VPC)",
      "Vendor lock-in (migration would require infrastructure changes)",
      "Railway doesn't support autoscaling (fixed resources)",
    ],
    deepDive:
      "Railway runs our Dockerfile with AWS credentials in environment variables. Vercel hosts static frontend and proxies API requests to Railway. Both platforms deploy automatically on git push to main branch.",
  },
];

export function TechStackCards() {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const toggleCard = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  return (
    <section
      id="tech-stack"
      className="container mx-auto px-4 py-16 md:py-24 bg-muted/30"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Technology Stack
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Why we chose these technologies, what alternatives we considered, and the trade-offs we accepted
          </p>
        </div>

        {/* Tech Cards Grid */}
        <div className="space-y-6">
          {technologies.map((tech, idx) => {
            const isExpanded = expandedCards.has(idx);

            return (
              <div
                key={idx}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-shadow"
              >
                {/* Card Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl flex-shrink-0">{tech.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-foreground mb-1">
                      {tech.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {tech.tagline}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleCard(idx)}
                    className="flex-shrink-0 p-2 hover:bg-muted rounded-lg transition-colors"
                    aria-label={
                      isExpanded ? "Collapse details" : "Expand details"
                    }
                  >
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Card Content */}
                <div>
                  {/* Why Chosen */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-foreground mb-2">
                      Why We Chose It
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tech.whyChosen}
                    </p>
                  </div>

                  {/* Expandable Details */}
                  {isExpanded && (
                    <div className="space-y-4 border-t border-border pt-4">
                      {/* Alternatives Considered */}
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-2">
                          🔍 Alternatives Considered
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {tech.alternatives.map((alt, altIdx) => (
                            <li
                              key={altIdx}
                              className="text-sm text-muted-foreground"
                            >
                              {alt}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Trade-offs */}
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-2">
                          ⚖️ Trade-offs
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {tech.tradeoffs.map((tradeoff, tradeoffIdx) => (
                            <li
                              key={tradeoffIdx}
                              className="text-sm text-muted-foreground"
                            >
                              {tradeoff}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Deep Dive (Optional) */}
                      {tech.deepDive && (
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-sm font-semibold text-foreground mb-2">
                            🔬 Deep Dive
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {tech.deepDive}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            All technologies chosen with cost, performance, and developer experience in mind.
            <br />
            See{" "}
            <a
              href="https://github.com/iamarsh/tesseric/blob/main/memory-bank/decisions.log.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              decisions.log.md
            </a>{" "}
            for full ADRs (Architectural Decision Records).
          </p>
        </div>
      </div>
    </section>
  );
}
