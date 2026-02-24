import { Cloud, Layers, FileCode, Terminal, Users } from "lucide-react";
import Link from "next/link";

const roadmapItems = [
  {
    icon: Cloud,
    title: "Multi-Cloud Support",
    description:
      "Extend beyond AWS to analyze Azure and GCP architectures. Provider-agnostic Well-Architected principles.",
    architectureImpact: [
      "Abstract provider-specific logic into plugins (aws/, azure/, gcp/)",
      "Common taxonomy mapping (AWS pillars → Azure WAF → GCP Architecture Framework)",
      "Multi-region inference profile selection per provider",
    ],
    phase: "Phase 3",
    estimatedTimeline: "Q2 2026",
  },
  {
    icon: Layers,
    title: "Real-Time Collaboration",
    description:
      "Multiple users review same architecture simultaneously. WebSocket-based live cursors and annotations.",
    architectureImpact: [
      "WebSocket server on backend (Socket.IO or native WebSockets)",
      "Redis for session state and presence tracking",
      "Frontend state sync with Zustand or Jotai",
    ],
    phase: "Phase 4",
    estimatedTimeline: "Q3 2026",
  },
  {
    icon: FileCode,
    title: "IaC Analysis",
    description:
      "Paste Terraform or CloudFormation templates. Parse resources, detect misconfigurations, suggest improvements.",
    architectureImpact: [
      "HCL parser for Terraform (terraform-json)",
      "CloudFormation JSON/YAML parser",
      "Map resources to Well-Architected checks (e.g., S3 without encryption)",
    ],
    phase: "Phase 4",
    estimatedTimeline: "Q3 2026",
  },
  {
    icon: Terminal,
    title: "CLI Tool",
    description:
      "tesseric review architecture.md --tone=roast --output=json. CI/CD integration for automated reviews.",
    architectureImpact: [
      "Python CLI with Click or Typer",
      "Local config file (.tesseric.yml) for defaults",
      "GitHub Actions workflow for PR comments",
    ],
    phase: "Phase 5",
    estimatedTimeline: "Q4 2026",
  },
  {
    icon: Users,
    title: "Team Accounts & SSO",
    description:
      "Multi-tenant architecture with team workspaces. SAML/OIDC integration for enterprise.",
    architectureImpact: [
      "Auth layer: AWS Cognito or Auth0",
      "DynamoDB table for organizations and memberships",
      "Row-level security for Neo4j queries",
    ],
    phase: "Phase 5",
    estimatedTimeline: "Q4 2026",
  },
];

export function FutureRoadmap() {
  return (
    <section
      id="future-roadmap"
      className="container mx-auto px-4 py-16 md:py-24 bg-muted/30"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Future Architecture
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            What's next on the roadmap with architectural implications
          </p>
        </div>

        {/* Roadmap Items */}
        <div className="space-y-6 mb-8">
          {roadmapItems.map((item, idx) => {
            const ItemIcon = item.icon;
            return (
              <div
                key={idx}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ItemIcon className="h-8 w-8 text-primary" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <div className="flex gap-2 flex-shrink-0">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                          {item.phase}
                        </span>
                        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full border border-border">
                          {item.estimatedTimeline}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4">
                      {item.description}
                    </p>

                    {/* Architecture Impact */}
                    <details className="text-sm">
                      <summary className="cursor-pointer hover:text-primary transition-colors font-medium text-foreground mb-2">
                        Architecture Impact
                      </summary>
                      <ul className="list-disc list-inside space-y-1 pl-4 text-muted-foreground text-xs">
                        {item.architectureImpact.map((impact, impactIdx) => (
                          <li key={impactIdx}>{impact}</li>
                        ))}
                      </ul>
                    </details>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Future State Diagram */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">
            Future State Architecture (v2.0 Vision)
          </h3>
          <pre className="text-xs md:text-sm text-muted-foreground overflow-x-auto font-mono leading-relaxed">
{`┌─────────────────────────────────────────────────────────────────┐
│                    Multi-Cloud Frontend                         │
│         Next.js 14 + WebSockets + Multi-tenant Auth            │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐   │
│  │ /aws      │  │ /azure    │  │ /gcp      │  │ /teams   │   │
│  │ (review)  │  │ (review)  │  │ (review)  │  │ (collab) │   │
│  └───────────┘  └───────────┘  └───────────┘  └──────────┘   │
└──────────┬──────────────┬──────────────┬──────────────────────┘
           │              │              │
           ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Intelligent Routing Layer (API Gateway)            │
│           • Provider detection (AWS/Azure/GCP)                  │
│           • Auth middleware (JWT validation)                    │
│           • Rate limiting per organization                      │
└──────────┬──────────────┬──────────────┬───────────────────────┘
           │              │              │
           ▼              ▼              ▼
┌────────────────┐  ┌─────────────┐  ┌─────────────┐
│ AWS Bedrock    │  │ Azure OpenAI│  │ GCP Vertex  │
│ Claude 3.5     │  │ GPT-4       │  │ PaLM 2      │
└────────────────┘  └─────────────┘  └─────────────┘
           │              │              │
           └──────────────┴──────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              Central Knowledge Graph (Neo4j)                    │
│  • Multi-provider service nodes (AWS/Azure/GCP)                 │
│  • Cross-cloud pattern detection                               │
│  • Organization-scoped data isolation                          │
│  • Real-time collaboration state                               │
└─────────────────────────────────────────────────────────────────┘`}
          </pre>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Want to influence the roadmap? We're open to feedback and feature
            requests.
          </p>
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-2 px-6 py-3 bg-muted border border-border text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-colors"
          >
            View Full Roadmap
          </Link>
        </div>
      </div>
    </section>
  );
}
