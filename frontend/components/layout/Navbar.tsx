"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Terminal, BarChart3, Network, Building2, BookOpen, Wrench, Github } from "lucide-react";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { DropdownMenu, type DropdownMenuItem } from "./DropdownMenu";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tools dropdown items
  const toolsItems: DropdownMenuItem[] = [
    {
      href: "/playground",
      label: "API Playground",
      description: "Interactive testing with live examples",
      icon: <Terminal className="h-4 w-4" />,
      badge: "Popular",
    },
    {
      href: "/stats",
      label: "Live Metrics",
      description: "Real-time production insights",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      href: "/graph",
      label: "Knowledge Graph",
      description: "Visualize architecture patterns",
      icon: <Network className="h-4 w-4" />,
      badge: "New",
    },
    {
      href: "/architecture",
      label: "System Architecture",
      description: "How Tesseric is built",
      icon: <Building2 className="h-4 w-4" />,
    },
  ];

  // Resources dropdown items
  const resourcesItems: DropdownMenuItem[] = [
    {
      href: "/#case-studies",
      label: "Case Studies",
      description: "Real-world architecture improvements",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      href: "/#technical-challenges",
      label: "Tech Challenges",
      description: "Engineering problems solved",
      icon: <Wrench className="h-4 w-4" />,
    },
    {
      href: "https://github.com/iamarsh/tesseric",
      label: "GitHub",
      description: "View source code",
      icon: <Github className="h-4 w-4" />,
      external: true,
    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/tesseric-logo.png"
              alt="Tesseric"
              width={40}
              height={40}
              className="rounded-lg transition-transform group-hover:scale-105"
            />
            <span className="text-xl font-bold text-foreground hidden sm:inline">
              Tesseric
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="/#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <DropdownMenu label="Tools" items={toolsItems} />
            <DropdownMenu label="Resources" items={resourcesItems} />
            <Link
              href="/roadmap"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Roadmap
            </Link>
            <div className="w-px h-6 bg-border" />
            <ThemeSwitcher />
            <a
              href="/#review"
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all hover:shadow-lg"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button & Theme Switcher */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 space-y-4 animate-slide-in">
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>

            {/* Tools section in mobile */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Tools
              </div>
              {toolsItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary/20 text-primary rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Resources section in mobile */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Resources
              </div>
              {resourcesItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  {...(item.external && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            <Link
              href="/roadmap"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Roadmap
            </Link>
            <a
              href="/#review"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full px-4 py-2.5 mt-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-center"
            >
              Get Started
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
