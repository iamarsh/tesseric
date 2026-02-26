"use client";

import { Copy, Check, Terminal } from "lucide-react";
import { useState } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import { atomOneDark, atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useTheme } from "next-themes";

// Register bash language
SyntaxHighlighter.registerLanguage("bash", bash);

interface CurlTabProps {
  architectureText: string;
  tone: "standard" | "roast";
}

export default function CurlTab({ architectureText, tone }: CurlTabProps) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Build cURL command
  const curlCommand = `curl -X POST "${apiUrl}/review" \\
  -H "Content-Type: application/json" \\
  -d '{
    "design_text": ${JSON.stringify(architectureText)},
    "format": "markdown",
    "tone": "${tone}"
  }'`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Explanation */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <Terminal className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <div className="font-medium text-blue-600 dark:text-blue-400 mb-1">
            Reproduce this request in your terminal
          </div>
          <p className="text-muted-foreground">
            Copy and paste this command to run the same analysis from the command line.
            Requires <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">curl</code> installed.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end">
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
              Copy Command
            </>
          )}
        </button>
      </div>

      {/* cURL command with syntax highlighting */}
      <div className="rounded-lg border border-border overflow-hidden">
        <SyntaxHighlighter
          language="bash"
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
          {curlCommand}
        </SyntaxHighlighter>
      </div>

      {/* Tip */}
      <div className="text-xs text-muted-foreground">
        <strong>Tip:</strong> You can modify the{" "}
        <code className="px-1 py-0.5 rounded bg-muted font-mono">tone</code> parameter
        to <code className="px-1 py-0.5 rounded bg-muted font-mono">"roast"</code> for
        brutally honest analysis.
      </div>
    </div>
  );
}
