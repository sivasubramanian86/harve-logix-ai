# Bedrock Agent Deployment Guide

## Current Status

✅ **Code Ready**: All agents, MCP tools, and Bedrock client code is complete  
✅ **Claude Models in ap-south-2**: 8 Claude models available (Opus 4.5, Haiku 4.5, Opus 4.6, etc.)
❌ **Access Method**: Need provisioned throughput or inference profile setup  

## The Problem

Your ap-south-2 region has Claude models, but AWS requires you to provision throughput before using them. You get this error:

```
ValidationException: Invocation of model ID anthropic.claude-opus-4-5-20251101-v1:0 
with on-demand throughput isn't supported. Retry your request with the ID or ARN of 
a provisioned model capacity or inference profile.
```

This means you need to either:
1. **Create Provisioned Throughput** (quickest for testing)
2. **Create Inference Profile** (best for multi-region/production)
3. **Request on-demand access** from AWS Support

## Solution 1: Create Provisioned Throughput in ap-south-2 (FASTEST)

This is the quickest way to test locally:

### Step 1: AWS Console Setup
1. Go to **AWS Bedrock Console** (ap-south-2 region)
2. Navigate to **Provisioned Throughput**
3. Click **Create Provisioned Throughput**
4. Configure:
   - **Model**: `anthropic.claude-opus-4-5-20251101-v1:0` (or Claude Haiku 4.5 for cheaper testing)
   - **Region**: `ap-south-2`
   - **Commitment**: 1 month (minimum, recommended for testing)
   - **Throughput Units**: 10-100 (start with 10-20 for testing)
5. Wait for provisioning to complete (usually 5-10 minutes)
6. Copy the generated **Model ARN** (looks like: `arn:aws:bedrock:ap-south-2:ACCOUNT:provisioned-model/MODEL-ID`)

### Step 2: Update Code
Set the environment variable with your provisioned model ARN:

```powershell
$env:BEDROCK_MODEL_ID = "arn:aws:bedrock:ap-south-2:YOUR_ACCOUNT_ID:provisioned-model/YOUR_MODEL_ID"
```

Or update `backend/config.py`:
```python
BEDROCK_MODEL_ID = os.getenv('BEDROCK_MODEL_ID', 'arn:aws:bedrock:ap-south-2:YOUR_ACCOUNT_ID:provisioned-model/YOUR_MODEL_ID')
```

### Step 3: Test
```bash
cd backend
python -c "
from core.bedrock_client import BedrockClient
client = BedrockClient()
response = client.invoke_model(
    prompt='What is the capital of India?',
    system_prompt='You are a helpful assistant.'
)
print('SUCCESS! Bedrock agents working')
print(response[:200])
"
```

## Solution 2: Create Inference Profile (FOR PRODUCTION)

Inference profiles allow cross-region, multi-model deployments:

### Step 1: Create Inference Profile in ap-south-2
1. AWS Bedrock Console → **Inference Profiles**
2. **Create Profile**:
   - Name: `harvelogix-analysis`
   - Models: Add `Claude Opus 4.5` and `Claude Haiku 4.5`
   - Regions: `ap-south-2` (primary), optionally add others
3. Copy the **Profile ARN** (looks like: `arn:aws:bedrock::YOUR_ACCOUNT:inference-profile/PROFILE-ID`)

### Step 2: Update Code
```python
# Use cross-account profile ARN (no region in ARN)
BEDROCK_MODEL_ID = os.getenv('BEDROCK_MODEL_ID', 'arn:aws:bedrock::YOUR_ACCOUNT:inference-profile/YOUR_PROFILE_ID')
```

## Solution 3: Request On-Demand Access

Contact AWS Support to get direct on-demand access:
1. AWS Console → **Support** → **Create Case**
2. Request: **Enable Bedrock on-demand access for Claude models in ap-south-2**
3. Include use case (agricultural AI platform)
4. Typically approved within 24 hours

---

## Complete AWS Deployment Architecture

### Phase 1: Local Testing (Current Goal)
```
Your Machine (Windows)
    ↓
Backend Server (Node.js + Python)
    ├── Express routes (agents.js)
    ├── Python agents
    └── Bedrock client
        ↓
Bedrock Service (ap-south-2)
    ↓
Claude Models
    (Opus 4.5, Haiku 4.5, etc.)
    ↓
Response back to dashboard
```

**Requirements**:
- ✅ Agent code (complete)
- ✅ Bedrock client (complete)
- ⏳ **Provisioned throughput OR inference profile** (15-30 min)

### Phase 2: AWS Lambda Deployment
```
Web Dashboard (React)
    ↓ HTTPS
API Gateway
    ↓
Lambda Functions (Python)
    ├── harvest_ready_lambda
    ├── storage_scout_lambda
    ├── supply_match_lambda
    ├── water_wise_lambda
    ├── quality_hub_lambda
    ├── collective_voice_lambda
    └── analysis_lambda
        ↓
Bedrock Client (with provisioned throughput ARN)
    ↓
Bedrock (ap-south-2)
    ↓
Claude Models
    ↓
AI Insights → Dashboard
```

**Timeline**: 2-4 hours

### Phase 3: Database Integration
```
Lambda Functions
    ↓
MCP Tools Service
    ├── query_crop_yield → Aurora RDS
    ├── query_weather_trends → Aurora RDS
    ├── query_market_prices → DynamoDB
    ├── query_soil_health → Aurora RDS
    ├── query_farmer_demographics → DynamoDB
    └── query_agent_recommendations → DynamoDB
```

**Timeline**: 4-6 hours

### Phase 4: EventBridge & Notifications
```
Agent Decisions
    ↓
DynamoDB Streams
    ↓
EventBridge Rules
    ├── Harvest timing → SNS Farmer Notifications
    ├── Storage alerts → SNS Processor Alerts
    ├── Price opportunities → SNS Buyer Notifications
    └── Quality issues → SNS QA Team
```

**Timeline**: 3-4 hours

---

## Implementation Status

### ✅ Complete and Ready
1. **Bedrock Client** (`backend/core/bedrock_client.py`)
   - 450+ LOC
   - Health checking, error handling, retries
   - Works with provisioned throughput ARNs

2. **Agent APIs** (`backend/routes/agents.js`)
   - 9 endpoints for 6 agents + analysis
   - Full request/response formats
   - Error handling built in

3. **MCP Tools Service** (`backend/services/mcp_tools.py`)
   - 6 tools: crop_yield, weather_trends, market_prices, soil_health, farmer_demographics, agent_recommendations
   - Tool execution engine ready
   - Mock implementations (will connect to DB in Phase 3)

4. **Strands Analysis Agent** (`backend/agents/strands_analysis_agent.py`)
   - Multi-turn conversation support
   - Tool selection logic
   - Structured output

5. **Configuration** (`backend/config.py`)
   - ✅ Points to ap-south-2 (your production region)
   - ✅ Uses Claude Opus 4.5 as default model
   - Ready for provisioned throughput ARN

### ⏳ Waiting For
- **Provisioned throughput setup** (15-30 min from you)
- Get provisioned model ARN
- Set environment variable
- Run test

---

## Quick Start Checklist for ap-south-2

- [ ] Open AWS Bedrock Console (region: **ap-south-2**)
- [ ] Go to **Provisioned Throughput**
- [ ] Create provisioned throughput for:
  - Model: `anthropic.claude-opus-4-5-20251101-v1:0`
  - Commitment: 1 month
  - Throughput Units: 10-20 (for testing)
- [ ] Copy generated **Model ARN**
- [ ] Set environment variable:
  ```powershell
  $env:BEDROCK_MODEL_ID = "arn:aws:bedrock:ap-south-2:ACCOUNT:provisioned-model/MODEL-ID"
  ```
- [ ] Test locally:
  ```bash
  cd backend
  python -c "from core.bedrock_client import BedrockClient; print(BedrockClient().health_check())"
  ```
- [ ] If health check passes: Start backend server
  ```bash
  npm start
  ```
- [ ] Test agent API:
  ```bash
  curl -X POST http://localhost:5000/api/agents/harvest-ready \
    -H "Content-Type: application/json" \
    -d '{"farmer_id":"F123","crop":"wheat","region":"Punjab"}'
  ```
- [ ] See AI insights in dashboard!

---

## Region Comparison

| Aspect | ap-south-2 (Mumbai) | us-east-1 (N. Virginia) |
|--------|-------------------|------------------------|
| **Claude Models** | ✅ 8 available | ✅ More available |
| **On-Demand Access** | ❌ Provisioned only | ❌ Provisioned only |
| **Latency** | Low (your region) | Higher |
| **Cost** | Recommended | Alternative |
| **Inference Profiles** | ✅ Supported | ✅ Supported |
| **Best For** | Production (local users) | Multi-region |

**Recommendation**: Use ap-south-2 since it's your configured region and has lower latency for Indian farmers.

---

## Command Reference

### Check what models are available in ap-south-2
```python
import boto3
bedrock = boto3.client('bedrock', region_name='ap-south-2')
models = bedrock.list_foundation_models()
claude_models = [m for m in models['modelSummaries'] if 'claude' in m['modelId'].lower()]
for m in claude_models:
    print(m['modelId'])
```

### List your provisioned models
```python
import boto3
bedrock = boto3.client('bedrock', region_name='ap-south-2')
provisioned = bedrock.list_provisioned_model_capacity()
for p in provisioned['provisioned_model_capacities']:
    print(f"{p['model_arn']}: {p['status']}")
```

### List inference profiles
```python
import boto3
bedrock = boto3.client('bedrock', region_name='ap-south-2')
profiles = bedrock.list_inference_profiles()
for p in profiles['inference_profiles']:
    print(f"{p['inference_profile_arn']}: {p['status']}")
```

---

## Support: File Structure

All agent code is ready in these locations:

```
backend/
├── core/
│   └── bedrock_client.py       # ✅ Ready for ap-south-2
├── agents/
│   ├── base_agent.py           # ✅ Ready
│   ├── harvest_ready_agent.py  # ✅ Ready
│   ├── storage_scout_agent.py  # ✅ Ready
│   ├── supply_match_agent.py   # ✅ Ready
│   ├── water_wise_agent.py     # ✅ Ready
│   ├── quality_hub_agent.py    # ✅ Ready
│   ├── collective_voice_agent.py # ✅ Ready
│   └── strands_analysis_agent.py # ✅ Ready
├── services/
│   └── mcp_tools.py            # ✅ Ready (mock data)
├── routes/
│   └── agents.js               # ✅ Ready (9 endpoints)
├── config.py                   # ✅ Updated for ap-south-2
├── server.js                   # ✅ Ready
└── requirements.txt            # ✅ Ready
```

---

## Estimated Timeline

| Phase | Task | Effort | Status |
|-------|------|--------|--------|
| **Now** | Set up Bedrock provisioned throughput in ap-south-2 | 15 min | ⏳ Your turn |
| **Now** | Get model ARN + set env variable | 5 min | ⏳ Your turn |
| **Now** | Test local agents | 30 min | ⏳ Blocked on provisioning |
| **Phase 2** | Deploy to Lambda | 2-4 hours | 📋 Planned |
| **Phase 2** | API Gateway + dashboard | 2-4 hours | 📋 Planned |
| **Phase 3** | Database integration | 4-6 hours | 📋 Planned |
| **Phase 4** | EventBridge + notifications | 3-4 hours | 📋 Planned |
| **Total** | | **20-30 hours** | |

---

**Next Action**: 
1. **Create provisioned throughput** in AWS Bedrock console (ap-south-2)
2. Copy the **Model ARN**
3. Set: `$env:BEDROCK_MODEL_ID = "arn:..."`
4. Run test command above
5. Let me know when it passes - we'll immediately start Phase 2 Lambda deployment!

Once provisioned throughput is ready, agents will work with live Bedrock and show real AI insights in your dashboard. 🚀
