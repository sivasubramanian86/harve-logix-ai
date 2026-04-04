#!/bin/bash
# HarveLogix Full Production Deployment Script
# Deploys: Lambda Agents, EC2 Backend, and S3/CloudFront Frontend

set -e

REGION="ap-south-2"
ACCOUNT_ID="020513638290"
BACKEND_S3_PATH="s3://harvelogix-020513638290-multimodal-dev-020513638290/deploy/backend.zip"
FRONTEND_BUCKET="harvelogixai-20260302095302-hostingbucket-dev"
CF_DISTRIBUTION_ID="E16NMKL0X0OCIV"
EC2_INSTANCE_ID="i-081aee7a8e818023d"

echo "🚀 Starting Full Production Deployment for HarveLogix AI"
echo "=========================================================="

# 1. DEPLOY LAMBDA AGENTS
echo "📦 Packaging and Deploying Lambda Agents..."
cd backend/agents
for agent in harvest_ready storage_scout supply_match water_wise quality_hub collective_voice; do
    echo "  - Packaging ${agent}..."
    zip -r ${agent}_agent.zip ${agent}_agent.py base_agent.py __init__.py ../config.py ../utils/ -q
done

aws lambda update-function-code --region $REGION --function-name harvelogix-020513638290-crop-health-analyzer-dev --zip-file fileb://harvest_ready_agent.zip > /dev/null
aws lambda update-function-code --region $REGION --function-name harvelogix-020513638290-irrigation-analyzer-dev --zip-file fileb://water_wise_agent.zip > /dev/null
aws lambda update-function-code --region $REGION --function-name harvelogix-020513638290-weather-analyzer-dev --zip-file fileb://storage_scout_agent.zip > /dev/null
aws lambda update-function-code --region $REGION --function-name harvelogix-020513638290-voice-query-processor-dev --zip-file fileb://supply_match_agent.zip > /dev/null
aws lambda update-function-code --region $REGION --function-name harvelogix-020513638290-video-analyzer-dev --zip-file fileb://quality_hub_agent.zip > /dev/null
aws lambda update-function-code --region $REGION --function-name harvelogix-020513638290-collective-voice-dev --zip-file fileb://collective_voice_agent.zip > /dev/null

echo "✅ Lambda Agents updated."
cd ../..

# 2. DEPLOY BACKEND TO EC2
echo "📦 Syncing Backend to EC2 via S3/SSM..."
# Create a temporary folder for zipping to avoid permission/node_modules issues
mkdir -p temp_deploy_backend
cp -r backend/* temp_deploy_backend/
rm -rf temp_deploy_backend/node_modules temp_deploy_backend/.venv temp_deploy_backend/__pycache__
cd temp_deploy_backend && zip -r ../backend.zip . -q && cd ..

aws s3 cp backend.zip $BACKEND_S3_PATH --region $REGION
rm -rf temp_deploy_backend backend.zip

aws ssm send-command \
  --instance-ids $EC2_INSTANCE_ID \
  --document-name "AWS-RunShellScript" \
  --comment "Deploying updated backend with Lambda support" \
  --parameters "commands=['cd /opt/harvelogix/backend', 'aws s3 cp $BACKEND_S3_PATH . --region $REGION', 'unzip -o backend.zip', 'npm install --production', 'NODE_ENV=production USE_LAMBDA=true AWS_REGION=$REGION pm2 restart harvelogix-backend --update-env || NODE_ENV=production USE_LAMBDA=true AWS_REGION=$REGION pm2 start server.js --name harvelogix-backend']" \
  --region $REGION > /dev/null

echo "✅ Backend updated and triggered PM2 restart."

# 3. DEPLOY FRONTEND TO S3/CLOUDFRONT
echo "📦 Syncing Frontend to S3/CloudFront..."
cd web-dashboard
npm install
npm run build
aws s3 sync dist/ s3://$FRONTEND_BUCKET --delete --region $REGION
aws cloudfront create-invalidation --distribution-id $CF_DISTRIBUTION_ID --paths "/*" --region $REGION > /dev/null

echo "✅ Frontend updated and CloudFront cache invalidated."
cd ..

echo "=========================================================="
echo "🎯 ALL SYSTEMS UPDATED! Your application is live at:"
echo "   https://d2autvkcn7doq.cloudfront.net"
echo "=========================================================="
