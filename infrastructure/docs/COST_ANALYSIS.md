# HarveLogix Multimodal AI Scanner - AWS Cost Analysis

## Executive Summary

This document provides a detailed cost breakdown for deploying the HarveLogix Multimodal AI Scanner on AWS. All services are deployed but invocations are disabled until approval.

**Estimated Monthly Cost**: $200 - $500 (depending on usage)

---

## 1. COMPUTE SERVICES

### 1.1 AWS Lambda (Multimodal Functions)

**Services Deployed**:
- Crop Health Analyzer
- Irrigation Analyzer
- Weather Analyzer
- Voice Query Processor
- Video Analyzer

**Pricing Model**: Pay-per-invocation + Duration

| Function | Memory | Timeout | Pricing |
|----------|--------|---------|---------|
| Crop Health | 512 MB | 60s | $0.0000166667/GB-second |
| Irrigation | 512 MB | 60s | $0.0000166667/GB-second |
| Weather | 512 MB | 60s | $0.0000166667/GB-second |
| Voice Query | 512 MB | 60s | $0.0000166667/GB-second |
| Video | 1024 MB | 300s | $0.0000333333/GB-second |

**Free Tier**: 1,000,000 requests/month + 400,000 GB-seconds/month

**Cost Calculation** (Example: 1,000 invocations/month):
- Crop Health: 1,000 × 60s × 0.5GB × $0.0000166667 = $0.50
- Irrigation: 1,000 × 60s × 0.5GB × $0.0000166667 = $0.50
- Weather: 1,000 × 60s × 0.5GB × $0.0000166667 = $0.50
- Voice Query: 1,000 × 60s × 0.5GB × $0.0000166667 = $0.50
- Video: 500 × 300s × 1GB × $0.0000333333 = $5.00
- **Total Lambda**: ~$7.00/month (at 1,000 invocations)

**Scaling Costs**:
- 10,000 invocations/month: ~$70
- 100,000 invocations/month: ~$700
- 1,000,000 invocations/month: ~$7,000

**Status**: ✅ FREE TIER ELIGIBLE (first 1M requests/month)

---

## 2. STORAGE SERVICES

### 2.1 Amazon S3 (Multimodal Media)

**Bucket**: `harvelogix-multimodal-{env}-{account-id}`

**Pricing Components**:

| Component | Cost | Notes |
|-----------|------|-------|
| Storage | $0.023/GB/month | First 50TB/month |
| PUT requests | $0.005 per 1,000 | Upload media files |
| GET requests | $0.0004 per 1,000 | Download/analyze files |
| Data transfer | $0.09/GB | Out to internet |
| Lifecycle transitions | $0.01 per 1,000 | Move to Glacier |

**Cost Calculation** (Example: 100GB stored, 1,000 uploads/month):
- Storage: 100GB × $0.023 = $2.30
- PUT requests: 1,000 × $0.005/1,000 = $0.005
- GET requests: 5,000 × $0.0004/1,000 = $0.002
- **Total S3**: ~$2.31/month

**Scaling Costs**:
- 1TB stored: ~$23/month
- 10TB stored: ~$230/month
- 100TB stored: ~$2,300/month

**Lifecycle Policy**: 90-day retention → Glacier (reduces cost by 80%)

**Status**: ✅ COST-EFFECTIVE (with lifecycle policies)

---

### 2.2 Amazon DynamoDB (Scan Storage)

**Tables**:
- `multimodal_scans` (Primary scan data)
- `scan_aggregations` (Aggregated metrics)

**Pricing Model**: On-Demand (PAY_PER_REQUEST)

| Operation | Cost |
|-----------|------|
| Write | $1.25 per million writes |
| Read | $0.25 per million reads |
| Storage | $0.25 per GB/month |

**Cost Calculation** (Example: 10,000 scans/month, 1GB storage):
- Writes: 10,000 × $1.25/1M = $0.0125
- Reads: 50,000 × $0.25/1M = $0.0125
- Storage: 1GB × $0.25 = $0.25
- **Total DynamoDB**: ~$0.28/month

**Scaling Costs**:
- 100,000 scans/month: ~$2.80
- 1,000,000 scans/month: ~$28
- 10,000,000 scans/month: ~$280

**Provisioned vs On-Demand**:
- On-Demand: Best for variable workloads (current setup)
- Provisioned: Better for predictable, high-volume workloads

**Status**: ✅ COST-EFFECTIVE (on-demand pricing)

---

## 3. AI/ML SERVICES

### 3.1 Amazon Bedrock (Claude Sonnet 4.6)

**Model**: `anthropic.claude-sonnet-4-20250514`

**Pricing Model**: Per token (input + output)

| Metric | Cost |
|--------|------|
| Input tokens | $0.003 per 1,000 tokens |
| Output tokens | $0.015 per 1,000 tokens |

**Token Estimation**:
- Average input: 500 tokens (image + prompt)
- Average output: 200 tokens (analysis result)
- Total per invocation: 700 tokens

**Cost Calculation** (Example: 1,000 invocations/month):
- Input: 1,000 × 500 × $0.003/1,000 = $1.50
- Output: 1,000 × 200 × $0.015/1,000 = $3.00
- **Total Bedrock**: ~$4.50/month

**Scaling Costs**:
- 10,000 invocations/month: ~$45
- 100,000 invocations/month: ~$450
- 1,000,000 invocations/month: ~$4,500

**Optimization Tips**:
- Use shorter prompts (fewer input tokens)
- Batch requests when possible
- Cache common prompts

**Status**: ⚠️ PAID SERVICE (no free tier)

---

### 3.2 Amazon Rekognition (Image Analysis)

**Services**:
- DetectLabels
- DetectText
- DetectFaces

**Pricing**:
- DetectLabels: $0.001 per image
- DetectText: $0.0015 per image
- DetectFaces: $0.0001 per image

**Cost Calculation** (Example: 1,000 images/month):
- DetectLabels: 1,000 × $0.001 = $1.00
- DetectText: 500 × $0.0015 = $0.75
- DetectFaces: 500 × $0.0001 = $0.05
- **Total Rekognition**: ~$1.80/month

**Scaling Costs**:
- 10,000 images/month: ~$18
- 100,000 images/month: ~$180
- 1,000,000 images/month: ~$1,800

**Status**: ⚠️ PAID SERVICE (no free tier)

---

### 3.3 Amazon Transcribe (Audio Transcription)

**Pricing**: $0.0001 per second of audio

**Cost Calculation** (Example: 100 hours audio/month):
- 100 hours × 3,600 seconds × $0.0001 = $36.00
- **Total Transcribe**: ~$36/month

**Scaling Costs**:
- 10 hours/month: $3.60
- 100 hours/month: $36
- 1,000 hours/month: $360

**Status**: ⚠️ PAID SERVICE (no free tier)

---

## 4. DATABASE SERVICES

### 4.1 Amazon RDS Aurora PostgreSQL (Optional)

**Instance Type**: db.t3.medium (2 vCPU, 4GB RAM)

**Pricing Components**:

| Component | Cost |
|-----------|------|
| Instance | $0.296/hour |
| Storage | $0.10/GB/month |
| Backup | $0.095/GB/month |
| Data transfer | $0.09/GB |

**Cost Calculation** (Example: 100GB storage):
- Instance: $0.296 × 730 hours = $216/month
- Storage: 100GB × $0.10 = $10/month
- Backup: 100GB × $0.095 = $9.50/month
- **Total RDS**: ~$235.50/month

**Status**: ⚠️ OPTIONAL (not required for MVP)

---

## 5. NETWORKING SERVICES

### 5.1 API Gateway

**Pricing**:
- HTTP API: $0.35 per million requests
- Data transfer: $0.09/GB out

**Cost Calculation** (Example: 100,000 requests/month):
- Requests: 100,000 × $0.35/1M = $0.035
- Data transfer: 10GB × $0.09 = $0.90
- **Total API Gateway**: ~$0.94/month

**Scaling Costs**:
- 1,000,000 requests/month: ~$0.35 + data transfer
- 10,000,000 requests/month: ~$3.50 + data transfer

**Status**: ✅ COST-EFFECTIVE

---

### 5.2 CloudFront (CDN - Optional)

**Pricing**:
- Data transfer: $0.085/GB (first 10TB)
- Requests: $0.0075 per 10,000 requests

**Status**: ⚠️ OPTIONAL (for production frontend)

---

## 6. MONITORING & LOGGING

### 6.1 CloudWatch

**Pricing Components**:

| Component | Cost |
|-----------|------|
| Logs ingestion | $0.50/GB |
| Logs storage | $0.03/GB/month |
| Metrics | $0.30 per custom metric |
| Alarms | $0.10 per alarm |

**Cost Calculation** (Example: 10GB logs/month):
- Ingestion: 10GB × $0.50 = $5.00
- Storage: 10GB × $0.03 = $0.30
- Metrics: 10 × $0.30 = $3.00
- Alarms: 5 × $0.10 = $0.50
- **Total CloudWatch**: ~$8.80/month

**Status**: ✅ COST-EFFECTIVE

---

## 7. SECURITY SERVICES

### 7.1 AWS KMS (Key Management)

**Pricing**:
- Key storage: $1.00/month per key
- API calls: $0.03 per 10,000 calls

**Cost Calculation**:
- Key storage: 1 × $1.00 = $1.00
- API calls: 100,000 × $0.03/10,000 = $0.30
- **Total KMS**: ~$1.30/month

**Status**: ✅ COST-EFFECTIVE

---

## 8. TOTAL COST SUMMARY

### Development Environment (Low Usage)

| Service | Monthly Cost |
|---------|--------------|
| Lambda | $7.00 |
| S3 | $2.31 |
| DynamoDB | $0.28 |
| Bedrock | $4.50 |
| Rekognition | $1.80 |
| Transcribe | $3.60 |
| API Gateway | $0.94 |
| CloudWatch | $8.80 |
| KMS | $1.30 |
| **TOTAL** | **~$30.53/month** |

### Production Environment (Medium Usage)

| Service | Monthly Cost |
|---------|--------------|
| Lambda | $70.00 |
| S3 | $23.00 |
| DynamoDB | $2.80 |
| Bedrock | $45.00 |
| Rekognition | $18.00 |
| Transcribe | $36.00 |
| API Gateway | $3.50 |
| CloudWatch | $25.00 |
| KMS | $1.30 |
| RDS Aurora (optional) | $235.50 |
| **TOTAL** | **~$460.10/month** |

### Enterprise Environment (High Usage)

| Service | Monthly Cost |
|---------|--------------|
| Lambda | $700.00 |
| S3 | $230.00 |
| DynamoDB | $28.00 |
| Bedrock | $450.00 |
| Rekognition | $180.00 |
| Transcribe | $360.00 |
| API Gateway | $35.00 |
| CloudWatch | $100.00 |
| KMS | $5.00 |
| RDS Aurora | $235.50 |
| **TOTAL** | **~$2,323.50/month** |

---

## 9. FREE TIER SERVICES

### AWS Free Tier Benefits (First 12 Months)

| Service | Free Allowance |
|---------|-----------------|
| Lambda | 1M requests + 400K GB-seconds |
| S3 | 5GB storage + 20K GET + 2K PUT |
| DynamoDB | 25GB storage + 25 write/read units |
| CloudWatch | 10 custom metrics + 10 alarms |
| API Gateway | 1M requests/month |
| Data Transfer | 1GB/month out |

**Estimated Free Tier Savings**: ~$50-100/month for first year

---

## 10. COST OPTIMIZATION STRATEGIES

### 1. Use Reserved Capacity
- Lambda: Reserved concurrency (10% discount)
- RDS: 1-year reserved instances (30% discount)
- DynamoDB: Provisioned capacity (40% discount for predictable workloads)

### 2. Implement Caching
- CloudFront for static assets
- ElastiCache for frequently accessed data
- API response caching

### 3. Optimize Data Transfer
- Use VPC endpoints (no data transfer charges)
- Compress data before transfer
- Use S3 Transfer Acceleration only when needed

### 4. Lifecycle Policies
- Move old scans to Glacier (80% cheaper)
- Delete logs after retention period
- Archive DynamoDB backups

### 5. Right-Sizing
- Monitor Lambda memory usage
- Adjust timeout values
- Use appropriate instance types

### 6. Spot Instances (For Batch Processing)
- Use Spot instances for video processing
- 70% discount vs on-demand
- Suitable for non-critical workloads

---

## 11. COST MONITORING

### CloudWatch Cost Anomaly Detection
```
Enable automatic alerts when costs exceed thresholds
```

### AWS Budgets
```
Set monthly budget: $500
Alert at 80% threshold
```

### Cost Explorer
```
Track spending by service
Identify cost drivers
Forecast future costs
```

---

## 12. DEPLOYMENT COST CHECKLIST

- [ ] Lambda functions deployed (5 functions)
- [ ] S3 bucket created with lifecycle policies
- [ ] DynamoDB tables created (2 tables)
- [ ] API Gateway configured
- [ ] CloudWatch logs configured
- [ ] KMS key created
- [ ] Bedrock model access enabled
- [ ] Rekognition enabled
- [ ] Transcribe enabled
- [ ] Cost monitoring configured
- [ ] Alarms configured
- [ ] Invocations disabled (until approval)

---

## 13. COST APPROVAL WORKFLOW

### Step 1: Review Costs
- Review this document
- Understand pricing models
- Identify cost drivers

### Step 2: Set Budget
- Define monthly budget
- Set alert thresholds
- Plan for scaling

### Step 3: Deploy Infrastructure
- Deploy all services
- Keep invocations disabled
- Monitor for any unexpected costs

### Step 4: Enable Invocations
- After cost approval
- Start with low volume
- Monitor actual costs
- Scale gradually

---

## 14. QUESTIONS & ANSWERS

**Q: Why is Bedrock so expensive?**
A: Bedrock charges per token (input + output). Optimize by using shorter prompts and batching requests.

**Q: Can I reduce Lambda costs?**
A: Yes, by reducing memory allocation, timeout values, and using reserved concurrency.

**Q: Should I use RDS or DynamoDB?**
A: DynamoDB is cheaper for variable workloads. RDS is better for complex queries and relational data.

**Q: How do I monitor costs?**
A: Use CloudWatch Cost Anomaly Detection, AWS Budgets, and Cost Explorer.

**Q: What's the cheapest way to store old scans?**
A: Use S3 Glacier (80% cheaper than standard S3) with lifecycle policies.

---

## 15. NEXT STEPS

1. **Review** this cost analysis
2. **Approve** the estimated monthly cost
3. **Deploy** infrastructure (invocations disabled)
4. **Monitor** costs for first week
5. **Enable** invocations after approval
6. **Track** actual vs estimated costs
7. **Optimize** based on usage patterns

---

**Document Version**: 1.0
**Last Updated**: March 1, 2026
**Status**: Ready for Review & Approval

---

## Contact & Support

For cost-related questions:
- AWS Cost Management: https://console.aws.amazon.com/cost-management
- AWS Pricing Calculator: https://calculator.aws
- Support: AWS Support Center

