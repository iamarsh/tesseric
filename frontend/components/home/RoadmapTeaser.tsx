import { CheckCircle2, Clock, ArrowRight } from "lucide-react";

const phases = [
  {
    label: "Phase 1",
    title: "AWS Foundation",
    description: "AI-powered analysis with Claude 3.5 Haiku via Bedrock",
    status: "completed" as const,
  },
  {
    label: "Phase 2",
    title: "Diagram Upload",
    description: "Accept architecture diagrams using Bedrock vision",
    status: "current" as const,
  },
  {
    label: "Phase 3",
    title: "Multi-Cloud",
    description: "Expand to Azure, GCP, and n8n workflows",
    status: "planned" as const,
  },
];

export function RoadmapTeaser() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12 max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-foreground mb-4">
          What's Next?
        </h2>
        <p className="text-lg text-muted-foreground">
          From AWS-first to multi-cloud SaaS platform
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-4">
          {phases.map((phase, idx) => (
            <div key={idx} className="flex-1 w-full">
              <div
                className={`p-6 rounded-2xl border h-full ${
                  phase.status === "completed"
                    ? "bg-success/10 border-success/30"
                    : phase.status === "current"
                    ? "bg-primary/10 border-primary/30"
                    : "bg-muted border-border"
                }`}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      phase.status === "completed"
                        ? "bg-success/20 text-success"
                        : phase.status === "current"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {phase.label}
                  </span>
                  {phase.status === "completed" && (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  )}
                  {phase.status === "current" && (
                    <Clock className="h-4 w-4 text-primary" />
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {phase.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground">
                  {phase.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="/roadmap"
            className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border hover:bg-muted text-foreground rounded-lg font-medium transition-colors"
          >
            View Full Roadmap
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
