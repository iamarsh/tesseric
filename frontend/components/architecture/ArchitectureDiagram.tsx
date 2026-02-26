"use client";

import { useEffect, useRef } from "react";

interface ArchitectureDiagramProps {
  type: "current" | "future";
}

export function ArchitectureDiagram({ type }: ArchitectureDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMermaid = async () => {
      // Dynamically import mermaid
      const mermaid = (await import("mermaid")).default;

      // Initialize mermaid with theme settings
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
          primaryColor: "#FDBA74",
          primaryTextColor: "#1F2937",
          primaryBorderColor: "#F97316",
          lineColor: "#64748B",
          secondaryColor: "#BFDBFE",
          secondaryTextColor: "#1F2937",
          secondaryBorderColor: "#3B82F6",
          tertiaryColor: "#A7F3D0",
          tertiaryTextColor: "#1F2937",
          tertiaryBorderColor: "#059669",
          noteBkgColor: "#FEF3C7",
          noteTextColor: "#1F2937",
          noteBorderColor: "#F59E0B",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontSize: "14px",
        },
      });

      if (containerRef.current) {
        const diagramDef = type === "current" ? currentArchitecture : futureArchitecture;
        const { svg } = await mermaid.render(`diagram-${type}`, diagramDef);
        containerRef.current.innerHTML = svg;
      }
    };

    loadMermaid();
  }, [type]);

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-xl overflow-x-auto">
      <div ref={containerRef} className="flex justify-center" />
    </div>
  );
}

const currentArchitecture = `
graph TB
    subgraph Frontend["🌐 Frontend - Vercel"]
        A["Next.js 14 + TypeScript<br/>/review | /graph | /architecture"]
    end

    subgraph Backend["⚙️ Backend API - Railway"]
        B["FastAPI + Python 3.11"]
        B1["/health"]
        B2["/review"]
        B3["/api/metrics"]
        B4["/api/graph/*"]
        B5["Analysis Orchestration<br/>• Image parsing vision<br/>• Bedrock AI analysis<br/>• Cost tracking"]
        B6["Graph Layer<br/>• Neo4j queries<br/>• Aggregations<br/>• Relationships"]
    end

    subgraph AWS["☁️ AWS Bedrock us-east-2"]
        C1["Claude 3.5 Haiku<br/>~$0.001 per call<br/>Text → JSON"]
        C2["Claude 3 Sonnet<br/>~$0.012 per image<br/>Image → Text"]
    end

    subgraph Neo4j["🕸️ Neo4j AuraDB"]
        D["Knowledge Graph<br/>• 31 reviews<br/>• 20 AWS services<br/>• 72 findings<br/>• Pattern analysis"]
    end

    A -->|POST /review| B2
    A -->|GET /api/graph/*| B4

    B2 --> B5
    B3 --> B6
    B4 --> B6

    B5 -->|AI Analysis| C1
    B5 -->|Vision| C2
    B5 -.->|Async Write| B6

    B6 --> D

    style Frontend fill:#E0F2FE,stroke:#0EA5E9,stroke-width:2px,color:#1F2937
    style Backend fill:#D1FAE5,stroke:#10B981,stroke-width:2px,color:#1F2937
    style AWS fill:#FED7AA,stroke:#F97316,stroke-width:2px,color:#1F2937
    style Neo4j fill:#E0E7FF,stroke:#6366F1,stroke-width:2px,color:#1F2937
`;

const futureArchitecture = `
graph TB
    subgraph Frontend["🌐 Multi-Cloud Frontend"]
        A["Next.js 14 + WebSockets<br/>Multi-tenant Auth<br/>/aws | /azure | /gcp | /teams"]
    end

    subgraph Gateway["🚪 Intelligent Routing Layer"]
        B["API Gateway"]
        B1["Provider Detection"]
        B2["Auth Middleware JWT"]
        B3["Rate Limiting per Org"]
    end

    subgraph AIProviders["🤖 AI Providers"]
        C1["AWS Bedrock<br/>Claude 3.5"]
        C2["Azure OpenAI<br/>GPT-4"]
        C3["GCP Vertex<br/>PaLM 2"]
    end

    subgraph Neo4j["🕸️ Central Knowledge Graph"]
        D["Neo4j Multi-Provider"]
        D1["Multi-provider nodes<br/>AWS / Azure / GCP"]
        D2["Cross-cloud patterns"]
        D3["Org-scoped isolation"]
        D4["Real-time collab state"]
    end

    A --> B

    B --> B1
    B --> B2
    B --> B3

    B1 --> C1
    B1 --> C2
    B1 --> C3

    C1 --> D
    C2 --> D
    C3 --> D

    D --> D1
    D --> D2
    D --> D3
    D --> D4

    style Frontend fill:#E0F2FE,stroke:#0EA5E9,stroke-width:3px,color:#1F2937
    style Gateway fill:#FEF3C7,stroke:#F59E0B,stroke-width:3px,color:#1F2937
    style AIProviders fill:#FED7AA,stroke:#F97316,stroke-width:3px,color:#1F2937
    style Neo4j fill:#E0E7FF,stroke:#6366F1,stroke-width:3px,color:#1F2937
`;
