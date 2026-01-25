import { Sparkles, Shield, Zap, Lock, Layers, AlertCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: Text */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            AWS-Powered Architecture Review
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-foreground text-balance">
            Architecture,
            <br />
            <span className="text-primary">piece by piece</span>
          </h1>

          <p className="text-xl text-muted-foreground text-balance">
            AI-powered AWS architecture review service that analyzes your designs
            and returns structured, Well-Architected-aligned feedback in seconds.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#review"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Review My Architecture
            </a>
            <a
              href="#how-it-works"
              className="px-8 py-3 bg-card border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
            >
              How It Works
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center gap-6 pt-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              AWS Well-Architected
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" />
              ~$0.01 per review
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 text-primary" />
              No signup required
            </div>
          </div>
        </div>

        {/* Right Column: Preview Card */}
        <div className="relative">
          {/* Decorative gradient blob */}
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />

          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Architecture Review</p>
                <p className="text-xs text-muted-foreground font-mono">REV-ABC123</p>
              </div>
            </div>

            {/* Mini Score Gauge */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-20 h-20">
                <svg className="transform -rotate-90 w-20 h-20">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-muted opacity-20"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray="226"
                    strokeDashoffset="45"
                    className="text-primary"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">82</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Excellent</p>
                <p className="text-xs text-muted-foreground">5 risks identified</p>
              </div>
            </div>

            {/* Sample Risk Cards */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <AlertCircle className="h-4 w-4 text-warning flex-shrink-0" />
                <span className="text-xs text-muted-foreground">Single AZ database deployment</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <AlertCircle className="h-4 w-4 text-warning flex-shrink-0" />
                <span className="text-xs text-muted-foreground">No CloudWatch alarms configured</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                Powered by Claude 3.5 Haiku via AWS Bedrock
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
