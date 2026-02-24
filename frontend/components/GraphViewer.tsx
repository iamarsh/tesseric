"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import "@xyflow/react/dist/style.css";
import {
  GraphNode,
  GraphEdge,
  Severity,
  ArchitectureServiceNode,
  ArchitectureConnection,
  ArchitecturePattern,
} from "@/lib/graphApi";
import {
  calculateServicePositions,
  detectArchitecturePattern,
} from "@/lib/architectureLayout";

interface GraphViewerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  className?: string;
  // Architecture-first mode (Phase 2)
  architectureServices?: ArchitectureServiceNode[];
  architectureConnections?: ArchitectureConnection[];
  architecturePattern?: ArchitecturePattern | null;
}

// Node dimensions for dagre layout
const NODE_DIMENSIONS = {
  Analysis: { width: 220, height: 60 },
  Finding: { width: 240, height: 120 },
  AWSService: { width: 160, height: 50 },
  Remediation: { width: 180, height: 60 },
};

// Node background colors
const getNodeColor = (node: GraphNode): string => {
  if (node.type === "Analysis") return "#1D4ED8"; // blue
  if (node.type === "AWSService") return "#7C3AED"; // purple
  if (node.type === "Remediation") return "#4B5563"; // gray

  // Finding nodes colored by severity
  if (node.type === "Finding") {
    const severity = node.properties.severity as Severity | undefined;
    switch (severity) {
      case "CRITICAL": return "#DC2626"; // red
      case "HIGH": return "#EA580C"; // orange
      case "MEDIUM": return "#CA8A04"; // yellow/dark
      case "LOW": return "#16A34A"; // green
      default: return "#6B7280"; // gray fallback
    }
  }

  return "#6B7280"; // default gray
};

// Auto-layout using dagre
function getLayoutedElements(
  nodes: GraphNode[],
  edges: GraphEdge[]
): { nodes: Node[]; edges: Edge[] } {
  // Custom structured layout for predictable, readable visualization
  // Layout: Analysis (top center) → Findings (middle column) → Services (right column)
  // Top-down flow: One review spawns multiple findings, each involving services

  const layoutedNodes: Node[] = [];

  // Separate nodes by type
  const analysisNodes = nodes.filter(n => n.type === "Analysis");
  const findingNodes = nodes.filter(n => n.type === "Finding");
  const serviceNodes = nodes.filter(n => n.type === "AWSService");
  const remediationNodes = nodes.filter(n => n.type === "Remediation");

  // Layout constants
  const ANALYSIS_X = 500;       // Top center
  const ANALYSIS_Y = 50;

  const FINDING_X = 300;        // Middle column - what was found
  const FINDING_START_Y = 200;
  const FINDING_SPACING_Y = 150;

  const SERVICE_X = 900;        // Right column - services involved
  const SERVICE_START_Y = 200;
  const SERVICE_SPACING_Y = 80;

  const REMEDIATION_X = 1300;   // Far right (for old reviews)
  const REMEDIATION_START_Y = 200;

  // 1. Position Analysis node at top center
  analysisNodes.forEach((node) => {
    const dimensions = NODE_DIMENSIONS[node.type];
    layoutedNodes.push({
      id: node.id,
      type: "custom",
      position: { x: ANALYSIS_X, y: ANALYSIS_Y },
      data: {
        ...node,
        color: getNodeColor(node),
        dimensions,
      },
    });
  });

  // 2. Position Findings in middle column (vertical list)
  findingNodes.forEach((node, index) => {
    const dimensions = NODE_DIMENSIONS[node.type];
    layoutedNodes.push({
      id: node.id,
      type: "custom",
      position: {
        x: FINDING_X,
        y: FINDING_START_Y + (index * FINDING_SPACING_Y)
      },
      data: {
        ...node,
        color: getNodeColor(node),
        dimensions,
      },
    });
  });

  // 3. Position Services on right (vertical list)
  serviceNodes.forEach((node, index) => {
    const dimensions = NODE_DIMENSIONS[node.type];
    layoutedNodes.push({
      id: node.id,
      type: "custom",
      position: {
        x: SERVICE_X,
        y: SERVICE_START_Y + (index * SERVICE_SPACING_Y)
      },
      data: {
        ...node,
        color: getNodeColor(node),
        dimensions,
      },
    });
  });

  // 4. Position Remediations far right (for old reviews with Remediation nodes)
  remediationNodes.forEach((node, index) => {
    const dimensions = NODE_DIMENSIONS[node.type];
    layoutedNodes.push({
      id: node.id,
      type: "custom",
      position: {
        x: REMEDIATION_X,
        y: REMEDIATION_START_Y + (index * FINDING_SPACING_Y)
      },
      data: {
        ...node,
        color: getNodeColor(node),
        dimensions,
      },
    });
  });

  const layoutedEdges: Edge[] = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.type,
    labelStyle: { fontSize: 10, fill: "#94A3B8" },
    labelBgStyle: { fill: "#0A1628", fillOpacity: 0.8 },
    style: { stroke: "#475569", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#475569",
    },
  }));

  return { nodes: layoutedNodes, edges: layoutedEdges };
}

// Architecture-first layout (Phase 2)
function getArchitectureLayout(
  services: ArchitectureServiceNode[],
  connections: ArchitectureConnection[],
  pattern?: ArchitecturePattern | null
): { nodes: Node[]; edges: Edge[] } {
  // Calculate positions using architecture layout algorithm
  const positions = calculateServicePositions(services, connections, pattern);

  const layoutedNodes: Node[] = services.map((service) => {
    const position = positions.get(service.service_name) || { x: 0, y: 0 };
    const dimensions = NODE_DIMENSIONS.AWSService;

    // Get color based on max severity
    let color = "#7C3AED"; // default purple for services
    if (service.max_severity) {
      switch (service.max_severity) {
        case "CRITICAL":
          color = "#DC2626"; // red
          break;
        case "HIGH":
          color = "#EA580C"; // orange
          break;
        case "MEDIUM":
          color = "#CA8A04"; // yellow
          break;
        case "LOW":
          color = "#16A34A"; // green
          break;
      }
    }

    return {
      id: service.service_name,
      type: "architecture",
      position,
      data: {
        service,
        color,
        dimensions,
      },
    };
  });

  // Create edges for topology relationships
  const layoutedEdges: Edge[] = connections.map((conn, index) => ({
    id: `${conn.source_service}-${conn.target_service}-${index}`,
    source: conn.source_service,
    target: conn.target_service,
    label: conn.relationship_type.replace("_", " "),
    labelStyle: { fontSize: 10, fill: "#94A3B8" },
    labelBgStyle: { fill: "#0A1628", fillOpacity: 0.8 },
    style: { stroke: "#475569", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#475569",
    },
  }));

  return { nodes: layoutedNodes, edges: layoutedEdges };
}

// Architecture service node component (Phase 2)
function ArchitectureServiceNode({ data }: { data: any }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const service: ArchitectureServiceNode = data.service;
  const color = data.color;
  const dimensions = data.dimensions;

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          backgroundColor: color,
          borderRadius: "8px",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          border: "2px solid rgba(255,255,255,0.1)",
          position: "relative",
        }}
      >
        {/* Service name */}
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#fff",
            textAlign: "center",
          }}
        >
          {service.service_name}
        </div>

        {/* Finding count badge */}
        {service.finding_count > 0 && (
          <div
            style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              backgroundColor: service.max_severity === "CRITICAL" ? "#DC2626" : "#EA580C",
              color: "#fff",
              borderRadius: "12px",
              padding: "2px 8px",
              fontSize: "11px",
              fontWeight: 700,
              border: "2px solid #0A1628",
            }}
          >
            {service.finding_count}
          </div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute z-50 bg-card border border-border rounded-lg shadow-2xl p-3 text-xs min-w-[250px] max-w-[400px]"
          style={{
            top: "0",
            left: `${dimensions.width + 15}px`,
            pointerEvents: "none",
          }}
        >
          <div className="space-y-2">
            <div className="font-semibold text-foreground">{service.service_name}</div>
            <div className="text-muted-foreground">Category: {service.category}</div>
            {service.finding_count > 0 && (
              <>
                <div className="text-muted-foreground">
                  Findings: {service.finding_count}
                </div>
                <div className="space-y-1">
                  {service.severity_breakdown.CRITICAL > 0 && (
                    <div className="text-red-400">
                      🔴 Critical: {service.severity_breakdown.CRITICAL}
                    </div>
                  )}
                  {service.severity_breakdown.HIGH > 0 && (
                    <div className="text-orange-400">
                      🟠 High: {service.severity_breakdown.HIGH}
                    </div>
                  )}
                  {service.severity_breakdown.MEDIUM > 0 && (
                    <div className="text-yellow-400">
                      🟡 Medium: {service.severity_breakdown.MEDIUM}
                    </div>
                  )}
                  {service.severity_breakdown.LOW > 0 && (
                    <div className="text-green-400">
                      🟢 Low: {service.severity_breakdown.LOW}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Custom node component
function CustomNode({ data }: { data: any }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const node: GraphNode = data;
  const color = data.color;
  const dimensions = data.dimensions;

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          backgroundColor: color,
          borderRadius: "8px",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          border: "2px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Type label */}
        <div
          style={{
            fontSize: "10px",
            color: "rgba(255,255,255,0.6)",
            marginBottom: "4px",
          }}
        >
          {node.type}
        </div>
        {/* Main label */}
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#FFFFFF",
            textAlign: "center",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            maxWidth: "100%",
            lineHeight: "1.3",
          }}
        >
          {node.label}
        </div>
      </div>

      {/* Hover tooltip */}
      {showTooltip && (
        <div
          className="absolute z-50 bg-card border border-border rounded-lg shadow-2xl p-3 text-xs min-w-[250px] max-w-[400px]"
          style={{
            top: "0",
            left: `${dimensions.width + 15}px`,
            pointerEvents: "none",
          }}
        >
          <div className="space-y-1">
            <div className="font-semibold text-foreground">{node.label}</div>
            <div className="text-muted-foreground">Type: {node.type}</div>
            {node.properties.severity && (
              <div className="text-muted-foreground">
                Severity: {node.properties.severity}
              </div>
            )}
            {typeof node.properties.occurrence_count === 'number' && node.properties.occurrence_count > 1 && (
              <div className="text-amber-400 font-semibold">
                ⚠️ Occurred in {node.properties.occurrence_count} reviews
              </div>
            )}
            {node.properties.score !== undefined && (
              <div className="text-muted-foreground">
                Score: {node.properties.score}
              </div>
            )}
            {node.properties.category && (
              <div className="text-muted-foreground">
                Category: {node.properties.category}
              </div>
            )}
            {node.properties.description && (
              <div className="text-muted-foreground mt-2">
                {node.properties.description}
              </div>
            )}
            {node.properties.steps && (
              <div className="text-muted-foreground mt-2">
                Steps: {node.properties.steps}
              </div>
            )}
            {node.properties.aws_doc_url && (
              <a
                href={node.properties.aws_doc_url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline mt-2 block"
              >
                AWS Documentation →
              </a>
            )}
            {node.properties.count && (
              <div className="text-muted-foreground">
                Count: {node.properties.count}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
  architecture: ArchitectureServiceNode,
};

export default function GraphViewer({
  nodes,
  edges,
  className = "",
  architectureServices,
  architectureConnections,
  architecturePattern,
}: GraphViewerProps) {
  const [reactFlowNodes, setReactFlowNodes, onNodesChange] = useNodesState<Node>([]);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Choose layout based on available data
  const useArchitectureLayout =
    architectureServices && architectureServices.length > 0;

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (useArchitectureLayout && architectureServices && architectureConnections) {
      return getArchitectureLayout(
        architectureServices,
        architectureConnections,
        architecturePattern
      );
    }
    return getLayoutedElements(nodes, edges);
  }, [
    useArchitectureLayout,
    architectureServices,
    architectureConnections,
    architecturePattern,
    nodes,
    edges,
  ]);

  useEffect(() => {
    setReactFlowNodes(layoutedNodes);
    setReactFlowEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setReactFlowNodes, setReactFlowEdges]);

  // Check if we have meaningful graph data (at least one Analysis or Finding node)
  const hasAnalysisData = nodes.some(n => n.type === "Analysis" || n.type === "Finding");

  if (nodes.length === 0 || !hasAnalysisData) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center max-w-md space-y-4 px-6">
          <div className="text-6xl mb-4">🧩</div>
          <h3 className="text-xl font-semibold text-foreground">
            Your Knowledge Graph Awaits
          </h3>
          <p className="text-muted-foreground">
            Run your first architecture analysis to start building your knowledge graph.
            Each review adds nodes for findings, AWS services, and remediations, creating
            a visual map of your cloud architecture insights.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors mt-4"
          >
            Run Your First Analysis →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15, minZoom: 0.7, maxZoom: 1.0 }}
        minZoom={0.3}
        maxZoom={2.0}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background color="#475569" gap={16} />
        <Controls className="bg-card border-border" />
        <MiniMap
          className="bg-card border border-border"
          nodeColor={(node: any) => node.data.color}
          maskColor="rgba(10, 22, 40, 0.6)"
        />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg shadow-lg p-3 text-xs z-10">
        <div className="font-semibold text-foreground mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#1D4ED8" }} />
            <span className="text-muted-foreground">Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#DC2626" }} />
            <span className="text-muted-foreground">Finding (CRITICAL)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#EA580C" }} />
            <span className="text-muted-foreground">Finding (HIGH)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#CA8A04" }} />
            <span className="text-muted-foreground">Finding (MEDIUM)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#16A34A" }} />
            <span className="text-muted-foreground">Finding (LOW)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#7C3AED" }} />
            <span className="text-muted-foreground">AWS Service</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#4B5563" }} />
            <span className="text-muted-foreground">Remediation</span>
          </div>
        </div>
      </div>

      {/* Technology badges */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <div className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-medium text-foreground flex items-center gap-2 shadow-lg">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#FF9900">
            <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335c-.072.048-.144.072-.208.072-.08 0-.16-.04-.239-.112-.12-.128-.216-.263-.296-.416-.08-.152-.16-.32-.248-.512-.631.744-1.423 1.116-2.383 1.116-.68 0-1.224-.193-1.624-.583-.4-.39-.6-.91-.6-1.558 0-.692.247-1.253.743-1.678.495-.424 1.15-.64 1.967-.64.272 0 .552.024.847.064.296.04.6.104.92.176v-.583c0-.608-.127-1.032-.375-1.279-.255-.248-.687-.368-1.295-.368-.28 0-.567.031-.863.104-.296.072-.583.16-.863.255-.128.056-.224.095-.28.111-.056.016-.096.024-.12.024-.104 0-.16-.072-.16-.224v-.352c0-.12.016-.208.056-.264.04-.056.12-.112.239-.168.28-.144.615-.264 1.007-.36.391-.096.808-.136 1.247-.136.952 0 1.647.216 2.095.648.44.432.663 1.08.663 1.943v2.56zm-3.287 1.23c.264 0 .536-.048.824-.143.288-.096.543-.271.768-.52.136-.16.232-.336.28-.535.048-.2.08-.424.08-.672v-.32c-.224-.064-.463-.12-.712-.159-.248-.04-.504-.056-.76-.056-.543 0-.943.104-1.207.319-.264.216-.392.52-.392.911 0 .368.095.64.287.816.191.183.48.271.831.271zm6.447.848c-.128 0-.216-.024-.272-.064-.056-.048-.104-.144-.152-.272l-1.599-5.263c-.048-.16-.072-.264-.072-.312 0-.12.064-.184.184-.184h.759c.136 0 .224.024.272.064.056.048.096.144.144.272l1.143 4.504 1.063-4.504c.04-.128.088-.224.144-.272.056-.048.144-.064.28-.064h.615c.136 0 .224.024.28.064.056.048.104.144.144.272l1.079 4.56 1.175-4.56c.048-.128.096-.224.152-.272.056-.048.136-.064.272-.064h.719c.12 0 .184.064.184.184 0 .072-.008.152-.024.232-.016.08-.04.176-.088.32l-1.647 5.263c-.048.16-.096.256-.152.272-.056.048-.144.064-.272.064h-.663c-.136 0-.224-.024-.28-.064-.056-.048-.104-.144-.144-.272l-1.055-4.384-1.047 4.384c-.04.128-.088.224-.144.272-.056.048-.144.064-.28.064h-.663zm10.735.272c-.4 0-.799-.047-1.191-.143-.392-.095-.695-.224-.903-.384-.104-.08-.176-.168-.2-.264-.024-.096-.04-.2-.04-.304v-.368c0-.152.056-.224.16-.224.064 0 .128.016.2.04.072.024.176.072.304.12.264.104.535.184.815.232.288.048.567.072.855.072.455 0 .807-.08 1.055-.232.248-.152.376-.368.376-.656 0-.192-.064-.36-.184-.488-.12-.128-.336-.248-.64-.359l-1.903-.6c-.543-.168-.943-.424-1.191-.76-.248-.336-.368-.728-.368-1.175 0-.336.072-.632.216-.888.144-.256.336-.472.576-.648.24-.176.52-.304.839-.392.32-.088.664-.12 1.023-.12.168 0 .344.008.52.032.176.024.336.056.488.088.144.04.28.08.4.127.12.048.216.096.272.144.08.048.136.096.168.16.032.063.048.144.048.24v.336c0 .152-.056.232-.16.232-.064 0-.168-.032-.32-.088-.487-.216-1.031-.32-1.631-.32-.415 0-.743.072-.975.216-.232.144-.344.36-.344.648 0 .192.072.36.208.488.136.128.368.256.695.368l1.863.592c.536.168.927.408 1.167.728.24.32.36.688.36 1.103 0 .344-.072.656-.216.928-.144.272-.344.512-.6.704-.256.192-.56.336-.928.448-.367.104-.767.16-1.199.16z"/>
          </svg>
          <span>Powered by AWS Bedrock</span>
        </div>
        <div className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-medium text-foreground flex items-center gap-2 shadow-lg">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#018BFF">
            <path d="M23.05 10.43L13.56 1.92a2.24 2.24 0 00-3.13 0L1.94 10.43a2.24 2.24 0 000 3.13l9.49 9.51a2.24 2.24 0 003.13 0l9.49-9.51a2.24 2.24 0 000-3.13zm-9.9 5.4L8.4 11.09l3.25-3.26L15.4 11.6l-2.25 2.24zm-3.13 3.13l-4.76-4.76L8.4 11.1l3.14 3.14-2.52 2.53zm7.64 0l-2.53-2.53 3.14-3.14 3.14 3.14-3.75 3.76zm-6.13-7.64L8.4 8.19l3.25-3.26 3.13 3.13-3.25 3.26z"/>
          </svg>
          <span>Graph by Neo4j</span>
        </div>
      </div>
    </div>
  );
}
