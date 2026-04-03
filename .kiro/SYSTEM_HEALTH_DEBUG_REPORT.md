# System Health Debug Report

**Date**: April 3, 2026  
**Status**: Degraded (All agents unreachable)  
**Root Cause**: AWS Bedrock credentials not configured locally

---

## Current System Status

### Health Endpoint Response
```json
{
  "status": "diagnostic",
  "timestamp": "2026-04-03T17:54:01.600Z",
  "agents": {
    "harvest-ready": {"status": "error", "bedrock_healthy": false, "error": "Agent unreachable"},
    "storage-scout": {"status": "error", "bedrock_healthy": false, "error": "Agent unreachable"},
    "supply-match": {"status": "error", "bedrock_healthy": false, "error": "Agent unreachable"},
    "water-wise": {"status": "error", "bedrock_healthy": false, "error": "Agent unreachable"},
    "quality-hub": {"status": "error", "bedrock_healthy": false, "error": "Agent unreachable"},
    "collective-voice": {"status": "error", "bedrock_healthy": false, "error": "Agent unreachable"}
  },
  "overall_healthy": false,
  "bedrock_available": false
}
```

---

## Root Cause Analysis

### Issue 1: AWS Credentials Not Configured
- **Problem**: Python agents cannot connect to Amazon Bedrock
- **Reason**: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY not set in environment
- **Impact**: All agent health checks fail with "Agent unreachable"

### Issue 2: Python Path Hardcoded
- **Problem**: Backend was using hardcoded path `/opt/harvelogix/backend/venv/bin/python3`
- **Status**: ✅ FIXED - Updated to use system `python3` with fallback
- **File**: `backend/routes/agents.js` (Line 42)

### Issue 3: Python Dependencies
- **Status**: ✅ INSTALLED - All required packages installed
- **Packages**: boto3, botocore, requests, pytest, hypothesis, faiss-cpu, numpy, anthropic

---

## What's Working

✅ **Backend Server**: Running on http://localhost:5000  
✅ **Frontend**: Deployed to CloudFront (https://d2autvkcn7doq.cloudfront.net)  
✅ **API Endpoints**: All endpoints responding  
✅ **CORS & Security**: Properly configured  
✅ **Rate Limiting**: Active (100 req/sec per farmer)  
✅ **Python Environment**: Configured and dependencies installed  

---

## What's Not Working

❌ **Bedrock Connection**: AWS credentials not configured  
❌ **Agent Health Checks**: All agents failing  
❌ **EventBridge Status**: Showing as "Degraded"  
❌ **AI Reasoning**: Cannot invoke Bedrock models  

---

## How to Fix (Production Deployment)

### Step 1: Configure AWS Credentials

**Option A: Environment Variables**
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=ap-south-1
```

**Option B: AWS CLI Configuration**
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter default region: ap-south-1
# Enter default output format: json
```

**Option C: IAM Role (Recommended for AWS Lambda/EC2)**
- Attach IAM role with Bedrock permissions to Lambda/EC2 instance
- No credentials needed - AWS SDK uses role automatically

### Step 2: Verify Bedrock Access

```bash
# Test Bedrock connectivity
aws bedrock list-foundation-models --region ap-south-1

# Test specific model
aws bedrock-runtime invoke-model \
  --model-id arn:aws:bedrock:ap-south-1:020513638290:application-inference-profile/hs79u71flmnc \
  --content-type application/json \
  --accept application/json \
  --body '{"messages":[{"role":"user","content":"Hello"}],"inferenceConfig":{"maxTokens":100}}' \
  --region ap-south-1 \
  response.json
```

### Step 3: Restart Backend

```bash
# Stop current backend
pkill -f "node server.js"

# Restart with credentials
npm start
```

### Step 4: Verify Health

```bash
curl http://localhost:5000/api/agents/health
```

Expected response when healthy:
```json
{
  "status": "diagnostic",
  "agents": {
    "harvest-ready": {"status": "success", "bedrock_healthy": true},
    "storage-scout": {"status": "success", "bedrock_healthy": true},
    ...
  },
  "overall_healthy": true,
  "bedrock_available": true
}
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│              https://d2autvkcn7doq.cloudfront.net           │
│                    ✅ WORKING                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Node.js)                          │
│              http://localhost:5000                          │
│                    ✅ WORKING                               │
│  - Express server running                                   │
│  - CORS enabled                                             │
│  - Rate limiting active                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Python Agents (6 agents)                       │
│                    ❌ FAILING                               │
│  - HarvestReady                                             │
│  - StorageScout                                             │
│  - SupplyMatch                                              │
│  - WaterWise                                                │
│  - QualityHub                                               │
│  - CollectiveVoice                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            Amazon Bedrock (Nova Models)                     │
│                    ❌ UNREACHABLE                           │
│  - Model: arn:aws:bedrock:ap-south-1:...                   │
│  - Region: ap-south-1                                       │
│  - Issue: AWS credentials not configured                    │
└─────────────────────────────────────────────────────────────┘
```

---

## System Health Metrics

| Metric | Status | Target | Notes |
|--------|--------|--------|-------|
| Agent Latency | N/A | <500ms | Agents not responding |
| Error Rate | 100% | <5% | All agents failing |
| Bedrock Status | ❌ Unavailable | ✅ Available | Credentials needed |
| EventBridge | ⚠️ Degraded | ✅ Healthy | Depends on Bedrock |
| Frontend | ✅ Healthy | ✅ Healthy | CloudFront working |
| Backend API | ✅ Healthy | ✅ Healthy | Express server running |

---

## Next Steps

### Immediate (Local Development)
1. ✅ Fixed Python path issue in `backend/routes/agents.js`
2. ✅ Installed Python dependencies
3. ⏳ Configure AWS credentials (see "How to Fix" section above)
4. ⏳ Restart backend server
5. ⏳ Verify health endpoint returns healthy status

### Short-term (Production)
1. Deploy backend to AWS Lambda or EC2
2. Attach IAM role with Bedrock permissions
3. Configure environment variables
4. Set up CloudWatch monitoring
5. Enable EventBridge rules

### Medium-term (Phase 2)
1. Implement caching for agent responses
2. Add fallback to demo data when Bedrock unavailable
3. Set up auto-recovery for failed agents
4. Implement circuit breaker pattern

### Long-term (Phase 3)
1. Migrate to Bedrock Agent Core (more reliable, better pricing)
2. Implement multi-region failover
3. Add advanced monitoring and alerting
4. Optimize costs with reserved capacity

---

## Files Modified

- `backend/routes/agents.js` - Fixed Python path (Line 42)
- `backend/.env` - AWS configuration (already set)
- `backend/requirements.txt` - Python dependencies (already installed)

---

## Testing Commands

```bash
# Check backend health
curl http://localhost:5000/api/agents/health

# Check specific agent
curl -X POST http://localhost:5000/api/agents/harvest-ready \
  -H "Content-Type: application/json" \
  -d '{"crop_type":"tomato","current_growth_stage":5}'

# Check AWS Bedrock access
aws bedrock list-foundation-models --region ap-south-1

# Check Python environment
python3 -c "import boto3; print(boto3.__version__)"
```

---

## Support

For issues with:
- **AWS Credentials**: See AWS documentation on [configuring credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- **Bedrock Access**: Check [Bedrock documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/)
- **Backend Issues**: Check logs in `backend/server.js` output
- **Frontend Issues**: Check browser console and CloudFront logs

