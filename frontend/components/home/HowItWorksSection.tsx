import { FileText, Sparkles, Network, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Describe Your Architecture",
    description:
      "Describe your AWS setup in plain English-takes 30 seconds. List your services (EC2, RDS, S3) or upload a diagram. No JSON, no code, just your architecture.",
    benefit: "No complex setup, no learning curve",
  },
  {
    icon: Sparkles,
    title: "AI Analysis via Bedrock",
    description:
      "Our AI (powered by AWS Bedrock) reviews your design against AWS best practices. We've built in deep Well-Architected expertise so you don't have to memorize it.",
    benefit: "Same quality as a $200/hour consultant, in 10 seconds",
  },
  {
    icon: Network,
    title: "See Your Architecture",
    description:
      "We recreate your system topology with visual problem indicators. See exactly WHERE issues exist—services with findings are color-coded by severity. Stored in Neo4j knowledge graph.",
    benefit: "Visual proof AI understood your architecture",
    badge: "NEW",
  },
  {
    icon: CheckCircle2,
    title: "Get Actionable Feedback",
    description:
      "Get your results in 8-10 seconds: specific risks (like 'Single-AZ database'), fix recommendations (like 'Enable RDS Multi-AZ'), and AWS doc links. Ready to act on immediately.",
    benefit: "Faster than reading a blog post, more accurate than ChatGPT",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12 max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-foreground mb-4">
          How It Works
        </h2>
        <p className="text-lg text-muted-foreground">
          Four simple steps to Well-Architected feedback
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          return (
            <div key={idx} className="relative">
              {/* Connector Line (desktop only) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-border -translate-x-1/2 z-0" />
              )}

              {/* Card */}
              <div className="relative bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-shadow z-10">
                {/* Step Number */}
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary">{idx + 1}</span>
                </div>

                {/* Title with Icon */}
                <div className="flex items-center gap-3 mb-2">
                  <StepIcon className="h-6 w-6 text-primary flex-shrink-0" />
                  <h3 className="text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  {step.badge && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 rounded-full">
                      {step.badge}
                    </span>
                  )}
                </div>

                {/* Content */}
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>

                {/* Benefit Sub-text */}
                <p className="text-xs text-muted-foreground italic mt-3">
                  {step.benefit}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
