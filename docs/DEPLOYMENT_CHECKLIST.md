# HarveLogix Multimodal AI Scanner - Deployment Checklist

## Phase 1: Local Development & Testing ✅

- [x] Frontend components created (ImageCapture, AudioCapture, VideoCapture)
- [x] AI Scanner page component created
- [x] Backend API routes configured
- [x] Demo data service implemented
- [x] Service layer created
- [x] i18n keys added for multimodal UI
- [x] Navigation updated with AI Scanner link
- [x] Demo mode working (VITE_USE_DEMO_DATA=true)

**Status**: Ready for local testing

**How to test locally**:
```bash
# Terminal 1: Start backend
cd backend
npm install
npm start

# Terminal 2: Start frontend
cd web-dashboard
npm install
npm run dev

# Open http://localhost:3000/ai-scanner
```

---

## Phase 2: AWS Infrastructure Setup

### 2.1 EC2 Instance Setup
- [ ] Create AWS account and configure AWS CLI
- [ ] Launch EC2 instance (t3.medium, Amazon Linux 2)
- [ ] Configure security groups (ports 22, 80, 443, 3000)
- [ ] Create key pair and save locally
- [ ] SSH into instance and verify access
- [ ] Install Node.js 18.x
- [ ] Install Python 3.9+
- [ ] Clone repository
- [ ] Install backend dependencies

**Reference**: `infrastructure/docs/AWS_SETUP_GUIDE.md` - Section 1

### 2.2 Amazon Bedrock Setup
- [ ] Go to AWS Console → Bedrock
- [ ] Click "Model access" → "Manage model access"
- [ ] Enable Claude Sonnet 4.6 (anthropic.claude-sonnet-4-20250514)
- [ ] Test in Bedrock Playground with sample prompts
- [ ] Verify model is accessible from EC2 instance
- [ ] Set AWS_REGION environment variable

**Reference**: `infrastructure/docs/AWS_SETUP_GUIDE.md` - Section 2

### 2.3 S3 Bucket Setup
- [ ] Create S3 bucket: `harvelogix-multimodal`
- [ ] Enable versioning
- [ ] Set lifecycle policy (90-day retention)
- [ ] Configure CORS for frontend access
- [ ] Create IAM policy for bucket access
- [ ] Test upload from backend

**Reference**: `infrastructure/docs/AWS_SETUP_GUIDE.md` - Section 5

### 2.4 Aurora/RDS Database Setup
- [ ] Create Aurora PostgreSQL cluster
- [ ] Create database instance (db.t3.medium)
- [ ] Configure security group for port 5432
- [ ] Create database and user
- [ ] Apply schema from setup guide
- [ ] Create indexes
- [ ] Test connection from EC2 instance
- [ ] Set up automated backups

**Reference**: `infrastructure/docs/AWS_SETUP_GUIDE.md` - Section 4

### 2.5 Lambda Functions Setup
- [ ] Create IAM role for Lambda
- [ ] Attach Bedrock and S3 permissions
- [ ] Create Lambda function from template
- [ ] Configure environment variables
- [ ] Test Lambda invocation
- [ ] Create API Gateway integration
- [ ] Test API endpoint

**Reference**: `infrastructure/docs/AWS_SETUP_GUIDE.md` - Section 3

### 2.6 CloudWatch Setup
- [ ] Create log group: `/aws/harvelogix/multimodal`
- [ ] Create log streams for backend and Lambda
- [ ] Set up CloudWatch alarms for errors
- [ ] Configure log retention (30 days)
- [ ] Test logging from backend

**Reference**: `infrastructure/docs/AWS_SETUP_GUIDE.md` - Section 8

---

## Phase 3: Backend Deployment

### 3.1 Environment Configuration
- [ ] Create `.env` file with AWS credentials
- [ ] Set `VITE_USE_DEMO_DATA=false` for live mode
- [ ] Configure database connection string
- [ ] Set Bedrock model ID
- [ ] Set S3 bucket name
- [ ] Configure weather API key (optional)

### 3.2 Backend Deployment
- [ ] SSH into EC2 instance
- [ ] Clone repository
- [ ] Install dependencies: `npm install`
- [ ] Copy `.env` file
- [ ] Start backend: `npm start`
- [ ] Verify server is running on port 5000
- [ ] Test health endpoint: `curl http://localhost:5000/api/health`

### 3.3 API Testing
- [ ] Test crop health endpoint: `POST /api/multimodal/crop-health`
- [ ] Test irrigation endpoint: `POST /api/multimodal/field-irrigation`
- [ ] Test weather endpoint: `POST /api/multimodal/sky-weather`
- [ ] Test voice query endpoint: `POST /api/multimodal/voice-query`
- [ ] Test video scan endpoint: `POST /api/multimodal/video-scan`
- [ ] Verify responses are valid JSON
- [ ] Check CloudWatch logs for errors

---

## Phase 4: Frontend Deployment

### 4.1 Build Configuration
- [ ] Update API endpoint in frontend config
- [ ] Set `VITE_USE_DEMO_DATA=false`
- [ ] Configure AWS region
- [ ] Build frontend: `npm run build`
- [ ] Verify build output in `dist/` directory

### 4.2 Frontend Deployment Options

**Option A: Deploy to S3 + CloudFront**
- [ ] Create S3 bucket for frontend
- [ ] Enable static website hosting
- [ ] Create CloudFront distribution
- [ ] Upload build files to S3
- [ ] Configure CloudFront cache invalidation
- [ ] Test frontend URL

**Option B: Deploy to EC2**
- [ ] Install Nginx on EC2
- [ ] Copy build files to Nginx directory
- [ ] Configure Nginx to proxy API requests
- [ ] Configure SSL certificate
- [ ] Test frontend URL

### 4.3 Frontend Testing
- [ ] Navigate to AI Scanner page
- [ ] Test image upload
- [ ] Test camera capture
- [ ] Test audio recording
- [ ] Test video upload
- [ ] Verify results display correctly
- [ ] Test error handling
- [ ] Test language switching
- [ ] Test theme switching

---

## Phase 5: Integration Testing

### 5.1 End-to-End Testing
- [ ] Test crop health scan (image → Bedrock → results)
- [ ] Test irrigation scan (image → Bedrock → results)
- [ ] Test weather scan (image → weather API → Bedrock → results)
- [ ] Test voice query (audio → Transcribe → agents → results)
- [ ] Test video scan (video → Bedrock → results)

### 5.2 Performance Testing
- [ ] Measure API response times
- [ ] Test with large files (10MB images, 50MB videos)
- [ ] Test concurrent requests
- [ ] Monitor Lambda execution time
- [ ] Check database query performance
- [ ] Monitor S3 upload speed

### 5.3 Error Handling Testing
- [ ] Test with invalid file types
- [ ] Test with oversized files
- [ ] Test with network errors
- [ ] Test with AWS service failures
- [ ] Verify fallback to demo data
- [ ] Check error messages are user-friendly

---

## Phase 6: Security & Compliance

### 6.1 Security Configuration
- [ ] Enable SSL/TLS certificates
- [ ] Configure security groups (least privilege)
- [ ] Enable VPC encryption
- [ ] Configure IAM roles (least privilege)
- [ ] Enable S3 bucket encryption
- [ ] Enable RDS encryption
- [ ] Configure API authentication
- [ ] Enable CloudTrail logging

### 6.2 Data Protection
- [ ] Verify no PII in logs
- [ ] Configure data retention policies
- [ ] Set up automated backups
- [ ] Test backup restoration
- [ ] Configure disaster recovery plan
- [ ] Document security procedures

### 6.3 Compliance
- [ ] Review data privacy requirements
- [ ] Configure GDPR compliance (if applicable)
- [ ] Document data handling procedures
- [ ] Set up audit logging
- [ ] Configure access controls

---

## Phase 7: Monitoring & Optimization

### 7.1 Monitoring Setup
- [ ] Configure CloudWatch dashboards
- [ ] Set up alarms for:
  - [ ] Lambda errors
  - [ ] API latency
  - [ ] Database connection errors
  - [ ] S3 upload failures
  - [ ] Bedrock API errors
- [ ] Configure SNS notifications
- [ ] Set up log analysis

### 7.2 Performance Optimization
- [ ] Enable Lambda caching
- [ ] Configure S3 caching headers
- [ ] Optimize database queries
- [ ] Enable CloudFront caching
- [ ] Implement request batching
- [ ] Monitor and optimize costs

### 7.3 Scaling Configuration
- [ ] Configure Lambda concurrency limits
- [ ] Set up RDS auto-scaling
- [ ] Configure S3 request rate limits
- [ ] Plan for traffic spikes
- [ ] Document scaling procedures

---

## Phase 8: Documentation & Handoff

### 8.1 Documentation
- [ ] Update README with deployment instructions
- [ ] Document API endpoints and examples
- [ ] Create troubleshooting guide
- [ ] Document environment variables
- [ ] Create runbook for common tasks
- [ ] Document backup/restore procedures

### 8.2 Training
- [ ] Train team on deployment process
- [ ] Train team on monitoring
- [ ] Train team on troubleshooting
- [ ] Document on-call procedures
- [ ] Create escalation procedures

### 8.3 Handoff
- [ ] Transfer AWS account access
- [ ] Transfer domain ownership
- [ ] Transfer SSL certificates
- [ ] Document all credentials (in secure vault)
- [ ] Schedule knowledge transfer sessions

---

## Post-Deployment Verification

### Week 1
- [ ] Monitor system for errors
- [ ] Check CloudWatch logs daily
- [ ] Verify backups are working
- [ ] Test disaster recovery plan
- [ ] Gather user feedback

### Week 2-4
- [ ] Analyze performance metrics
- [ ] Optimize based on usage patterns
- [ ] Fine-tune alarms and thresholds
- [ ] Document lessons learned
- [ ] Plan for improvements

---

## Rollback Plan

If deployment fails:

1. **Immediate Actions**
   - [ ] Stop new deployments
   - [ ] Revert to previous version
   - [ ] Notify stakeholders
   - [ ] Investigate root cause

2. **Recovery Steps**
   - [ ] Restore from backup
   - [ ] Verify data integrity
   - [ ] Test functionality
   - [ ] Gradually roll out fixes

3. **Post-Incident**
   - [ ] Document what went wrong
   - [ ] Implement preventive measures
   - [ ] Update deployment procedures
   - [ ] Schedule post-mortem

---

## Success Criteria

- [x] All 4 AWS services integrated (EC2, Bedrock, Lambda, RDS)
- [x] Frontend components working with demo data
- [x] Backend API routes functional
- [x] Demo mode working without AWS
- [ ] Live mode working with AWS services
- [ ] All tests passing
- [ ] Performance meets requirements
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] Team trained and ready

---

## Contact & Support

- **AWS Support**: https://console.aws.amazon.com/support
- **Bedrock Documentation**: https://docs.aws.amazon.com/bedrock
- **Lambda Documentation**: https://docs.aws.amazon.com/lambda
- **RDS Documentation**: https://docs.aws.amazon.com/rds

---

**Last Updated**: March 1, 2026
**Status**: Ready for Phase 2 (AWS Infrastructure Setup)
