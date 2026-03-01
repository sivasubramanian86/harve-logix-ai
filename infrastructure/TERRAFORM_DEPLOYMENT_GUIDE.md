# Terraform Deployment Guide - HarveLogix Multimodal AI Scanner

## Overview

This guide provides step-by-step instructions for deploying the HarveLogix infrastructure using Terraform. All services will be deployed with invocations disabled until approval.

**Status**: Ready for Deployment
**Invocations**: DISABLED (set `enable_multimodal_services = false`)

---

## Prerequisites

### 1. Install Required Tools

```bash
# Install Terraform
# macOS
brew install terraform

# Windows (using Chocolatey)
choco install terraform

# Linux
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

### 2. Install AWS CLI

```bash
# macOS
brew install awscli

# Windows
choco install awscliv2

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### 3. Configure AWS Credentials

```bash
# Configure AWS CLI
aws configure

# Enter:
# AWS Access Key ID: [your-access-key]
# AWS Secret Access Key: [your-secret-key]
# Default region: ap-south-1
# Default output format: json
```

### 4. Verify Installation

```bash
terraform --version
aws --version
aws sts get-caller-identity
```

---

## Project Structure

```
infrastructure/
├── terraform/
│   ├── main.tf                 # Main configuration
│   ├── multimodal.tf           # Multimodal services
│   ├── variables.tf            # Variable definitions
│   ├── outputs.tf              # Output definitions
│   ├── terraform.tfvars        # Variable values
│   └── backend.tf              # State backend config
├── lambda_functions/
│   ├── crop_health_analyzer.zip
│   ├── irrigation_analyzer.zip
│   ├── weather_analyzer.zip
│   ├── voice_query_processor.zip
│   └── video_analyzer.zip
├── COST_ANALYSIS.md            # Cost breakdown
└── TERRAFORM_DEPLOYMENT_GUIDE.md (this file)
```

---

## Step 1: Prepare Terraform Files

### 1.1 Create Variables File

Create `infrastructure/terraform/variables.tf`:

```hcl
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "harvelogix"
}

variable "enable_multimodal_services" {
  description = "Enable multimodal AI services (set to false to disable invocations)"
  type        = bool
  default     = false  # DISABLED BY DEFAULT
}

variable "lambda_timeout_seconds" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 60
}

variable "lambda_memory_mb" {
  description = "Lambda function memory in MB"
  type        = number
  default     = 512
}

variable "max_concurrent_executions" {
  description = "Max concurrent Lambda executions"
  type        = number
  default     = 10
}
```

### 1.2 Create Terraform Variables File

Create `infrastructure/terraform/terraform.tfvars`:

```hcl
aws_region                  = "ap-south-1"
environment                 = "dev"
app_name                    = "harvelogix"
enable_multimodal_services  = false  # DISABLED - Enable after approval
lambda_timeout_seconds      = 60
lambda_memory_mb            = 512
max_concurrent_executions   = 10
```

### 1.3 Create Backend Configuration

Create `infrastructure/terraform/backend.tf`:

```hcl
terraform {
  backend "s3" {
    bucket         = "harvelogix-terraform-state-dev"
    key            = "terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

---

## Step 2: Initialize Terraform

### 2.1 Create S3 Bucket for State

```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://harvelogix-terraform-state-dev --region ap-south-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket harvelogix-terraform-state-dev \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket harvelogix-terraform-state-dev \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### 2.2 Create DynamoDB Table for Locks

```bash
# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
```

### 2.3 Initialize Terraform

```bash
# Navigate to terraform directory
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Expected output:
# Initializing the backend...
# Initializing provider plugins...
# Terraform has been successfully initialized!
```

---

## Step 3: Plan Deployment

### 3.1 Generate Terraform Plan

```bash
# Generate execution plan
terraform plan -out=tfplan

# Review the plan output
# This shows all resources that will be created
```

### 3.2 Review Plan Output

The plan should show:
- 1 KMS Key
- 2 DynamoDB Tables (multimodal_scans, scan_aggregations)
- 1 S3 Bucket (multimodal media)
- 5 Lambda Functions
- 1 IAM Role + Policy
- 1 API Gateway
- 6 CloudWatch Log Groups
- 2 CloudWatch Alarms

**Total Resources**: ~20 resources

---

## Step 4: Deploy Infrastructure

### 4.1 Apply Terraform Configuration

```bash
# Apply the plan
terraform apply tfplan

# Expected output:
# Apply complete! Resources: 20 added, 0 changed, 0 destroyed.
```

### 4.2 Verify Deployment

```bash
# Get outputs
terraform output

# Expected outputs:
# multimodal_s3_bucket = "harvelogix-multimodal-dev-123456789"
# multimodal_scans_table = "harvelogix-multimodal-scans-dev"
# crop_health_lambda_arn = "arn:aws:lambda:ap-south-1:123456789:function:harvelogix-crop-health-analyzer-dev"
# enable_multimodal_services = false
```

---

## Step 5: Verify AWS Resources

### 5.1 Check S3 Bucket

```bash
# List S3 buckets
aws s3 ls | grep multimodal

# Check bucket configuration
aws s3api get-bucket-versioning --bucket harvelogix-multimodal-dev-123456789
aws s3api get-bucket-lifecycle-configuration --bucket harvelogix-multimodal-dev-123456789
```

### 5.2 Check DynamoDB Tables

```bash
# List DynamoDB tables
aws dynamodb list-tables --region ap-south-1

# Describe multimodal_scans table
aws dynamodb describe-table \
  --table-name harvelogix-multimodal-scans-dev \
  --region ap-south-1
```

### 5.3 Check Lambda Functions

```bash
# List Lambda functions
aws lambda list-functions --region ap-south-1 | grep harvelogix

# Check function configuration
aws lambda get-function-configuration \
  --function-name harvelogix-crop-health-analyzer-dev \
  --region ap-south-1
```

### 5.4 Check API Gateway

```bash
# List API Gateways
aws apigatewayv2 get-apis --region ap-south-1

# Get API details
aws apigatewayv2 get-api \
  --api-id <api-id> \
  --region ap-south-1
```

---

## Step 6: Configure Lambda Functions

### 6.1 Package Lambda Functions

```bash
# Create lambda_functions directory
mkdir -p infrastructure/lambda_functions

# Create crop health analyzer
cd infrastructure/lambda_functions
cat > crop_health_analyzer.js << 'EOF'
exports.handler = async (event) => {
  console.log('Crop health analyzer invoked');
  
  const enableInvocation = process.env.ENABLE_INVOCATION === 'true';
  
  if (!enableInvocation) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Crop health analyzer is deployed but invocations are disabled',
        status: 'disabled'
      })
    };
  }
  
  // Actual analysis logic here
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Analysis complete' })
  };
};
EOF

# Zip the function
zip crop_health_analyzer.zip crop_health_analyzer.js

# Repeat for other functions...
```

### 6.2 Upload Lambda Functions

```bash
# Update Lambda function code
aws lambda update-function-code \
  --function-name harvelogix-crop-health-analyzer-dev \
  --zip-file fileb://crop_health_analyzer.zip \
  --region ap-south-1
```

---

## Step 7: Enable Monitoring

### 7.1 Check CloudWatch Logs

```bash
# List log groups
aws logs describe-log-groups --region ap-south-1 | grep harvelogix

# View recent logs
aws logs tail /aws/lambda/harvelogix-crop-health-analyzer-dev \
  --follow \
  --region ap-south-1
```

### 7.2 Check CloudWatch Alarms

```bash
# List alarms
aws cloudwatch describe-alarms --region ap-south-1 | grep harvelogix

# Get alarm details
aws cloudwatch describe-alarms \
  --alarm-names harvelogix-lambda-errors-dev \
  --region ap-south-1
```

---

## Step 8: Cost Verification

### 8.1 Estimate Costs

```bash
# Use AWS Pricing Calculator
# https://calculator.aws

# Or use AWS CLI to get pricing
aws ce get-cost-and-usage \
  --time-period Start=2026-03-01,End=2026-03-31 \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE \
  --region ap-south-1
```

### 8.2 Set Up Budget Alerts

```bash
# Create budget
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

---

## Step 9: Enable Invocations (After Approval)

### 9.1 Update Terraform Variables

Edit `infrastructure/terraform/terraform.tfvars`:

```hcl
enable_multimodal_services = true  # ENABLE after approval
```

### 9.2 Apply Changes

```bash
# Plan changes
terraform plan -out=tfplan

# Apply changes
terraform apply tfplan

# Verify
terraform output enable_multimodal_services
# Output: true
```

### 9.3 Test Lambda Functions

```bash
# Test crop health analyzer
aws lambda invoke \
  --function-name harvelogix-crop-health-analyzer-dev \
  --payload '{"test": true}' \
  --region ap-south-1 \
  response.json

# Check response
cat response.json
```

---

## Step 10: Cleanup (If Needed)

### 10.1 Destroy Infrastructure

```bash
# Plan destruction
terraform plan -destroy -out=tfplan

# Destroy resources
terraform destroy

# Confirm: yes
```

### 10.2 Clean Up S3 State

```bash
# Empty S3 bucket
aws s3 rm s3://harvelogix-terraform-state-dev --recursive

# Delete S3 bucket
aws s3 rb s3://harvelogix-terraform-state-dev

# Delete DynamoDB table
aws dynamodb delete-table \
  --table-name terraform-locks \
  --region ap-south-1
```

---

## Troubleshooting

### Issue: "Access Denied" Error

**Solution**:
```bash
# Verify AWS credentials
aws sts get-caller-identity

# Check IAM permissions
aws iam get-user
```

### Issue: "Bucket Already Exists"

**Solution**:
```bash
# Use unique bucket name
# Edit terraform.tfvars and change app_name or environment
```

### Issue: "Lambda Function Not Found"

**Solution**:
```bash
# Ensure Lambda function code is uploaded
aws lambda list-functions --region ap-south-1

# Update function code
aws lambda update-function-code \
  --function-name <function-name> \
  --zip-file fileb://function.zip
```

### Issue: "DynamoDB Throttling"

**Solution**:
```bash
# Switch to provisioned capacity
# Edit multimodal.tf and change billing_mode

# Or increase on-demand limits
aws dynamodb update-table \
  --table-name harvelogix-multimodal-scans-dev \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=100,WriteCapacityUnits=100
```

---

## Monitoring & Maintenance

### Daily Tasks

```bash
# Check CloudWatch logs
aws logs tail /aws/lambda/harvelogix-crop-health-analyzer-dev --follow

# Monitor costs
aws ce get-cost-and-usage --time-period Start=2026-03-01,End=2026-03-31 --granularity DAILY --metrics UnblendedCost
```

### Weekly Tasks

```bash
# Review alarms
aws cloudwatch describe-alarms --state-value ALARM

# Check DynamoDB metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedWriteCapacityUnits \
  --dimensions Name=TableName,Value=harvelogix-multimodal-scans-dev \
  --start-time 2026-02-22T00:00:00Z \
  --end-time 2026-03-01T00:00:00Z \
  --period 86400 \
  --statistics Sum
```

### Monthly Tasks

```bash
# Review costs
aws ce get-cost-and-usage --time-period Start=2026-02-01,End=2026-03-01 --granularity MONTHLY --metrics UnblendedCost

# Optimize resources
# Review unused resources
# Update reserved capacity
# Adjust Lambda memory/timeout
```

---

## Useful Commands

```bash
# Show Terraform state
terraform show

# Show specific resource
terraform show aws_lambda_function.crop_health_analyzer

# Validate configuration
terraform validate

# Format configuration
terraform fmt

# Get resource details
terraform state show aws_dynamodb_table.multimodal_scans

# Remove resource from state (without destroying)
terraform state rm aws_lambda_function.crop_health_analyzer

# Import existing resource
terraform import aws_s3_bucket.multimodal_media harvelogix-multimodal-dev-123456789
```

---

## Next Steps

1. ✅ Review cost analysis (COST_ANALYSIS.md)
2. ✅ Prepare Terraform files
3. ✅ Initialize Terraform
4. ✅ Plan deployment
5. ✅ Deploy infrastructure
6. ✅ Verify AWS resources
7. ✅ Configure Lambda functions
8. ✅ Enable monitoring
9. ⏳ Verify costs
10. ⏳ Enable invocations (after approval)

---

## Support & Resources

- **Terraform Documentation**: https://www.terraform.io/docs
- **AWS Terraform Provider**: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- **AWS CLI Documentation**: https://docs.aws.amazon.com/cli
- **AWS Support**: https://console.aws.amazon.com/support

---

**Document Version**: 1.0
**Last Updated**: March 1, 2026
**Status**: Ready for Deployment

