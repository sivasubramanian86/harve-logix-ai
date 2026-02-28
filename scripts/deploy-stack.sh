#!/bin/bash

# HarveLogix AI - AWS CloudFormation Stack Deployment Script
# Usage: ./scripts/deploy-stack.sh [dev|staging|prod]

set -e

ENVIRONMENT=${1:-dev}
APP_NAME="harvelogix"
REGION="ap-south-1"
STACK_NAME="${APP_NAME}-stack-${ENVIRONMENT}"

echo "🚀 Deploying HarveLogix AI CloudFormation Stack"
echo "Environment: $ENVIRONMENT"
echo "Stack Name: $STACK_NAME"
echo "Region: $REGION"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if CloudFormation template exists
if [ ! -f "infrastructure/cloudformation/harvelogix-stack.yaml" ]; then
    echo "❌ CloudFormation template not found at infrastructure/cloudformation/harvelogix-stack.yaml"
    exit 1
fi

echo "📋 Validating CloudFormation template..."
aws cloudformation validate-template \
    --template-body file://infrastructure/cloudformation/harvelogix-stack.yaml \
    --region $REGION > /dev/null

echo "✅ Template validation passed"
echo ""

# Check if stack exists
echo "🔍 Checking if stack exists..."
if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION &> /dev/null; then
    echo "📝 Stack exists. Updating..."
    aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://infrastructure/cloudformation/harvelogix-stack.yaml \
        --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
                     ParameterKey=AppName,ParameterValue=$APP_NAME \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $REGION
    
    echo "⏳ Waiting for stack update to complete..."
    aws cloudformation wait stack-update-complete \
        --stack-name $STACK_NAME \
        --region $REGION
else
    echo "🆕 Stack does not exist. Creating..."
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://infrastructure/cloudformation/harvelogix-stack.yaml \
        --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
                     ParameterKey=AppName,ParameterValue=$APP_NAME \
        --capabilities CAPABILITY_NAMED_IAM \
        --region $REGION
    
    echo "⏳ Waiting for stack creation to complete..."
    aws cloudformation wait stack-create-complete \
        --stack-name $STACK_NAME \
        --region $REGION
fi

echo "✅ Stack deployment completed successfully!"
echo ""

echo "📊 Stack Outputs:"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs' \
    --output table

echo ""
echo "💾 Saving outputs to .env file..."

# Extract outputs and save to .env
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output text | while read key value; do
    echo "${key}=${value}" >> .env
done

echo "✅ Outputs saved to .env file"
echo ""
echo "🎉 Deployment complete! Your AWS infrastructure is ready."
