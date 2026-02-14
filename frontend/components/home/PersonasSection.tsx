import { GraduationCap, Code, Shield, Award, DollarSign } from "lucide-react";

interface Persona {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  useCase: string;
  outcome: {
    icon: React.ComponentType<{ className?: string }>;
    text: string;
  };
}

const personas: Persona[] = [
  {
    icon: GraduationCap,
    title: "AWS SAA Candidates",
    description:
      "Studying for the Solutions Architect Associate exam? Stop second-guessing your designs. Test them instantly against real Well-Architected principles and learn what you're missing.",
    useCase:
      "I reviewed 10 practice exam architectures before my SAA-C03. Tesseric caught 3 Multi-AZ mistakes and 2 IAM overpermissions I would've missed. Passed first try with an 850.",
    outcome: {
      icon: Award,
      text: "Passed SAA-C03 first attempt",
    },
  },
  {
    icon: Code,
    title: "Cloud Architects",
    description:
      "Presenting to stakeholders? Get a second opinion before you commit. Find hidden risks, justify your design choices with Well-Architected alignment, and present with confidence.",
    useCase:
      "I reviewed my CloudFormation stack for a fintech client. Tesseric flagged a single-AZ RDS setup that would've caused $200K+ downtime. Fixed it before the deploy—client never knew how close we came to disaster.",
    outcome: {
      icon: Shield,
      text: "Prevented $200K incident",
    },
  },
  {
    icon: Shield,
    title: "DevOps Engineers",
    description:
      "Inherited a legacy AWS environment with zero docs? Audit it in seconds. Get a prioritized list of security gaps, cost waste, and reliability risks—then fix the critical stuff first.",
    useCase:
      "I analyzed our production environment and found 5 critical security issues: unencrypted RDS, overpermissioned IAM roles, and public S3 buckets. Fixed them before our SOC 2 audit. One $0.01 review saved our certification.",
    outcome: {
      icon: Shield,
      text: "Fixed 5 critical security issues",
    },
  },
  {
    icon: DollarSign,
    title: "Startup CTOs",
    description:
      "Burning cash on AWS? Find out where. Tesseric reviews your architecture for cost waste and gives you actionable fixes. Cut your bill by 20-30% in one review.",
    useCase:
      "Our AWS bill hit $18K/month and our runway was shrinking. One Tesseric review found over-provisioned EC2, unnecessary NAT gateways, and unoptimized RDS. We cut costs 28%—that's $5K/month back in the bank.",
    outcome: {
      icon: DollarSign,
      text: "Reduced AWS costs 28%",
    },
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {personas.map((persona, idx) => {
            const PersonaIcon = persona.icon;
            const OutcomeIcon = persona.outcome.icon;
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
                  <p className="text-xs font-medium text-primary mb-2">Real Story:</p>
                  <p className="text-sm text-muted-foreground italic mb-4">
                    "{persona.useCase}"
                  </p>

                  {/* Outcome Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs font-medium text-primary">
                    <OutcomeIcon className="h-3 w-3" />
                    <span>{persona.outcome.text}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
