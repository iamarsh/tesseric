# Tesseric Architecture - Explained in Simple Terms

**Last Updated**: 2026-01-22
**Version**: v0.1.0-alpha (with Phase 1 Bedrock integration)
**Audience**: Developers learning the codebase

---

## Table of Contents

1. [Big Picture: How Tesseric Works](#big-picture)
2. [Backend Deep Dive](#backend-deep-dive)
3. [Frontend Deep Dive](#frontend-deep-dive)
4. [Data Flow: Request to Response](#data-flow)
5. [Key Concepts Explained](#key-concepts)
6. [Common Patterns Used](#common-patterns)
7. [Where to Start Reading Code](#where-to-start)

---

## Phase 1: Real AWS Analysis with Amazon Bedrock

### What is Bedrock?

Amazon Bedrock is AWS's service for using AI models like Claude, Llama, and Titan. We use Claude 3.5 Haiku - the newest and cheapest Claude model ($1 per million input tokens).

### Data Flow (User → AI → AWS-Specific Results)

1. **User enters AWS architecture description** in frontend
   - Example: "EC2 in single AZ with unencrypted RDS MySQL"

2. **Request Validation** (models/request.py)
   - Validates provider field is "aws" (only provider supported in v1)
   - Rejects non-AWS providers (azure, gcp, etc.) with validation error

3. **Prompt Builder** (prompts.py)
   - Loads AWS Well-Architected best practices (~6K tokens)
   - Covers all 6 pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability
   - Includes AWS service-specific guidance: EC2, RDS, S3, VPC, Lambda, ECS, etc.
   - Adds tone modifier (professional: educational, roast: sarcastic but technical)
   - Formats output schema (JSON structure for AWS pillar-mapped response)

4. **Cost Estimator** (token_counter.py)
   - Estimates tokens: ~7,600 input (system + AWS context + user text)
   - Estimates cost: ~$0.011 per review
   - Logs estimate for tracking

5. **Bedrock Client** (bedrock.py)
   - Uses boto3 to call AWS Bedrock API
   - Sends: system prompt + user message
   - Model: Claude 3.5 Haiku in us-east-2
   - Temperature: 0.3 (low = more deterministic, consistent)
   - Max tokens: 4096 (enough for 5-10 AWS-specific risks)

6. **Claude 3.5 Haiku analyzes AWS architecture**
   - Reads system prompt (base instructions + AWS Well-Architected context)
   - Reads user AWS architecture description
   - Identifies 3-10 risks based on AWS best practices
   - Maps findings to AWS Well-Architected pillars (security, reliability, etc.)
   - Assigns severity (CRITICAL, HIGH, MEDIUM, LOW) based on AWS impact
   - Writes remediation steps with actual AWS service names (KMS, Multi-AZ RDS, ASG, etc.)
   - Calculates architecture score (100 - penalties)
   - Returns strict JSON matching schema

7. **Response Parser** (rag.py)
   - Extracts JSON from Bedrock response
   - Validates against ReviewResponse schema (Pydantic)
   - Ensures risks map to valid AWS pillars
   - Logs actual token usage and cost
   - Adds metadata: analysis_method, provider=aws, cost

8. **Error Handler** (rag.py)
   - If Bedrock fails (throttling, access denied, timeout):
     - Retry once for throttling (wait 2 seconds)
     - Fall back to v0.1 AWS pattern matching for other errors
   - User gets AWS-focused result either way (AI or pattern matching)

9. **Frontend displays**
   - Architecture score (0-100) with color coding
   - Risk cards: title, severity, AWS pillar, impact, remediation, AWS doc references
   - Summary (2-3 sentences) in chosen tone
   - AWS-specific terminology and examples

### Why Inline AWS Context Instead of Knowledge Bases?

**Inline Context** (our approach):
- Include AWS Well-Architected best practices directly in prompt (~6K tokens)
- Single API call to Bedrock (no retrieval step)
- Cost: ~$0.011 per review
- Simple: No vector database to manage
- Deep AWS focus: Comprehensive coverage of all 6 pillars + AWS services

**Knowledge Bases** (Path A, not chosen):
- Store AWS docs in S3, index in OpenSearch Serverless
- Two API calls: retrieve docs → generate response
- Cost: ~$730/month minimum (OpenSearch) + per-review charges
- Complex: Manage embeddings, indexing, chunking
- Same AWS focus but higher operational overhead

**When to switch to KB**: If AWS context exceeds 50K tokens or need dynamic document retrieval

### Cost Breakdown (Per AWS Architecture Review)

| Component | Tokens | Cost |
|-----------|--------|------|
| System prompt | 800 | $0.0008 |
| AWS Well-Architected context | 6,000 | $0.0060 |
| JSON schema | 300 | $0.0003 |
| User input (avg) | 500 | $0.0005 |
| **Input Total** | **7,600** | **$0.0076** |
| Response (avg) | 700 | $0.0035 |
| **Total** | **8,300** | **~$0.011** |

### Why This Beats ChatGPT for AWS Architectures

| Feature | ChatGPT | Tesseric |
|---------|---------|----------|
| AWS Knowledge | Generic 2023 data | Curated AWS Well-Architected (2024) |
| Output Format | Unstructured paragraphs | Strict JSON, AWS pillar mapping |
| AWS Services | Generic ("use encryption") | Specific ("use AWS KMS with CMK") |
| Consistency | Variable, creative | Deterministic AWS risk framework |
| Multi-AZ | May or may not mention | Always evaluates (AWS best practice) |
| Cost per review | ~$0.02 (GPT-4) | $0.011 (Claude Haiku) |
| AWS Doc Links | Rarely provided | Always included in references |
| Tone Options | One | Professional + Roast (AWS-themed) |

### Multi-Cloud Future (Phase 3+)

**Current Status**: AWS-only for v1
**Future Vision**: After AWS path is stable, add:
- Azure Well-Architected Framework support
- GCP Cloud Architecture Framework support
- n8n workflow analysis
- Provider abstraction layer

**Why Not Now**: Focus on depth (excellent AWS reviews) before breadth (mediocre multi-cloud)

---

## Big Picture: How Tesseric Works

### The Restaurant Analogy

Think of Tesseric like a restaurant where you get your architecture "reviewed":

1. **You (Customer)** → Enter your AWS architecture description
2. **Frontend (Waiter)** → Takes your order, shows you the menu (UI)
3. **Backend (Kitchen)** → Analyzes your architecture, finds problems
4. **RAG Service (Chef)** → The expert who actually reviews your design
5. **Response (Meal)** → A beautiful report with problems and solutions

### The Flow in One Sentence

> You type your architecture → Frontend sends it to Backend → Backend finds problems → Frontend shows you a beautiful report with a score and fix recommendations.

---

## Backend Deep Dive

The backend is built with **FastAPI** (a Python web framework). It's like the "brain" that does the analysis.

### Directory Structure (What Each Folder Does)

```
backend/
├── app/
│   ├── main.py              # The "restaurant entrance" - starts everything
│   ├── api/                 # The "menu" - what you can order
│   │   ├── health.py        # "Are you open?" check
│   │   └── review.py        # "Analyze my architecture" request
│   ├── core/                # The "settings" - configuration
│   │   └── config.py        # Loads environment variables (like AWS region)
│   ├── models/              # The "order forms" - what requests/responses look like
│   │   ├── request.py       # What you send IN
│   │   └── response.py      # What you get BACK
│   └── services/            # The "kitchen" - where work happens
│       ├── rag.py           # The "chef" - analyzes architecture
│       ├── bedrock.py       # Connection to AWS AI (stubbed for now)
│       ├── storage.py       # Where we'll save reviews (future)
│       └── parsing.py       # Parse images/Terraform (future)
└── tests/                   # Quality control - make sure everything works
```

---

### File-by-File Explanation

#### 1. `backend/app/main.py` - The Restaurant Entrance

**What it does**: This is where FastAPI starts. It's like opening the restaurant doors.

**Key parts**:
```python
app = FastAPI(title="Tesseric Backend")  # Create the restaurant
```

This creates the web server that listens for requests.

```python
app.add_middleware(CORSMiddleware, ...)  # Let frontend talk to backend
```

CORS = "Cross-Origin Resource Sharing". Translation: "Let the website (localhost:3000) talk to the API (localhost:8000)". Without this, your browser would block requests for security.

```python
app.include_router(health.router)   # Add the /health endpoint
app.include_router(review.router)   # Add the /review endpoint
```

This is like adding menu items. "You can order health checks or architecture reviews."

**When to edit**: Only when adding new major features or changing CORS settings.

---

#### 2. `backend/app/api/health.py` - The "Are You Open?" Check

**What it does**: Simple endpoint that says "Yes, I'm running!"

```python
@router.get("/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0-alpha"}
```

**Translation**:
- `@router.get("/health")` = "When someone visits /health..."
- `async def` = "This function can wait for things without blocking"
- `return {...}` = "Send back this JSON"

**Why we need it**: DevOps/monitoring tools ping this to check if the server is alive.

**When to edit**: Rarely. Maybe update version number or add database health checks later.

---

#### 3. `backend/app/api/review.py` - The Main Feature

**What it does**: Receives architecture descriptions and returns analysis.

```python
@router.post("/review", response_model=ReviewResponse)
async def review_architecture(request: ReviewRequest):
    response = await analyze_design(request)
    return response
```

**Translation**:
- `@router.post("/review")` = "When someone POSTs to /review..."
- `response_model=ReviewResponse` = "The response will match this structure"
- `request: ReviewRequest` = "The input must match this structure"
- `await analyze_design(request)` = "Call the chef to do the analysis"

**Flow**:
1. Frontend sends: `{design_text: "...", tone: "standard"}`
2. FastAPI validates it matches `ReviewRequest`
3. Calls `analyze_design()` to do the work
4. Returns `ReviewResponse` back to frontend

**When to edit**: When adding new request parameters or changing the API contract.

---

#### 4. `backend/app/models/request.py` - The Order Form

**What it does**: Defines what a valid request looks like.

```python
class ReviewRequest(BaseModel):
    design_text: str = Field(..., description="Architecture description")
    format: Literal["markdown", "text"] = Field(default="markdown")
    tone: Literal["standard", "roast"] = Field(default="standard")
```

**Translation**:
- `class ReviewRequest(BaseModel)` = "This is a request template"
- `design_text: str` = "Must be text (string)"
- `Literal["standard", "roast"]` = "Must be exactly 'standard' or 'roast', nothing else"
- `Field(default="standard")` = "If not provided, use 'standard'"

**Pydantic Magic**: If you send `{"design_text": 123}` (number instead of text), Pydantic automatically rejects it with a clear error. You don't have to write validation code!

**When to edit**: When adding new input fields (like image uploads in v1.1).

---

#### 5. `backend/app/models/response.py` - The Report Template

**What it does**: Defines what the analysis report looks like.

```python
class RiskItem(BaseModel):
    id: str                  # Like "SEC-001"
    title: str               # Like "Data Not Encrypted"
    severity: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    pillar: Literal[         # Which Well-Architected pillar
        "security",
        "reliability",
        "cost_optimization",
        # ... etc
    ]
    impact: str              # What happens if not fixed
    finding: str             # What we found wrong
    remediation: str         # How to fix it
    references: List[str]    # AWS doc links
```

**Translation**: Each "risk" is a problem we found. It has:
- An ID (for tracking)
- A title (short name)
- Severity (how bad is it?)
- Pillar (which category of best practice?)
- Impact (consequences)
- Finding (detailed description)
- Remediation (step-by-step fix)
- References (links to AWS docs)

```python
class ReviewResponse(BaseModel):
    review_id: str
    architecture_score: int      # 0-100
    risks: List[RiskItem]        # List of problems
    summary: str                 # 2-3 sentence overview
    tone: str
    created_at: datetime
```

**Translation**: The full report includes:
- Unique ID for this review
- Overall score (like a grade)
- List of all risks found
- Summary paragraph
- Tone used
- When it was created

**When to edit**: When adding new fields to risks or changing the scoring algorithm.

---

#### 6. `backend/app/core/config.py` - The Settings Manager

**What it does**: Loads settings from `.env` file or environment variables.

```python
class Settings(BaseSettings):
    aws_region: str = "us-east-1"
    bedrock_kb_id: str | None = None
    backend_port: int = 8000
    # ...
```

**Translation**:
- `BaseSettings` = "Load from environment variables"
- `aws_region: str = "us-east-1"` = "Default to us-east-1 if not set"
- `str | None` = "Can be a string OR None (not set yet)"

**How it works**:
1. Looks in `.env` file for `AWS_REGION=...`
2. If not found, uses default value
3. Makes it available everywhere as `settings.aws_region`

**Environment Variables Example**:
```bash
# .env file
AWS_REGION=us-west-2
BACKEND_PORT=9000
```

Then in code:
```python
from app.core.config import settings
print(settings.aws_region)  # Prints: us-west-2
```

**When to edit**: When adding new configuration options (like database URLs).

---

#### 7. `backend/app/services/rag.py` - The Chef (The Smart Part)

**What it does**: This is the "brain" that analyzes your architecture and finds problems.

**Current Implementation (v0.1)**: Simple pattern matching (like a checklist)

```python
async def analyze_design(request: ReviewRequest) -> ReviewResponse:
    design_lower = request.design_text.lower()  # Convert to lowercase
    risks: list[RiskItem] = []

    # Pattern 1: Check for single AZ
    if "single az" in design_lower:
        risks.append(RiskItem(
            id="REL-001",
            title="Single Availability Zone Deployment",
            severity="HIGH",
            pillar="reliability",
            # ... more fields
        ))

    # More patterns...

    score = calculate_score(risks)  # 100 minus penalty for each risk
    return ReviewResponse(...)
```

**How it works now**:
1. Takes the architecture description
2. Converts to lowercase (for case-insensitive matching)
3. Looks for keywords:
   - "single az" → Adds reliability risk
   - "no encryption" → Adds security risk (CRITICAL)
   - "public s3" → Adds security risk (CRITICAL)
   - "no backup" → Adds reliability risk
   - "no auto-scaling" → Adds performance risk
   - "over-provisioned" → Adds cost risk
4. Calculates score (starts at 100, subtracts for each risk)
5. Generates summary

**Scoring System**:
```python
def calculate_score(risks: list[RiskItem]) -> int:
    score = 100
    for risk in risks:
        if risk.severity == "CRITICAL": score -= 25
        elif risk.severity == "HIGH": score -= 15
        elif risk.severity == "MEDIUM": score -= 8
        elif risk.severity == "LOW": score -= 3
    return max(0, score)  # Can't go below 0
```

**Example**:
- Start: 100 points
- Find 1 CRITICAL issue: 100 - 25 = 75
- Find 1 HIGH issue: 75 - 15 = 60
- Find 1 MEDIUM issue: 60 - 8 = 52
- Final score: 52/100

**Phase 1 Upgrade**: Replace this with real AI (Amazon Bedrock Claude 3):
1. Send description to Bedrock Knowledge Base
2. Bedrock retrieves relevant AWS documentation
3. Claude 3 analyzes with retrieved context
4. Returns structured JSON (same format)

**When to edit**:
- v0.1: Add more patterns to detect
- Phase 1: Replace entire implementation with Bedrock API calls

---

#### 8. `backend/app/services/bedrock.py` - AWS AI Connection (Stubbed)

**What it does (v0.1)**: Nothing yet. Just a placeholder.

**What it will do (Phase 1)**:
```python
class BedrockClient:
    async def retrieve(self, query: str) -> list[dict]:
        # Call Bedrock Knowledge Base to get relevant AWS docs
        pass

    async def generate(self, prompt: str) -> str:
        # Call Claude 3 to analyze with retrieved context
        pass
```

**Why it's separate**: Keeps AI logic isolated. Easy to test, swap, or mock.

**When to edit**: Phase 1 when we integrate real Bedrock.

---

#### 9. `backend/tests/` - Quality Control

**What it does**: Automatically tests the API to make sure it works.

**Example from `test_review.py`**:
```python
def test_review_endpoint_success():
    payload = {
        "design_text": "Single AZ deployment with EC2",
        "format": "text",
        "tone": "standard"
    }
    response = client.post("/review", json=payload)
    assert response.status_code == 200  # Should succeed
```

**Translation**:
1. Create a fake request
2. Send it to `/review`
3. Check that it returns 200 (success)

**Run tests**:
```bash
cd backend
pytest -v
```

**When to edit**: Add new tests when adding features or fixing bugs.

---

## Frontend Deep Dive

The frontend is built with **Next.js** (React framework) + **TypeScript** + **Tailwind CSS**.

### Directory Structure

```
frontend/
├── app/
│   ├── layout.tsx           # Wrapper for all pages (theme provider)
│   ├── page.tsx             # Main page (the review form + results)
│   └── globals.css          # Theme colors, Tailwind imports
├── components/
│   ├── ThemeProvider.tsx    # Manages light/dark mode
│   ├── ThemeSwitcher.tsx    # Button to toggle theme
│   ├── ReviewForm.tsx       # Input form (where you type)
│   └── ReviewResults.tsx    # Results display (score + risks)
└── lib/
    └── api.ts               # Functions to call backend API
```

---

### File-by-File Explanation

#### 1. `frontend/app/layout.tsx` - The Wrapper

**What it does**: Wraps every page with common elements (like fonts, metadata, theme).

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}  {/* Your actual pages go here */}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Key concepts**:
- **`{children}`**: This is where the actual page content goes (like `page.tsx`)
- **`ThemeProvider`**: Wraps everything so theme (light/dark) is available everywhere
- **Metadata**: SEO tags (title, description) for Google

**When to edit**: When adding global things (like analytics, auth providers).

---

#### 2. `frontend/app/page.tsx` - The Main Page

**What it does**: The home page where everything happens.

**State Management** (React's way of remembering things):
```tsx
const [review, setReview] = useState<ReviewResponse | null>(null);
const [loading, setLoading] = useState(false);
const [currentTone, setCurrentTone] = useState<"standard" | "roast">("standard");
```

**Translation**:
- `review` = The analysis results (null if not done yet)
- `loading` = Are we waiting for the backend? (true/false)
- `currentTone` = Which tone mode is active?

**The Submit Flow**:
```tsx
const handleSubmit = async (request: ReviewRequest) => {
  setLoading(true);  // Show loading spinner
  try {
    const result = await submitReview(request);  // Call backend
    setReview(result);  // Save results
  } catch (err) {
    setError(err.message);  // Show error
  } finally {
    setLoading(false);  // Hide loading spinner
  }
};
```

**Translation**:
1. User clicks "Review My Architecture"
2. Set `loading = true` (shows spinner)
3. Call backend API with `submitReview()`
4. If success: save results in `review`
5. If error: save error message
6. Always: set `loading = false` (hide spinner)

**The Tone Toggle**:
```tsx
const handleToggleTone = async () => {
  const newTone = currentTone === "standard" ? "roast" : "standard";
  const updatedRequest = { ...lastRequest, tone: newTone };
  await handleSubmit(updatedRequest);  // Re-submit with new tone
};
```

**Translation**: When you click "Switch to Roast Mode", it re-sends the same architecture but with tone changed.

**Conditional Rendering**:
```tsx
{!review && <ReviewForm onSubmit={handleSubmit} />}
{review && <ReviewResults review={review} />}
```

**Translation**:
- If `review` is empty → Show the input form
- If `review` has data → Show the results

**When to edit**: When changing the page layout or adding new sections.

---

#### 3. `frontend/components/ReviewForm.tsx` - The Input Form

**What it does**: Where you enter your architecture description.

**Input Modes**:
```tsx
const [inputMode, setInputMode] = useState<"text" | "image">("text");
```

User can toggle between:
- **Text mode**: Type/paste architecture description
- **Image mode**: Drag-and-drop screenshots (v1.1)

**Form Validation**:
```tsx
if (!designText.trim()) {
  alert("Please provide an architecture description");
  return;
}
if (designText.length < 50) {
  alert("Please provide more details (at least 50 characters)");
  return;
}
```

**Translation**:
- Can't submit empty text
- Must be at least 50 characters (forces meaningful input)

**Drag-and-Drop** (prepared for v1.1):
```tsx
const handleDrop = (e: React.DragEvent) => {
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    // TODO: Send to backend for OCR
    alert("Image upload coming in v1.1!");
  }
};
```

**Translation**: When you drop an image, it checks if it's actually an image file. For now, shows a message that it's coming soon.

**Tone Selector**:
```tsx
<button onClick={() => setTone("standard")} />
<button onClick={() => setTone("roast")} />
```

Two buttons that toggle the tone. Active one is highlighted.

**When to edit**: When adding new input types (Terraform, n8n) or changing validation.

---

#### 4. `frontend/components/ReviewResults.tsx` - The Report Display

**What it does**: Shows the beautiful results with score, risks, remediation.

**Score Gauge**:
```tsx
function ScoreGauge({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "green";   // Excellent
    if (score >= 60) return "yellow";  // Good
    if (score >= 40) return "orange";  // Needs work
    return "red";                       // Critical
  };

  return (
    <circle
      strokeDashoffset={`${circumference * (1 - score / 100)}`}
      className={getScoreColor(score)}
    />
  );
}
```

**Translation**:
- Draws a circular progress bar
- Color changes based on score (green = good, red = bad)
- `strokeDashoffset` animates the circle to show progress

**Risk Cards**:
```tsx
function RiskCard({ risk }: { risk: RiskItem }) {
  const severityInfo = severityConfig[risk.severity];  // Get color/icon

  return (
    <div className="card">
      <Badge severity={risk.severity} />
      <h3>{risk.title}</h3>
      <p>Finding: {risk.finding}</p>
      <p>Remediation: {risk.remediation}</p>
      <a href={risk.references[0]}>AWS Docs →</a>
    </div>
  );
}
```

**Translation**: Each risk is a card showing:
- Severity badge (CRITICAL = red, HIGH = orange, etc.)
- Title
- What we found wrong
- How to fix it
- Link to AWS documentation

**Show More Button**:
```tsx
{risks.length > 3 && !showAllRisks && (
  <button onClick={() => setShowAllRisks(true)}>
    Show {risks.length - 3} More Risks
  </button>
)}
```

**Translation**: If more than 3 risks, only show first 3. Button reveals the rest.

**When to edit**: When changing the results UI or adding export features.

---

#### 5. `frontend/components/ThemeProvider.tsx` - Theme Manager

**What it does**: Manages light/dark mode across the entire app.

**How it works**:
```tsx
const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

useEffect(() => {
  // Save to localStorage when changed
  localStorage.setItem("tesseric-theme", theme);

  // Apply to HTML element
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
}, [theme]);
```

**Translation**:
1. User clicks theme toggle
2. `setTheme("dark")` is called
3. Saves "dark" to localStorage (persists across visits)
4. Adds "dark" class to `<html>` element
5. CSS variables change based on `.dark` class

**CSS Magic** (in `globals.css`):
```css
:root {
  --background: white;
  --foreground: black;
}

.dark {
  --background: #0F172A;  /* Dark blue */
  --foreground: white;
}
```

All components use `bg-background` and `text-foreground`, so when `.dark` is added, all colors change automatically!

**When to edit**: When adding more theme options or changing theme logic.

---

#### 6. `frontend/lib/api.ts` - Backend Communication

**What it does**: Functions to call the backend API.

```tsx
export async function submitReview(request: ReviewRequest): Promise<ReviewResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const response = await fetch(`${apiUrl}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}
```

**Translation**:
1. Get API URL from environment (or default to localhost:8000)
2. Make POST request to `/review`
3. Send JSON body with architecture description
4. If error (not 200 OK), throw error
5. Otherwise, parse JSON response and return it

**Error Handling**:
```tsx
try {
  const result = await submitReview(request);
} catch (error) {
  alert("Failed to connect to backend. Is it running?");
}
```

**When to edit**: When adding new API endpoints or changing request format.

---

## Data Flow: Request to Response

Let's trace what happens when you submit a review:

### Step 1: User Types Architecture

```
User types: "Single AZ deployment with EC2 instances"
```

### Step 2: Frontend Validates

```typescript
// ReviewForm.tsx
if (designText.length < 50) {
  alert("Too short!");
  return;
}
```

### Step 3: Frontend Calls API

```typescript
// lib/api.ts
fetch("http://localhost:8000/review", {
  method: "POST",
  body: JSON.stringify({
    design_text: "Single AZ deployment with EC2 instances",
    format: "text",
    tone: "standard"
  })
})
```

### Step 4: Backend Receives Request

```python
# backend/app/api/review.py
@router.post("/review")
async def review_architecture(request: ReviewRequest):
    # Pydantic validates: ✅ design_text is string
    # Pydantic validates: ✅ tone is "standard" or "roast"
    # Pydantic validates: ✅ format is "text" or "markdown"
```

### Step 5: Backend Analyzes

```python
# backend/app/services/rag.py
design_lower = "single az deployment with ec2 instances"

if "single az" in design_lower:
    risks.append(RiskItem(
        id="REL-001",
        title="Single Availability Zone Deployment",
        severity="HIGH",
        pillar="reliability",
        # ...
    ))

score = 100 - 15 = 85  # -15 for HIGH severity
```

### Step 6: Backend Returns Response

```json
{
  "review_id": "review-abc123",
  "architecture_score": 85,
  "risks": [
    {
      "id": "REL-001",
      "title": "Single Availability Zone Deployment",
      "severity": "HIGH",
      "pillar": "reliability",
      "impact": "Service unavailable during AZ failure",
      "finding": "Architecture uses single AZ",
      "remediation": "Deploy across multiple AZs",
      "references": ["https://..."]
    }
  ],
  "summary": "Found 1 issue in reliability pillar",
  "tone": "standard",
  "created_at": "2026-01-21T12:00:00Z"
}
```

### Step 7: Frontend Displays Results

```typescript
// ReviewResults.tsx
<ScoreGauge score={85} />  // Circular progress: 85%
<RiskCard risk={risks[0]} />  // Orange HIGH badge
```

### Step 8: User Sees Beautiful Report

```
┌─────────────────────┐
│   Score: 85/100     │  (Circular gauge, yellow)
│   Good              │
└─────────────────────┘

┌─────────────────────────────────────┐
│ [HIGH] Single Availability Zone     │
│ Pillar: Reliability                 │
│                                     │
│ Finding: Uses single AZ             │
│ Remediation: Deploy across AZs      │
│ References: AWS Docs →              │
└─────────────────────────────────────┘
```

---

## Key Concepts Explained

### 1. Pydantic Models (Type Safety)

**Problem**: How do you make sure requests are valid?

**Bad Way**:
```python
def review(data):
    design = data.get("design_text")
    if not design:
        return {"error": "missing design_text"}
    if not isinstance(design, str):
        return {"error": "design_text must be string"}
    # ... 50 more lines of validation
```

**Pydantic Way**:
```python
class ReviewRequest(BaseModel):
    design_text: str
    tone: Literal["standard", "roast"] = "standard"

@router.post("/review")
def review(request: ReviewRequest):
    # If we get here, request is GUARANTEED to be valid!
    # Pydantic already checked everything
```

**Magic**: Pydantic automatically:
- Validates types (string, int, etc.)
- Checks required fields
- Enforces literal values
- Converts types if possible
- Returns clear error messages

### 2. React State (Remembering Things)

**Problem**: How do you remember data between renders?

**Solution**: `useState` hook

```typescript
const [count, setCount] = useState(0);

// To read: count
// To update: setCount(1)
```

**Example in Tesseric**:
```typescript
const [review, setReview] = useState(null);

// After API call:
setReview(data);  // Save results

// Now "review" has the data everywhere in the component
```

**Important**: When you call `setReview()`, React re-renders the component with new data!

### 3. TypeScript Types (Catching Errors Early)

**Problem**: JavaScript lets you do dumb things:

```javascript
const score = "85";
const doubled = score * 2;  // "85" * 2 = 170 (WAT?)
```

**TypeScript catches this**:
```typescript
const score: number = "85";  // ❌ ERROR: string is not number
```

**In Tesseric**:
```typescript
interface ReviewResponse {
  architecture_score: number;  // Must be number
  risks: RiskItem[];           // Must be array of RiskItem
  tone: "standard" | "roast";  // Must be exactly these values
}

// Now TypeScript won't let you mess up:
review.architecture_score = "85";  // ❌ ERROR
review.tone = "friendly";          // ❌ ERROR: not "standard" or "roast"
```

### 4. Async/Await (Waiting for Things)

**Problem**: API calls take time. You can't block the browser.

**Old Way (Callback Hell)**:
```javascript
fetch("/review").then(response => {
  response.json().then(data => {
    console.log(data);  // Nested callbacks = messy
  });
});
```

**Modern Way (Async/Await)**:
```typescript
async function getReview() {
  const response = await fetch("/review");
  const data = await response.json();
  console.log(data);  // Clean, sequential
}
```

**In Tesseric**:
```typescript
const handleSubmit = async (request: ReviewRequest) => {
  setLoading(true);                        // 1. Show loading
  const result = await submitReview(request);  // 2. Wait for API
  setReview(result);                       // 3. Show results
  setLoading(false);                       // 4. Hide loading
};
```

### 5. Tailwind CSS (Utility Classes)

**Problem**: CSS files get huge and messy.

**Old Way**:
```css
/* styles.css */
.my-button {
  background-color: blue;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
}
```

**Tailwind Way**:
```html
<button className="bg-blue-500 text-white px-6 py-3 rounded-lg">
  Click Me
</button>
```

**In Tesseric**:
- `bg-primary` = Background is primary color (blue)
- `text-foreground` = Text is foreground color (changes with theme)
- `px-4 py-2` = Padding: 4 on x-axis (left/right), 2 on y-axis (top/bottom)
- `rounded-lg` = Large border radius (rounded corners)
- `hover:bg-accent` = On hover, background changes to accent color

**Theme Colors**:
```css
:root {
  --primary: hsl(221, 83%, 53%);  /* Blue */
}

.dark {
  --primary: hsl(217, 91%, 60%);  /* Lighter blue for dark mode */
}
```

All Tailwind classes like `bg-primary` automatically use these CSS variables!

### 6. Component Props (Passing Data)

**Problem**: How do you pass data from parent to child component?

**Solution**: Props (like function parameters)

```typescript
// Parent component
<ReviewResults review={myReviewData} />

// Child component
function ReviewResults({ review }: { review: ReviewResponse }) {
  // Can now use "review" here
  return <div>{review.summary}</div>
}
```

**In Tesseric**:
```typescript
// page.tsx passes data to ReviewResults
<ReviewResults
  review={review}
  onToggleTone={handleToggleTone}
  currentTone={currentTone}
  loading={loading}
/>

// ReviewResults.tsx receives it
function ReviewResults({ review, onToggleTone, currentTone, loading }) {
  // Use the data
  console.log(review.architecture_score);

  // Call parent's function
  onToggleTone();  // This calls handleToggleTone in page.tsx
}
```

**Key Point**: Data flows DOWN (parent → child), events flow UP (child → parent via callbacks).

---

## Common Patterns Used

### Pattern 1: Loading States

**Every async operation has 3 states**:

```typescript
// 1. Initial (not started)
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState(null);

async function fetchData() {
  // 2. Loading (in progress)
  setLoading(true);
  setError(null);

  try {
    const result = await api.call();
    // 3. Success
    setData(result);
  } catch (err) {
    // 3. Error
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

// UI based on state:
if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (data) return <Results data={data} />;
return <InitialState />;
```

### Pattern 2: Conditional Rendering

**Show different things based on state**:

```typescript
{!review && <ReviewForm />}        // No results yet → Show form
{review && <ReviewResults />}      // Have results → Show results
{error && <ErrorMessage />}        // Have error → Show error
```

### Pattern 3: Environment Variables

**Different settings for dev vs prod**:

```bash
# .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:8000

# .env.production (production)
NEXT_PUBLIC_API_URL=https://api.tesseric.ca
```

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
```

### Pattern 4: Error Boundaries

**Catch errors and show nice messages**:

```typescript
try {
  await dangerousOperation();
} catch (error) {
  console.error("Something went wrong:", error);
  alert("Please try again later");
}
```

### Pattern 5: Optimistic Updates

**Show result immediately, fix if it fails**:

```typescript
// Immediately update UI
setCurrentTone(newTone);

// Then call API in background
await handleSubmit(updatedRequest);

// If it fails, revert
if (error) {
  setCurrentTone(oldTone);
}
```

---

## Where to Start Reading Code

### If You're New to Backend:

1. Start here: `backend/app/main.py`
   - See how FastAPI app is created
   - See what routers are registered

2. Then: `backend/app/api/health.py`
   - Simplest endpoint (just returns JSON)
   - Understand `@router.get()`

3. Then: `backend/app/models/request.py`
   - See Pydantic model
   - Understand validation

4. Then: `backend/app/services/rag.py`
   - See the pattern matching logic
   - Understand how risks are generated

5. Finally: `backend/app/api/review.py`
   - See how it all connects

### If You're New to Frontend:

1. Start here: `frontend/app/page.tsx`
   - See the main page structure
   - See state management (`useState`)
   - See `handleSubmit` function

2. Then: `frontend/lib/api.ts`
   - See how API calls work
   - Understand `fetch()` and error handling

3. Then: `frontend/components/ReviewForm.tsx`
   - See form handling
   - See validation
   - See input modes

4. Then: `frontend/components/ReviewResults.tsx`
   - See how results are displayed
   - See the ScoreGauge component
   - See RiskCard component

5. Finally: `frontend/components/ThemeProvider.tsx`
   - See how themes work
   - See localStorage usage

### Debugging Tips

**Backend Issues**:
```bash
# See all API requests
uvicorn app.main:app --reload --log-level debug

# Run single test
pytest tests/test_review.py -v -s

# Check if endpoint is reachable
curl http://localhost:8000/health
```

**Frontend Issues**:
```bash
# Clear Next.js cache
rm -rf .next && npm run dev

# Check browser console (F12)
# Look for errors or API failures

# Test API call manually
curl -X POST http://localhost:8000/review -H "Content-Type: application/json" -d '{"design_text":"test","tone":"standard"}'
```

---

## Quick Reference: Common Tasks

### Add New Pattern Detection

**File**: `backend/app/services/rag.py`

```python
# Add new pattern check
if "no monitoring" in design_lower:
    risks.append(RiskItem(
        id="OPS-001",
        title="No Monitoring Configured",
        severity="MEDIUM",
        pillar="operational_excellence",
        impact="Can't detect issues",
        finding="No CloudWatch/monitoring mentioned",
        remediation="Set up CloudWatch alarms",
        references=["https://..."]
    ))
```

### Add New Input Field

**Files**:
1. `backend/app/models/request.py` (add to model)
2. `frontend/lib/api.ts` (add to TypeScript interface)
3. `frontend/components/ReviewForm.tsx` (add input field)

```python
# Backend
class ReviewRequest(BaseModel):
    design_text: str
    new_field: str  # Add this
```

```typescript
// Frontend
interface ReviewRequest {
  design_text: string;
  new_field: string;  // Add this
}
```

### Change Theme Colors

**File**: `frontend/app/globals.css`

```css
:root {
  --primary: hsl(221, 83%, 53%);  /* Change this */
}

.dark {
  --primary: hsl(217, 91%, 60%);  /* And this */
}
```

---

## Conclusion

This document should help you understand:
- ✅ How the backend works (FastAPI, Pydantic, pattern matching)
- ✅ How the frontend works (Next.js, React, TypeScript)
- ✅ How they communicate (REST API with JSON)
- ✅ Key concepts (state, async, types, themes)
- ✅ Where to start reading code
- ✅ How to make common changes

**Remember**:
- Backend = "What problems exist?"
- Frontend = "Show problems beautifully"
- They talk via JSON over HTTP

**Next Steps**:
- Read the actual code files (start with the suggested order)
- Run the app and use Chrome DevTools to see requests
- Make small changes and see what happens
- Ask questions about specific parts you don't understand

---

**Last Updated**: 2026-01-21
**Update this file**: When making major architecture changes or adding new patterns
