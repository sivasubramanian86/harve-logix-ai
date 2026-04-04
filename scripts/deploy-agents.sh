#!/bin/bash
# Deploy HarveLogix Agents to AWS Lambda

set -e

REGION="ap-south-2"
ACCOUNT_ID="020513638290"

echo "🚀 Deploying HarveLogix Agents to Lambda"
echo "========================================="

cd backend/agents

# Package each agent
for agent in harvest_ready storage_scout supply_match water_wise quality_hub collective_voice; do
    echo "📦 Packaging ${agent}_agent..."
    zip -r ${agent}_agent.zip ${agent}_agent.py base_agent.py __init__.py ../config.py ../utils/ -q
done

# Update Lambda functions
echo ""
echo "🔄 Updating Lambda functions..."

aws lambda update-function-code \
  --region $REGION \
  --function-name harvelogix-020513638290-crop-health-analyzer-dev \
  --zip-file fileb://harvest_ready_agent.zip

aws lambda update-function-code \
  --region $REGION \
  --function-name harvelogix-020513638290-irrigation-analyzer-dev \
  --zip-file fileb://water_wise_agent.zip

aws lambda update-function-code \
  --region $REGION \
  --function-name harvelogix-020513638290-weather-analyzer-dev \
  --zip-file fileb://storage_scout_agent.zip

aws lambda update-function-code \
  --region $REGION \
  --function-name harvelogix-020513638290-voice-query-processor-dev \
  --zip-file fileb://supply_match_agent.zip

aws lambda update-function-code \
  --region $REGION \
  --function-name harvelogix-020513638290-video-analyzer-dev \
  --zip-file fileb://quality_hub_agent.zip

aws lambda update-function-code \
  --region $REGION \
  --function-name harvelogix-020513638290-collective-voice-dev \
  --zip-file fileb://collective_voice_agent.zip

echo ""
echo "✅ All agents deployed successfully!"
echo ""
echo "🧪 Test an agent:"
echo "  aws lambda invoke --region $REGION --function-name harvelogix-020513638290-crop-health-analyzer-dev --payload '{\"request_data\":{\"crop_type\":\"tomato\",\"current_growth_stage\":8}}' response.json"
