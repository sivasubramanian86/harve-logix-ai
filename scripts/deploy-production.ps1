$ErrorActionPreference = 'Stop'
$REGION = 'ap-south-2'
$ACCOUNT_ID = '020513638290'
$BACKEND_S3_PATH = 's3://harvelogix-020513638290-multimodal-dev-020513638290/deploy/backend.zip'
$FRONTEND_BUCKET = 'harvelogixai-20260302095302-hostingbucket-dev'
$CF_DISTRIBUTION_ID = 'E16NMKL0X0OCIV'
$EC2_INSTANCE_ID = 'i-081aee7a8e818023d'

Write-Host '🚀 Deployment Start' -ForegroundColor Cyan

# 1. Lambda
Set-Location 'backend/agents'
$agents = @('harvest_ready', 'storage_scout', 'supply_match', 'water_wise', 'quality_hub', 'collective_voice')
foreach ($a in $agents) {
    $z = "${a}_agent.zip"
    if (Test-Path $z) { Remove-Item $z }
    Compress-Archive -Path "${a}_agent.py", 'base_agent.py', '__init__.py', '../config.py', '../utils', '../core' -DestinationPath $z
}

$mapping = @{
    'harvest_ready_agent.zip' = 'harvelogix-020513638290-crop-health-analyzer-dev'
    'water_wise_agent.zip' = 'harvelogix-020513638290-irrigation-analyzer-dev'
    'storage_scout_agent.zip' = 'harvelogix-020513638290-weather-analyzer-dev'
    'supply_match_agent.zip' = 'harvelogix-020513638290-voice-query-processor-dev'
    'quality_hub_agent.zip' = 'harvelogix-020513638290-video-analyzer-dev'
    'collective_voice_agent.zip' = 'harvelogix-020513638290-collective-voice-dev'
}

foreach ($item in $mapping.GetEnumerator()) {
    $zip = $item.Key
    $func = $item.Value
    Write-Host "Updating $func..." -ForegroundColor Yellow
    aws lambda update-function-code --region $REGION --function-name $func --zip-file "fileb://$zip"
    aws lambda update-function-configuration --region $REGION --function-name $func --environment "Variables={BEDROCK_MODEL_ID=arn:aws:bedrock:ap-south-1:020513638290:application-inference-profile/hs79u71flmnc}"
}
Set-Location '../../'

# 2. EC2
if (Test-Path 'temp_deploy') { Remove-Item -Recurse -Force 'temp_deploy' }
New-Item -ItemType Directory -Path 'temp_deploy'
Copy-Item -Path 'backend/*' -Destination 'temp_deploy/' -Recurse
Remove-Item -Recurse -Force 'temp_deploy/node_modules', 'temp_deploy/.venv', 'temp_deploy/__pycache__' -ErrorAction SilentlyContinue
if (Test-Path 'backend.zip') { Remove-Item 'backend.zip' }
Compress-Archive -Path 'temp_deploy/*' -DestinationPath 'backend.zip'
aws s3 cp 'backend.zip' $BACKEND_S3_PATH --region $REGION
$cmd = "cd /opt/harvelogix/backend && aws s3 cp $BACKEND_S3_PATH . --region $REGION && unzip -o backend.zip && npm install --production && NODE_ENV=production USE_LAMBDA=true AWS_REGION=$REGION pm2 restart harvelogix-backend --update-env || NODE_ENV=production USE_LAMBDA=true AWS_REGION=$REGION pm2 start server.js --name harvelogix-backend"
aws ssm send-command --instance-ids $EC2_INSTANCE_ID --document-name 'AWS-RunShellScript' --parameters "commands=['$cmd']" --region $REGION

# 3. Frontend
Set-Location 'web-dashboard'
npm install
npm run build
aws s3 sync dist/ "s3://$FRONTEND_BUCKET" --delete --region $REGION
aws cloudfront create-invalidation --distribution-id $CF_DISTRIBUTION_ID --paths '/*' --region $REGION
Set-Location '..'

Write-Host '✅ Success' -ForegroundColor Green
