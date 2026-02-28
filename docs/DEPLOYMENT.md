# HarveLogix AI - Deployment Guide

## Overview

This guide covers deploying HarveLogix AI to AWS environments (Development, Staging, Production).

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured (`aws configure`)
- Terraform 1.0+ or AWS CloudFormation
- Python 3.11+
- Node.js 18+
- Docker (optional)
- Git

## Environment Setup

### 1. AWS Credentials

```bash
# Configure AWS credentials
aws configure

# Verify configuration
aws sts get-caller-identity
```

### 2. Environment Variables

Create `.env` files for each environment:

**`.env.dev`**
```
AWS_REGION=ap-south-1
ENVIRONMENT=dev
BEDROCK_MODEL=claude-3-5-sonnet
DYNAMODB_BILLING_MODE=PAY_PER_REQUEST
RDS_INSTANCE_CLASS=db.t3.micro
REDSHIFT_NODE_TYPE=dc2.large
```

**`.env.staging`**
```
AWS_REGION=ap-south-1
ENVIRONMENT=staging
BEDROCK_MODEL=claude-3-5-sonnet
DYNAMODB_BILLING_MODE=PAY_PER_REQUEST
RDS_INSTANCE_CLASS=db.t3.small
REDSHIFT_NODE_TYPE=dc2.large
```

**`.env.prod`**
```
AWS_REGION=ap-south-1
ENVIRONMENT=prod
BEDROCK_MODEL=claude-3-5-sonnet
DYNAMODB_BILLING_MODE=PROVISIONED
RDS_INSTANCE_CLASS=db.t3.medium
REDSHIFT_NODE_TYPE=dc2.xlarge
```

## Infrastructure Deployment

### Option 1: Terraform

#### 1. Initialize Terraform

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Select workspace
terraform workspace select dev
# or create new workspace
terraform workspace new dev
```

#### 2. Plan Deployment

```bash
# Plan infrastructure changes
terraform plan -var-file="environments/dev.tfvars" -out=tfplan

# Review the plan
cat tfplan
```

#### 3. Apply Deployment

```bash
# Apply infrastructure changes
terraform apply tfplan

# Save outputs
terraform output -json > outputs.json
```

#### 4. Verify Deployment

```bash
# Check resources
aws ec2 describe-instances --region ap-south-1
aws dynamodb list-tables --region ap-south-1
aws rds describe-db-instances --region ap-south-1
```

### Option 2: AWS CloudFormation

#### 1. Create Stack

```bash
cd infrastructure/cloudformation

# Create stack
aws cloudformation create-stack \
  --stack-name harvelogix-dev \
  --template-body file://main.yaml \
  --parameters ParameterKey=Environment,ParameterValue=dev \
  --region ap-south-1

# Monitor stack creation
aws cloudformation describe-stacks \
  --stack-name harvelogix-dev \
  --region ap-south-1
```

#### 2. Update Stack

```bash
# Update stack
aws cloudformation update-stack \
  --stack-name harvelogix-dev \
  --template-body file://main.yaml \
  --parameters ParameterKey=Environment,ParameterValue=dev \
  --region ap-south-1
```

## Lambda Deployment

### 1. Build Lambda Functions

```bash
cd backend

# Create deployment package
./scripts/build-lambda.sh dev

# Output: lambda-packages/
```

### 2. Deploy Lambda Functions

```bash
# Deploy all agents
./scripts/deploy-agents.sh dev

# Deploy specific agent
./scripts/deploy-agent.sh harvest_ready dev

# Verify deployment
aws lambda list-functions --region ap-south-1 | grep harvelogix
```

### 3. Test Lambda Functions

```bash
# Test HarvestReady Agent
aws lambda invoke \
  --function-name harvelogix-harvest-ready-agent-dev \
  --payload '{"crop_type":"tomato","growth_stage":8}' \
  --region ap-south-1 \
  response.json

cat response.json
```

## Database Setup

### 1. DynamoDB Tables

```bash
# Create tables (via Terraform/CloudFormation)
# Or manually:

# Create farmers table
aws dynamodb create-table \
  --table-name farmers-dev \
  --attribute-definitions \
    AttributeName=farmer_id,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
  --key-schema \
    AttributeName=farmer_id,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1

# Create agent_decisions table
aws dynamodb create-table \
  --table-name agent_decisions-dev \
  --attribute-definitions \
    AttributeName=farmer_id,AttributeType=S \
    AttributeName=decision_timestamp,AttributeType=S \
  --key-schema \
    AttributeName=farmer_id,KeyType=HASH \
    AttributeName=decision_timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --ttl-specification AttributeName=ttl,Enabled=true \
  --region ap-south-1
```

### 2. RDS Aurora Setup

```bash
# Create RDS cluster (via Terraform/CloudFormation)
# Or manually:

aws rds create-db-cluster \
  --db-cluster-identifier harvelogix-dev \
  --engine aurora-postgresql \
  --master-username admin \
  --master-user-password <strong_password> \
  --region ap-south-1

# Wait for cluster to be available
aws rds describe-db-clusters \
  --db-cluster-identifier harvelogix-dev \
  --region ap-south-1
```

### 3. Load Initial Data

```bash
# Connect to RDS
psql -h <rds-endpoint> -U admin -d harvelogix

# Load crop phenology data
\copy crop_phenology FROM 'data/crop_phenology.csv' WITH CSV HEADER;

# Load market prices data
\copy market_prices FROM 'data/market_prices.csv' WITH CSV HEADER;

# Load government schemes
\copy government_schemes FROM 'data/government_schemes.csv' WITH CSV HEADER;

# Verify data
SELECT COUNT(*) FROM crop_phenology;
SELECT COUNT(*) FROM market_prices;
SELECT COUNT(*) FROM government_schemes;
```

### 4. Redshift Setup

```bash
# Create Redshift cluster (via Terraform/CloudFormation)
# Or manually:

aws redshift create-cluster \
  --cluster-identifier harvelogix-dev \
  --node-type dc2.large \
  --master-username admin \
  --master-user-password <strong_password> \
  --number-of-nodes 2 \
  --region ap-south-1

# Wait for cluster to be available
aws redshift describe-clusters \
  --cluster-identifier harvelogix-dev \
  --region ap-south-1
```

## API Gateway Deployment

### 1. Create API

```bash
# Deploy API Gateway (via Terraform/CloudFormation)
# Or manually:

aws apigateway create-rest-api \
  --name harvelogix-api-dev \
  --description "HarveLogix AI API" \
  --region ap-south-1
```

### 2. Configure Endpoints

```bash
# Create resources and methods
# This is typically done via Terraform/CloudFormation

# Verify API
aws apigateway get-rest-apis --region ap-south-1
```

### 3. Deploy API

```bash
# Create deployment
aws apigateway create-deployment \
  --rest-api-id <api-id> \
  --stage-name dev \
  --region ap-south-1

# Get API endpoint
aws apigateway get-stage \
  --rest-api-id <api-id> \
  --stage-name dev \
  --region ap-south-1
```

## Cognito Setup

### 1. Create User Pool

```bash
# Create user pool (via Terraform/CloudFormation)
# Or manually:

aws cognito-idp create-user-pool \
  --pool-name harvelogix-farmers-dev \
  --policies PasswordPolicy='{MinimumLength=8,RequireUppercase=false,RequireLowercase=false,RequireNumbers=false,RequireSymbols=false}' \
  --region ap-south-1
```

### 2. Create User Pool Client

```bash
aws cognito-idp create-user-pool-client \
  --user-pool-id <pool-id> \
  --client-name harvelogix-app \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --region ap-south-1
```

## Mobile App Deployment

### 1. Build Mobile App

```bash
cd mobile-app

# Install dependencies
npm install

# Build for iOS
npm run build:ios

# Build for Android
npm run build:android
```

### 2. Deploy to App Stores

```bash
# iOS - Upload to App Store
npm run deploy:ios

# Android - Upload to Google Play
npm run deploy:android
```

## Monitoring Setup

### 1. CloudWatch Dashboards

```bash
# Create dashboard (via Terraform/CloudFormation)
# Or manually:

aws cloudwatch put-dashboard \
  --dashboard-name harvelogix-dev \
  --dashboard-body file://monitoring/dashboard.json \
  --region ap-south-1
```

### 2. CloudWatch Alarms

```bash
# Create alarms (via Terraform/CloudFormation)
# Or manually:

aws cloudwatch put-metric-alarm \
  --alarm-name harvelogix-error-rate-dev \
  --alarm-description "Alert when error rate exceeds 0.1%" \
  --metric-name ErrorRate \
  --namespace HarveLogix \
  --statistic Average \
  --period 300 \
  --threshold 0.001 \
  --comparison-operator GreaterThanThreshold \
  --region ap-south-1
```

## Testing Deployment

### 1. Smoke Tests

```bash
# Run smoke tests
./scripts/smoke-tests.sh dev

# Expected output:
# ✓ API Gateway is responding
# ✓ Lambda functions are deployed
# ✓ DynamoDB tables are accessible
# ✓ RDS is accessible
# ✓ Cognito is configured
```

### 2. Integration Tests

```bash
# Run integration tests
pytest backend/tests/integration/ -v --env=dev

# Expected output:
# test_harvest_ready_agent PASSED
# test_storage_scout_agent PASSED
# test_supply_match_agent PASSED
# ...
```

### 3. Load Tests

```bash
# Run load tests
./scripts/load-test.sh dev

# Expected output:
# Simulating 10K concurrent requests...
# Average response time: 45ms
# p99 response time: 98ms
# Success rate: 99.95%
```

## Rollback Procedures

### Terraform Rollback

```bash
# View previous state
terraform state list

# Rollback to previous version
terraform destroy -var-file="environments/dev.tfvars"

# Or revert to previous commit
git revert <commit-hash>
terraform apply -var-file="environments/dev.tfvars"
```

### CloudFormation Rollback

```bash
# Rollback stack
aws cloudformation cancel-update-stack \
  --stack-name harvelogix-dev \
  --region ap-south-1

# Or delete and recreate
aws cloudformation delete-stack \
  --stack-name harvelogix-dev \
  --region ap-south-1
```

### Lambda Rollback

```bash
# Rollback to previous version
aws lambda update-function-code \
  --function-name harvelogix-harvest-ready-agent-dev \
  --s3-bucket harvelogix-lambda-packages \
  --s3-key harvest-ready-agent-v1.0.zip \
  --region ap-south-1
```

## Production Deployment Checklist

- [ ] All tests passing (unit, integration, load)
- [ ] Security scan completed (no vulnerabilities)
- [ ] Code review approved
- [ ] Infrastructure reviewed
- [ ] Monitoring configured
- [ ] Backup procedures tested
- [ ] Disaster recovery plan reviewed
- [ ] Team trained on deployment
- [ ] Rollback procedures documented
- [ ] Stakeholders notified

## Troubleshooting

### Lambda Deployment Issues

```bash
# Check Lambda logs
aws logs tail /aws/lambda/harvelogix-harvest-ready-agent-dev --follow

# Check Lambda configuration
aws lambda get-function-configuration \
  --function-name harvelogix-harvest-ready-agent-dev \
  --region ap-south-1
```

### DynamoDB Issues

```bash
# Check table status
aws dynamodb describe-table \
  --table-name farmers-dev \
  --region ap-south-1

# Check capacity
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedWriteCapacityUnits \
  --dimensions Name=TableName,Value=farmers-dev \
  --start-time 2026-01-25T00:00:00Z \
  --end-time 2026-01-26T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

### RDS Issues

```bash
# Check RDS status
aws rds describe-db-instances \
  --db-instance-identifier harvelogix-dev \
  --region ap-south-1

# Check RDS logs
aws rds describe-db-log-files \
  --db-instance-identifier harvelogix-dev \
  --region ap-south-1
```

## Support

- **Documentation:** [docs/](../docs/)
- **Issues:** [GitHub Issues](https://github.com/sivasubramanian86/harve-logix-ai/issues)
- **Email:** support@harvelogix.ai

---

**Last Updated:** 2026-01-25  
**Deployment Version:** 1.0  
**Status:** Active
