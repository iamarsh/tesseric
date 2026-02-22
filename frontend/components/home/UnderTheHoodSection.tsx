import { Database, Zap, Code, Cloud, ExternalLink } from "lucide-react";

const techCards = [
  {
    icon: Zap,
    title: "Claude via AWS Bedrock",
    body: "Each review invokes Claude 3.5 Haiku via AWS Bedrock with a structured RAG pipeline over Well-Architected Framework documentation. Findings are returned as typed JSON with severity, impact, and remediation steps.",
    badge: "In Production",
    badgeColor: "bg-success/20 text-success",
  },
  {
    icon: Database,
    title: "Neo4j AuraDB Knowledge Graph",
    body: "Every analysis is persisted as a connected graph - findings, services, and remediations as nodes with typed relationships. AWSService nodes accumulate across reviews, enabling cross-analysis pattern detection.",
    badge: "In Development",
    badgeColor: "bg-warning/20 text-warning",
  },
  {
    icon: Code,
    title: "Next.js 14 + TypeScript",
    body: "App Router, server-side rendering, dynamic imports for graph visualization. React-Flow for knowledge graph rendering with dagre auto-layout.",
    badge: "In Production",
    badgeColor: "bg-success/20 text-success",
  },
  {
    icon: Cloud,
    title: "FastAPI + Vercel + Railway",
    body: "Python FastAPI backend deployed on Railway with async background writes. Frontend on Vercel with edge caching. Zero-downtime deploys via GitHub Actions.",
    badge: "In Production",
    badgeColor: "bg-success/20 text-success",
  },
];

export function UnderTheHoodSection() {
  return (
    <section id="tech-stack" className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Under the Hood
          </h2>
          <p className="text-lg text-muted-foreground">
            Built by one engineer. Production-grade from day one.
          </p>
        </div>

        {/* Tech Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {techCards.map((card, idx) => {
            const CardIcon = card.icon;
            return (
              <div
                key={idx}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-shadow"
              >
                {/* Icon and Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CardIcon className="h-6 w-6 text-primary" />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {card.title}
                </h3>

                {/* Body */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.body}
                </p>
              </div>
            );
          })}
        </div>

        {/* GitHub Link */}
        <div className="text-center mt-8">
          <a
            href="https://github.com/iamarsh/tesseric"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border hover:bg-muted text-foreground rounded-lg font-medium transition-colors"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span>View on GitHub</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
