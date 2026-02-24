import {
  Lock,
  Shield,
  Key,
  CheckCircle,
  Ban,
  Activity,
  ExternalLink,
} from "lucide-react";

export function SecurityArchitecture() {
  const securityMeasures = [
    {
      icon: Lock,
      title: "No Data Storage",
      description:
        "Ephemeral sessions with immediate discard. Architecture descriptions never touch a database. GDPR compliant by design.",
      status: "✅ Implemented",
    },
    {
      icon: Shield,
      title: "HTTPS Everywhere",
      description:
        "TLS 1.3 for all connections. Vercel and Railway enforce HTTPS by default. No mixed content warnings.",
      status: "✅ Implemented",
    },
    {
      icon: Key,
      title: "IAM Roles Only",
      description:
        "AWS Bedrock accessed via IAM roles in Railway environment. No hardcoded access keys in codebase or Docker images.",
      status: "✅ Implemented",
    },
    {
      icon: CheckCircle,
      title: "Input Validation",
      description:
        "Pydantic v2 schemas validate all inputs. XSS protection via framework defaults. Field-level constraints enforced.",
      status: "✅ Implemented",
    },
    {
      icon: Ban,
      title: "CORS Whitelist",
      description:
        "Restricted origins: tesseric.ca and api.tesseric.ca only. No wildcard (*) in production. Preflight requests validated.",
      status: "✅ Implemented",
    },
    {
      icon: Activity,
      title: "Rate Limiting",
      description:
        "Coming soon: 10 req/min per IP for /review, 60 req/min for /api/metrics. Prevents API abuse and cost overruns.",
      status: "🚧 Roadmap (TASK-011)",
    },
  ];

  return (
    <section id="security" className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Security Architecture
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Defense-in-depth with zero-trust principles
          </p>
        </div>

        {/* Security Measures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {securityMeasures.map((measure, idx) => {
            const MeasureIcon = measure.icon;
            return (
              <div
                key={idx}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MeasureIcon className="h-6 w-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {measure.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {measure.description}
                    </p>
                    <span
                      className={`text-xs font-semibold ${
                        measure.status.startsWith("✅")
                          ? "text-success"
                          : "text-warning"
                      }`}
                    >
                      {measure.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Boundaries Diagram */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">
            Security Boundaries
          </h3>
          <pre className="text-xs md:text-sm text-muted-foreground overflow-x-auto font-mono leading-relaxed">
{`┌─────────────────────────────────────────────────────────────────┐
│                         User / Browser                          │
│                   (HTTPS only, TLS 1.3)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ Trusted
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel (Frontend CDN)                        │
│              • Origin whitelisted (tesseric.ca)                 │
│              • Auto SSL certificates                            │
│              • DDoS protection built-in                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ CORS validated
                             │ (tesseric.ca → api.tesseric.ca)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                Railway (Backend API)                            │
│              • HTTPS-only endpoints                             │
│              • Environment secrets encrypted                    │
│              • No public IP (Railway internal)                  │
└───────────────┬──────────────────────┬──────────────────────────┘
                │ IAM role            │ Connection string
                │ (no keys)           │ (env variable)
                ▼                     ▼
┌────────────────────┐       ┌─────────────────────────┐
│   AWS Bedrock      │       │   Neo4j AuraDB          │
│   (us-east-2)      │       │   (Cloud-managed)       │
│                    │       │                         │
│ • IAM role auth    │       │ • TLS connection        │
│ • Regional service │       │ • Encrypted at rest     │
│ • AWS-managed keys │       │ • Automatic backups     │
└────────────────────┘       └─────────────────────────┘`}
          </pre>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-muted-foreground">Trusted boundary</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-warning rounded-full"></div>
              <span className="text-muted-foreground">CORS validated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-muted-foreground">IAM authenticated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-muted-foreground">TLS encrypted</span>
            </div>
          </div>
        </div>

        {/* Security Best Practices */}
        <div className="mt-8 bg-muted/50 border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            AWS Well-Architected Security Pillar Alignment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-foreground mb-1">
                ✅ Identity & Access Management
              </p>
              <p className="text-xs text-muted-foreground">
                IAM roles for Bedrock (principle of least privilege)
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">
                ✅ Detective Controls
              </p>
              <p className="text-xs text-muted-foreground">
                Logging enabled for all API requests (Railway logs)
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">
                ✅ Data Protection
              </p>
              <p className="text-xs text-muted-foreground">
                Zero persistence + TLS everywhere + Neo4j encryption at rest
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">
                ✅ Infrastructure Protection
              </p>
              <p className="text-xs text-muted-foreground">
                CORS whitelist, Pydantic validation, HTTPS-only
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-2">
            <ExternalLink className="h-3 w-3" />
            See{" "}
            <a
              href="https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              AWS Security Pillar
            </a>{" "}
            for full best practices
          </p>
        </div>
      </div>
    </section>
  );
}
