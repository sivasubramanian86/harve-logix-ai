# Security Policy

## Overview

HarveLogix AI is committed to maintaining the highest security standards to protect farmer data, processor information, and government analytics. This document outlines our security practices, policies, and procedures.

## Security Principles

1. **Defense in Depth:** Multiple layers of security controls
2. **Least Privilege:** Minimal permissions for all components
3. **Encryption by Default:** All data encrypted at rest and in transit
4. **Audit Everything:** Complete audit trail for compliance
5. **Zero Trust:** Verify every request, never trust by default
6. **Privacy First:** Farmer data is sacred and protected

## Data Classification

### Tier 1: Highly Sensitive (PII)
- Farmer phone numbers
- Aadhaar numbers (if collected)
- Bank account details
- Personal location data

**Protection:** AES-256 encryption with separate KMS key, access restricted to authorized services only

### Tier 2: Sensitive (Business)
- Crop decisions and recommendations
- Income data
- Processor pricing
- Supply chain information

**Protection:** AES-256 encryption with master KMS key, role-based access control

### Tier 3: Internal (Operational)
- System logs
- Performance metrics
- Debugging information

**Protection:** Encrypted in transit, access restricted to operations team

## Encryption

### At Rest
- **DynamoDB:** AES-256 encryption with AWS KMS
- **RDS Aurora:** AES-256 encryption with AWS KMS
- **S3:** AES-256 encryption with AWS KMS
- **EBS Volumes:** AES-256 encryption with AWS KMS
- **Backups:** Encrypted with same KMS keys

### In Transit
- **TLS 1.3:** All API calls (HTTPS)
- **Certificate Pinning:** Mobile app pins API certificates
- **VPC Endpoints:** Private connectivity to AWS services
- **VPN:** Secure tunnels for administrative access

### Key Management
- **Master Key:** AWS-managed KMS key (harvelogix-master-key)
- **PII Key:** Separate KMS key for sensitive personal data
- **Key Rotation:** Automatic annual rotation
- **Key Access:** Restricted to Bedrock, Lambda, and authorized services

## Authentication & Authorization

### Farmer Authentication
- **Method:** Phone-based OTP (SMS)
- **Backup:** Biometric (iOS Face ID, Android fingerprint)
- **Tokens:**
  - Access Token: 1 hour (API calls)
  - Refresh Token: 30 days (cached locally for offline re-auth)
- **MFA:** Optional for transactions >₹50K
- **Session Management:** Automatic logout after 30 minutes of inactivity

### Service-to-Service Authentication
- **Method:** AWS IAM roles and policies
- **Principle:** Least privilege (each service has minimal required permissions)
- **Audit:** All API calls logged to CloudTrail

### Government Dashboard Access
- **Method:** Cognito user pool with MFA required
- **Roles:** Admin, Analyst, Viewer
- **Audit:** All dashboard access logged

## Authorization

### Role-Based Access Control (RBAC)

**Farmer Role:**
- Read own decisions and recommendations
- Write new crop data and decisions
- Read supply matches and buyer information
- Cannot access other farmers' data

**Processor Role:**
- Read farmer profiles (anonymized)
- Read supply matches
- Write buyer requirements
- Cannot access farmer PII

**Government Role:**
- Read aggregated analytics (Redshift)
- Read government dashboards (QuickSight)
- Cannot access individual farmer data

**Admin Role:**
- Full access to all systems
- User management
- System configuration
- Audit log access

## Network Security

### API Gateway
- **Rate Limiting:** 100 requests/second per farmer
- **WAF Rules:**
  - SQL injection prevention
  - XSS prevention
  - DDoS protection (AWS Shield Standard)
- **CORS:** Restricted to approved domains
- **Request Validation:** All inputs validated

### VPC Configuration
- **Private Subnets:** Lambda, RDS, DynamoDB in private subnets
- **NAT Gateway:** Outbound internet access through NAT
- **Security Groups:** Restrictive inbound/outbound rules
- **Network ACLs:** Additional network-level filtering

### DDoS Protection
- **AWS Shield Standard:** Automatic DDoS protection
- **AWS Shield Advanced:** Optional enhanced protection
- **CloudFront:** CDN with DDoS mitigation
- **Rate Limiting:** 100 req/sec per farmer

## Application Security

### Input Validation
- **All Inputs:** Validated against schema
- **SQL Queries:** Parameterized queries (no string concatenation)
- **File Uploads:** Scanned for malware, size limits enforced
- **Image Processing:** Validated before Rekognition analysis

### Output Encoding
- **JSON:** Properly escaped
- **HTML:** HTML-encoded for web dashboard
- **CSV:** Quoted and escaped for exports

### Dependency Management
- **Scanning:** Regular vulnerability scanning (Snyk, Dependabot)
- **Updates:** Security patches applied within 24 hours
- **Pinning:** Specific versions pinned in requirements.txt
- **Audit:** `pip audit` and `npm audit` in CI/CD

### Secrets Management
- **AWS Secrets Manager:** Store API keys, database passwords
- **Rotation:** Automatic rotation every 30 days
- **Access:** Restricted to authorized Lambda functions
- **Audit:** All secret access logged

## Data Protection

### Privacy by Design
- **Minimal Collection:** Only collect necessary data
- **Data Retention:** 90-day TTL on agent_decisions (GDPR compliance)
- **Data Deletion:** Farmers can request data deletion
- **Data Export:** Farmers can export their data

### GDPR Compliance
- **Right to Access:** Farmers can download their data
- **Right to Deletion:** Farmers can request data deletion
- **Right to Portability:** Data export in standard format
- **Consent:** Explicit consent for data collection
- **Privacy Policy:** Clear, transparent privacy policy

### Data Anonymization
- **Government Analytics:** Farmer data anonymized in Redshift
- **Aggregation:** Only aggregate metrics shared with government
- **Location:** Aggregated to district level (not individual coordinates)
- **Identifiers:** Farmer IDs replaced with hashes

## Audit & Logging

### CloudTrail Logging
- **Scope:** All AWS API calls
- **Retention:** 90 days in CloudWatch, 1 year in S3
- **Analysis:** CloudTrail Insights for anomaly detection
- **Alerts:** Suspicious activity triggers alerts

### Application Logging
- **Lambda:** All function executions logged
- **API Gateway:** All requests logged (excluding sensitive data)
- **DynamoDB:** Query logging enabled
- **RDS:** Query logging enabled
- **S3:** Access logging enabled

### Log Security
- **Encryption:** All logs encrypted in transit and at rest
- **Retention:** Logs retained for 1 year
- **Access:** Restricted to security and operations teams
- **Immutability:** Logs cannot be modified or deleted

### Audit Trail
- **Farmer Actions:** All decisions logged with timestamp and reasoning
- **Admin Actions:** All administrative changes logged
- **System Events:** All system events logged
- **Compliance:** Audit trail available for compliance audits

## Incident Response

### Incident Classification
- **Critical:** Data breach, system outage, security vulnerability
- **High:** Unauthorized access attempt, data corruption
- **Medium:** Performance degradation, minor security issue
- **Low:** Informational, no immediate action required

### Response Procedures
1. **Detection:** Automated alerts via CloudWatch
2. **Triage:** Determine severity and impact
3. **Containment:** Isolate affected systems
4. **Investigation:** Root cause analysis
5. **Remediation:** Fix the issue
6. **Communication:** Notify affected parties
7. **Post-Mortem:** Document lessons learned

### Incident Communication
- **Farmers:** Notified within 24 hours of data breach
- **Processors:** Notified within 24 hours of data breach
- **Government:** Notified within 24 hours of data breach
- **Public:** Transparency report published

### Incident Response Team
- **Security Lead:** Oversees incident response
- **Engineering Lead:** Technical investigation
- **Operations Lead:** System recovery
- **Communications Lead:** External communication

## Vulnerability Management

### Vulnerability Scanning
- **SAST:** Static Application Security Testing (SonarQube)
- **DAST:** Dynamic Application Security Testing (OWASP ZAP)
- **Dependency Scanning:** Snyk, Dependabot
- **Container Scanning:** ECR image scanning
- **Infrastructure Scanning:** AWS Config, CloudTrail

### Vulnerability Disclosure
- **Responsible Disclosure:** Security researchers can report vulnerabilities
- **Email:** security@harvelogix.ai
- **Response Time:** 24-hour acknowledgment, 7-day fix target
- **Rewards:** Bug bounty program (details on security page)

### Patch Management
- **Critical:** Applied within 24 hours
- **High:** Applied within 7 days
- **Medium:** Applied within 30 days
- **Low:** Applied in next release

## Compliance

### Standards & Frameworks
- **OWASP Top 10:** Addressed all common vulnerabilities
- **NIST Cybersecurity Framework:** Implemented core functions
- **ISO 27001:** Information security management
- **SOC 2 Type II:** Security, availability, processing integrity
- **GDPR:** Data protection and privacy
- **India Data Protection Act:** Compliance with local regulations

### Certifications
- **AWS Certified:** Infrastructure security
- **ISO 27001:** Information security management (target)
- **SOC 2 Type II:** Security audit (target)

### Compliance Audits
- **Annual:** Third-party security audit
- **Quarterly:** Internal security assessment
- **Monthly:** Vulnerability scanning
- **Weekly:** Log review and analysis

## Security Best Practices

### For Developers
1. **Code Review:** All code reviewed before merge
2. **Security Testing:** Security tests in CI/CD pipeline
3. **Dependency Updates:** Keep dependencies up-to-date
4. **Secrets:** Never commit secrets to repository
5. **Logging:** Log security-relevant events
6. **Error Handling:** Don't expose sensitive information in errors

### For Operations
1. **Access Control:** Principle of least privilege
2. **Monitoring:** 24/7 monitoring and alerting
3. **Backups:** Regular backups with encryption
4. **Disaster Recovery:** Tested recovery procedures
5. **Change Management:** All changes tracked and approved
6. **Incident Response:** Documented procedures

### For Farmers
1. **Strong Passwords:** Use unique, strong passwords
2. **Biometric:** Enable biometric authentication
3. **MFA:** Enable MFA for high-value transactions
4. **Phishing:** Be aware of phishing attempts
5. **Updates:** Keep mobile app updated
6. **Offline:** Use offline mode when internet is unreliable

## Security Contacts

- **Security Issues:** security@harvelogix.ai
- **Incident Response:** incidents@harvelogix.ai
- **Compliance:** compliance@harvelogix.ai
- **General Questions:** support@harvelogix.ai

## Security Updates

- **Blog:** Security updates published on our blog
- **Email:** Subscribe to security mailing list
- **GitHub:** Watch repository for security advisories
- **Twitter:** Follow @HarveLogixAI for announcements

## Changelog

### Version 1.0 (2026-01-25)
- Initial security policy
- Encryption at rest and in transit
- Authentication and authorization
- Audit logging
- Incident response procedures
- Vulnerability management
- Compliance framework

## Disclaimer

This security policy is subject to change. We recommend reviewing it regularly for updates. For the latest version, visit our GitHub repository.

---

**Last Updated:** 2026-01-25  
**Next Review:** 2026-04-25  
**Status:** Active
