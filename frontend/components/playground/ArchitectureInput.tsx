"use client";

import { FileText, X, ClipboardPaste } from "lucide-react";
import { useState } from "react";

interface ArchitectureInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export default function ArchitectureInput({
  value,
  onChange,
  maxLength = 5000,
}: ArchitectureInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const characterCount = value.length;
  const isNearLimit = characterCount > maxLength * 0.9;
  const isAtLimit = characterCount >= maxLength;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text.slice(0, maxLength));
    } catch (error) {
      console.error("Failed to paste from clipboard:", error);
    }
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4 text-primary" />
          Architecture Description
        </label>
        <div className="flex items-center gap-2">
          {/* Paste button */}
          {!value && (
            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Paste from clipboard"
            >
              <ClipboardPaste className="h-3 w-3" />
              Paste
            </button>
          )}
          {/* Clear button */}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Clear text"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className={`relative rounded-lg border transition-colors ${
        isFocused ? "border-primary ring-2 ring-primary/20" : "border-border"
      }`}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full rounded-lg bg-background p-4 text-sm leading-relaxed resize-none focus:outline-none dark:bg-card min-h-[400px]"
          placeholder="Describe your AWS architecture...&#10;&#10;Example:&#10;Multi-AZ deployment with ALB, Auto Scaling Groups, RDS Multi-AZ, S3 + CloudFront, CloudWatch monitoring, KMS encryption..."
          maxLength={maxLength}
        />
      </div>

      {/* Character counter */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {value ? `${Math.ceil(value.split(/\s+/).length)} words` : "Start typing..."}
        </span>
        <span className={isAtLimit ? "text-destructive font-medium" : isNearLimit ? "text-warning" : ""}>
          {characterCount.toLocaleString()} / {maxLength.toLocaleString()} characters
        </span>
      </div>
    </div>
  );
}
