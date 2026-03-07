# Bedrock Agent Deployment Guide

## Current Status

✅ **Code Ready**: All agents, MCP tools, and Bedrock client code is complete  
❌ **Bedrock Access Issue**: AWS account requires provisioned throughput or inference profiles

## The Problem

Your AWS account is rejecting direct on-demand model invocations with:
```
ValidationException: Invocation of model ID anthropic.claude-3-5-sonnet-20241022-v2:0 
with on-demand throughput isn't supported. Retry your request with the ID or ARN of 
an inference profile that contains this model.
```

This means you need to either:
1. **Set up Provisioned Throughput** (recommended for testing)
2. **Use Inference Profiles** (for multi-region support)
3. **Request on-demand access** from AWS Support

## Solution 1: Create Provisioned Throughput (FASTEST FOR TESTING)

This is the quickest way to test locally:

### Step 1: AWS Console Setup
1. Go to **AWS Bedrock Console** → **Provisioned Throughput**
2. Click **Create Provisioned Throughput**
3. Configure:
   - **Model**: `anthropic.claude-3-5-sonnet-20241022-v2:0`
   - **Region**: `us-east-1`
   - **Commitment**: 1 month (minimum)
   - **Throughput Units**: 10-100 (start small for testing)
4. Copy the generated **Model ARN** (looks like: `arn:aws:bedrock:us-east-1:ACCOUNT:provisioned-model/MODEL-ID`)

### Step 2: Update Code
Update `backend/config.py`:

```python
# Use the ARN from provisioned throughput
BEDROCK_MODEL_ID = os.getenv(
    'BEDROCK_MODEL_ID', 
    'your-model-arn-here'  # Paste ARN from console
)
```

Set environment variable:
```bash
$env:BEDROCK_MODEL_ID = "arn:aws:bedrock:us-east-1:ACCOUNT:provisioned-model/MODEL-ID"
```

### Step 3: Test
```bash
python -c "from core.bedrock_client import BedrockClient; 
client = BedrockClient(); 
print(client.health_check())"
```

## Solution 2: Use Inference Profiles (FOR PRODUCTION)

Inference profiles work across regions and don't require provisioned throughput:

### Step 1: Create Inference Profile
1. AWS Bedrock Console → **Inference Profiles**
2. **Create Profile**:
   - Name: `harvelogix-analysis`
   - Models: Add `Claude 3.5 Sonnet`
   - Regions: `us-east-1`, `ap-south-2`
3. Copy the **Profile ARN**

### Step 2: Update Code
```python
BEDROCK_MODEL_ID = os.getenv(
    'BEDROCK_MODEL_ID',
    'arn:aws:bedrock::ACCOUNT:inference-profile/PROFILE-ID'
)
```

## Solution 3: Request On-Demand Access

Contact AWS Support:
1. AWS Console → **Support** → **Create Case**
2. Request: **Enable Bedrock on-demand access for Claude models**
3. Include use case and regions needed
4. Typically approved within 24 hours

---

## AWS Deployment Architecture

### Phase 1: Local Testing (Current)
```
Your Machine
    ↓
Bedrock Client (Python)
    ↓
Provisioned Throughput / Inference Profile
    ↓
Claude Models in AWS
```

**Status**: ⏳ Waiting for provisioned throughput or inference profile setup

### Phase 2: Lambda Deployment (Next)
```
Web Dashboard
    ↓
API Gateway (HTTPS)
    ↓
Lambda Functions (Python)
    ├── harvest_ready_lambda.py
    ├── storage_scout_lambda.py
    ├── supply_match_lambda.py
    ├── water_wise_lambda.py
    ├── quality_hub_lambda.py
    ├── collective_voice_lambda.py
    └── analysis_lambda.py
        ↓
    Bedrock Client
        ↓
    Claude Models (Provisioned Throughput)
        ↓
    Response → Dashboard
```

**What we'll do**:
- Deploy Lambda entrypoints for each agent
- Configure API Gateway routes
- Set up CloudFormation template
- Update dashboard to call Lambda endpoints instead of local endpoints

### Phase 3: Database Integration
```
Lambda Functions
    ↓
MCP Tools Service
    ├── query_crop_yield → Aurora
    ├── query_weather_trends → Aurora  
    ├── query_market_prices → DynamoDB
    ├── query_soil_health → Aurora
    ├── query_farmer_demographics → DynamoDB
    └── query_agent_recommendations → DynamoDB
```

**What we'll do**:
Replace mock data in `backend/services/mcp_tools.py` with real database queries

### Phase 4: EventBridge Integration
```
Agent Decisions
    ↓
DynamoDB Streams
    ↓
EventBridge Rules
    ├── Harvest timing events → Farmer notifications
    ├── Storage alerts → Processor alerts
    ├── Price opportunities → Buyer notifications
    └── Quality issues → QA alerts
    ↓
SNS / Email / Dashboard
```

---

## Current Implementation Status

### ✅ Complete and Ready
1. **Bedrock Client** (`backend/core/bedrock_client.py`)
   - 450+ LOC
   - Health checking
   - Error handling with retries
   - Multimodal support ready

2. **Agent APIs** (`backend/routes/agents.js`)
   - 9 endpoints for 6 agents + 1 analysis endpoint
   - All request/response formats defined
   - Error handling

3. **MCP Tools Service** (`backend/services/mcp_tools.py`)
   - 6 tools defined
   - Tool execution engine
   - Ready for database integration

4. **Strands Analysis Agent** (`backend/agents/strands_analysis_agent.py`)
   - Multi-turn conversation support
   - Tool selection logic
   - Structured output

### ⏳ Waiting for Bedrock Access
- Local testing of agents
- Health check endpoint
- Example API calls

### 📋 Next Steps (Once Bedrock Access Configured)

1. **Update config with provisioned throughput ARN**
   ```bash
   $env:BEDROCK_MODEL_ID = "arn:aws:bedrock:..."
   ```

2. **Test agents locally**
   ```bash
   curl -X POST http://localhost:5000/api/agents/harvest-ready \
     -H "Content-Type: application/json" \
     -d '{"farmer_id":"F123","crop":"wheat","region":"Punjab"}'
   ```

3. **Deploy to Lambda**
   - Create `infrastructure/lambda/agents.py` wrapper
   - Deploy via AWS SAM or CloudFormation
   - Update API Gateway

4. **Connect to databases**
   - Aurora for crop/weather/soil data
   - DynamoDB for farmer/decision history
   - Update MCP tool handlers

5. **Set up monitoring**
   - CloudWatch logs
   - X-Ray tracing
   - Custom metrics

---

## File Structure for Deployment

```
backend/
├── core/
│   ├── bedrock_client.py          # ✅ Ready
├── agents/
│   ├── base_agent.py              # ✅ Ready
│   ├── harvest_ready_agent.py      # ✅ Ready
│   ├── storage_scout_agent.py      # ✅ Ready
│   ├── supply_match_agent.py       # ✅ Ready
│   ├── water_wise_agent.py         # ✅ Ready
│   ├── quality_hub_agent.py        # ✅ Ready
│   ├── collective_voice_agent.py   # ✅ Ready
│   └── strands_analysis_agent.py   # ✅ Ready
├── services/
│   ├── mcp_tools.py                # ✅ Ready (mock data)
│   ├── bedrockService.js           # ✅ Ready
│   └── ... (other services)
├── routes/
│   ├── agents.js                   # ✅ Ready
│   └── ... (other routes)
├── server.js                       # ✅ Ready
├── config.py                       # ⏳ Needs provisioned throughput ARN
└── requirements.txt                # ✅ Ready

infrastructure/
├── lambda/
│   ├── agents.py                   # 📋 To create
│   └── ... (other Lambda functions)
└── terraform/
    ├── main.tf                     # 📋 To update
    └── ... (other TF files)
```

---

## Estimated Timeline

| Phase | Task | Effort | Blockers |
|-------|------|--------|----------|
| **Now** | Set up Bedrock provisioned throughput | 15 min | AWS console access |
| **Now** | Update config with ARN | 5 min | None |
| **Now** | Test local agents | 30 min | None |
| **Phase 2** | Deploy to Lambda | 2-4 hours | Terraform setup |
| **Phase 2** | API Gateway + dashboard integration | 2-4 hours | None |
| **Phase 3** | Database integration | 4-6 hours | DB schema design |
| **Phase 3** | MCP tools testing | 2-3 hours | None |
| **Phase 4** | EventBridge setup | 3-4 hours | Event routing design |
| **Phase 4** | Monitoring + alerts | 2-3 hours | None |
| **Total** | | **20-30 hours** | |

---

## Quick Start Checklist

- [ ] Request/setup Bedrock provisioned throughput or inference profiles
- [ ] Get model ARN from AWS console
- [ ] Update `backend/config.py` with ARN
- [ ] Update environment: `$env:BEDROCK_MODEL_ID = "arn:..."`
- [ ] Test: `python test_bedrock.py`
- [ ] If working: Commit and push changes
- [ ] Begin Phase 2 Lambda deployment

---

## Support Commands

```python
# Check Bedrock models in your region
import boto3
bedrock = boto3.client('bedrock', region_name='us-east-1')
for model in bedrock.list_foundation_models()['modelSummaries']:
    if 'claude' in model['modelId'].lower():
        print(model['modelId'])

# Check provisioned throughput
bedrock = boto3.client('bedrock', region_name='us-east-1')
response = bedrock.list_provisioned_model_capacity()
for capacity in response.get('provisioned_model_capacities', []):
    print(f"{capacity['model_arn']}: {capacity['status']}")

# Check inference profiles
bedrock = boto3.client('bedrock', region_name='us-east-1')
response = bedrock.list_inference_profiles()
for profile in response.get('inference_profiles', []):
    print(f"{profile['inference_profile_arn']}: {profile['status']}")
```

---

**Next Step**: Set up Bedrock provisioned throughput, then we can test the agents locally!
