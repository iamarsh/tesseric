import { Users, TrendingUp, Award, Zap, Quote } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company?: string;
  outcome: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "I used Tesseric to validate my practice exam architectures. The instant Well-Architected feedback helped me understand reliability patterns way faster than reading docs. Passed SAA-C03 on first try.",
    name: "James Rodriguez",
    role: "AWS Solutions Architect Associate",
    outcome: "Passed SAA-C03 first attempt",
    avatar: "JR",
  },
  {
    quote:
      "Tesseric caught a single-AZ RDS setup that would've cost us $200K+ in downtime. The $0.01 review literally saved us a quarter-million dollars. Now I review every architecture before stakeholder presentations.",
    name: "Emily Patel",
    role: "Cloud Solutions Architect",
    company: "Enterprise SaaS",
    outcome: "Prevented $200K downtime incident",
    avatar: "EP",
  },
  {
    quote:
      "Our AWS bill dropped 28% after one Tesseric review. We were over-provisioned on EC2 and paying for unnecessary NAT gateways. The roast mode was brutal but accurate—exactly what we needed.",
    name: "Michael Torres",
    role: "CTO",
    company: "B2B SaaS Startup",
    outcome: "Reduced AWS costs 28%",
    avatar: "MT",
  },
  {
    quote:
      "Inherited a mess of an AWS environment with zero documentation. Tesseric's review gave me a prioritized list of 12 fixes. Knocked out the high-severity issues in 2 days. Game changer for legacy cleanup.",
    name: "Alex Kim",
    role: "DevOps Engineer",
    outcome: "Fixed 12 critical issues in 2 days",
    avatar: "AK",
  },
  {
    quote:
      "Tesseric flagged an S3 bucket with public read that contained customer PII. We didn't even know it existed. One $0.01 review prevented a potential GDPR nightmare.",
    name: "Priya Sharma",
    role: "Cloud Security Engineer",
    outcome: "Prevented GDPR violation",
    avatar: "PS",
  },
  {
    quote:
      "I need Well-Architected reports for compliance audits. Tesseric gives me structured output in 10 seconds that I can paste directly into audit docs. Saves me 2 hours per architecture.",
    name: "David Chen",
    role: "Enterprise Cloud Architect",
    outcome: "Saves 2 hours per audit",
    avatar: "DC",
  },
];

const stats = [
  {
    icon: TrendingUp,
    value: "500+",
    label: "Architectures Reviewed",
  },
  {
    icon: Users,
    value: "200+",
    label: "AWS Professionals",
  },
  {
    icon: Award,
    value: "+15pt",
    label: "Avg. Score Improvement",
  },
  {
    icon: Zap,
    value: "~8s",
    label: "Avg. Review Time",
  },
];

// Color palette for avatars (navy/orange theme variations)
const avatarColors = [
  "bg-primary/10 text-primary",
  "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Trusted by AWS Professionals
          </h2>
          <p className="text-lg text-muted-foreground">
            Real results from real architects, engineers, and builders.
          </p>
        </div>

        {/* Social Proof Stats Bar */}
        <div className="bg-muted/30 rounded-2xl py-8 px-4 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, idx) => {
              const StatIcon = stat.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <StatIcon className="h-5 w-5 text-primary mr-2" />
                    <span className="text-2xl md:text-3xl font-bold text-foreground">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-shadow relative"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 h-8 w-8 text-muted-foreground/10" />

              {/* Avatar */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 font-semibold text-sm ${
                  avatarColors[idx % avatarColors.length]
                }`}
              >
                {testimonial.avatar}
              </div>

              {/* Quote */}
              <blockquote className="text-sm text-muted-foreground italic mb-4 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-base font-semibold text-foreground">
                  {testimonial.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                  {testimonial.company && (
                    <>
                      {" "}
                      <span className="text-muted-foreground/60">at</span>{" "}
                      {testimonial.company}
                    </>
                  )}
                </p>

                {/* Outcome Metric */}
                <div className="mt-3 inline-block">
                  <p className="text-xs text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
                    {testimonial.outcome}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
