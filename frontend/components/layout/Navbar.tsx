"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { ThemeSwitcher } from "../ThemeSwitcher";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <div className="hidden md:flex items-center gap-8">
            <a
              href="/#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <Link
              href="/graph"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors relative pr-10"
            >
              Knowledge Graph
              <span className="absolute -top-2 right-0 px-1.5 py-0.5 text-[10px] font-semibold bg-primary/20 text-primary rounded-full whitespace-nowrap">
                New
              </span>
            </Link>
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
            <Link
              href="/graph"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Knowledge Graph
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary/20 text-primary rounded-full">
                New
              </span>
            </Link>
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
