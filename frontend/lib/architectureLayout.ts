/**
 * Architecture-First Graph Layout Engine
 *
 * Positions AWS services in realistic architecture diagram layers based on:
 * - Service categories (edge, compute, data, cross-cutting)
 * - Detected architecture pattern (3-tier, serverless, microservices)
 * - Topology relationships
 */

import {
  ArchitectureServiceNode,
  ArchitectureConnection,
  ArchitecturePattern,
} from "./graphApi";

export interface ServicePosition {
  x: number;
  y: number;
}

export interface LayerAssignment {
  layer: "edge" | "compute" | "data" | "cross-cutting";
  priority: number; // Used for ordering within layer
}

// Service categorization for layer assignment
const SERVICE_LAYERS: Record<string, LayerAssignment> = {
  // Edge Layer (Layer 1 - Top)
  CloudFront: { layer: "edge", priority: 1 },
  "Route 53": { layer: "edge", priority: 2 },
  ALB: { layer: "edge", priority: 3 },
  NLB: { layer: "edge", priority: 4 },
  "API Gateway": { layer: "edge", priority: 5 },
  "Application Load Balancer": { layer: "edge", priority: 3 },
  "Network Load Balancer": { layer: "edge", priority: 4 },

  // Compute Layer (Layer 2 - Middle)
  EC2: { layer: "compute", priority: 1 },
  Lambda: { layer: "compute", priority: 2 },
  ECS: { layer: "compute", priority: 3 },
  Fargate: { layer: "compute", priority: 4 },
  "Elastic Beanstalk": { layer: "compute", priority: 5 },
  "App Runner": { layer: "compute", priority: 6 },

  // Data Layer (Layer 3 - Bottom)
  RDS: { layer: "data", priority: 1 },
  DynamoDB: { layer: "data", priority: 2 },
  Aurora: { layer: "data", priority: 3 },
  S3: { layer: "data", priority: 4 },
  ElastiCache: { layer: "data", priority: 5 },
  Redshift: { layer: "data", priority: 6 },
  DocumentDB: { layer: "data", priority: 7 },
  Neptune: { layer: "data", priority: 8 },
  EFS: { layer: "data", priority: 9 },

  // Cross-Cutting Layer (Layer 4 - Right Side)
  CloudWatch: { layer: "cross-cutting", priority: 1 },
  IAM: { layer: "cross-cutting", priority: 2 },
  KMS: { layer: "cross-cutting", priority: 3 },
  "Secrets Manager": { layer: "cross-cutting", priority: 4 },
  SNS: { layer: "cross-cutting", priority: 5 },
  SQS: { layer: "cross-cutting", priority: 6 },
  Backup: { layer: "cross-cutting", priority: 7 },
  "Systems Manager": { layer: "cross-cutting", priority: 8 },
};

/**
 * Detect architecture pattern from services and connections.
 * Used to choose appropriate positioning algorithm.
 */
export function detectArchitecturePattern(
  services: ArchitectureServiceNode[],
  connections: ArchitectureConnection[]
): ArchitecturePattern {
  const serviceNames = new Set(services.map((s) => s.service_name));

  // Check for serverless pattern
  const hasApiGateway = serviceNames.has("API Gateway");
  const hasLambda = serviceNames.has("Lambda");
  const hasDynamoDB =
    serviceNames.has("DynamoDB") || serviceNames.has("Aurora");

  if (hasApiGateway && hasLambda) {
    return "serverless";
  }

  // Check for 3-tier pattern
  const hasLoadBalancer =
    serviceNames.has("ALB") ||
    serviceNames.has("NLB") ||
    serviceNames.has("Application Load Balancer") ||
    serviceNames.has("Network Load Balancer");
  const hasCompute = serviceNames.has("EC2") || serviceNames.has("ECS");
  const hasDatabase =
    serviceNames.has("RDS") ||
    serviceNames.has("Aurora") ||
    serviceNames.has("DynamoDB");

  if (hasLoadBalancer && hasCompute && hasDatabase) {
    return "3-tier";
  }

  // Check for microservices pattern
  const computeServices = Array.from(serviceNames).filter((s) =>
    ["EC2", "ECS", "Fargate", "Lambda"].includes(s)
  );
  const hasMessageQueue = serviceNames.has("SQS") || serviceNames.has("SNS");

  if (computeServices.length >= 3 && hasMessageQueue) {
    return "microservices";
  }

  // Check for event-driven pattern
  const hasEventBridge = serviceNames.has("EventBridge");
  if ((hasLambda || computeServices.length > 0) && (hasEventBridge || hasMessageQueue)) {
    return "event-driven";
  }

  // Default to custom
  return "custom";
}

/**
 * Assign services to layers based on their categories.
 */
function assignServiceLayers(
  services: ArchitectureServiceNode[]
): Map<string, LayerAssignment> {
  const assignments = new Map<string, LayerAssignment>();

  for (const service of services) {
    const assignment = SERVICE_LAYERS[service.service_name];
    if (assignment) {
      assignments.set(service.service_name, assignment);
    } else {
      // Default assignment based on category
      const category = service.category.toLowerCase();
      if (category.includes("compute")) {
        assignments.set(service.service_name, { layer: "compute", priority: 99 });
      } else if (category.includes("database") || category.includes("storage")) {
        assignments.set(service.service_name, { layer: "data", priority: 99 });
      } else if (category.includes("network")) {
        assignments.set(service.service_name, { layer: "edge", priority: 99 });
      } else {
        assignments.set(service.service_name, {
          layer: "cross-cutting",
          priority: 99,
        });
      }
    }
  }

  return assignments;
}

/**
 * Calculate positions for 3-tier architecture pattern.
 * Layout: Edge services at top, compute in middle, data at bottom, cross-cutting on right.
 */
function position3TierArchitecture(
  services: ArchitectureServiceNode[],
  layerAssignments: Map<string, LayerAssignment>
): Map<string, ServicePosition> {
  const positions = new Map<string, ServicePosition>();

  // Group services by layer
  const layers: Record<string, ArchitectureServiceNode[]> = {
    edge: [],
    compute: [],
    data: [],
    "cross-cutting": [],
  };

  for (const service of services) {
    const assignment = layerAssignments.get(service.service_name);
    if (assignment) {
      layers[assignment.layer].push(service);
    }
  }

  // Sort services within each layer by priority
  for (const layer of Object.keys(layers)) {
    layers[layer].sort((a, b) => {
      const priorityA = layerAssignments.get(a.service_name)?.priority ?? 99;
      const priorityB = layerAssignments.get(b.service_name)?.priority ?? 99;
      return priorityA - priorityB;
    });
  }

  // Layout parameters
  const HORIZONTAL_SPACING = 200;
  const VERTICAL_SPACING = 200;
  const START_X = 100;
  const START_Y = 50;

  // Position edge services (Layer 1 - Top)
  let currentY = START_Y;
  layers.edge.forEach((service, index) => {
    positions.set(service.service_name, {
      x: START_X + index * HORIZONTAL_SPACING,
      y: currentY,
    });
  });

  // Position compute services (Layer 2 - Middle)
  currentY += VERTICAL_SPACING;
  layers.compute.forEach((service, index) => {
    positions.set(service.service_name, {
      x: START_X + index * HORIZONTAL_SPACING,
      y: currentY,
    });
  });

  // Position data services (Layer 3 - Bottom)
  currentY += VERTICAL_SPACING;
  layers.data.forEach((service, index) => {
    positions.set(service.service_name, {
      x: START_X + index * HORIZONTAL_SPACING,
      y: currentY,
    });
  });

  // Position cross-cutting services (Layer 4 - Right Side)
  const rightX = START_X + Math.max(
    layers.edge.length,
    layers.compute.length,
    layers.data.length
  ) * HORIZONTAL_SPACING + 100;

  layers["cross-cutting"].forEach((service, index) => {
    positions.set(service.service_name, {
      x: rightX,
      y: START_Y + index * VERTICAL_SPACING * 0.8,
    });
  });

  return positions;
}

/**
 * Calculate positions for serverless architecture pattern.
 * Layout: API Gateway at top, Lambda in middle, DynamoDB/Aurora at bottom.
 */
function positionServerlessArchitecture(
  services: ArchitectureServiceNode[],
  layerAssignments: Map<string, LayerAssignment>
): Map<string, ServicePosition> {
  // Similar to 3-tier but with specific serverless components prioritized
  return position3TierArchitecture(services, layerAssignments);
}

/**
 * Calculate positions for microservices architecture pattern.
 * Layout: Multiple compute services horizontally, data services below, message queues on side.
 */
function positionMicroservicesArchitecture(
  services: ArchitectureServiceNode[],
  layerAssignments: Map<string, LayerAssignment>
): Map<string, ServicePosition> {
  // Use 3-tier layout as base, microservices spread horizontally
  return position3TierArchitecture(services, layerAssignments);
}

/**
 * Calculate positions for custom/unknown architecture patterns.
 * Falls back to layer-based layout.
 */
function positionCustomArchitecture(
  services: ArchitectureServiceNode[],
  layerAssignments: Map<string, LayerAssignment>
): Map<string, ServicePosition> {
  return position3TierArchitecture(services, layerAssignments);
}

/**
 * Main entry point: Calculate positions for all services based on architecture pattern.
 */
export function calculateServicePositions(
  services: ArchitectureServiceNode[],
  connections: ArchitectureConnection[],
  pattern?: ArchitecturePattern | null
): Map<string, ServicePosition> {
  // Detect pattern if not provided
  const architecturePattern =
    pattern || detectArchitecturePattern(services, connections);

  // Assign services to layers
  const layerAssignments = assignServiceLayers(services);

  // Choose positioning algorithm based on pattern
  switch (architecturePattern) {
    case "3-tier":
      return position3TierArchitecture(services, layerAssignments);
    case "serverless":
      return positionServerlessArchitecture(services, layerAssignments);
    case "microservices":
      return positionMicroservicesArchitecture(services, layerAssignments);
    case "event-driven":
      return positionCustomArchitecture(services, layerAssignments);
    case "monolith":
      return positionCustomArchitecture(services, layerAssignments);
    case "custom":
    default:
      return positionCustomArchitecture(services, layerAssignments);
  }
}
