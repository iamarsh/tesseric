import { Sparkles, Shield, Zap, Lock, Layers, AlertCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: Text */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Production-ready AWS architecture analysis
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-foreground text-balance">
            Instant AWS
            <br />
            <span className="text-primary">Architecture Reviews</span>
          </h1>

          <p className="text-xl text-muted-foreground text-balance">
            Paste your AWS architecture description and receive a Well-Architected aligned score, structured findings, and remediation steps in seconds. Built with Claude via AWS Bedrock, Next.js, and Neo4j.
          </p>

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-4">
              <a
                href="#review"
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Get My Architecture Score
              </a>
              <a
                href="#how-it-works"
                className="px-8 py-3 bg-card border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
              >
                See How It Works
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              No signup required · Pay per use
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center gap-6 pt-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              Well-Architected aligned
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" />
              ~10 second reviews
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

            {/* Before/After Score Comparison */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Before</p>
                <p className="text-3xl font-bold text-warning">61</p>
                <p className="text-xs text-muted-foreground">5 critical risks</p>
              </div>
              <div className="text-center p-3 bg-primary/10 rounded-lg border-2 border-primary">
                <p className="text-xs text-primary mb-1">After fixes</p>
                <p className="text-3xl font-bold text-primary">94</p>
                <p className="text-xs text-muted-foreground">Well-Architected</p>
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
                Powered by Claude via AWS Bedrock
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
