# HarveLogix AI - AWS CloudFormation Stack Deployment Script (PowerShell)
# Usage: .\scripts\deploy-stack.ps1 -Environment dev

param(
    [string]$Environment = "dev"
)

$AppName = "harvelogix"
$Region = "ap-south-1"
$StackName = "$AppName-stack-$Environment"

Write-Host "🚀 Deploying HarveLogix AI CloudFormation Stack" -ForegroundColor Green
Write-Host "Environment: $Environment"
Write-Host "Stack Name: $StackName"
Write-Host "Region: $Region"
Write-Host ""

# Check if AWS CLI is installed
try {
    aws --version | Out-Null
} catch {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if CloudFormation template exists
if (-not (Test-Path "infrastructure/cloudformation/harvelogix-stack.yaml")) {
    Write-Host "❌ CloudFormation template not found at infrastructure/cloudformation/harvelogix-stack.yaml" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Validating CloudFormation template..."
aws cloudformation validate-template `
    --template-body file://infrastructure/cloudformation/harvelogix-stack.yaml `
    --region $Region | Out-Null

Write-Host "✅ Template validation passed" -ForegroundColor Green
Write-Host ""

# Check if stack exists
Write-Host "🔍 Checking if stack exists..."
$stackExists = aws cloudformation describe-stacks --stack-name $StackName --region $Region 2>$null

if ($stackExists) {
    Write-Host "📝 Stack exists. Updating..."
    aws cloudformation update-stack `
        --stack-name $StackName `
        --template-body file://infrastructure/cloudformation/harvelogix-stack.yaml `
        --parameters ParameterKey=Environment,ParameterValue=$Environment `
                     ParameterKey=AppName,ParameterValue=$AppName `
        --capabilities CAPABILITY_NAMED_IAM `
        --region $Region
    
    Write-Host "⏳ Waiting for stack update to complete..."
    aws cloudformation wait stack-update-complete `
        --stack-name $StackName `
        --region $Region
} else {
    Write-Host "🆕 Stack does not exist. Creating..."
    aws cloudformation create-stack `
        --stack-name $StackName `
        --template-body file://infrastructure/cloudformation/harvelogix-stack.yaml `
        --parameters ParameterKey=Environment,ParameterValue=$Environment `
                     ParameterKey=AppName,ParameterValue=$AppName `
        --capabilities CAPABILITY_NAMED_IAM `
        --region $Region
    
    Write-Host "⏳ Waiting for stack creation to complete..."
    aws cloudformation wait stack-create-complete `
        --stack-name $StackName `
        --region $Region
}

Write-Host "✅ Stack deployment completed successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Stack Outputs:"
aws cloudformation describe-stacks `
    --stack-name $StackName `
    --region $Region `
    --query 'Stacks[0].Outputs' `
    --output table

Write-Host ""
Write-Host "💾 Saving outputs to .env file..."

# Extract outputs and save to .env
$outputs = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --region $Region `
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' `
    --output text

$outputs | ForEach-Object {
    $parts = $_ -split '\s+', 2
    if ($parts.Count -eq 2) {
        "$($parts[0])=$($parts[1])" | Add-Content -Path ".env"
    }
}

Write-Host "✅ Outputs saved to .env file" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Deployment complete! Your AWS infrastructure is ready." -ForegroundColor Green
