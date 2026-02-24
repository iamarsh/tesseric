import { Zap, Database, Shield, Code } from "lucide-react";

export function HeroSection() {
  const metrics = [
    {
      icon: Zap,
      value: "8.0s",
      label: "Average Response Time",
      description: "Bedrock AI analysis + Neo4j write",
      color: "text-primary",
    },
    {
      icon: Database,
      value: "98.7%",
      label: "Graph Write Success",
      description: "Async background writes to Neo4j",
      color: "text-success",
    },
    {
      icon: Shield,
      value: "Zero",
      label: "Data Persistence",
      description: "Ephemeral sessions, immediate discard",
      color: "text-success",
    },
    {
      icon: Code,
      value: "100%",
      label: "Type Safe",
      description: "TypeScript + Pydantic strict mode",
      color: "text-primary",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            System <span className="text-primary">Architecture</span>
          </h1>
          <p className="text-xl text-muted-foreground text-balance max-w-3xl mx-auto">
            How Tesseric Works - Built for Scale, Security, and Speed
          </p>
        </div>

        {/* High-Level Architecture Diagram */}
        <div className="mb-12 bg-card border border-border rounded-2xl p-8 shadow-xl">
          <pre className="text-xs md:text-sm text-muted-foreground overflow-x-auto font-mono leading-relaxed">
{`┌────────────────────────────────────────────────────────────────────┐
│                   User / Frontend (Vercel)                          │
│                      Next.js 14 + TypeScript                        │
│   ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐          │
│   │  /review    │  │  /graph     │  │  /architecture   │          │
│   │ (Analysis)  │  │ (Viz)       │  │  (Docs)          │          │
│   └─────────────┘  └─────────────┘  └──────────────────┘          │
└─────────┬────────────────┬──────────────────┬────────────────────────┘
          │ POST /review   │ GET /api/graph/* │
          │                │                   │
          ▼                ▼                   ▼
┌────────────────────────────────────────────────────────────────────┐
│                   Production API (Railway)                          │
│                    FastAPI + Python 3.11                            │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  ┌──────────────┐ │
│  │ /health  │  │ /review  │  │ /api/metrics  │  │ /api/graph/* │ │
│  └──────────┘  └─────┬────┘  └──────┬────────┘  └──────┬───────┘ │
│                      │                │                   │         │
│  ┌───────────────────▼────────────────┼───────────────────┼───────┐│
│  │       Analysis Orchestration       │   Graph Layer     │       ││
│  │  • Image parsing (vision)          │  • Neo4j queries  │       ││
│  │  • Bedrock AI analysis             │  • Aggregations   │       ││
│  │  • Cost tracking                   │  • Relationships  │       ││
│  │  • Background graph write  ────────┼───────────▶       │       ││
│  └────────────┬───────────────────────┴───────────────────────────┘│
└───────────────┼───────────────────────┬────────────────────────────┘
                │                       │
      ┌─────────┴──────────┐           │
      │                    │           │
      ▼                    ▼           ▼
┌──────────────┐   ┌──────────────┐   ┌─────────────────────────┐
│   Bedrock    │   │   Bedrock    │   │   Neo4j AuraDB          │
│  (us-east-2) │   │   Vision     │   │   Knowledge Graph       │
│              │   │              │   │                         │
│ Claude 3.5   │   │ Claude 3     │   │ • 31 reviews            │
│   Haiku      │   │   Sonnet     │   │ • 20 AWS services       │
│              │   │              │   │ • 72 findings           │
│ ~$0.001/call │   │ ~$0.012/img  │   │ • Relationships         │
│ Text → JSON  │   │ Image → Text │   │ • Pattern analysis      │
└──────────────┘   └──────────────┘   └─────────────────────────┘`}
          </pre>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Color Legend: <span className="text-blue-500">Frontend</span> •{" "}
            <span className="text-success">Backend</span> •{" "}
            <span className="text-primary">AWS</span> •{" "}
            <span className="text-cyan-500">Neo4j</span>
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, idx) => {
            const MetricIcon = metric.icon;
            return (
              <div
                key={idx}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MetricIcon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">
                  {metric.value}
                </p>
                <p className="text-sm font-semibold text-foreground mb-2">
                  {metric.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
