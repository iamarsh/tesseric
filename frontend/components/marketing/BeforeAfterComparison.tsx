"use client";

import { useState } from "react";
import { Network, FileText, ArrowRight } from "lucide-react";

export function BeforeAfterComparison() {
  const [activeView, setActiveView] = useState<"before" | "after">("before");

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Text vs. Topology
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ChatGPT gives you a wall of text. Tesseric shows you exactly where problems exist.
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveView("before")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeView === "before"
                ? "bg-muted text-foreground shadow-lg"
                : "bg-card text-muted-foreground border border-border hover:bg-muted/50"
            }`}
          >
            <FileText className="h-5 w-5" />
            ChatGPT (Text Only)
          </button>
          <button
            onClick={() => setActiveView("after")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeView === "after"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-card text-muted-foreground border border-border hover:bg-muted/50"
            }`}
          >
            <Network className="h-5 w-5" />
            Tesseric (Visual Topology)
          </button>
        </div>

        {/* Comparison Cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Before: ChatGPT */}
          <div
            className={`bg-card border-2 rounded-2xl p-8 transition-all ${
              activeView === "before"
                ? "border-muted-foreground scale-105 shadow-2xl"
                : "border-border opacity-50"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">ChatGPT Output</h3>
                <p className="text-sm text-muted-foreground">Generic text response</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-muted-foreground font-mono bg-muted/30 p-4 rounded-lg max-h-96 overflow-y-auto">
              <p>
                "Your architecture has several potential issues. First, you should consider implementing
                high availability by using multiple availability zones. This will help ensure your
                application remains available even if one zone experiences problems.
              </p>
              <p>
                Additionally, you should implement proper monitoring. CloudWatch can help you track
                metrics and set up alarms. Make sure to monitor CPU usage, disk space, and network
                traffic.
              </p>
              <p>
                Security is also important. Consider using encryption for data at rest and in transit.
                Enable MFA on your AWS accounts. Use IAM roles instead of access keys where possible.
              </p>
              <p>
                For cost optimization, you might want to look into Reserved Instances or Savings Plans.
                Also review your S3 storage classes to ensure you're not paying for Standard storage
                when Glacier would suffice.
              </p>
              <p className="text-yellow-600 dark:text-yellow-400 italic">
                ❌ No visual representation<br />
                ❌ Can't see WHERE problems exist<br />
                ❌ Generic advice, not actionable
              </p>
            </div>
          </div>

          {/* After: Tesseric */}
          <div
            className={`bg-card border-2 rounded-2xl p-8 transition-all ${
              activeView === "after"
                ? "border-primary scale-105 shadow-2xl"
                : "border-border opacity-50"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Network className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Tesseric Output</h3>
                <p className="text-sm text-muted-foreground">Interactive topology graph</p>
              </div>
            </div>

            {/* Mock Architecture Visualization */}
            <div className="space-y-4 bg-gradient-to-br from-primary/5 to-orange-500/5 p-6 rounded-lg border border-primary/20">
              {/* Layer 1: ALB */}
              <div className="flex justify-center">
                <div className="px-4 py-2 bg-card border-2 border-green-500 rounded-lg text-sm font-mono shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ALB
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">0 issues</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-primary rotate-90" />
              </div>

              {/* Layer 2: EC2 */}
              <div className="flex justify-center gap-4">
                <div className="px-4 py-2 bg-card border-2 border-orange-500 rounded-lg text-sm font-mono shadow-lg animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    EC2 (us-east-1a)
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">2 HIGH issues</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-primary rotate-90" />
              </div>

              {/* Layer 3: RDS */}
              <div className="flex justify-center">
                <div className="px-4 py-2 bg-card border-2 border-red-500 rounded-lg text-sm font-mono shadow-lg animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    RDS (Single-AZ)
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">1 CRITICAL issue</div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs font-semibold mb-2">Interactive Features:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">●</span> Click service → See related findings
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">●</span> Border color = Severity level
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">●</span> Pulse animation = Critical issue
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <p className="text-green-600 dark:text-green-400 flex items-start gap-2">
                <span>✓</span>
                <span><strong>Visual spatial reasoning</strong>: See topology at a glance</span>
              </p>
              <p className="text-green-600 dark:text-green-400 flex items-start gap-2">
                <span>✓</span>
                <span><strong>Problem location</strong>: Orange/red borders show WHERE issues exist</span>
              </p>
              <p className="text-green-600 dark:text-green-400 flex items-start gap-2">
                <span>✓</span>
                <span><strong>Interactive</strong>: Click services to filter findings</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Stop reading walls of text. Start seeing your architecture.
          </p>
          <a
            href="#review"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg"
          >
            Try Tesseric Now
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
