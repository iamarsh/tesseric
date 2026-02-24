# Tesseric - Architectural Decision Records (ADRs)

**Last Updated**: 2026-02-23

## ADR Template

For future decisions, use this template:

```markdown
## ADR-XXX – [Title]
**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-YYY
**Decision**: What we decided
**Rationale**: Why we decided it
**Consequences**: What this means for the codebase/operations
**Alternatives Considered**: What we didn't choose and why
```

---

## ADR-001 – Amazon Bedrock vs External LLM APIs

**Date**: 2026-01-21
**Status**: Accepted

**Decision**: Use Amazon Bedrock exclusively for RAG and generation. Do not use OpenAI, Anthropic direct API, or other external LLM providers.

**Rationale**:
- **AWS Integration**: Bedrock is native to AWS ecosystem (IAM roles, VPC endpoints, CloudWatch)
- **SAA Alignment**: Deep learning opportunity for AWS Solutions Architect certification
- **Compliance**: Single provider simplifies data residency and compliance (all data stays in AWS)
- **Knowledge Bases**: Bedrock KB feature provides managed RAG without running vector DB
- **Cost Transparency**: AWS billing consolidated (vs multiple vendors)
- **Model Choice**: Bedrock supports Claude 3 (Anthropic models) plus others if needed

**Consequences**:
- Locked into AWS; cannot easily switch to OpenAI/etc. without major refactor
- Bedrock pricing may be higher than direct API calls (marginal difference)
- Regional availability: must use Bedrock-supported regions (us-east-1, us-west-2, etc.)
- Future: can add adapter pattern if multi-LLM support becomes critical

**Alternatives Considered**:
- **OpenAI API**: More popular, but external dependency, no native RAG
- **Anthropic Direct API**: Same models as Bedrock but external, no AWS integration
- **Self-hosted (Ollama, llama.cpp)**: Too much ops overhead, lower quality

---

## ADR-002 – Bedrock Knowledge Bases vs Custom Vector Store

**Date**: 2026-01-21
**Status**: Accepted

**Decision**: Use Bedrock Knowledge Bases (with OpenSearch Serverless) for v0.1-v1.0. Do not self-host vector DB (Pinecone, FAISS, pgvector).

**Rationale**:
- **Managed Service**: No infra to maintain (indexing, embeddings, scaling)
- **Simplicity**: Upload docs to S3 → Bedrock handles chunking, embedding, indexing
- **AWS Native**: Same IAM/VPC story as Bedrock models
- **Cost at Scale**: OpenSearch Serverless auto-scales; cheaper than managing EC2/RDS for vector DB at low volume
- **Time to Value**: Faster to MVP vs setting up self-hosted solution

**Consequences**:
- Locked into Bedrock KB feature; migration to custom store requires rewrite
- Chunking strategy controlled by Bedrock (limited customization)
- Pricing: Pay per OCU (OpenSearch Capacity Units) even at low usage (~$700/month minimum for OpenSearch Serverless, but Bedrock KB abstracts this)
- Future: If specialized retrieval needed (e.g., graph-based), may need custom store

**Alternatives Considered**:
- **Pinecone**: Popular, fast, but external SaaS (compliance risk, cost)
- **pgvector (Postgres)**: Good for small scale, but ops overhead (backups, scaling)
- **FAISS (self-hosted)**: Requires EC2 or Lambda, state management complexity
- **Chroma/Weaviate**: Good OSS options, but more infra to manage

**Future Review**: If Bedrock KB costs exceed $500/month, re-evaluate pgvector on RDS.

---

## ADR-003 – AWS App Runner vs ECS Fargate vs Lambda

**Date**: 2026-01-21
**Status**: Accepted

**Decision**: Use AWS App Runner for v0.1 deployment (first cloud deployment). Evaluate ECS Fargate for v1.0+ if scaling needs increase.

**Rationale**:
- **Simplicity**: App Runner is "Dockerfile → HTTPS endpoint" with minimal config
- **Cost**: At low volume (<1000 requests/day), App Runner cheaper than ECS + ALB (~$10-30/month)
- **Auto-Scaling**: Built-in based on requests (no need to configure ASG)
- **HTTPS**: Free TLS certs, automatic cert renewal
- **Time to Deploy**: Fastest path from code to production

**Consequences**:
- Less control over networking (VPC integration limited vs ECS)
- No direct access to underlying EC2 instances (less debugging flexibility)
- Region support: App Runner not available in all regions (but available in us-east-1)
- Future: If we need private VPC-only access or >5 GB RAM, migrate to ECS

**Alternatives Considered**:
- **ECS Fargate**: More control, better for complex networking, but requires ALB setup (~$20/month baseline)
- **Lambda**: Great for serverless, but FastAPI + cold starts = poor UX; better for async workers
- **EC2**: Too much ops overhead (patching, scaling, monitoring); not cost-effective for MVP

**Decision Criteria for Migration to ECS**:
- Traffic exceeds 10,000 requests/day
- Need private VPC-only backend (no internet-facing endpoints)
- Need >4 GB RAM per task (Bedrock calls become memory-intensive)

---

## ADR-004 – DynamoDB vs Postgres for Review History

**Date**: 2026-01-21
**Status**: Accepted (with v0.1 exception)

**Decision**:
- **v0.1**: No storage (stateless API only)
- **v1.0**: DynamoDB for review history
- **v1.1+**: Re-evaluate Postgres if complex querying needed

**Rationale for DynamoDB**:
- **Serverless**: No instance to manage, auto-scales to zero
- **Cost at Low Volume**: Free tier (25 GB storage, 25 RCU/WCU), then pay-per-request
- **AWS Native**: Works well with IAM, VPC endpoints, CloudWatch
- **Simple Access Pattern**: Reviews accessed by `review_id` (primary key) or `user_id` + `timestamp` (GSI)
- **Performance**: Single-digit ms latency for key-based lookups

**Consequences**:
- Limited querying: can't easily do "find all reviews mentioning 'S3'" without scanning
- No JOINs: if we add relational data (teams, comments), need multiple tables + client-side joins
- DynamoDB pricing complexity: need to monitor RCU/WCU usage vs On-Demand

**Alternatives Considered**:
- **Postgres (RDS/Aurora Serverless v2)**: Better for complex queries, but minimum cost ~$50-100/month
- **SQLite**: Great for local dev, but not suitable for production (no multi-user concurrency)

**Table Schema (v1.0)**:
```
Table: reviews
- PK: review_id (string, UUID)
- SK: (not used in v1.0)
- Attributes: user_id, design_text, response_json, tone, created_at, architecture_score

GSI: user_id-created_at-index
- PK: user_id
- SK: created_at (for sorting by time)
```

**Future**: If we add features like "search reviews by keyword" or "compare reviews across teams," migrate to Postgres.

---

## ADR-005 – Tone Modes (Standard vs Roast)

**Date**: 2026-01-21
**Status**: Accepted

**Decision**: Implement two tone modes ("standard" and "roast") as **prompt variants**, not separate models or analysis pipelines. The underlying risk assessment is identical; only the wording differs.

**Rationale**:
- **Quality Consistency**: Same risks, same scoring, same recommendations → reliable
- **Simplicity**: Single RAG pipeline, single Bedrock call, just change system prompt
- **User Choice**: Some users want professional feedback, others want direct/humorous
- **Differentiation**: Sets Tesseric apart from generic ChatGPT (intentional tone engineering)

**Consequences**:
- Must carefully engineer prompts to ensure "roast" mode is funny but not offensive
- Need examples/testing to ensure tone shift doesn't degrade technical quality
- Both modes must return **identical structure** (same JSON schema)

**Prompt Strategy**:
- **Standard Tone**:
  - System prompt: "You are a professional AWS Solutions Architect. Provide clear, respectful, actionable feedback aligned with Well-Architected Framework."
  - Example: "This architecture uses a single Availability Zone, which may result in service unavailability during AZ-level failures."

- **Roast Tone**:
  - System prompt: "You are a direct, no-nonsense AWS architect who tells it like it is. Be humorous but technically accurate. Roast bad decisions, praise good ones."
  - Example: "Single AZ? Bold move. Hope you enjoy explaining to your CEO why the site is down every time AWS sneezes in us-east-1a."

**Future**: Consider adding a third tone ("educational") that explains *why* best practices matter (for junior devs learning AWS).

**Alternatives Considered**:
- Separate models: wasteful, doubles cost, no quality benefit
- Separate RAG pipelines: unnecessarily complex
- User-editable tone via slider: too vague, unpredictable results

---

## ADR-006 – Python 3.11+ as Minimum Version

**Date**: 2026-01-21
**Status**: Accepted

**Decision**: Require Python 3.11+ for backend. Do not support Python 3.10 or earlier.

**Rationale**:
- **Performance**: 3.11 has 10-25% speed improvements over 3.10 (faster startup, better asyncio)
- **Type Hints**: Better support for modern typing features (Self, LiteralString, etc.)
- **Library Compatibility**: All major libs (FastAPI, Pydantic v2, boto3) support 3.11+
- **Stability**: 3.11 released Oct 2022, mature and stable
- **Not Bleeding Edge**: 3.12 is newer but some libs still catching up; 3.11 is sweet spot

**Consequences**:
- Users must have 3.11+ installed (most devs on 3.11 or 3.12 by 2024+)
- AWS Lambda supports 3.11 (if we add Lambda workers later)
- Docker base image: `python:3.11-slim` (smaller than 3.12, widely tested)

**Alternatives Considered**:
- **Python 3.10**: Wider compatibility, but missing perf gains and some type features
- **Python 3.12**: Latest features, but some libs (especially AWS SDK extensions) lag

---

## ADR-007 – Tailwind CSS for Frontend Styling

**Date**: 2026-01-21
**Status**: Accepted

**Decision**: Use Tailwind CSS for all frontend styling. Do not use plain CSS, CSS modules, or component libraries like Material-UI / Chakra.

**Rationale**:
- **Rapid Development**: Utility-first approach = fast prototyping
- **Small Bundle**: Tailwind purges unused classes; final CSS typically <10 KB
- **Next.js Integration**: Official Next.js support, works seamlessly with App Router
- **Popularity**: Industry standard, easy to hire for, good documentation
- **Customization**: Easy to extend theme for brand colors (future: Tesseric teal/blue)

**Consequences**:
- HTML can look cluttered with many class names (trade-off for speed)
- Team must learn Tailwind utilities (but very quick to pick up)
- No pre-built components (like Material-UI), but we want custom design anyway

**Alternatives Considered**:
- **Plain CSS**: Full control, but slow for rapid iteration
- **CSS Modules**: Better scoping, but verbose for utility classes
- **shadcn/ui + Tailwind**: Beautiful components, but adds complexity; v0.1 doesn't need fancy UI

**Future**: If we want premium UI for v1.0, consider adding **shadcn/ui** components on top of Tailwind base.

---

## ADR-008 – Include Sample Well-Architected Docs in Repo

**Date**: 2026-01-21
**Status**: Accepted

**Decision**: Include 3-4 sample markdown files with AWS Well-Architected excerpts in `docs/well-architected-samples/` for local testing. These are NOT used in production (v1.0+ uses real Bedrock KB).

**Rationale**:
- **v0.1 Tangibility**: Makes MVP feel more real; can reference sample docs in stubbed RAG
- **Testing**: Provides example content for validating chunking/retrieval in Phase 1
- **Learning**: Contributors can see Well-Architected structure by reading samples

**Consequences**:
- Repo size increases slightly (~20-50 KB of markdown)
- Must ensure samples are publicly shareable (AWS docs are public, no licensing issue)
- Clear documentation that these are SAMPLES only, not production knowledge base

**Alternatives Considered**:
- No sample content: cleaner repo, but v0.1 feels less complete
- Full Well-Architected dump: too large (hundreds of MB), overkill for v0.1

---

## ADR-009 – Keep .env.local for Local Git Operations

**Date**: 2026-01-21
**Status**: Accepted

**Decision**: Keep `.env.local` file on disk (with GitHub PAT) but add to `.gitignore`. Do not delete or move to git credential helper (yet).

**Rationale**:
- **User Preference**: User confirmed they want to keep for local git operations
- **Security**: `.gitignore` prevents accidental commit
- **Convenience**: Avoids reconfiguring GitHub CLI or credential helper mid-project

**Consequences**:
- Risk of accidental commit if `.gitignore` is removed (mitigated by multiple reminders)
- File remains on disk; anyone with filesystem access can read token

**Alternatives Considered**:
- **Delete file**: More secure, but requires reconfiguring git auth
- **GitHub CLI**: Better long-term, but adds setup friction for user

**Future**: Migrate to GitHub CLI (`gh auth login`) once project stabilizes.

---

## ADR-010 – Claude.md Git-Ignore Strategy

**Date**: 2026-01-21
**Status**: Accepted

**Decision**: Move `Claude.md` (AI working contract) to `.gitignore` and keep it local-only, similar to `memory-bank/` directory.

**Rationale**:
- **Privacy**: Contains internal development notes, session workflows, and personal preferences not relevant to public repo
- **Flexibility**: Can update working contract without polluting git history with frequent minor edits
- **Consistency**: Aligns with memory-bank approach (local brain, not public docs)
- **Regenerability**: If new developers need guidance, they can create their own working contract or refer to public README

**Consequences**:
- New contributors won't see Claude.md (but can read public README and docs/)
- Must be recreated if cloning repo fresh (not a problem; it's personal)
- Git history will show Claude.md removal but file remains on disk for current user

**Alternatives Considered**:
- **Keep in repo**: Transparent but clutters public repo with internal AI assistant notes
- **Move to docs/**: Could work but mixes internal workflow with user-facing docs

---

## ADR-011 – Documentation Update Policy

**Date**: 2026-01-21
**Status**: Accepted

**Decision**: Establish a consistent rule to update all relevant documentation files (README, memory-bank, architecture-explained.md, progress.md) with every significant change to the codebase.

**Rationale**:
- **Knowledge Preservation**: Prevents documentation drift; future sessions have accurate context
- **Learning**: User requested educational docs; keeping them current is critical for learning
- **Consistency**: Reduces confusion when docs don't match code
- **Best Practice**: Industry standard for maintainable projects

**Consequences**:
- Slightly longer session time (5-10% overhead for doc updates)
- Requires discipline to update docs after every significant change
- Must define "significant change" (guidance: new files, API changes, architectural shifts, bug fixes affecting behavior)

**What to Update After Changes**:
1. **progress.md**: Mark tasks complete, add new tasks discovered
2. **architecture-explained.md**: Update if new components/patterns added
3. **decisions.log.md**: Add ADR if architectural decision made
4. **README.md**: Update if user-facing features or setup instructions change
5. **architecture.md**: Update if data models, endpoints, or AWS services change

**Alternatives Considered**:
- **Update docs only at milestones**: Simpler but risks documentation debt
- **Auto-generated docs**: Great for API docs (already have OpenAPI) but not for conceptual/learning content

---

## ADR-012 – Multi-Cloud Support with Inline Context (Path B)

**Date**: 2026-01-22
**Status**: Accepted

**Decision**: Implement multi-cloud architecture analysis (AWS, Azure, GCP, n8n, generic system design) using Claude 3.5 Haiku WITHOUT Knowledge Bases. Include best practices for all platforms directly in prompts (inline context approach).

**Rationale**:
- **Differentiation**: Sets Tesseric apart from ChatGPT (specialized multi-cloud expert knowledge vs generic responses)
- **Market Expansion**: Not limited to AWS-only customers; appeals to multi-cloud enterprises
- **Cost Efficiency**: Saves ~$700/month (no OpenSearch Serverless minimum OCU charge for Bedrock Knowledge Bases)
- **Model Choice**: Claude 3.5 Haiku is newest and cheapest option ($1/MTok input vs $3 for Sonnet), sufficient for structured analysis tasks with inline context
- **Flexibility**: Modern engineers use multiple clouds; tool should support their reality
- **Learning Value**: User wants to learn AWS SAA but build marketable product
- **Time to Value**: Can start testing immediately without KB setup delays

**Consequences**:
- Prompt complexity increases (must include AWS + Azure + GCP + n8n best practices in single prompt)
- Limited to ~12K tokens of best practices context (vs theoretically unlimited KB retrieval)
- Must manually maintain best practices content (quarterly updates recommended)
- Platform detection logic needed to tailor responses appropriately
- Slightly higher per-request token cost (sending all context every time vs dynamic retrieval)
- If context needs exceed prompt limits (~100K chars), must migrate to KB or chunking strategy

**Cost Comparison**:
| Approach | Monthly Cost (1K reviews) | Per Review | Notes |
|----------|--------------------------|------------|-------|
| Path A (Bedrock KB) | $730+ | $0.73+ | OpenSearch Serverless minimum + Claude calls |
| Path B (Inline context) | $9 | $0.009 | Claude calls only (4K input + 1K output tokens) |
| ChatGPT Plus | $20/user | N/A | No API, no structured output, no multi-cloud specialization |

**Competitive Advantage Over ChatGPT**:
1. **Specialized Knowledge**: Curated, up-to-date best practices (2024+) for AWS, Azure, GCP, n8n
2. **Structured Output**: JSON with severity levels, pillars, remediation steps (vs unstructured paragraphs)
3. **Platform Detection**: Auto-detects cloud provider and tailors analysis
4. **Consistency**: Deterministic risk framework produces repeatable, reliable results
5. **Tone Flexibility**: Professional mode + Roast mode (same analysis, different presentation)
6. **Cost Transparency**: Per-review cost visibility and tracking
7. **Service-Specific**: Recommends actual services (e.g., "use Azure Key Vault" not "use secrets manager")

**Migration Plan**: If Phase 1 testing reveals:
- Context exceeds 100K characters (unlikely with curated content)
- Quality degrades due to context overload
- Need for dynamic retrieval based on architecture content
- Cost per review exceeds $0.02 (200% over target)

Then implement Bedrock Knowledge Bases in Phase 2 with platform-specific indices (AWS KB, Azure KB, GCP KB).

**Alternatives Considered**:
- **AWS-only focus (Path A-lite)**: Simpler prompts, easier to maintain, but limits addressable market and product differentiation
- **External vector DB (pgvector on RDS)**: More control over retrieval, but adds infrastructure complexity, costs ~$50/month minimum, requires manual embedding management
- **Multiple specialized models**: Use different models per platform (e.g., GPT-4 for Azure), but significantly higher cost and complexity
- **Hybrid approach**: KB for AWS, inline for others - introduces inconsistency and complexity

**Implementation Notes**:
- Use `build_analysis_prompt()` to construct platform-specific system prompts
- Platform detection via keyword matching (S3/EC2/Lambda → AWS, Blob/VMs/Functions → Azure, etc.)
- Graceful fallback to v0.1 pattern matching if Bedrock fails
- Token usage logging for cost tracking and optimization

**Success Metrics for Phase 1**:
- Cost per review ≤ $0.01
- Response time < 5 seconds for typical architecture descriptions
- Platform detection accuracy ≥ 95%
- User feedback: "Better than ChatGPT" for multi-cloud reviews

---

## ADR-013 – AWS-First Scope for v0.1 / v1.0

**Date**: 2026-01-22
**Status**: Accepted

**Decision**: v0.1 and v1.0 will focus exclusively on AWS architectures and AWS Well-Architected Framework. Multi-cloud support (Azure, GCP, n8n, generic) is deferred to Phase 3+ after AWS path is stable and validated.

**Rationale**:
- **Depth over breadth**: Deliver high-quality, credible AWS reviews that real AWS teams could use
- **Market focus**: AWS has largest cloud market share (~32% in 2024)
- **Portfolio value**: Demonstrable deep AWS expertise more valuable than shallow multi-cloud
- **Complexity management**: Multi-cloud adds significant prompt engineering and knowledge curation overhead
- **Validation first**: Prove single-cloud approach works before expanding scope
- **SAA alignment**: Project goal is AWS Solutions Architect Associate preparation; AWS-first is natural fit
- **Cost efficiency**: Inline AWS context (~6K tokens) is manageable; multi-cloud would require 20K+ tokens or complex provider switching

**Consequences**:
- v0.1/v1.0 code, prompts, and docs will be AWS-specific
- ReviewRequest schema includes `provider` field but only accepts "aws" in v1
- Frontend can assume AWS terminology (EC2, RDS, S3) in examples and placeholders
- Bedrock prompts optimized for AWS Well-Architected Framework (6 pillars)
- Multi-cloud requires future Phase 3 work: provider abstraction, new KBs, taxonomy mapping
- User expectations set: "AWS architecture reviewer" not "generic cloud tool"

**Future Migration Path**:
1. Extract AWS logic into `providers/aws/` module
2. Define common provider interface (analyze, map_findings, get_references)
3. Add `providers/azure/`, `providers/gcp/`, `providers/n8n/` modules
4. Update schema to accept multiple provider values
5. Implement provider detection if `provider` not specified
6. Expand inline context or migrate to Knowledge Bases for multi-cloud scale

**Alternatives Considered**:
- **Multi-cloud from day 1**: Too complex, dilutes quality, harder to validate, 3x token costs
- **Generic cloud-agnostic**: Loses specificity and credibility (becomes "yet another ChatGPT")
- **AWS-only forever**: Limits addressable market long-term; AWS-first with roadmap is better

**Related ADRs**:
- Supersedes ADR-012 (Multi-Cloud Support with Inline Context) for v1 scope
- ADR-012 remains valid as Phase 3+ roadmap intent (multi-cloud expansion after AWS stable)

---

## ADR-014 – Roast Mode Enhancement: Nuclear Level Brutality

**Date**: 2026-01-25
**Status**: Accepted

**Decision**: Enhance roast mode from "slightly sarcastic" to "ABSOLUTELY BRUTAL, personally insulting, and devastatingly savage" based on explicit user feedback.

**Rationale**:
- **User Feedback**: User explicitly stated: "We need to make roast mode more brutal. It needs to get more personal and talk more 'crap' about the proposed design. If there are issues, the response should amplify the issues and try to make a mockery of the attempt"
- **Product Differentiation**: Roast mode is a unique selling point; making it memorably brutal increases viral potential
- **Market Testing**: Need to validate if extreme roast mode resonates with target audience
- **Technical Accuracy Maintained**: Brutality doesn't compromise remediation quality; still provides actionable AWS fixes
- **User Choice**: Roast mode is opt-in; users who don't want it can use standard mode

**Consequences**:
- Roast mode may offend some users → Mitigated by clear tone selector and disclaimers
- Risk of viral negative feedback if users share offensive roasts → Balanced by potential viral positive feedback for humor
- Must ensure Claude doesn't refuse prompts for being "mean" → Test thoroughly with production model
- May need content warnings or "roast intensity" slider in future versions
- Creates memorable, shareable content that differentiates Tesseric from competitors

**Tone Evolution**:
- **Before (Session 2)**: "Bold strategy deploying to a single AZ. I also like to live dangerously when us-east-1a goes down."
- **After (Session 3a)**: "Single AZ deployment in 2026? Are you TRYING to get fired? Your disaster recovery plan is literally 'hope and pray.' Did you skip EVERY AWS training? When us-east-1a inevitably goes down, you'll be frantically updating your résumé while the business burns. Multi-AZ isn't rocket science—it's checkbox-level easy. This is embarrassing."

**Key Prompt Instructions Added**:
- "ABSOLUTELY BRUTAL, personally insulting, and devastatingly savage"
- "Question their competence, mock their decisions, and make them feel personally responsible"
- "Make it PERSONAL. Make it PAINFUL. Make it MEMORABLE."
- "Channel 'Gordon Ramsay + Linus Torvalds + the angriest AWS TAM who just got paged at 3 AM'"
- "Be savage enough that they'll remember this roast for years and NEVER make these mistakes again"

**Examples Provided**:
- Single AZ: "Are you TRYING to get fired?"
- No encryption: "Have you SEEN the news lately? This is a GDPR lawsuit speedrun."
- Over-provisioned: "m5.4xlarge for a BLOG?! Are you laundering money through AWS?"
- Public S3: "You've basically published a Google Map to your company's most sensitive data."
- No backups: "When (not if, WHEN) this data disappears, you'll be explaining to executives why you gambled the company's most valuable asset."

**Success Metrics**:
- Roast mode usage rate (% of reviews using roast vs standard)
- User feedback on roast mode intensity (too much, just right, not enough)
- Viral sharing of roast mode results (social media mentions)
- Churn rate for roast mode users vs standard mode users

**Future Considerations**:
- Add "Roast Intensity" slider (mild, medium, nuclear)
- Add content warnings before displaying roast results
- Track user sentiment and adjust if negative feedback exceeds 25%
- Consider "constructive roast" option (brutal but more educational)

**Related ADRs**:
- ADR-005: Original tone modes decision (standard vs roast)
- Supersedes Session 2 roast mode implementation (not formally an ADR)

---

## ADR-015 – Bedrock Vision Model Selection for Architecture Diagram Parsing
**Date**: 2026-01-31
**Status**: Accepted ✅
**Phase**: 2.1 - Image Upload & Diagram Parsing

**Context**:
Phase 2.1 requires accepting AWS architecture diagrams (PNG/JPG/PDF) and extracting architecture details using AI vision capabilities. Need to select appropriate Bedrock model for vision + extraction task.

**Decision**: Use Claude 3 Sonnet for vision extraction, Claude 3.5 Haiku for analysis

**Rationale**:
1. **Claude 3.5 Haiku does NOT support vision capabilities**
   - Only text input/output
   - Cannot process images directly
   - Would require external OCR solution (more complexity, lower quality)

2. **Claude 3 Sonnet has native vision support**
   - Can process images directly via Bedrock API
   - Model ID: `anthropic.claude-3-sonnet-20240229-v1:0`
   - Optimized for structured extraction tasks
   - Balance of cost and accuracy

3. **Vision as Preprocessing Step**
   - Extract architecture description from image using Sonnet
   - Feed extracted text to existing RAG pipeline (Haiku)
   - No changes to core analysis logic
   - Maintains quality consistency between text and image reviews

4. **Cost Analysis**:
   - Sonnet vision: $3/MTok input, $15/MTok output
   - Typical image: ~4K input tokens, ~800 output tokens
   - Cost: (4000 * $0.003 / 1000) + (800 * $0.015 / 1000) = ~$0.012 per extraction
   - Total review cost: $0.012 (vision) + $0.011 (analysis) = ~$0.023
   - **Under $0.05 budget target** ✅

5. **Alternatives Considered**:
   - **Claude 3 Opus**: More capable but 5x more expensive ($15/$75 per MTok)
   - **External OCR (Textract)**: Would miss visual context, layout understanding
   - **Claude 3.5 Sonnet** (newer): Similar capabilities, slightly different pricing (not available in Bedrock at time of implementation)

**Consequences**:

**Positive**:
- High-quality architecture extraction from diagrams
- Native Bedrock integration (no external services)
- Cost-efficient at ~$0.023 per diagram review
- Structured output format integrates seamlessly with existing pipeline
- Maintains same analysis quality for both text and image input

**Negative**:
- Requires two Bedrock API calls per image review (vision + analysis)
- Sonnet costs 2x Haiku for vision step
- No fallback for images (requires backend connection)
- Dependency on Bedrock vision availability

**Implementation Details**:
- Image processing: Validate, resize (max 2048px), base64 encode
- Vision prompt: Extract services, configurations, network topology
- Cost tracking: Separate metrics for vision vs analysis
- Error handling: Graceful degradation if extraction unclear

**Configuration** (`backend/app/core/config.py`):
```python
bedrock_model_id: str = "anthropic.claude-3-5-haiku-20241022-v1:0"  # Analysis
bedrock_vision_model_id: str = "anthropic.claude-3-sonnet-20240229-v1:0"  # Vision
vision_input_cost_per_1k: float = 0.003   # $3/MTok
vision_output_cost_per_1k: float = 0.015  # $15/MTok
```

**Success Criteria**:
- ✅ Extract >= 3 AWS services correctly from test diagrams
- ✅ Cost per diagram review < $0.05
- ✅ Vision extraction < 4 seconds
- ✅ Analysis quality matches text reviews

**Monitoring**:
- Track vision token usage separately from analysis
- Log total cost (vision + analysis) in metadata
- Monitor extraction accuracy via manual spot checks
- Alert if average cost exceeds $0.03 per review

**Future Considerations**:
- Evaluate Claude 3.5 Sonnet when available in Bedrock
- Consider Opus for complex multi-page diagrams if budget allows
- Add confidence scoring for extractions
- Support architectural diagram generation (reverse process)

**Related ADRs**:
- ADR-001: Bedrock vs External LLMs (decided Bedrock)
- ADR-013: AWS-First Scope (validates AWS diagram focus)

---

## ADR-016 – Architecture-First Visualization with Bidirectional Highlighting
**Date**: 2026-02-23
**Status**: Accepted ✅
**Phase**: 2.3 - Architecture-First Graph Visualization

**Context**:
Generic knowledge graphs show Analysis → Finding → Service relationships, which doesn't demonstrate credibility or help users understand where problems exist in their specific architecture. Users need to see:
1. Their actual architecture recreated using AWS service nodes with realistic topology
2. Visual indicators showing where security/reliability issues exist (red borders, severity badges)
3. Actionable findings presented as premium cards ordered by severity
4. Interactive highlighting to connect findings to affected services

**Decision**: Implement architecture-first visualization with 60/40 split layout, smart topology positioning, and bidirectional highlighting

**Rationale**:

1. **Credibility through Visualization**
   - Showing user's actual architecture proves AI understands the design
   - Visual problem indicators are more actionable than text lists
   - Premium aesthetic increases perceived value vs generic ChatGPT responses
   - Demonstrates production-ready UX for portfolio

2. **60/40 Split Layout**
   - 60% graph (top): User's focus is on their architecture first
   - 40% cards (bottom): Action items accessible without scrolling
   - Natural reading flow: see problem → see solution
   - Mobile-friendly: vertical stack maintains usability

3. **Bidirectional Highlighting**
   - Click service → highlight related finding cards
   - Click finding card → highlight affected services in graph
   - Smooth scroll coordination between sections
   - Provides interactive exploration vs static view

4. **Smart Topology Positioning**
   - Pattern detection: 3-tier, serverless, microservices
   - Layer-based positioning:
     - Layer 1 (Top): Edge services (CloudFront, ALB, Route 53)
     - Layer 2 (Middle): Compute (EC2, Lambda, ECS)
     - Layer 3 (Bottom): Data (RDS, DynamoDB, S3)
     - Layer 4 (Right): Cross-cutting (CloudWatch, IAM, KMS)
   - Realistic topology matches AWS architecture diagram conventions

5. **Visual Problem Indicators**
   - Severity-based borders: CRITICAL (red + pulse), HIGH (orange), MEDIUM (yellow), LOW (gray)
   - Finding count badges on affected services
   - Premium card design with hover effects and shadows
   - Collapsible remediation details to reduce cognitive load

**Consequences**:

**Positive**:
- ✅ Users immediately see where problems exist in their architecture
- ✅ Interactive exploration improves engagement and understanding
- ✅ Premium aesthetic differentiates from competitors
- ✅ Portfolio-ready UX demonstrates production skills
- ✅ Backward compatible: falls back to generic graph if no topology
- ✅ Mobile responsive: single column stack with touch-friendly interactions

**Negative**:
- ⚠️ More complex state management (shared selection between components)
- ⚠️ Requires accurate service extraction from findings (text-based matching)
- ⚠️ Performance considerations with large graphs (100+ services)
- ⚠️ Maintenance burden: layout algorithm needs tuning for edge cases

**Alternatives Considered**:

1. **Cards as Sidebar (50/50 split)**
   - Pros: See both simultaneously without scrolling
   - Cons: Cramped on mobile, cards too narrow for content, less focus on architecture
   - Rejected: Mobile UX suffers, violates "architecture-first" principle

2. **Tabs (Graph vs Cards)**
   - Pros: Simpler state management, full screen for each view
   - Cons: Loses bidirectional highlighting value, requires clicking to switch
   - Rejected: No visual connection between findings and affected services

3. **Overlay Cards on Graph**
   - Pros: Single view, no scrolling
   - Cons: Occludes graph, cluttered, poor mobile experience
   - Rejected: Reduces graph visibility, UX feels cramped

4. **Generic Graph Layout (dagre auto-layout)**
   - Pros: Automatic positioning, less code to maintain
   - Cons: Doesn't match AWS architecture conventions, unpredictable layout
   - Rejected: Generic layout doesn't demonstrate AWS expertise

**Implementation Details**:

**Frontend Components** (1,305 lines total):
- `ArchitectureViewer.tsx` (215 lines): Main orchestrator with 60/40 split
- `ActionFindingCard.tsx` (180 lines): Premium card component
- `GraphViewer.tsx` (290 lines): Updated with external selection state

**Backend Endpoint**:
- `GET /api/graph/{analysis_id}/architecture`: Returns services, connections, pattern
- Response includes finding counts and severity breakdowns per service

**State Management**:
- External vs internal selection state pattern
- `selectedServiceId` and `selectedFindingId` shared in ArchitectureViewer
- Map data structures for O(1) service ↔ finding lookups

**Tech Stack**:
- ReactFlow 11 for graph visualization
- Lucide React for icons (AlertTriangle, Shield, Activity)
- Tailwind CSS for styling (severity colors, animations, shadows)
- TypeScript for type safety

**Performance**:
- Graph render: ~100-200ms (ReactFlow optimization)
- Smooth scroll: `scrollIntoView({ behavior: "smooth" })`
- Mapping lookups: O(1) with Map data structures
- Mobile optimized: Touch-friendly, single column grid

**Success Criteria**:
- ✅ Services positioned in realistic layers matching architecture pattern
- ✅ CRITICAL findings trigger pulse animation on affected services
- ✅ Click service → relevant cards highlight and scroll into view
- ✅ Click card → affected services highlight in graph
- ✅ Mobile responsive: single column, graph above cards
- ✅ Premium aesthetic: shadows, borders, hover effects
- ✅ Backward compatible: generic graph if no topology

**Future Enhancements**:
- Minimap for large architectures (100+ services)
- Zoom controls and pan gestures
- Export graph as PNG/SVG
- Animated transitions between selection states
- Graph diff view (before/after architecture changes)
- Custom node icons using AWS official icon set

**Related ADRs**:
- ADR-013: AWS-First Scope (validates AWS service focus)
- ADR-007: Tailwind CSS (consistent styling approach)

---

## Next ADR: ADR-017

For future decisions (IaC parsing strategy, Terraform analysis, deployment architecture, etc.), add here following the template above.

---

**How to Use This Log**:
1. Before making significant decisions, check this log for prior art
2. When adding a new ADR, increment the number and follow the template
3. Update `Status` field if decisions are superseded (e.g., "Superseded by ADR-015")
4. Keep this file in sync with actual codebase (mark "Deprecated" if we diverge)
