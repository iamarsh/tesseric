"use client";

import { BookOpen } from "lucide-react";
import { exampleArchitectures, type ExampleArchitecture } from "@/lib/example-architectures";

interface ExampleSelectorProps {
  selectedExample: string;
  onSelectExample: (example: ExampleArchitecture) => void;
}

export default function ExampleSelector({ selectedExample, onSelectExample }: ExampleSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium">
        <BookOpen className="h-4 w-4 text-primary" />
        Example Architectures
      </label>
      <select
        value={selectedExample}
        onChange={(e) => {
          const example = exampleArchitectures.find(ex => ex.name === e.target.value);
          if (example) {
            onSelectExample(example);
          }
        }}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-card"
      >
        {exampleArchitectures.map((example) => (
          <option key={example.name} value={example.name}>
            {example.name}
            {example.expectedScore !== "N/A" && ` (Expected: ${example.expectedScore})`}
          </option>
        ))}
      </select>

      {/* Category badge */}
      {selectedExample && selectedExample !== "Blank" && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {exampleArchitectures.find(ex => ex.name === selectedExample)?.category || "custom"}
          </span>
          {selectedExample === "Tesseric's Own Architecture" && (
            <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-400">
              Meta-Analysis
            </span>
          )}
        </div>
      )}
    </div>
  );
}
