"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle2 } from "lucide-react";

export interface Challenge {
  id: string;
  title: string;
  category: "security" | "performance" | "cost" | "devops" | "integration" | "architecture";
  icon: React.ReactNode;
  context: string;
  solution: string;
  techStack: string[];
  result: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
}

interface ChallengeCardProps {
  challenge: Challenge;
}

const categoryColors = {
  security: "border-red-500/20 bg-red-500/5",
  performance: "border-yellow-500/20 bg-yellow-500/5",
  cost: "border-green-500/20 bg-green-500/5",
  devops: "border-blue-500/20 bg-blue-500/5",
  integration: "border-purple-500/20 bg-purple-500/5",
  architecture: "border-orange-500/20 bg-orange-500/5",
};

const categoryIconColors = {
  security: "text-red-600 dark:text-red-400",
  performance: "text-yellow-600 dark:text-yellow-400",
  cost: "text-green-600 dark:text-green-400",
  devops: "text-blue-600 dark:text-blue-400",
  integration: "text-purple-600 dark:text-purple-400",
  architecture: "text-orange-600 dark:text-orange-400",
};

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`rounded-lg border p-6 transition-all hover:shadow-lg ${
        categoryColors[challenge.category]
      } ${isExpanded ? "ring-2 ring-primary/20" : ""}`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start gap-4 text-left"
      >
        <div className={`p-2 rounded-lg bg-background ${categoryIconColors[challenge.category]}`}>
          {challenge.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{challenge.title}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {challenge.category}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{challenge.context}</p>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-6 space-y-4 animate-in fade-in duration-200">
          {/* Challenge accepted animation */}
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
            <CheckCircle2 className="h-4 w-4 animate-in zoom-in duration-300" />
            Challenge accepted ✓
          </div>

          {/* Solution */}
          <div>
            <div className="text-sm font-medium mb-2">Solution</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{challenge.solution}</p>
          </div>

          {/* Tech stack */}
          <div>
            <div className="text-sm font-medium mb-2">Technologies Used</div>
            <div className="flex flex-wrap gap-2">
              {challenge.techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Code snippet (if provided) */}
          {challenge.codeSnippet && (
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium mb-2 hover:text-primary transition-colors">
                View Code Example
              </summary>
              <div className="mt-2 rounded-lg border border-border bg-muted/50 p-4 overflow-x-auto">
                <pre className="text-xs">
                  <code className="language-{challenge.codeSnippet.language}">
                    {challenge.codeSnippet.code}
                  </code>
                </pre>
              </div>
            </details>
          )}

          {/* Result */}
          <div className="pt-4 border-t border-border">
            <div className="text-sm font-medium mb-2">Result</div>
            <p className="text-sm text-muted-foreground font-medium">{challenge.result}</p>
          </div>
        </div>
      )}
    </div>
  );
}
