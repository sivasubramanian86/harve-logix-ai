# HarveLogix AI - Infrastructure Documentation

Complete documentation for the HarveLogix AI infrastructure setup.

## 📚 Documentation Structure

### Getting Started
- **[README.md](./README.md)** - Infrastructure overview (if exists)

### Deployment
- **[../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)** - Deployment guide

### Architecture
- **[../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)** - System architecture

---

## 🏗️ Infrastructure Overview

### Technology Stack

- **IaC**: Terraform & CloudFormation
- **Cloud Provider**: AWS
- **Compute**: Lambda (serverless)
- **Database**: DynamoDB, RDS Aurora, Redshift
- **Storage**: S3
- **API**: API Gateway
- **Authentication**: Cognito
- **Orchestration**: EventBridge
- **Monitoring**: CloudWatch
- **Security**: KMS, WAF, CloudTrail

---

## 📁 Project Structure

```
infrastructure/
├── terraform/
│   ├── main.tf                 # Main configuration
│   ├── variables.tf            # Variables
│   ├── outputs.tf              # Outputs
│   ├── environments/
│   │   ├── dev.tfvars
│   │   ├── staging.tfvars
│   │   └── prod.tfvars
│   └── modules/                # Reusable modules
│
├── cloudformation/
│   └── harvelogix-stack.yaml   # CloudFormation template
│
└── DOCUMENTATION.md            # This file
```

---

## 🚀 Terraform Setup

### Prerequisites

```bash
# Install Terraform
terraform --version

# Configure AWS credentials
aws configure
```

### Initialization

```bash
cd terraform
terraform init
```

### Planning

```bash
# Development environment
terraform plan -var-file="environments/dev.tfvars"

# Staging environment
terraform plan -var-file="environments/staging.tfvars"

# Production environment
terraform plan -var-file="environments/prod.tfvars"
```

### Deployment

```bash
# Development
terraform apply -var-file="environments/dev.tfvars"

# Staging
terraform apply -var-file="environments/staging.tfvars"

# Production
terraform apply -var-file="environments/prod.tfvars"
```

---

## 🔧 AWS Resources

### Compute

**Lambda Functions**
- HarvestReady Agent
- StorageScout Agent
- SupplyMatch Agent
- WaterWise Agent
- QualityHub Agent
- CollectiveVoice Agent

### Storage

**DynamoDB Tables**
- `farmers` - Farmer profiles and state
- `agent_decisions` - Decision history
- `processor_profiles` - Processor information
- `storage_templates` - Storage protocols

**S3 Buckets**
- `harvelogix-models-{env}` - ML models
- `harvelogix-images-{env}` - Crop images
- `harvelogix-terraform-state` - Terraform state

**RDS Aurora**
- PostgreSQL cluster
- Crop phenology data
- Market prices
- Government schemes

**Redshift**
- Analytics cluster
- Farmer decisions fact table
- Processor supply fact table

### Networking

**API Gateway**
- REST endpoints
- WebSocket support
- Rate limiting
- Request validation

**EventBridge**
- Event bus: `harvelogix-events-{env}`
- Rules for agent orchestration
- Dead-letter queue

### Security

**KMS**
- Master key for encryption
- PII key for sensitive data

**Cognito**
- User pool: `harvelogix-farmers-{env}`
- User pool client
- Phone-based authentication

**WAF**
- DDoS protection
- SQL injection prevention
- XSS prevention

**CloudTrail**
- Audit logging
- Compliance tracking

---

## 📊 Environment Configuration

### Development

```hcl
# environments/dev.tfvars
aws_region = "ap-south-1"
environment = "dev"
app_name = "harvelogix"
```

### Staging

```hcl
# environments/staging.tfvars
aws_region = "ap-south-1"
environment = "staging"
app_name = "harvelogix"
```

### Production

```hcl
# environments/prod.tfvars
aws_region = "ap-south-1"
environment = "prod"
app_name = "harvelogix"
```

---

## 🔐 Security Best Practices

### Encryption

- **At Rest**: KMS AES-256
- **In Transit**: TLS 1.3
- **Database**: Encrypted RDS & DynamoDB

### Authentication

- **API**: Cognito + API keys
- **Database**: IAM roles
- **Services**: Service-to-service authentication

### Authorization

- **IAM Roles**: Least privilege principle
- **Resource Policies**: Specific permissions
- **VPC**: Network isolation

### Monitoring

- **CloudTrail**: Audit logging
- **CloudWatch**: Metrics & alarms
- **VPC Flow Logs**: Network monitoring

---

## 📈 Scaling

### Auto-Scaling

**Lambda**
- Automatic scaling based on invocations
- Concurrent execution limits

**DynamoDB**
- On-demand billing
- Auto-scaling for provisioned capacity

**RDS Aurora**
- Read replicas for scaling
- Auto-scaling for Aurora Serverless

**Redshift**
- Cluster resizing
- Concurrency scaling

### Load Balancing

- **API Gateway**: Automatic load balancing
- **ALB**: Application load balancer (if needed)
- **Route 53**: DNS failover

---

## 🔄 Disaster Recovery

### Backup Strategy

- **DynamoDB**: Point-in-time recovery enabled
- **RDS**: Automated backups (35 days retention)
- **S3**: Versioning enabled
- **Redshift**: Automated snapshots

### Recovery Procedures

1. **Database Recovery**: Restore from snapshots
2. **Application Recovery**: Redeploy Lambda functions
3. **Data Recovery**: Restore from S3 versions
4. **Configuration Recovery**: Terraform state

### RTO/RPO Targets

- **RTO**: 1 hour
- **RPO**: 15 minutes

---

## 📊 Monitoring & Observability

### CloudWatch Dashboards

- System health
- Agent performance
- API latency
- Error rates

### CloudWatch Alarms

- Error rate > 0.1%
- Latency > 100ms
- DynamoDB throttling
- Lambda errors

### Metrics

- Lambda duration
- API response time
- DynamoDB latency
- Error count

### Logs

- Lambda logs
- API Gateway logs
- Application logs
- Audit logs (CloudTrail)

---

## 💰 Cost Optimization

### Cost Drivers

- **Lambda**: Invocations & duration
- **DynamoDB**: Read/write capacity
- **RDS**: Instance size & storage
- **S3**: Storage & data transfer
- **Data Transfer**: Inter-region transfer

### Optimization Strategies

1. **Lambda**: Optimize function duration
2. **DynamoDB**: Use on-demand billing
3. **RDS**: Right-size instances
4. **S3**: Use lifecycle policies
5. **Data Transfer**: Minimize cross-region

### Cost Estimation

- **Development**: ~₹5K-10K/month
- **Staging**: ~₹10K-20K/month
- **Production**: ~₹50K-2L/month (scales with users)

---

## 🚀 Deployment Pipeline

### CI/CD

1. **Code Push**: GitHub push triggers pipeline
2. **Build**: Build Lambda functions
3. **Test**: Run test suite
4. **Deploy**: Deploy to environment
5. **Verify**: Run smoke tests

### Deployment Steps

```bash
# 1. Plan infrastructure changes
terraform plan -var-file="environments/prod.tfvars"

# 2. Review changes
# (manual approval)

# 3. Apply changes
terraform apply -var-file="environments/prod.tfvars"

# 4. Deploy Lambda functions
./scripts/deploy-agents.sh prod

# 5. Run smoke tests
./scripts/smoke-tests.sh prod
```

---

## 🔧 Troubleshooting

### Common Issues

**Lambda Timeout**
- Increase timeout in configuration
- Optimize function code
- Check cold start time

**DynamoDB Throttling**
- Increase provisioned capacity
- Use on-demand billing
- Optimize query patterns

**RDS Connection Issues**
- Check security groups
- Verify credentials
- Check connection pool

**API Gateway Errors**
- Check request format
- Verify authentication
- Check rate limits

---

## 📖 Related Documentation

- **Deployment Guide**: [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)
- **Architecture**: [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- **Security**: [../SECURITY.md](../SECURITY.md)

---

## 📚 Resources

- **Terraform Docs**: https://www.terraform.io/docs
- **AWS Documentation**: https://docs.aws.amazon.com
- **CloudFormation**: https://aws.amazon.com/cloudformation/
- **AWS Best Practices**: https://aws.amazon.com/architecture/well-architected/

---

**Made with ❤️ for Indian Agriculture | Viksit Bharat 2047**
