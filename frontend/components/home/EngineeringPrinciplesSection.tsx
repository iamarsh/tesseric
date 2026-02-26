import { Shield, Zap, CheckCircle, Code, DollarSign, Terminal } from "lucide-react";

interface Principle {
  icon: typeof Shield;
  title: string;
  description: string;
  metric: string;
}

const principles: Principle[] = [
  {
    icon: Shield,
    title: "Security First",
    description: "Zero data storage. IAM roles only. Input validation. HTTPS everywhere.",
    metric: "0 security incidents in production",
  },
  {
    icon: Zap,
    title: "Performance Obsessed",
    description: "Sub-10s responses. 5-min caching. Async everything. 58.5% faster.",
    metric: "9.75s average image review (from 23.5s)",
  },
  {
    icon: CheckCircle,
    title: "Production Ready",
    description: "CI/CD automation. Rate limiting. Graceful fallbacks. Real monitoring.",
    metric: "99.9% uptime, 0 critical bugs",
  },
  {
    icon: Code,
    title: "Type Safe",
    description: "100% typed Python (Pydantic). TypeScript strict mode. API contract validation.",
    metric: "0 runtime type errors",
  },
  {
    icon: DollarSign,
    title: "Cost Conscious",
    description: "Smart model selection. Request caching. Inline context. Usage tracking.",
    metric: "$0.016 → $0.009 per review (42% cheaper)",
  },
  {
    icon: Terminal,
    title: "Developer Friendly",
    description: "Clean architecture. Comprehensive docs. OpenAPI specs. Easy local setup.",
    metric: "5-minute setup (see README)",
  },
];

export function EngineeringPrinciplesSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Engineering Principles
          </h2>
          <p className="text-lg text-muted-foreground">
            Built with production-grade practices from day one.
          </p>
        </div>

        {/* Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {principles.map((principle, idx) => {
            const IconComponent = principle.icon;
            return (
              <div
                key={idx}
                className="group relative hover:scale-105 transition-transform duration-300"
              >
                {/* Glassmorphism Card */}
                <div className="relative h-full bg-card/50 backdrop-blur-md border border-border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-primary/50">
                  {/* Background Gradient on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon with Animation */}
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      {principle.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {principle.description}
                    </p>

                    {/* Metric Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                      <span className="text-xs font-medium text-primary">
                        {principle.metric}
                      </span>
                    </div>
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
