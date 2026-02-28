# HarveLogix AI - Deployment Scripts

This directory contains scripts for deploying and managing HarveLogix AI infrastructure and applications.

## Scripts Overview

### Infrastructure Deployment

#### `deploy-stack.sh` (Linux/macOS)
Deploys AWS CloudFormation stack for HarveLogix AI infrastructure.

**Usage:**
```bash
./scripts/deploy-stack.sh [dev|staging|prod]
```

**What it does:**
- Validates CloudFormation template
- Creates or updates AWS stack
- Deploys KMS keys, DynamoDB tables, S3 buckets, Lambda roles, EventBridge, Cognito
- Saves outputs to `.env` file

**Example:**
```bash
./scripts/deploy-stack.sh dev
```

#### `deploy-stack.ps1` (Windows PowerShell)
Windows PowerShell version of the deployment script.

**Usage:**
```powershell
.\scripts\deploy-stack.ps1 -Environment dev
```

**What it does:**
- Same as `deploy-stack.sh` but for Windows
- Uses PowerShell for AWS CLI calls
- Saves outputs to `.env` file

**Example:**
```powershell
.\scripts\deploy-stack.ps1 -Environment prod
```

### Application Deployment

#### `deploy-backend.sh` (Linux/macOS)
Deploys backend Lambda functions to AWS.

**Usage:**
```bash
./scripts/deploy-backend.sh [dev|staging|prod]
```

**What it does:**
- Installs Python dependencies
- Packages Lambda functions
- Deploys to AWS Lambda
- Updates function configuration
- Runs smoke tests

#### `deploy-mobile.sh` (Linux/macOS)
Builds and deploys mobile app to app stores.

**Usage:**
```bash
./scripts/deploy-mobile.sh [dev|staging|prod]
```

**What it does:**
- Builds React Native app
- Runs tests
- Creates app bundle
- Deploys to App Store and Google Play

#### `deploy-web.sh` (Linux/macOS)
Builds and deploys web dashboard.

**Usage:**
```bash
./scripts/deploy-web.sh [dev|staging|prod]
```

**What it does:**
- Builds React app
- Runs tests
- Creates production bundle
- Deploys to S3 and CloudFront

### Testing & Validation

#### `run-tests.sh` (Linux/macOS)
Runs all tests with coverage reporting.

**Usage:**
```bash
./scripts/run-tests.sh
```

**What it does:**
- Runs unit tests
- Runs property-based tests
- Runs integration tests
- Generates coverage report
- Fails if coverage <87%

#### `load-test.sh` (Linux/macOS)
Runs load testing against deployed infrastructure.

**Usage:**
```bash
./scripts/load-test.sh [dev|staging|prod]
```

**What it does:**
- Simulates 10K concurrent requests
- Measures response times
- Checks error rates
- Generates performance report

#### `security-test.sh` (Linux/macOS)
Runs security tests and vulnerability scans.

**Usage:**
```bash
./scripts/security-test.sh
```

**What it does:**
- Runs OWASP security tests
- Checks for SQL injection vulnerabilities
- Checks for XSS vulnerabilities
- Generates security report

### Monitoring & Operations

#### `setup-monitoring.sh` (Linux/macOS)
Sets up CloudWatch monitoring and alerting.

**Usage:**
```bash
./scripts/setup-monitoring.sh [dev|staging|prod]
```

**What it does:**
- Creates CloudWatch dashboards
- Creates CloudWatch alarms
- Configures SNS notifications
- Sets up log groups

#### `check-health.sh` (Linux/macOS)
Checks health of deployed infrastructure.

**Usage:**
```bash
./scripts/check-health.sh [dev|staging|prod]
```

**What it does:**
- Checks Lambda function status
- Checks DynamoDB table status
- Checks RDS database status
- Checks API Gateway status
- Reports overall health

#### `rollback.sh` (Linux/macOS)
Rolls back to previous deployment.

**Usage:**
```bash
./scripts/rollback.sh [dev|staging|prod]
```

**What it does:**
- Identifies previous deployment
- Reverts CloudFormation stack
- Reverts Lambda functions
- Verifies rollback success

### Maintenance & Cleanup

#### `cleanup.sh` (Linux/macOS)
Cleans up unused resources and temporary files.

**Usage:**
```bash
./scripts/cleanup.sh [dev|staging|prod]
```

**What it does:**
- Removes unused Lambda versions
- Removes unused CloudFormation stacks
- Cleans up temporary files
- Generates cleanup report

#### `backup.sh` (Linux/macOS)
Creates backups of databases and configurations.

**Usage:**
```bash
./scripts/backup.sh [dev|staging|prod]
```

**What it does:**
- Backs up DynamoDB tables
- Backs up RDS databases
- Backs up S3 buckets
- Stores backups in S3

#### `restore.sh` (Linux/macOS)
Restores from backups.

**Usage:**
```bash
./scripts/restore.sh [dev|staging|prod] [backup-date]
```

**What it does:**
- Restores DynamoDB tables
- Restores RDS databases
- Restores S3 buckets
- Verifies restoration

## Prerequisites

### Required Tools
- AWS CLI v2
- Python 3.11+
- Node.js 18+
- Git
- Bash (for Linux/macOS scripts)
- PowerShell (for Windows scripts)

### AWS Credentials
```bash
aws configure
```

### Environment Variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Quick Start

### 1. Deploy Infrastructure
```bash
./scripts/deploy-stack.sh dev
```

### 2. Deploy Backend
```bash
./scripts/deploy-backend.sh dev
```

### 3. Run Tests
```bash
./scripts/run-tests.sh
```

### 4. Setup Monitoring
```bash
./scripts/setup-monitoring.sh dev
```

### 5. Check Health
```bash
./scripts/check-health.sh dev
```

## Deployment Workflow

### Development Environment
```bash
# Deploy infrastructure
./scripts/deploy-stack.sh dev

# Deploy backend
./scripts/deploy-backend.sh dev

# Run tests
./scripts/run-tests.sh

# Setup monitoring
./scripts/setup-monitoring.sh dev

# Check health
./scripts/check-health.sh dev
```

### Staging Environment
```bash
# Deploy infrastructure
./scripts/deploy-stack.sh staging

# Deploy backend
./scripts/deploy-backend.sh staging

# Run load tests
./scripts/load-test.sh staging

# Run security tests
./scripts/security-test.sh

# Check health
./scripts/check-health.sh staging
```

### Production Environment
```bash
# Deploy infrastructure
./scripts/deploy-stack.sh prod

# Deploy backend
./scripts/deploy-backend.sh prod

# Setup monitoring
./scripts/setup-monitoring.sh prod

# Check health
./scripts/check-health.sh prod
```

## Troubleshooting

### Script Permissions
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

### AWS CLI Not Found
```bash
# Install AWS CLI
pip install awscli

# Configure credentials
aws configure
```

### Python Dependencies
```bash
# Install dependencies
pip install -r backend/requirements.txt
```

### Node.js Dependencies
```bash
# Install dependencies
npm install

# For mobile app
cd mobile-app && npm install

# For web dashboard
cd web-dashboard && npm install
```

## Best Practices

1. **Always test in dev first**
   ```bash
   ./scripts/deploy-stack.sh dev
   ```

2. **Run tests before deployment**
   ```bash
   ./scripts/run-tests.sh
   ```

3. **Check health after deployment**
   ```bash
   ./scripts/check-health.sh dev
   ```

4. **Monitor logs during deployment**
   ```bash
   aws logs tail /aws/lambda/harvelogix-dev --follow
   ```

5. **Keep backups before major changes**
   ```bash
   ./scripts/backup.sh dev
   ```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review AWS CloudFormation events
3. Check CloudWatch logs
4. Contact the development team

## References

- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)
- [CloudFormation User Guide](https://docs.aws.amazon.com/cloudformation/)
- [Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/dynamodb/)

---

**Last Updated:** 2026-02-28
**Version:** 1.0.0
