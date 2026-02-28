# HarveLogix AI - Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying HarveLogix AI to production on AWS.

## Prerequisites

### Required Tools
- AWS CLI v2 (https://aws.amazon.com/cli/)
- Python 3.11+ (https://www.python.org/)
- Node.js 18+ (https://nodejs.org/)
- Git (https://git-scm.com/)
- Terraform (optional, for IaC deployment)

### AWS Account Setup
1. Create an AWS account (https://aws.amazon.com/)
2. Create an IAM user with programmatic access
3. Configure AWS CLI: `aws configure`
4. Ensure the IAM user has permissions for:
   - CloudFormation
   - Lambda
   - DynamoDB
   - RDS
   - S3
   - Cognito
   - EventBridge
   - KMS
   - IAM

### Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
# Edit .env with your AWS credentials and configuration
```

## Phase 1: Infrastructure Deployment

### Step 1: Deploy AWS Infrastructure

#### Option A: Using CloudFormation (Recommended)

**On Linux/macOS:**
```bash
./scripts/deploy-stack.sh dev
```

**On Windows (PowerShell):**
```powershell
.\scripts\deploy-stack.ps1 -Environment dev
```

This will:
- Create KMS encryption keys
- Create DynamoDB tables (farmers, agent_decisions, processor_profiles)
- Create S3 buckets (models, images)
- Create Lambda execution role
- Create EventBridge event bus
- Create SQS dead-letter queue
- Create Cognito user pool
- Create CloudWatch log groups

#### Option B: Using Terraform

```bash
cd infrastructure/terraform
terraform init
terraform plan -var-file="environments/dev.tfvars"
terraform apply -var-file="environments/dev.tfvars"
```

### Step 2: Verify Infrastructure

```bash
# List DynamoDB tables
aws dynamodb list-tables --region ap-south-1

# List S3 buckets
aws s3 ls

# List Lambda execution roles
aws iam list-roles --query "Roles[?contains(RoleName, 'harvelogix')]"
```

## Phase 2: Backend Deployment

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Run Tests

```bash
# Run all tests
pytest tests/ -v --cov=agents --cov=core --cov-report=html

# Run specific test file
pytest tests/test_harvest_ready_agent.py -v

# Run property-based tests
pytest tests/test_agents_property_based.py -v
```

### Step 3: Package Lambda Functions

```bash
# Create deployment package
mkdir -p build
cp -r agents build/
cp -r core build/
cp -r utils build/
cp config.py build/
cp requirements.txt build/

# Install dependencies in build directory
pip install -r requirements.txt -t build/

# Create ZIP file
cd build
zip -r ../harvelogix-agents.zip .
cd ..
```

### Step 4: Deploy Lambda Functions

```bash
# Deploy HarvestReady Agent
aws lambda create-function \
    --function-name harvelogix-harvest-ready-dev \
    --runtime python3.11 \
    --role arn:aws:iam::ACCOUNT_ID:role/harvelogix-lambda-role-dev \
    --handler agents.harvest_ready_agent.lambda_handler \
    --zip-file fileb://harvelogix-agents.zip \
    --timeout 60 \
    --memory-size 512 \
    --region ap-south-1

# Deploy other agents similarly
# (StorageScout, SupplyMatch, WaterWise, QualityHub, CollectiveVoice)
```

## Phase 3: Database Setup

### Step 1: Create RDS Aurora PostgreSQL Cluster

```bash
aws rds create-db-cluster \
    --db-cluster-identifier harvelogix-cluster-dev \
    --engine aurora-postgresql \
    --engine-version 14.6 \
    --master-username admin \
    --master-user-password YOUR_PASSWORD \
    --database-name harvelogix \
    --db-subnet-group-name default \
    --vpc-security-group-ids sg-xxxxxxxx \
    --region ap-south-1
```

### Step 2: Load Initial Data

```bash
# Connect to RDS
psql -h harvelogix-cluster-dev.cluster-XXXXX.ap-south-1.rds.amazonaws.com \
     -U admin \
     -d harvelogix

# Create tables and load data
\i backend/sql/schema.sql
\i backend/sql/seed_data.sql
```

### Step 3: Create Read Replica

```bash
aws rds create-db-instance \
    --db-instance-identifier harvelogix-read-replica-dev \
    --db-instance-class db.t3.medium \
    --engine aurora-postgresql \
    --db-cluster-identifier harvelogix-cluster-dev \
    --region ap-south-1
```

## Phase 4: API Gateway Setup

### Step 1: Create REST API

```bash
# Create API Gateway
aws apigateway create-rest-api \
    --name harvelogix-api-dev \
    --description "HarveLogix AI API" \
    --region ap-south-1
```

### Step 2: Create Resources and Methods

```bash
# Create /harvest-ready resource
# Create POST method
# Integrate with Lambda function
# Deploy to stage
```

### Step 3: Configure Rate Limiting

```bash
# Create usage plan
aws apigateway create-usage-plan \
    --name harvelogix-usage-plan-dev \
    --description "HarveLogix usage plan" \
    --throttle burstLimit=100,rateLimit=100 \
    --region ap-south-1
```

## Phase 5: Monitoring Setup

### Step 1: Create CloudWatch Dashboards

```bash
aws cloudwatch put-dashboard \
    --dashboard-name harvelogix-dashboard-dev \
    --dashboard-body file://monitoring/dashboard.json \
    --region ap-south-1
```

### Step 2: Create Alarms

```bash
# Lambda error rate alarm
aws cloudwatch put-metric-alarm \
    --alarm-name harvelogix-lambda-errors-dev \
    --alarm-description "Alert on Lambda errors" \
    --metric-name Errors \
    --namespace AWS/Lambda \
    --statistic Sum \
    --period 300 \
    --threshold 10 \
    --comparison-operator GreaterThanThreshold \
    --region ap-south-1

# DynamoDB throttling alarm
aws cloudwatch put-metric-alarm \
    --alarm-name harvelogix-dynamodb-throttle-dev \
    --alarm-description "Alert on DynamoDB throttling" \
    --metric-name ConsumedWriteCapacityUnits \
    --namespace AWS/DynamoDB \
    --statistic Sum \
    --period 300 \
    --threshold 1000 \
    --comparison-operator GreaterThanThreshold \
    --region ap-south-1
```

## Phase 6: Security Configuration

### Step 1: Enable Encryption

```bash
# Enable S3 bucket encryption
aws s3api put-bucket-encryption \
    --bucket harvelogix-models-dev-ACCOUNT_ID \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "aws:kms",
                "KMSMasterKeyID": "arn:aws:kms:ap-south-1:ACCOUNT_ID:key/KEY_ID"
            }
        }]
    }' \
    --region ap-south-1
```

### Step 2: Enable CloudTrail

```bash
aws cloudtrail create-trail \
    --name harvelogix-trail-dev \
    --s3-bucket-name harvelogix-cloudtrail-dev \
    --region ap-south-1

aws cloudtrail start-logging \
    --trail-name harvelogix-trail-dev \
    --region ap-south-1
```

### Step 3: Configure WAF

```bash
# Create WAF rules
aws wafv2 create-web-acl \
    --name harvelogix-waf-dev \
    --scope REGIONAL \
    --default-action Block={} \
    --rules file://waf-rules.json \
    --region ap-south-1
```

## Phase 7: Testing

### Step 1: Run Integration Tests

```bash
pytest tests/integration/ -v
```

### Step 2: Load Testing

```bash
# Using Apache JMeter
jmeter -n -t load-test.jmx -l results.jtl -j jmeter.log

# Using Apache Bench
ab -n 10000 -c 100 https://api.harvelogix.ai/v1/harvest-ready
```

### Step 3: Security Testing

```bash
# SQL injection testing
# XSS testing
# DDoS simulation
# Penetration testing
```

## Phase 8: Production Deployment

### Step 1: Deploy to Staging

```bash
# Deploy infrastructure to staging
./scripts/deploy-stack.sh staging

# Deploy backend to staging
# Run smoke tests
# Verify all systems
```

### Step 2: Deploy to Production

```bash
# Deploy infrastructure to production
./scripts/deploy-stack.sh prod

# Deploy backend to production
# Monitor system health
# Collect metrics
```

### Step 3: Post-Deployment Verification

```bash
# Test all API endpoints
curl -X POST https://api.harvelogix.ai/v1/harvest-ready \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "crop_type": "tomato",
    "current_growth_stage": 8,
    "location": {"latitude": 15.8, "longitude": 75.6}
  }'

# Verify database connectivity
# Verify S3 access
# Verify Lambda execution
# Verify EventBridge routing
```

## Troubleshooting

### Lambda Deployment Issues

**Problem:** Lambda function not found
```bash
# Solution: Verify function name and region
aws lambda list-functions --region ap-south-1
```

**Problem:** Permission denied
```bash
# Solution: Check IAM role permissions
aws iam get-role --role-name harvelogix-lambda-role-dev
```

### DynamoDB Issues

**Problem:** Table not found
```bash
# Solution: Verify table exists
aws dynamodb describe-table --table-name harvelogix-farmers-dev --region ap-south-1
```

**Problem:** Throttling errors
```bash
# Solution: Increase throughput
aws dynamodb update-table \
    --table-name harvelogix-farmers-dev \
    --billing-mode PAY_PER_REQUEST \
    --region ap-south-1
```

### API Gateway Issues

**Problem:** 403 Forbidden
```bash
# Solution: Check API key and usage plan
aws apigateway get-api-keys --region ap-south-1
```

**Problem:** 504 Gateway Timeout
```bash
# Solution: Check Lambda timeout and memory
aws lambda get-function-configuration \
    --function-name harvelogix-harvest-ready-dev \
    --region ap-south-1
```

## Monitoring & Maintenance

### Daily Tasks
- Monitor CloudWatch dashboards
- Check error logs
- Verify system health

### Weekly Tasks
- Review performance metrics
- Check cost optimization
- Update security patches

### Monthly Tasks
- Review and optimize queries
- Analyze user feedback
- Plan capacity upgrades

## Rollback Procedures

### Rollback Lambda Function

```bash
# Get previous version
aws lambda list-versions-by-function \
    --function-name harvelogix-harvest-ready-dev \
    --region ap-south-1

# Update alias to previous version
aws lambda update-alias \
    --function-name harvelogix-harvest-ready-dev \
    --name LIVE \
    --function-version 1 \
    --region ap-south-1
```

### Rollback CloudFormation Stack

```bash
# Continue update rollback
aws cloudformation continue-update-rollback \
    --stack-name harvelogix-stack-prod \
    --region ap-south-1
```

## Support & Resources

- **AWS Documentation:** https://docs.aws.amazon.com
- **Bedrock Guide:** https://docs.aws.amazon.com/bedrock
- **Lambda Guide:** https://docs.aws.amazon.com/lambda
- **DynamoDB Guide:** https://docs.aws.amazon.com/dynamodb
- **GitHub Repository:** https://github.com/sivasubramanian86/harve-logix-ai

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing (87%+ coverage)
- [ ] Code reviewed and approved
- [ ] Security scan completed
- [ ] Performance tested
- [ ] Documentation updated
- [ ] Monitoring configured
- [ ] Backup procedures tested
- [ ] Disaster recovery plan reviewed
- [ ] Team trained on deployment
- [ ] Rollback procedures documented

---

**Last Updated:** 2026-02-28
**Status:** Production Ready
**Version:** 1.0.0
