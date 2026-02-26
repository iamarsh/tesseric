# Speed Optimization Guide - Tesseric

**Last Updated**: 2026-02-26
**Current Performance**:
- Text reviews: ~2-4 seconds
- Image reviews: ~8-12 seconds (3 sequential Bedrock calls)

---

## 🎯 Current Bottlenecks

### Image Processing Pipeline (3 Sequential API Calls)
1. **Validation Call** (~2-3s): Check if image is architecture diagram
2. **Vision Extraction** (~3-5s): Extract text description from image
3. **Analysis Call** (~2-4s): Analyze the extracted architecture
4. **Background Graph Write** (~500ms): Write to Neo4j (non-blocking)

**Total**: ~8-12 seconds for image reviews

### Text Processing Pipeline (1 API Call)
1. **Analysis Call** (~2-4s): Direct analysis
2. **Background Graph Write** (~500ms): Non-blocking

**Total**: ~2-4 seconds for text reviews

---

## ⚡ Optimization Strategies

### 1. Model Optimization ⭐ **QUICK WIN**

#### Current Setup
```python
# Text analysis: Claude 3.5 Haiku (fastest)
bedrock_model_id: str = "anthropic.claude-3-5-haiku-20241022-v1:0"

# Vision extraction: Claude 3.5 Sonnet v2 (slower, but required for vision)
bedrock_vision_model_id: str = "us.anthropic.claude-3-5-sonnet-20241022-v2:0"
```

#### Optimization
- ✅ **Already using fastest models available**
- ✅ **Using cross-region inference profile** (`us.` prefix) for better routing
- ⚠️ **No Claude 3.5 Haiku with vision yet** - must use Sonnet for images

**Impact**: Already optimized, ~0% improvement possible

---

### 2. Combine Validation + Extraction ⭐ **HIGH IMPACT**

#### Current Flow (2 Separate Calls)
```python
# Call 1: Is this an architecture diagram?
validation = bedrock.validate_architecture_diagram(image)

# Call 2: Extract architecture description
description = bedrock.extract_architecture_from_image(image)
```

#### Optimized Flow (1 Combined Call)
```python
# Single call: Extract AND validate in one prompt
result = bedrock.extract_and_validate_architecture(image)
# Returns: {is_valid: bool, description: str, confidence: float}
```

**Prompt Example**:
```
Analyze this image:
1. Is it an AWS architecture diagram? (yes/no)
2. If yes, extract all AWS services, configurations, and connections
3. If no, explain what type of image it is

Format response as JSON:
{
  "is_architecture": true/false,
  "confidence": 0.0-1.0,
  "description": "extracted architecture details...",
  "reason": "why this is/isn't an architecture diagram"
}
```

**Expected Speedup**: **25-30% faster** (eliminates 1 API call)
**Implementation**: `backend/app/services/bedrock.py` - merge validation + extraction functions

---

### 3. Image Preprocessing Optimization 🔧 **MEDIUM IMPACT**

#### Current
```python
max_image_size_mb: int = 5  # Maximum file size
# Resize logic in validate_and_process_image()
```

#### Optimizations
1. **More aggressive resizing**:
   ```python
   # Current: Preserve quality, minimal resizing
   # Optimized: Aggressive resizing to 1024px max dimension
   max_dimension = 1024  # Down from ~2048
   ```

2. **Image compression**:
   ```python
   from PIL import Image

   # Reduce JPEG quality for faster upload/processing
   img.save(output, format='JPEG', quality=75, optimize=True)
   ```

3. **Format conversion**:
   ```python
   # Convert all images to JPEG (smaller than PNG)
   if format == 'png':
       img = img.convert('RGB')
       format = 'jpeg'
   ```

**Expected Speedup**: **10-15% faster** (smaller payloads, faster uploads)
**Trade-off**: Slightly lower image quality (acceptable for diagram analysis)

---

### 4. Parallel Processing Where Possible 🚀 **FUTURE**

#### Current Sequential Flow
```
Image Upload → Validation → Extraction → Analysis → Response
   (blocking)    (~3s)        (~4s)       (~3s)
```

#### Potential Parallel Flow
```
Image Upload → [Validation + Knowledge Base Retrieval in parallel]
                      ↓                    ↓
                 Wait for both → Analysis → Response
```

**Challenge**: Validation must complete before extraction (can't extract non-architecture)
**Opportunity**: Knowledge base retrieval could happen in parallel with validation

**Expected Speedup**: **5-10% faster**
**Complexity**: High (requires architectural changes)

---

### 5. Response Streaming 📡 **FUTURE**

#### Current
```python
# Wait for full response, then return
response = await bedrock.generate(prompt)
return response  # User sees nothing until complete
```

#### Optimized (Streaming)
```python
# Stream response tokens as they arrive
async for chunk in bedrock.generate_stream(prompt):
    yield chunk  # User sees progressive results
```

**Expected Speedup**: **Perceived 50-70% faster** (results visible immediately)
**Implementation**: Requires:
- Bedrock API: `invoke_model_with_response_stream()`
- Frontend: Server-Sent Events (SSE) or WebSockets
- Backend: Async generators

**Example**:
```python
from fastapi.responses import StreamingResponse

@router.post("/review-stream")
async def review_stream(...):
    async def generate():
        async for chunk in bedrock.generate_stream(prompt):
            yield f"data: {json.dumps(chunk)}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
```

---

### 6. Prompt Optimization ✍️ **QUICK WIN**

#### Vision Extraction Prompt (Current)
```python
"Extract the AWS architecture from this diagram. Describe all services,
configurations, and connections you can identify."
```

#### Optimized (More Focused)
```python
"List AWS services and connections in this diagram:
- Services: [name, configuration]
- Connections: [from → to, protocol]
Keep it concise."
```

**Why Faster**:
- Shorter prompt = fewer input tokens
- Focused instructions = shorter output
- Bullet format = structured, predictable output

**Expected Speedup**: **5-10% faster** (fewer tokens processed)

---

### 7. Caching Strategy 💾 **MEDIUM IMPACT**

#### Image Hash Caching
```python
import hashlib

def get_image_hash(image_data: bytes) -> str:
    return hashlib.sha256(image_data).hexdigest()

# Cache extracted descriptions
cache_key = f"vision:{get_image_hash(image_data)}"
cached = redis.get(cache_key)
if cached:
    return cached  # Skip Bedrock call entirely
```

#### Benefits
- Identical images (re-uploads): **100% faster** (instant response)
- Similar architectures: No benefit (different hash)

#### Implementation
```python
# Add to backend/app/services/bedrock.py
from functools import lru_cache
from app.core.cache import get_cache

@lru_cache(maxsize=100)  # In-memory for small scale
async def extract_with_cache(image_hash: str, image_data: str):
    # Check cache, call Bedrock if miss
    ...
```

**Expected Speedup**: **0-100%** depending on cache hit rate
**Trade-off**: Requires Redis or in-memory cache

---

### 8. Infrastructure Optimization 🏗️ **PRODUCTION ONLY**

#### AWS Region Selection
```python
# Current
aws_region: str = "us-east-2"

# Optimization: Use closest region to user
# - us-east-1: Most Bedrock capacity (fastest)
# - Cross-region inference profiles: Already using (us. prefix)
```

#### Bedrock Provisioned Throughput
```
# On-demand (current): Pay per token, variable latency
# Provisioned: Fixed cost, guaranteed throughput, 50% faster

Cost: $X/hour for reserved capacity
Use case: High-volume production (1000+ requests/hour)
```

**Expected Speedup**: **20-50% faster** in production
**Cost**: Significant ($hundreds/month minimum)

---

## 📊 Recommended Implementation Order

### Phase 1: Quick Wins (1-2 hours) ⭐
1. ✅ **Fix inference profile** (DONE - `us.anthropic...`)
2. **Combine validation + extraction** into single call
3. **Optimize prompts** (shorter, more focused)
4. **Aggressive image resizing** (1024px max)

**Expected Total Speedup**: **30-40% faster**

### Phase 2: Medium Effort (4-6 hours)
5. **Add in-memory caching** for duplicate images
6. **Image format optimization** (convert to JPEG)
7. **Knowledge base parallel retrieval**

**Expected Total Speedup**: **45-55% faster**

### Phase 3: Future Enhancements (2-3 days)
8. **Response streaming** (perceived instant results)
9. **Redis caching layer**
10. **Provisioned throughput** (production only)

**Expected Total Speedup**: **60-80% faster** + better UX

---

## 🧪 Benchmarking Current Performance

### Test Image Reviews (100 samples)
```python
# Run from backend/
pytest tests/test_performance.py -v

# Expected results (current):
# - p50 (median): ~8-10 seconds
# - p95: ~12-15 seconds
# - p99: ~18-20 seconds
```

### Test Text Reviews (100 samples)
```python
# Expected results (current):
# - p50 (median): ~2-3 seconds
# - p95: ~4-5 seconds
# - p99: ~6-8 seconds
```

---

## 📈 Monitoring Speed in Production

### CloudWatch Metrics
```python
# Add custom metric logging
import boto3
cloudwatch = boto3.client('cloudwatch')

cloudwatch.put_metric_data(
    Namespace='Tesseric/Performance',
    MetricData=[{
        'MetricName': 'ReviewProcessingTime',
        'Value': processing_time_ms,
        'Unit': 'Milliseconds',
        'Dimensions': [
            {'Name': 'InputType', 'Value': 'image'},
            {'Name': 'Region', 'Value': 'us-east-2'},
        ]
    }]
)
```

### Target Metrics
- **Text reviews**: < 3 seconds (p95)
- **Image reviews**: < 8 seconds (p95)
- **Streaming**: First token < 1 second

---

## 🚀 Next Steps

1. **Implement Phase 1 optimizations** (30-40% speedup)
   - Merge validation + extraction
   - Optimize prompts
   - Aggressive image resizing

2. **Test with real images** from test-images/
   - Measure before/after times
   - Validate no quality degradation

3. **Update memory-bank/progress.md** with results

4. **Consider Phase 2** if Phase 1 is insufficient

---

**Questions?** See `backend/app/services/bedrock.py` for implementation details.
