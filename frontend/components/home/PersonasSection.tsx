import { GraduationCap, Code, Shield } from "lucide-react";

const personas = [
  {
    icon: GraduationCap,
    title: "AWS SAA Candidates",
    description:
      "Preparing for the Solutions Architect Associate exam? Test your designs against real Well-Architected principles.",
    useCase:
      "I paste practice exam architectures to validate my understanding before the test.",
  },
  {
    icon: Code,
    title: "Cloud Architects",
    description:
      "Get a second opinion on your infrastructure designs before presenting to stakeholders or deploying to production.",
    useCase:
      "I review my CloudFormation templates to catch security and cost issues early.",
  },
  {
    icon: Shield,
    title: "DevOps Engineers",
    description:
      "Audit existing AWS environments for compliance with best practices and identify improvement opportunities.",
    useCase:
      "I analyze inherited architectures to prioritize refactoring efforts.",
  },
];

export function PersonasSection() {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Built For You
          </h2>
          <p className="text-lg text-muted-foreground">
            Whether you're studying, building, or auditing, Tesseric has your back
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {personas.map((persona, idx) => {
            const PersonaIcon = persona.icon;
            return (
              <div
                key={idx}
                className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-shadow"
              >
                {/* Avatar/Icon */}
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <PersonaIcon className="h-8 w-8 text-primary" />
                </div>

                {/* Persona Title */}
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {persona.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4">
                  {persona.description}
                </p>

                {/* Use Case */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-medium text-primary mb-1">Use Case:</p>
                  <p className="text-sm text-muted-foreground italic">
                    "{persona.useCase}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
