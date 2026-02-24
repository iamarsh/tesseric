export type NodeType = "Analysis" | "Finding" | "Remediation" | "AWSService";
export type EdgeType =
  | "HAS_FINDING"
  | "REMEDIATED_BY"
  | "INVOLVES_SERVICE"
  | "CO_OCCURS_WITH"
  | "ROUTES_TO"
  | "READS_FROM"
  | "WRITES_TO"
  | "MONITORS"
  | "AUTHORIZES"
  | "BACKS_UP"
  | "REPLICATES_TO";
export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type RelationshipType =
  | "routes_to"
  | "reads_from"
  | "writes_to"
  | "monitors"
  | "authorizes"
  | "backs_up"
  | "replicates_to";
export type ArchitecturePattern =
  | "3-tier"
  | "serverless"
  | "microservices"
  | "event-driven"
  | "monolith"
  | "custom";

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

/**
 * Architecture-specific types for topology visualization
 */
export interface ArchitectureServiceNode {
  service_name: string;
  category: string;
  finding_count: number;
  severity_breakdown: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  max_severity: Severity | null;
}

export interface ArchitectureConnection {
  source_service: string;
  target_service: string;
  relationship_type: RelationshipType;
  description?: string;
}

export interface ArchitectureGraphResponse {
  services: ArchitectureServiceNode[];
  connections: ArchitectureConnection[];
  architecture_pattern: ArchitecturePattern | null;
  architecture_description: string | null;
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

/**
 * Fetch architecture-first graph for visualization.
 * Returns services with finding counts and topology relationships.
 *
 * @param analysisId - The review_id from the analysis
 * @returns Architecture graph with services and connections
 * @throws Error if analysis not found or has no topology data
 */
export async function fetchArchitectureGraph(
  analysisId: string
): Promise<ArchitectureGraphResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/graph/${analysisId}/architecture`
  );
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        "No architecture data found. This may be an old review created before topology extraction."
      );
    }
    throw new Error("Failed to fetch architecture graph");
  }
  return res.json();
}
