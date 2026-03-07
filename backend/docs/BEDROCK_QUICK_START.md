# Running HarveLogixAI Backend with Bedrock

## Prerequisites ✓
- AWS account with ap-south-2 region access
- Bedrock inference profile created: `3uca3qqdrcyo`
- AWS Marketplace subscription for Anthropic models (syncing 2-15 min)
- Python 3.10+ with boto3 installed
- Node.js 18+ for Express server

## Quick Start

### 1. Set AWS Region (IMPORTANT)
Before running the backend, set the AWS region environment variable:

**PowerShell:**
```powershell
$env:AWS_REGION="ap-south-2"
$env:BEDROCK_MODEL_ID="arn:aws:bedrock:ap-south-2:020513638290:application-inference-profile/3uca3qqdrcyo"
```

**Bash/Linux/Mac:**
```bash
export AWS_REGION="ap-south-2"
export BEDROCK_MODEL_ID="arn:aws:bedrock:ap-south-2:020513638290:application-inference-profile/3uca3qqdrcyo"
```

**Windows CMD:**
```cmd
set AWS_REGION=ap-south-2
set BEDROCK_MODEL_ID=arn:aws:bedrock:ap-south-2:020513638290:application-inference-profile/3uca3qqdrcyo
```

### 2. Test Bedrock Connection
```bash
cd backend
python test_bedrock_final.py
```

Expected output when Marketplace subscription is ready:
```
Model: arn:aws:bedrock:ap-south-2:020513638290:application-inference-profile/3uca3qqdrcyo
Region: ap-south-2
Success! Got response from Bedrock:
[AI response here]
```

### 3. Start the Backend Server
```bash
cd backend
npm install    # Install dependencies if needed
npm start      # Start Express server
```

Server runs at: `http://localhost:3000`

## Available APIs

### Agent Endpoints
- `GET /api/agents` - List all agents
- `GET /api/agents/:id` - Get specific agent
- `POST /api/agents/:id/invoke` - Invoke agent with prompt
- `GET /api/agents/:id/health` - Check agent health
- `GET /api/agents/:id/status` - Get agent status

### Example Agent Invocation
```bash
curl -X POST http://localhost:3000/api/agents/supply-match/invoke \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What crops are suitable for Punjab?"}'
```

## Available Agents
1. **Supply Match Agent** - Matches suppliers with farmers
2. **Storage Scout Agent** - Optimizes storage solutions
3. **Water Wise Agent** - Provides irrigation guidance
4. **Quality Hub Agent** - Quality assurance and grading
5. **Harvest Ready Agent** - Harvest timing recommendations
6. **Collective Voice Agent** - Farmer collective coordination

## Troubleshooting

### Error: "INVALID_PAYMENT_INSTRUMENT"
- **Cause**: AWS Marketplace subscription still syncing
- **Fix**: Wait 2-15 minutes after payment method was added
- **Check**: Run `python test_bedrock_final.py` again

### Error: "Region: us-west-2"
- **Cause**: System environment variable AWS_REGION=us-west-2 is set globally
- **Fix**: Override before running:
  ```powershell
  $env:AWS_REGION="ap-south-2"
  python test_bedrock_final.py
  ```

### Error: "Model access is denied"
- **Cause**: Inference profile ARN or credentials incorrect
- **Fix**: Verify ARN: `arn:aws:bedrock:ap-south-2:020513638290:application-inference-profile/3uca3qqdrcyo`
- **Check AWS Console**: Verify inference profile exists in ap-south-2

### Error: "on-demand throughput isn't supported"
- **Cause**: Tried to use direct model ID instead of inference profile
- **Fix**: Always use inference profile ARN, not direct model IDs

## Architecture
```
┌─────────────────────────────────────────┐
│     Express.js Server (Node.js)        │
│   (/api/agents/* endpoints)             │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│   Python Agent Classes (Flask/Workers)  │
│      (base_agent.py, *_agent.py)        │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│    BedrockClient (Python/boto3)         │
│      (core/bedrock_client.py)           │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│  AWS Bedrock (ap-south-2)               │
│  Inference Profile → Claude Haiku 4.5   │
└──────────────────────────────────────────┘
```

## Configuration Files

- `config.py` - Python configuration (AWS region, model ID, timeouts)
- `.env.example` - Environment variables template
- `test_bedrock_final.py` - Bedrock connection test
- `BEDROCK_SETUP_STATUS.md` - Setup status and troubleshooting

## Next Steps
1. Wait for AWS Marketplace subscription to sync (2-15 min)
2. Run `python test_bedrock_final.py` to verify
3. Start server: `npm start`
4. Test agents via API endpoints
5. Commit code once verified working

## Support
Check `BEDROCK_SETUP_STATUS.md` for detailed setup information and troubleshooting guide.
