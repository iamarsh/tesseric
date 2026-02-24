'use client';

import Link from "next/link";
import Image from "next/image";
import { Sparkles, Shield, Lock, Zap } from "lucide-react";

export function Footer() {
  const productLinks = [
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/graph", label: "Knowledge Graph" },
    { href: "/#comparison", label: "vs ChatGPT" },
    { href: "/roadmap", label: "Roadmap" },
  ];

  const resourceLinks = [
    { href: "https://github.com/iamarsh/tesseric", label: "GitHub", external: true },
    { href: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html", label: "AWS Well-Architected", external: true },
  ];

  const contactLinks = [
    { href: "mailto:contact@iamarsh.com", label: "Contact", external: true },
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
                v0.1.0-alpha
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
                  <h3 className="font-semibold mb-3 text-sm">Connect</h3>
                  <div className="space-y-2">
                    {contactLinks.map((link) => (
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
              <span>~10s Review Time</span>
            </div>
            <div className="flex items-center gap-2 group">
              <Sparkles className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              <span>No Signup Required</span>
            </div>
          </div>
        </div>

        {/* Tech Stack Badges */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-muted-foreground font-medium">Built with</p>
            <div className="flex flex-wrap justify-center items-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z"/>
                </svg>
                <span>Next.js</span>
              </div>
              <span className="text-muted-foreground/30">•</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/>
                </svg>
                <span>TypeScript</span>
              </div>
              <span className="text-muted-foreground/30">•</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.375 0 0 5.375 0 12c0 6.627 5.375 12 12 12 6.626 0 12-5.373 12-12 0-6.625-5.373-12-12-12zm-.624 21.62v-7.528H7.19v-2.12h4.187V9.356c0-3.495 1.372-5.047 4.564-5.047.366 0 .675.024.947.052v2.084c-.24-.024-.548-.048-.932-.048-1.811 0-2.491.708-2.491 2.411v3.164h3.326l-.443 2.12h-2.883v7.528c-4.287-.266-7.718-3.788-7.718-8.12 0-4.5 3.645-8.145 8.145-8.145 4.498 0 8.144 3.645 8.144 8.145 0 4.332-3.43 7.854-7.718 8.12z"/>
                </svg>
                <span>FastAPI</span>
              </div>
              <span className="text-muted-foreground/30">•</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335c-.072.048-.144.072-.208.072-.08 0-.16-.04-.239-.112-.12-.128-.216-.263-.296-.416-.08-.152-.16-.32-.248-.512-.631.744-1.423 1.116-2.383 1.116-.68 0-1.224-.193-1.624-.583-.4-.39-.6-.91-.6-1.558 0-.692.247-1.253.743-1.678.495-.424 1.15-.64 1.967-.64.272 0 .552.024.847.064.296.04.6.104.92.176v-.583c0-.608-.127-1.032-.375-1.279-.255-.248-.687-.368-1.295-.368-.28 0-.567.031-.863.104-.296.072-.583.16-.863.255-.128.056-.224.095-.28.111-.056.016-.096.024-.12.024-.104 0-.16-.072-.16-.224v-.352c0-.12.016-.208.056-.264.04-.056.12-.112.239-.168.28-.144.615-.264 1.007-.36.391-.096.808-.136 1.247-.136.952 0 1.647.216 2.095.648.44.432.663 1.08.663 1.943v2.56zm-3.287 1.23c.264 0 .536-.048.824-.143.288-.096.543-.271.768-.52.136-.16.232-.336.28-.535.048-.2.08-.424.08-.672v-.32c-.224-.064-.463-.12-.712-.159-.248-.04-.504-.056-.76-.056-.543 0-.943.104-1.207.319-.264.216-.392.52-.392.911 0 .368.095.64.287.816.191.183.48.271.831.271zm6.447.848c-.128 0-.216-.024-.272-.064-.056-.048-.104-.144-.152-.272l-1.599-5.263c-.048-.16-.072-.264-.072-.312 0-.12.064-.184.184-.184h.759c.136 0 .224.024.272.064.056.048.096.144.144.272l1.143 4.504 1.063-4.504c.04-.128.088-.224.144-.272.056-.048.144-.064.28-.064h.615c.136 0 .224.024.28.064.056.048.104.144.144.272l1.079 4.56 1.175-4.56c.048-.128.096-.224.152-.272.056-.048.136-.064.272-.064h.719c.12 0 .184.064.184.184 0 .072-.008.152-.024.232-.016.08-.04.176-.088.32l-1.647 5.263c-.048.16-.096.256-.152.272-.056.048-.144.064-.272.064h-.663c-.136 0-.224-.024-.28-.064-.056-.048-.104-.144-.144-.272l-1.055-4.384-1.047 4.384c-.04.128-.088.224-.144.272-.056.048-.144.064-.28.064h-.663zm10.735.272c-.4 0-.799-.047-1.191-.143-.392-.095-.695-.224-.903-.384-.104-.08-.176-.168-.2-.264-.024-.096-.04-.2-.04-.304v-.368c0-.152.056-.224.16-.224.064 0 .128.016.2.04.072.024.176.072.304.12.264.104.535.184.815.232.288.048.567.072.855.072.455 0 .807-.08 1.055-.232.248-.152.376-.368.376-.656 0-.192-.064-.36-.184-.488-.12-.128-.336-.248-.64-.359l-1.903-.6c-.543-.168-.943-.424-1.191-.76-.248-.336-.368-.728-.368-1.175 0-.336.072-.632.216-.888.144-.256.336-.472.576-.648.24-.176.52-.304.839-.392.32-.088.664-.12 1.023-.12.168 0 .344.008.52.032.176.024.336.056.488.088.144.04.28.08.4.127.12.048.216.096.272.144.08.048.136.096.168.16.032.063.048.144.048.24v.336c0 .152-.056.232-.16.232-.064 0-.168-.032-.32-.088-.487-.216-1.031-.32-1.631-.32-.415 0-.743.072-.975.216-.232.144-.344.36-.344.648 0 .192.072.36.208.488.136.128.368.256.695.368l1.863.592c.536.168.927.408 1.167.728.24.32.36.688.36 1.103 0 .344-.072.656-.216.928-.144.272-.344.512-.6.704-.256.192-.56.336-.928.448-.367.104-.767.16-1.199.16z"/>
                </svg>
                <span>AWS Bedrock</span>
              </div>
              <span className="text-muted-foreground/30">•</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.05 10.43L13.56 1.92a2.24 2.24 0 00-3.13 0L1.94 10.43a2.24 2.24 0 000 3.13l9.49 9.51a2.24 2.24 0 003.13 0l9.49-9.51a2.24 2.24 0 000-3.13zm-9.9 5.4L8.4 11.09l3.25-3.26L15.4 11.6l-2.25 2.24zm-3.13 3.13l-4.76-4.76L8.4 11.1l3.14 3.14-2.52 2.53zm7.64 0l-2.53-2.53 3.14-3.14 3.14 3.14-3.75 3.76zm-6.13-7.64L8.4 8.19l3.25-3.26 3.13 3.13-3.25 3.26z"/>
                </svg>
                <span>Neo4j</span>
              </div>
              <span className="text-muted-foreground/30">•</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M0 0h11.377v11.372H0V0zm12.623 0H24v11.372H12.623V0zM0 12.623h11.377V24H0V12.623zm12.623 0H24V24H12.623V12.623z"/>
                </svg>
                <span>Vercel</span>
              </div>
              <span className="text-muted-foreground/30">•</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Railway</span>
              </div>
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
