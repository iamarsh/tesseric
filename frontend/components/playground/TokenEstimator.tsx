"use client";

import { Zap } from "lucide-react";

interface TokenEstimatorProps {
  text: string;
}

/**
 * Estimates token count and cost for architecture analysis
 * Uses approximation: ~4 characters per token (Claude/GPT standard)
 */
export default function TokenEstimator({ text }: TokenEstimatorProps) {
  // Rough token estimation: 4 chars per token
  const estimatedInputTokens = Math.ceil(text.length / 4);

  // System prompt + AWS context is ~6000 tokens
  const systemTokens = 6000;
  const totalInputTokens = estimatedInputTokens + systemTokens;

  // Estimated output tokens: ~700 for standard reviews
  const estimatedOutputTokens = 700;

  // Claude 3.5 Haiku pricing (per million tokens)
  const inputCostPerMillion = 1.00; // $1/MTok
  const outputCostPerMillion = 5.00; // $5/MTok

  // Calculate costs
  const inputCost = (totalInputTokens / 1_000_000) * inputCostPerMillion;
  const outputCost = (estimatedOutputTokens / 1_000_000) * outputCostPerMillion;
  const totalCost = inputCost + outputCost;

  // Color coding based on token count
  const getColorClass = () => {
    if (totalInputTokens < 10000) return "text-green-600 dark:text-green-400";
    if (totalInputTokens < 20000) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  // Format cost with appropriate precision
  const formatCost = (cost: number): string => {
    if (cost < 0.001) return "$<0.001";
    if (cost < 0.01) return `$${cost.toFixed(4)}`;
    return `$${cost.toFixed(3)}`;
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <Zap className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">
          Estimated tokens:
        </span>
        <span className={`font-mono font-semibold ${getColorClass()}`}>
          ~{totalInputTokens.toLocaleString()} input
        </span>
        <span className="text-muted-foreground">+</span>
        <span className="font-mono font-semibold text-muted-foreground">
          ~{estimatedOutputTokens.toLocaleString()} output
        </span>
        <span className="text-muted-foreground">≈</span>
        <span className={`font-mono font-bold ${getColorClass()}`}>
          {formatCost(totalCost)}
        </span>
      </div>
    </div>
  );
}
