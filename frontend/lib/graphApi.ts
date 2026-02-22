export type NodeType = "Analysis" | "Finding" | "Remediation" | "AWSService";
export type EdgeType = "HAS_FINDING" | "REMEDIATED_BY" | "INVOLVES_SERVICE" | "CO_OCCURS_WITH";
export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  properties: {
    severity?: Severity;
    score?: number;
    category?: string;
    description?: string;
    title?: string;
    steps?: string;
    aws_doc_url?: string;
    count?: number;
    [key: string]: unknown;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  properties: Record<string, unknown>;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export async function fetchAnalysisGraph(analysisId: string): Promise<GraphResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/graph/${analysisId}`
  );
  if (!res.ok) throw new Error("Failed to fetch analysis graph");
  return res.json();
}

export async function fetchGlobalGraph(limit = 100): Promise<GraphResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/graph/global/all?limit=${limit}`
  );
  if (!res.ok) throw new Error("Failed to fetch global graph");
  return res.json();
}
