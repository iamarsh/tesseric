# Rate Limiting Deployment Guide

## Overview

Tesseric implements per-endpoint rate limiting to prevent API abuse and demonstrate production-ready security practices. Rate limiting is powered by `slowapi` with support for both in-memory and Redis backends.

## Rate Limits

| Endpoint | Rate Limit | Purpose |
|----------|------------|---------|
| `/review` | 10 req/min per IP | Prevent AI analysis abuse (each costs ~$0.001-0.012) |
| `/api/metrics/*` | 60 req/min per IP | Dashboard and stats access |
| `/api/graph/*` | 30 req/min per IP | Knowledge graph visualization |
| `/health` | No limit | Monitoring and uptime checks |

## Local Development

### Default Configuration

By default, rate limiting uses **in-memory storage** for local development. No additional setup is required.

```bash
# Start server (rate limiting automatically enabled with in-memory storage)
uvicorn app.main:app --reload
```

### Testing Rate Limits Locally

```bash
# Run the test script
python test_rate_limit.py

# Or manually test with curl
for i in {1..15}; do
  curl -s http://localhost:8000/api/metrics/stats | jq '.total_reviews'
  echo "Request $i"
done
```

**Important**: Localhost requests (`127.0.0.1`, `::1`) automatically bypass rate limiting for development convenience.

## Production Deployment (Railway)

### Step 1: Add Redis Service

1. Go to your Railway project dashboard
2. Click "+ New" → "Database" → "Add Redis"
3. Railway will automatically provision a Redis instance
4. Note the connection URL format: `redis://default:password@redis.railway.internal:6379`

### Step 2: Configure Environment Variables

In your Railway backend service, add these environment variables:

```bash
# Enable rate limiting
RATE_LIMIT_ENABLED=true

# Use Redis for production (persistent across restarts)
RATE_LIMIT_STORAGE=redis

# Redis connection URL (Railway provides this automatically as REDIS_URL)
# Option 1: Use Railway's automatic REDIS_URL variable (recommended)
# Option 2: Manually set if using external Redis:
REDIS_URL=redis://default:your_password@redis.railway.internal:6379

# Optional: Customize rate limits (defaults shown)
RATE_LIMIT_REVIEW=10/minute
RATE_LIMIT_METRICS=60/minute
RATE_LIMIT_GRAPH=30/minute
```

**Railway Tip**: If you add Redis in the same project, Railway automatically injects `REDIS_URL` as a shared variable. You just need to set `RATE_LIMIT_STORAGE=redis`.

### Step 3: Deploy

```bash
# Commit changes
git add .
git commit -m "feat: Add production rate limiting with Redis backend"
git push origin main

# Railway auto-deploys on push
# Check deployment logs for confirmation:
# "Using Redis for rate limiting: redis://..."
```

### Step 4: Verify

```bash
# Test rate limiting in production
for i in {1..65}; do
  curl -s https://your-backend.up.railway.app/api/metrics/stats | jq '.total_reviews'
  echo "Request $i"
  sleep 0.1
done

# You should see HTTP 429 responses after exceeding the limit
```

## Alternative: Upstash Redis

If you prefer Upstash (serverless Redis with generous free tier):

1. Create account at [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy the connection URL: `redis://:your_token@your-region.upstash.io:6379`
4. Set in Railway:
   ```bash
   REDIS_URL=redis://:your_token@us1-charming-fox-12345.upstash.io:6379
   RATE_LIMIT_STORAGE=redis
   ```

## Monitoring Rate Limiting

### Check Logs

Railway logs will show rate limiting activity:

```
INFO: Using Redis for rate limiting: redis://default:***@redis.railway.internal:6379
INFO: Rate limiting enabled with storage: redis
```

### Rate Limit Responses

When a client exceeds the rate limit, they receive HTTP 429:

```json
{
  "error": "Rate limit exceeded",
  "message": "You have exceeded the rate limit. Please wait 60 seconds before retrying.",
  "retry_after": 60,
  "limit": "10",
  "endpoint": "/review"
}
```

## Configuration Reference

### Environment Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `RATE_LIMIT_ENABLED` | boolean | `true` | Master switch for rate limiting |
| `RATE_LIMIT_STORAGE` | string | `"memory"` | Storage backend: `"memory"` or `"redis"` |
| `REDIS_URL` | string | `None` | Redis connection URL (required if storage=redis) |
| `RATE_LIMIT_REVIEW` | string | `"10/minute"` | Review endpoint limit |
| `RATE_LIMIT_METRICS` | string | `"60/minute"` | Metrics endpoints limit |
| `RATE_LIMIT_GRAPH` | string | `"30/minute"` | Graph endpoints limit |

### Rate Limit Formats

Slowapi supports various time windows:

- `"10/second"` - 10 requests per second
- `"10/minute"` - 10 requests per minute (default)
- `"10/hour"` - 10 requests per hour
- `"10/day"` - 10 requests per day

## Troubleshooting

### Rate limiting not working in production

**Symptom**: Clients can send unlimited requests

**Solutions**:
1. Check `RATE_LIMIT_ENABLED=true` is set
2. Verify `RATE_LIMIT_STORAGE=redis` (in-memory doesn't persist across containers)
3. Check `REDIS_URL` is correctly formatted
4. Review Railway logs for Redis connection errors

### Redis connection fails

**Symptom**: Logs show "Redis connection refused" or "Redis timeout"

**Solutions**:
1. Verify Redis service is running in Railway dashboard
2. Check `REDIS_URL` uses internal Railway hostname: `redis.railway.internal`
3. Ensure backend and Redis are in the same Railway project
4. Try redeploying backend service

### Localhost bypasses rate limiting

**This is intentional** for development. To test rate limiting locally:
1. Use ngrok or localtunnel to expose localhost
2. Test from external IP
3. Or deploy to Railway and test production URL

### Rate limits reset unexpectedly

**In-memory storage** (dev): Resets on server restart
**Redis storage** (prod): Persists across restarts, resets after time window (1 minute)

## Security Considerations

### IP-Based Limiting

Rate limiting is based on client IP address:
- In production behind a proxy (Railway, Vercel), uses `X-Forwarded-For` header
- Direct connections use connection IP
- IPv6 and IPv4 both supported

### DDoS Protection

Rate limiting provides basic DDoS protection but consider:
- Railway's built-in DDoS protection (automatic)
- Cloudflare for advanced DDoS and bot protection
- AWS WAF if migrating to AWS infrastructure

### Rate Limit Bypass

Localhost IPs (`127.0.0.1`, `::1`, `192.168.*`) bypass rate limiting by design for development. Ensure production deployments use public IPs.

## Cost Implications

### Redis Costs

- **Railway Redis**: ~$5-10/month (starts after free tier)
- **Upstash Redis**: Free tier: 10,000 commands/day, then pay-as-you-go
- **In-memory**: Free but doesn't persist across restarts

### Why Redis Matters

Without Redis in production:
- Rate limits reset when container restarts (frequent on Railway)
- Horizontal scaling (multiple instances) won't share rate limit state
- Attackers can easily bypass limits by triggering restarts

## Next Steps

After deploying rate limiting:
1. Monitor Railway logs for rate limit hits
2. Adjust limits based on actual usage patterns
3. Consider adding user authentication for higher limits
4. Implement API keys for premium tiers (future)

## Related Documentation

- [FastAPI Rate Limiting](https://slowapi.readthedocs.io/)
- [Railway Redis Documentation](https://docs.railway.app/databases/redis)
- [Upstash Redis](https://docs.upstash.com/redis)
- [README.md Security Section](../README.md#security)
