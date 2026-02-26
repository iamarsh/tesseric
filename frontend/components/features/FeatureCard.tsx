"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
  badgeColor?: "primary" | "success" | "warning" | "info";
  stats?: string;
  preview?: React.ReactNode;
}

const badgeStyles = {
  primary: "bg-primary/20 text-primary",
  success: "bg-green-500/20 text-green-600 dark:text-green-400",
  warning: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
  info: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
};

export default function FeatureCard({
  title,
  description,
  icon,
  href,
  badge,
  badgeColor = "primary",
  stats,
  preview,
}: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/50"
    >
      {/* Badge */}
      {badge && (
        <div className="absolute -top-3 right-4 z-10">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeStyles[badgeColor]} shadow-sm`}>
            {badge}
          </span>
        </div>
      )}

      {/* Icon */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 transition-all duration-300 ${isHovered ? "scale-110 rotate-3" : ""}`}>
          <div className="text-primary">{icon}</div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          {stats && (
            <p className="text-xs text-muted-foreground mt-0.5">{stats}</p>
          )}
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className={`mb-4 rounded-lg overflow-hidden bg-muted/50 border border-border transition-all duration-300 ${isHovered ? "scale-[1.01]" : ""}`}>
          {preview}
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
        {description}
      </p>

      {/* CTA */}
      <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
        <span>Explore</span>
        <ArrowRight className={`h-4 w-4 transition-transform ${isHovered ? "translate-x-1" : ""}`} />
      </div>

      {/* Hover glow effect */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent pointer-events-none transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`} />
    </Link>
  );
}
