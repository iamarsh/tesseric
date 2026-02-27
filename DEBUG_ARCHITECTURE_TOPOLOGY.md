# Architecture Topology Visualization - Debug Guide

**Issue**: After uploading architecture diagrams, the Knowledge Graph shows duplicate "Architecture Requires Detailed Design" finding nodes instead of the actual architecture topology with services and connections.

**Expected**: The graph should display AWS services (EC2, RDS, ALB, Lambda, etc.) as nodes with color-coded borders indicating severity, connected by topology relationships (routes_to, reads_from, writes_to, etc.).

## What I've Done

I've added **comprehensive debug logging** at every stage of the data flow to help us identify exactly where the topology data is being lost.

### Changes Made:

1. **Backend RAG Service** (`backend/app/services/rag.py`):
   - Added logging after Bedrock analysis to show if topology was extracted
   - Logs services count, connections count, and architecture pattern

2. **Backend Neo4j Client** (`backend/app/graph/neo4j_client.py`):
   - Added logging when storing topology connections
   - Added logging for architecture graph query results
   - Warns if no topology connections are present

3. **Frontend Graph Page** (`frontend/app/graph/page.tsx`):
   - Added console.log showing architecture data fetched from API
   - Shows services count, connections count, and service names preview

4. **Frontend GraphViewer** (`frontend/components/GraphViewer.tsx`):
   - Added console.log for layout selection logic
   - Shows why architecture vs traditional layout was chosen

## How to Debug

### Step 1: Start Backend with Debug Logging

```bash
cd backend

# Set log level to DEBUG to see all logs
export LOG_LEVEL=DEBUG

# Start backend
uvicorn app.main:app --reload --port 8000
```

### Step 2: Upload Test Image

Upload `/Users/arshsingh/Downloads/Projects/tesseric/test-images/aws-architecture.png` via:
- **Frontend**: http://localhost:3000/#review
- **OR curl**: See curl command below

### Step 3: Watch Backend Logs

Look for these log entries in order:

**A. After Vision Extraction:**
```
INFO: Vision extraction complete: XXX chars, YYY input tokens, ZZZ output tokens
```

**B. After Bedrock Analysis:**
```
INFO: Topology extracted: X services, Y connections, pattern=Z
DEBUG: Services: ['EC2', 'RDS', 'ALB', ...]
DEBUG: Connections: [...]
```
OR
```
WARNING: No topology data in Bedrock response!  # ← This means Claude didn't return topology
```

**C. During Neo4j Storage:**
```
INFO: Storing X topology connections in Neo4j
DEBUG: Creating topology relationship: ALB -ROUTES_TO-> EC2
```
OR
```
WARNING: No topology connections to store for analysis review-xxx  # ← Empty connections
```

**D. When Fetching Architecture Graph:**
```
INFO: Architecture graph query result for review-xxx: X services, Y connections, pattern=Z
```

### Step 4: Check Frontend Console

Open browser DevTools (F12) and look for:

**A. After API Fetch:**
```javascript
[GRAPH DEBUG] Architecture data fetched: {
  services: 5,  // ← Should be > 0
  connections: 8,  // ← Should be > 0
  pattern: "3-tier",
  servicesPreview: ["EC2", "RDS", "ALB"]
}
```

**B. Layout Selection:**
```javascript
[GRAPHVIEWER DEBUG] Layout selection: {
  useArchitectureLayout: true,  // ← Should be true if services > 0
  servicesCount: 5,
  connectionsCount: 8,
  pattern: "3-tier",
  traditionalNodesCount: 10
}
```

**C. If Architecture Layout is Used:**
```javascript
[GRAPHVIEWER DEBUG] Using architecture layout with services: ["EC2", "RDS", "ALB", "Lambda", "CloudWatch"]
```

### Step 5: Identify the Problem

Based on the logs, you'll see where the topology data is lost:

| Log Pattern | Root Cause | Fix Needed |
|------------|------------|------------|
| "No topology data in Bedrock response" | Claude isn't returning topology field | Check prompts, verify JSON schema |
| "No topology connections to store" | Topology field exists but connections array is empty | Claude extracted services but no relationships |
| "0 services, 0 connections" in architecture query | Data not stored in Neo4j | Check Neo4j connection, verify write succeeded |
| Frontend shows "servicesCount: 0" | API endpoint not returning data | Check API endpoint, verify analysis_id exists |
| "useArchitectureLayout: false" but services exist | Frontend logic issue | Bug in GraphViewer layout selection |

## Manual API Testing

### Test Architecture Endpoint Directly

```bash
# Replace review-xxx with actual review ID from upload
curl http://localhost:8000/api/graph/review-xxx/architecture | jq .

# Expected response:
{
  "services": [
    {
      "service_name": "EC2",
      "category": "compute",
      "finding_count": 3,
      "severity_breakdown": {"CRITICAL": 1, "HIGH": 2, "MEDIUM": 0, "LOW": 0},
      "max_severity": "CRITICAL"
    },
    ...
  ],
  "connections": [
    {
      "source_service": "ALB",
      "target_service": "EC2",
      "relationship_type": "routes_to",
      "description": "Load balancer distributes traffic"
    },
    ...
  ],
  "architecture_pattern": "3-tier",
  "architecture_description": "..."
}
```

### Upload Image via curl

```bash
curl -X POST http://localhost:8000/api/review \
  -F "file=@test-images/aws-architecture.png" \
  -F "tone=standard" \
  -F "provider=aws" \
  | jq '.'

# Response will include review_id:
# { "review_id": "review-xxx", ... }
```

## Common Issues & Solutions

### Issue 1: "No topology data in Bedrock response"

**Cause**: Claude isn't returning the `topology` field in the JSON response.

**Solution**: The prompt in `backend/app/services/prompts.py` (lines 357-442) tells Claude to return topology. Check:
1. Is Claude Haiku being used? (Might need Sonnet for complex extraction)
2. Is the prompt being truncated? (Check max_tokens)
3. Is JSON parsing failing? (Check for malformed JSON)

### Issue 2: Empty Connections Array

**Cause**: Claude extracted services but couldn't identify relationships from the description.

**Reasons**:
- Vision extraction didn't capture connection details (arrows, labels)
- Architecture description text is too vague ("EC2 and RDS" vs "EC2 queries RDS database")
- Image quality too low for vision model to see connections

**Solution**: Enhance vision extraction prompt to capture data flow explicitly.

### Issue 3: Neo4j Storage Fails

**Cause**: Services in connections don't exist in `AWS_SERVICES` mapping.

**Solution**: Check `backend/app/graph/service_parser.py` - ensure all services Claude mentions are in the AWS_SERVICES dict.

### Issue 4: Frontend Shows Empty State

**Cause**: Either API returns 404, or empty services array.

**Solution**:
1. Check API logs for 404 errors
2. Verify `analysisId` in URL matches stored `review_id`
3. Check if old review (created before topology feature)

## Next Steps

1. **Run the test**: Upload test-images/aws-architecture.png with debug logging enabled
2. **Capture logs**: Save backend logs and frontend console output
3. **Identify bottleneck**: Use the table above to pinpoint where data is lost
4. **Apply fix**: Based on root cause, we'll fix the specific component

Let me know what you see in the logs and I'll help fix the specific issue!

## Production Debugging

For your existing production review (`review-c7b5a4d1-e2d3-4b4f-8a9b-4d5e6f7a8b9c`):

```bash
# Check if architecture data exists
curl https://api.tesseric.ca/api/graph/review-c7b5a4d1-e2d3-4b4f-8a9b-4d5e6f7a8b9c/architecture | jq .

# If 404, it means this review has no topology data
# Upload a new test image to get a new review with topology
```

**Note**: Old reviews created before topology extraction was implemented won't have architecture data. You'll need to upload a new test image to verify the fix.
