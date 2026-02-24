"use client";

import { useState } from "react";
import {
  Send,
  Globe,
  CheckCircle,
  Zap,
  Brain,
  FileJson,
  Database,
  CornerDownRight,
  Monitor,
} from "lucide-react";

interface Step {
  number: number;
  icon: any;
  title: string;
  duration: string;
  technologies: string[];
  description: string;
  codeSnippet?: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: Send,
    title: "User Submits Architecture",
    duration: "~0ms",
    technologies: ["Next.js", "React", "Fetch API"],
    description:
      "User enters architecture description or uploads diagram via frontend form.",
  },
  {
    number: 2,
    icon: Globe,
    title: "API Call to Backend",
    duration: "~50-100ms",
    technologies: ["HTTPS", "CORS preflight", "Railway"],
    description:
      "POST request to /review endpoint with JSON payload or multipart form data.",
  },
  {
    number: 3,
    icon: CheckCircle,
    title: "Input Validation",
    duration: "~10ms",
    technologies: ["Pydantic v2", "FastAPI"],
    description:
      "Validate request schema, check field types, enforce constraints (50-10000 chars).",
    codeSnippet: `# Pydantic validation
class ReviewRequest(BaseModel):
    design_text: str = Field(min_length=50, max_length=10000)
    tone: Literal["standard", "roast"] = "standard"
    provider: Literal["aws"] = "aws"`,
  },
  {
    number: 4,
    icon: Zap,
    title: "Token Estimation",
    duration: "~5ms",
    technologies: ["tiktoken", "Cost calculator"],
    description:
      "Estimate input tokens (~7600 with inline AWS context), calculate expected cost.",
  },
  {
    number: 5,
    icon: Brain,
    title: "AWS Bedrock Invocation",
    duration: "~2-8s",
    technologies: ["boto3", "Claude 3.5 Haiku", "AWS Bedrock"],
    description:
      "Call Bedrock with system prompt + inline Well-Architected context + user architecture. Streaming response enabled.",
  },
  {
    number: 6,
    icon: FileJson,
    title: "Response Parsing",
    duration: "~20ms",
    technologies: ["JSON parser", "Pydantic validation"],
    description:
      "Parse Claude's JSON response, validate structure, map to ReviewResponse model.",
  },
  {
    number: 7,
    icon: Database,
    title: "Neo4j Write (Async)",
    duration: "~200-500ms",
    technologies: ["asyncio", "Neo4j Python driver"],
    description:
      "Background task creates Analysis, Finding, AWSService nodes and relationships. Non-blocking.",
    codeSnippet: `# Async background write
asyncio.create_task(
    neo4j_client.create_analysis_graph(...)
)
# Returns immediately, doesn't block response`,
  },
  {
    number: 8,
    icon: CornerDownRight,
    title: "Return Response",
    duration: "~5ms",
    technologies: ["FastAPI", "JSON serialization"],
    description:
      "Serialize ReviewResponse to JSON, add metadata (processing time, cost), return to frontend.",
  },
  {
    number: 9,
    icon: Monitor,
    title: "Display Results",
    duration: "~50ms",
    technologies: ["React state", "Tailwind CSS"],
    description:
      "Frontend renders score, risk cards, summary. User can toggle tone or reset.",
  },
];

export function DataFlowDiagram() {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  return (
    <section
      id="data-flow"
      className="container mx-auto px-4 py-16 md:py-24"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Data Flow & Request Lifecycle
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Follow a review request from submission to display (9 steps, ~2-10s total)
          </p>
        </div>

        {/* Timeline - Desktop Horizontal, Mobile Vertical */}
        <div className="relative">
          {/* Desktop: Horizontal Timeline */}
          <div className="hidden md:block">
            <div className="flex items-start justify-between relative pb-20">
              {/* Connector Line */}
              <div className="absolute top-12 left-0 right-0 h-0.5 bg-border z-0" />

              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                const isSelected = selectedStep === idx;

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center relative z-10 flex-1"
                  >
                    {/* Step Number + Icon */}
                    <button
                      onClick={() =>
                        setSelectedStep(isSelected ? null : idx)
                      }
                      className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110"
                          : "bg-card border-2 border-border hover:border-primary hover:shadow-lg"
                      }`}
                    >
                      <StepIcon
                        className={`h-8 w-8 mb-1 ${
                          isSelected ? "" : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={`text-xs font-semibold ${
                          isSelected ? "" : "text-muted-foreground"
                        }`}
                      >
                        {step.number}
                      </span>
                    </button>

                    {/* Step Title */}
                    <p className="text-xs text-center mt-3 font-medium text-foreground max-w-[100px]">
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.duration}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile: Vertical Timeline */}
          <div className="md:hidden space-y-4">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isSelected = selectedStep === idx;

              return (
                <div key={idx} className="flex gap-4">
                  {/* Step Icon */}
                  <button
                    onClick={() =>
                      setSelectedStep(isSelected ? null : idx)
                    }
                    className={`w-16 h-16 rounded-full flex-shrink-0 flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-card border-2 border-border"
                    }`}
                  >
                    <StepIcon className="h-6 w-6" />
                    <span className="text-xs font-semibold">{step.number}</span>
                  </button>

                  {/* Step Info */}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.duration}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Step Details */}
          {selectedStep !== null && (
            <div className="mt-8 bg-card border border-border rounded-2xl p-6 shadow-xl">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Step {steps[selectedStep].number}:{" "}
                  {steps[selectedStep].title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {steps[selectedStep].description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {steps[selectedStep].technologies.map((tech, techIdx) => (
                    <span
                      key={techIdx}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Code Snippet (Optional) */}
              {steps[selectedStep].codeSnippet && (
                <details className="mt-4">
                  <summary className="text-sm font-semibold text-foreground cursor-pointer hover:text-primary transition-colors">
                    View Code Snippet
                  </summary>
                  <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                    <code>{steps[selectedStep].codeSnippet}</code>
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-card border border-border rounded-lg">
            <p className="text-2xl font-bold text-primary">9</p>
            <p className="text-xs text-muted-foreground">Total Steps</p>
          </div>
          <div className="text-center p-4 bg-card border border-border rounded-lg">
            <p className="text-2xl font-bold text-primary">2-10s</p>
            <p className="text-xs text-muted-foreground">End-to-End Time</p>
          </div>
          <div className="text-center p-4 bg-card border border-border rounded-lg">
            <p className="text-2xl font-bold text-primary">~8.0s</p>
            <p className="text-xs text-muted-foreground">Avg Production Time</p>
          </div>
          <div className="text-center p-4 bg-card border border-border rounded-lg">
            <p className="text-2xl font-bold text-primary">Async</p>
            <p className="text-xs text-muted-foreground">Neo4j Writes</p>
          </div>
        </div>
      </div>
    </section>
  );
}
