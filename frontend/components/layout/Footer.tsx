'use client';

import Link from "next/link";
import Image from "next/image";
import { Sparkles, Shield, Lock, Zap } from "lucide-react";

export function Footer() {
  const productLinks = [
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#comparison", label: "vs ChatGPT" },
    { href: "/roadmap", label: "Roadmap" },
  ];

  const resourceLinks = [
    { href: "https://github.com/iamarsh/tesseric", label: "GitHub", external: true },
    { href: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html", label: "AWS Well-Architected", external: true },
  ];

  const legalLinks = [
    { href: "/#", label: "Privacy" },
    { href: "/#", label: "Terms" },
    { href: "/#", label: "Contact" },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Brand */}
            <div className="lg:col-span-4">
              <Link
                href="/"
                className="flex items-center gap-3 mb-4"
                aria-label="Tesseric"
              >
                <Image
                  src="/tesseric-logo.png"
                  alt="Tesseric logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold text-foreground">
                  Tesseric
                </span>
              </Link>
              <p className="text-muted-foreground text-sm mb-4 max-w-sm">
                Instant AWS architecture reviews with Well-Architected-aligned scores.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
                <Sparkles className="h-3 w-3" />
                v0.1.0-alpha - Production Beta
              </div>
            </div>

            {/* Links */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                <div>
                  <h3 className="font-semibold mb-3 text-sm">Product</h3>
                  <div className="space-y-2">
                    {productLinks.map((link) => (
                      <div key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
                        >
                          {link.label}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-sm">Resources</h3>
                  <div className="space-y-2">
                    {resourceLinks.map((link) => (
                      <div key={link.href}>
                        <Link
                          href={link.href}
                          {...(link.external && {
                            target: "_blank",
                            rel: "noopener noreferrer"
                          })}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
                        >
                          {link.label}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-sm">Legal</h3>
                  <div className="space-y-2">
                    {legalLinks.map((link) => (
                      <div key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
                        >
                          {link.label}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-border py-6">
          <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 group">
              <Shield className="w-4 h-4 text-success group-hover:scale-110 transition-transform" />
              <span>AWS Bedrock Powered</span>
            </div>
            <div className="flex items-center gap-2 group">
              <Lock className="w-4 h-4 text-success group-hover:scale-110 transition-transform" />
              <span>No Data Stored</span>
            </div>
            <div className="flex items-center gap-2 group">
              <Zap className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              <span>~$0.01 per Review</span>
            </div>
            <div className="flex items-center gap-2 group">
              <Sparkles className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              <span>No Signup Required</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Tesseric. Crafted by{" "}
            <Link
              href="https://iamarsh.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors"
            >
              Arsh
            </Link>
            .
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <Link href="/#" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <Link href="https://github.com/iamarsh/tesseric" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
