import { CheckCircle2, Clock, ArrowRight } from "lucide-react";

const phases = [
  {
    label: "In Development",
    title: "Knowledge Graph Explorer",
    description: "Visualize your AWS architecture as a traversable knowledge graph. See how services relate, where risks cluster, and which patterns repeat across your reviews - powered by Neo4j.",
    status: "current" as const,
  },
  {
    label: "Planned",
    title: "Multi-Architecture Diff",
    description: "Compare two architecture versions side-by-side. Track how your risk score changes as you implement remediations.",
    status: "planned" as const,
  },
  {
    label: "Planned",
    title: "Diagram Upload (IaC)",
    description: "Upload your IaC directly - CloudFormation templates or Terraform plans - for automated architecture extraction and review.",
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
          Roadmap for technical depth and analysis capabilities
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-4">
          {phases.map((phase, idx) => (
            <div key={idx} className="flex-1 w-full">
              <div
                className={`p-6 rounded-2xl border h-full ${
                  phase.status === "current"
                    ? "bg-warning/10 border-warning/30"
                    : "bg-muted border-border"
                }`}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      phase.status === "current"
                        ? "bg-warning/20 text-warning"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {phase.label}
                  </span>
                  {phase.status === "current" && (
                    <Clock className="h-4 w-4 text-warning" />
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
