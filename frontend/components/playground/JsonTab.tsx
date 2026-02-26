"use client";

import { Copy, Download, Check } from "lucide-react";
import { useState } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import { atomOneDark, atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useTheme } from "next-themes";
import type { ReviewResponse } from "@/lib/api";

// Register JSON language
SyntaxHighlighter.registerLanguage("json", json);

interface JsonTabProps {
  response: ReviewResponse;
}

export default function JsonTab({ response }: JsonTabProps) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const jsonString = JSON.stringify(response, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tesseric-review-${response.review_id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Raw JSON response from API
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
          >
            <Download className="h-3 w-3" />
            Download
          </button>
        </div>
      </div>

      {/* JSON with syntax highlighting */}
      <div className="rounded-lg border border-border overflow-hidden">
        <SyntaxHighlighter
          language="json"
          style={theme === "dark" ? atomOneDark : atomOneLight}
          showLineNumbers
          customStyle={{
            margin: 0,
            padding: "1.5rem",
            fontSize: "0.875rem",
            backgroundColor: theme === "dark" ? "rgb(15, 23, 42)" : "rgb(248, 250, 252)",
          }}
          lineNumberStyle={{
            minWidth: "3em",
            paddingRight: "1em",
            color: "rgb(100, 116, 139)",
            userSelect: "none",
          }}
        >
          {jsonString}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
