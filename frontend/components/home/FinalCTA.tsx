import { Sparkles } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="bg-primary py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
          Ready to Elevate Your AWS Game?
        </h2>
        <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
          Join hundreds of AWS practitioners getting instant, expert feedback on their architectures.
        </p>
        <a
          href="#review"
          className="inline-flex items-center gap-2 px-8 py-4 bg-background text-foreground rounded-lg font-semibold hover:bg-background/90 transition-colors shadow-xl"
        >
          <Sparkles className="h-5 w-5" />
          Analyze Your Architecture Now
        </a>
        <p className="text-sm text-primary-foreground/70 mt-4">
          No signup required · ~$0.01 per review · Takes 10 seconds
        </p>
      </div>
    </section>
  );
}
