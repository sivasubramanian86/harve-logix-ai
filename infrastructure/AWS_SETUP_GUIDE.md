# AWS Setup Guide for HarveLogix Multimodal AI Scanner

This guide covers the AWS services required for the multimodal AI scanner implementation.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured locally
- Node.js and Python installed

## 1. EC2 Instance Setup

### Launch EC2 Instance

```bash
# Using AWS CLI
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name harvelogix-key \
  --security-groups harvelogix-sg \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=HarveLogix-Backend}]'
```

### Instance Configuration

1. **Instance Type**: t3.medium (2 vCPU, 4GB RAM)
2. **OS**: Amazon Linux 2 or Ubuntu 20.04 LTS
3. **Storage**: 30GB EBS volume
4. **Security Group**: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (Node.js)

### Setup Backend on EC2

```bash
# SSH into instance
ssh -i harvelogix-key.pem ec2-user@<instance-ip>

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Python
sudo yum install -y python3 python3-pip

# Clone repository
git clone https://github.com/your-org/harvelogix-ai.git
cd harvelogix-ai/backend

# Install dependencies
npm install
pip install -r requirements.txt

# Set environment variables
export AWS_REGION=us-east-1
export S3_BUCKET_NAME=harvelogix-multimodal
export VITE_USE_DEMO_DATA=false

# Start backend server
npm start
```

## 2. Amazon Bedrock Setup

### Enable Bedrock Models

1. Go to AWS Console → Bedrock
2. Click "Model access" in left sidebar
3. Click "Manage model access"
4. Enable the following models:
   - **Claude Sonnet 4.6** (anthropic.claude-sonnet-4-20250514)
   - **Claude 3 Haiku** (anthropic.claude-3-haiku-20240307-v1:0)

### Test Bedrock in Playground

1. Go to Bedrock Playground
2. Select Claude Sonnet 4.6
3. Test with sample prompts:

```
System Prompt:
You are an expert agricultural AI assistant. Analyze crop images and provide health assessments.

User Prompt:
Analyze this crop image for health status and provide recommendations.
```

### Configure Bedrock in Backend

```javascript
// backend/services/bedrockService.js
const AWS = require('aws-sdk')

const bedrock = new AWS.BedrockRuntime({
  region: process.env.AWS_REGION || 'us-east-1',
})

const MODEL_ID = 'anthropic.claude-sonnet-4-20250514'
```

## 3. AWS Lambda Setup

### Create Lambda Function for Multimodal Analysis

```bash
# Create Lambda function
aws lambda create-function \
  --function-name harvelogix-crop-health-analyzer \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://lambda-function.zip
```

### Lambda Function Code

```javascript
// lambda/cropHealthAnalyzer.js
const AWS = require('aws-sdk')
const bedrock = new AWS.BedrockRuntime()

exports.handler = async (event) => {
  try {
    const { imageUri } = JSON.parse(event.body)

    const params = {
      modelId: 'anthropic.claude-sonnet-4-20250514',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-06-01',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Analyze this crop image: ${imageUri}`,
          },
        ],
      }),
    }

    const response = await bedrock.invokeModel(params).promise()
    const result = JSON.parse(response.body.toString())

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}
```

### Lambda Permissions

```bash
# Allow Lambda to invoke Bedrock
aws iam attach-role-policy \
  --role-name lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess

# Allow Lambda to access S3
aws iam attach-role-policy \
  --role-name lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
```

### API Gateway Integration

```bash
# Create API Gateway
aws apigateway create-rest-api \
  --name harvelogix-multimodal-api \
  --description "Multimodal AI Scanner API"

# Create resource
aws apigateway create-resource \
  --rest-api-id <api-id> \
  --parent-id <root-id> \
  --path-part crop-health

# Create method
aws apigateway put-method \
  --rest-api-id <api-id> \
  --resource-id <resource-id> \
  --http-method POST \
  --authorization-type NONE
```

## 4. Aurora/RDS Database Setup

### Create Aurora PostgreSQL Cluster

```bash
# Create Aurora cluster
aws rds create-db-cluster \
  --db-cluster-identifier harvelogix-cluster \
  --engine aurora-postgresql \
  --engine-version 14.6 \
  --master-username admin \
  --master-user-password <strong-password> \
  --database-name harvelogix \
  --db-subnet-group-name default \
  --vpc-security-group-ids sg-xxxxxxxx
```

### Create Database Instance

```bash
# Create instance in cluster
aws rds create-db-instance \
  --db-instance-identifier harvelogix-instance-1 \
  --db-instance-class db.t3.medium \
  --engine aurora-postgresql \
  --db-cluster-identifier harvelogix-cluster
```

### Database Schema

```sql
-- Create tables for multimodal scans
CREATE TABLE multimodal_scans (
  scan_id UUID PRIMARY KEY,
  farmer_id VARCHAR(255) NOT NULL,
  scan_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50),
  data JSONB,
  s3_uri VARCHAR(500),
  processing_time_ms INTEGER,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for farmer queries
CREATE INDEX idx_multimodal_scans_farmer_id ON multimodal_scans(farmer_id);
CREATE INDEX idx_multimodal_scans_scan_type ON multimodal_scans(scan_type);
CREATE INDEX idx_multimodal_scans_timestamp ON multimodal_scans(timestamp);

-- Create table for scan aggregations
CREATE TABLE scan_aggregations (
  aggregation_id UUID PRIMARY KEY,
  region VARCHAR(255),
  scan_type VARCHAR(50),
  date DATE,
  total_scans INTEGER,
  avg_health_score DECIMAL(3,2),
  issues_detected INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for aggregation queries
CREATE INDEX idx_scan_aggregations_region ON scan_aggregations(region);
CREATE INDEX idx_scan_aggregations_date ON scan_aggregations(date);
```

### Connect Backend to RDS

```javascript
// backend/config.js
const { Pool } = require('pg')

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
})

module.exports = pool
```

## 5. S3 Bucket Setup

### Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://harvelogix-multimodal --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket harvelogix-multimodal \
  --versioning-configuration Status=Enabled

# Set lifecycle policy
aws s3api put-bucket-lifecycle-configuration \
  --bucket harvelogix-multimodal \
  --lifecycle-configuration file://lifecycle.json
```

### Lifecycle Policy (lifecycle.json)

```json
{
  "Rules": [
    {
      "Id": "DeleteOldScans",
      "Status": "Enabled",
      "Prefix": "multimodal/",
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
```

## 6. DynamoDB Setup (Alternative to RDS)

### Create DynamoDB Table

```bash
# Create table
aws dynamodb create-table \
  --table-name MultimodalScans \
  --attribute-definitions \
    AttributeName=scan_id,AttributeType=S \
    AttributeName=farmer_id,AttributeType=S \
    AttributeName=timestamp,AttributeType=N \
  --key-schema \
    AttributeName=scan_id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=FarmerIdIndex,Keys=[{AttributeName=farmer_id,KeyType=HASH},{AttributeName=timestamp,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --billing-mode PAY_PER_REQUEST
```

## 7. Environment Variables

Create `.env` file in backend directory:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>

# S3 Configuration
S3_BUCKET_NAME=harvelogix-multimodal

# Database Configuration
DB_USER=admin
DB_PASSWORD=<strong-password>
DB_HOST=harvelogix-cluster.cluster-xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=harvelogix

# Bedrock Configuration
BEDROCK_MODEL_ID=anthropic.claude-sonnet-4-20250514

# Weather API
WEATHER_API_KEY=<openweathermap-api-key>

# Demo Mode
VITE_USE_DEMO_DATA=false
```

## 8. Monitoring and Logging

### CloudWatch Logs

```bash
# Create log group
aws logs create-log-group --log-group-name /aws/harvelogix/multimodal

# Create log stream
aws logs create-log-stream \
  --log-group-name /aws/harvelogix/multimodal \
  --log-stream-name backend
```

### CloudWatch Alarms

```bash
# Create alarm for Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name harvelogix-lambda-errors \
  --alarm-description "Alert on Lambda function errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

## 9. Security Best Practices

1. **IAM Roles**: Use least privilege principle
2. **Encryption**: Enable encryption at rest and in transit
3. **VPC**: Deploy in private subnets with NAT gateway
4. **Secrets Manager**: Store sensitive data in AWS Secrets Manager
5. **API Keys**: Rotate API keys regularly

## 10. Cost Optimization

- Use S3 Intelligent-Tiering for automatic cost optimization
- Set up lifecycle policies to delete old scans
- Use Aurora Serverless for variable workloads
- Monitor Lambda execution time and optimize code
- Use CloudWatch cost anomaly detection

## Deployment Checklist

- [ ] EC2 instance running and accessible
- [ ] Bedrock models enabled and tested
- [ ] Lambda functions created and tested
- [ ] Aurora/RDS database created and schema applied
- [ ] S3 bucket created with lifecycle policies
- [ ] Environment variables configured
- [ ] IAM roles and policies set up
- [ ] CloudWatch logs and alarms configured
- [ ] Security groups configured correctly
- [ ] SSL/TLS certificates installed
- [ ] Monitoring and alerting enabled
- [ ] Backup and disaster recovery plan in place

## Troubleshooting

### Bedrock Access Denied
- Verify model access is enabled in Bedrock console
- Check IAM permissions for BedrockRuntime

### Lambda Timeout
- Increase Lambda timeout to 60 seconds
- Optimize Bedrock invocation code

### RDS Connection Issues
- Verify security group allows inbound traffic on port 5432
- Check database credentials
- Verify VPC and subnet configuration

### S3 Upload Failures
- Check S3 bucket permissions
- Verify bucket exists in correct region
- Check file size limits

## Support

For issues or questions, refer to:
- AWS Documentation: https://docs.aws.amazon.com
- Bedrock Guide: https://docs.aws.amazon.com/bedrock
- RDS Guide: https://docs.aws.amazon.com/rds
