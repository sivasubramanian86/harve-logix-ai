#!/bin/bash
# Deploy AWS Bedrock Agent for HarveLogix AI

set -e

REGION="us-east-1"  # Bedrock Agents only in us-east-1
AGENT_REGION="ap-south-2"  # Lambda functions region
ACCOUNT_ID="020513638290"

echo "🎯 Creating AWS Bedrock Agent for HarveLogix AI"
echo "================================================"

# Step 1: Create IAM role for Bedrock Agent
echo "[1/4] Creating IAM role for Bedrock Agent..."

TRUST_POLICY='{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "bedrock.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}'

ROLE_ARN=$(aws iam create-role \
  --role-name HarveLogixBedrockAgentRole \
  --assume-role-policy-document "$TRUST_POLICY" \
  --query 'Role.Arn' \
  --output text 2>/dev/null || aws iam get-role --role-name HarveLogixBedrockAgentRole --query 'Role.Arn' --output text)

echo "✅ Role ARN: $ROLE_ARN"

# Attach policies
aws iam attach-role-policy \
  --role-name HarveLogixBedrockAgentRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess 2>/dev/null || true

# Step 2: Create Bedrock Agent
echo ""
echo "[2/4] Creating Bedrock Agent..."

AGENT_INSTRUCTION="You are HarveLogix AI, an agricultural assistant helping farmers with post-harvest decisions. You have access to 6 specialized agents:
1. HarvestReady - Optimal harvest timing
2. StorageScout - Storage recommendations
3. SupplyMatch - Buyer matching
4. WaterWise - Water optimization
5. QualityHub - Quality assessment
6. CollectiveVoice - Farmer aggregation

Route farmer requests to the appropriate agent based on their needs."

AGENT_ID=$(aws bedrock-agent create-agent \
  --region $REGION \
  --agent-name "HarveLogixAI" \
  --agent-resource-role-arn "$ROLE_ARN" \
  --foundation-model "anthropic.claude-sonnet-4-20250514" \
  --instruction "$AGENT_INSTRUCTION" \
  --query 'agent.agentId' \
  --output text 2>&1)

if [[ $AGENT_ID == *"ConflictException"* ]]; then
  echo "⚠️  Agent already exists, fetching ID..."
  AGENT_ID=$(aws bedrock-agent list-agents --region $REGION --query "agentSummaries[?agentName=='HarveLogixAI'].agentId" --output text)
fi

echo "✅ Agent ID: $AGENT_ID"

# Step 3: Create Action Group for HarvestReady
echo ""
echo "[3/4] Creating Action Group for HarvestReady..."

ACTION_GROUP_SCHEMA='{
  "actionGroupName": "HarvestReadyActions",
  "description": "Actions for harvest timing recommendations",
  "actionGroupExecutor": {
    "lambda": "arn:aws:lambda:'$AGENT_REGION':'$ACCOUNT_ID':function:harvelogix-020513638290-crop-health-analyzer-dev"
  },
  "apiSchema": {
    "payload": "{\"openapi\":\"3.0.0\",\"info\":{\"title\":\"HarvestReady API\",\"version\":\"1.0.0\"},\"paths\":{\"/analyze-harvest\":{\"post\":{\"summary\":\"Analyze optimal harvest timing\",\"operationId\":\"analyzeHarvest\",\"requestBody\":{\"required\":true,\"content\":{\"application/json\":{\"schema\":{\"type\":\"object\",\"properties\":{\"crop_type\":{\"type\":\"string\"},\"growth_stage\":{\"type\":\"integer\"},\"location\":{\"type\":\"object\"}}}}}},\"responses\":{\"200\":{\"description\":\"Harvest recommendation\"}}}}}}"
  }
}'

aws bedrock-agent create-agent-action-group \
  --region $REGION \
  --agent-id "$AGENT_ID" \
  --agent-version "DRAFT" \
  --action-group-name "HarvestReadyActions" \
  --action-group-executor lambda="arn:aws:lambda:$AGENT_REGION:$ACCOUNT_ID:function:harvelogix-020513638290-crop-health-analyzer-dev" \
  --api-schema '{"payload":"{\"openapi\":\"3.0.0\",\"info\":{\"title\":\"HarvestReady\",\"version\":\"1.0.0\"},\"paths\":{\"/harvest\":{\"post\":{\"summary\":\"Get harvest timing\",\"operationId\":\"getHarvestTiming\",\"requestBody\":{\"content\":{\"application/json\":{\"schema\":{\"type\":\"object\",\"properties\":{\"crop_type\":{\"type\":\"string\"},\"growth_stage\":{\"type\":\"integer\"}}}}}},\"responses\":{\"200\":{\"description\":\"Success\"}}}}}}"}' \
  2>/dev/null || echo "⚠️  Action group may already exist"

# Step 4: Prepare Agent
echo ""
echo "[4/4] Preparing Bedrock Agent..."

aws bedrock-agent prepare-agent \
  --region $REGION \
  --agent-id "$AGENT_ID" 2>/dev/null || true

echo ""
echo "✅ Bedrock Agent Deployment Complete!"
echo ""
echo "📊 Agent Details:"
echo "  Agent ID: $AGENT_ID"
echo "  Region: $REGION"
echo "  Model: Claude Sonnet 4"
echo "  Action Groups: HarvestReadyActions"
echo ""
echo "🌐 View in Console:"
echo "  https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/agents/$AGENT_ID"
echo ""
echo "🧪 Test Agent:"
echo "  aws bedrock-agent-runtime invoke-agent --region $REGION --agent-id $AGENT_ID --agent-alias-id TSTALIASID --session-id test-session --input-text 'When should I harvest my tomatoes?'"
