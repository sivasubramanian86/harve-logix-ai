# HarveLogix AI - Security & Architecture Audit Report

**Date:** February 28, 2026  
**Auditor:** Principal Cloud Architect & Security Reviewer  
**Status:** PROTOTYPE - CRITICAL GAPS IDENTIFIED  
**Severity:** HIGH - Production deployment NOT recommended without fixes

---

## Executive Summary

HarveLogix AI is a well-architected multi-agent agricultural platform with **solid foundational design** but **critical security and integration gaps** that must be addressed before production deployment.

### Key Findings:
- ✅ **Architecture:** Excellent serverless design with 6 autonomous agents
- ✅ **Infrastructure:** Terraform/CloudFormation properly configured with KMS encryption
- ⚠️ **Security:** Authentication framework documented but NOT IMPLEMENTED in code
- ❌ **RAG:** NO retrieval-augmented generation pipeline implemented
- ❌ **MCP/Strands:** NO Model Context Protocol or Strands Agents integration
- ⚠️ **Observability:** Logging framework exists but incomplete tracing/metrics

---

## A. SECURITY & GUARDRAILS AUDIT

### A.1 Authentication

| Capability | Status | Evidence | Next Step |
|-----------|--------|----------|-----------|
| Cognito JWT auth on APIs | MISSING | docs/API.md describes Cognito but backend/server.js has NO auth middleware | Implement JWT verification middleware in Express |
| Role-based access control (farmer/processor/admin) | MISSING | No role checks in any agent code | Add role extraction from JWT claims + authorization middleware |
| Session management | MISSING | No session store or token refresh logic | Implement Redis session store + refresh token rotation |
| MFA support | DOCUMENTED ONLY | SECURITY.md mentions MFA but no implementation | Add Cognito MFA configuration to CloudFormation |

**Evidence:**
- `docs/API.md` lines 15-40: Describes Cognito auth requirement
- `backend/server.js` lines 1-20: NO auth middleware present
- `backend/config.py` lines 1-60: NO Cognito configuration

**Risk:** All API endpoints are currently OPEN - any client can call agents without authentication.

---

### A.2 Authorization & Role-Based Access

| Capability | Status | Evidence | Next Step |
|-----------|--------|----------|-----------|
| Farmer role enforcement | MISSING | No farmer_id validation or tenant isolation | Add farmer_id extraction from JWT + DynamoDB query filtering |
| Processor role enforcement | MISSING | No processor_id validation | Add processor role checks in SupplyMatch agent |
| Government/admin role enforcement | MISSING | No admin checks for analytics endpoints | Add admin role checks for Redshift/QuickSight access |
| Data isolation by tenant | PARTIAL | DynamoDB schema has farmer_id as hash key but no query filtering | Enforce farmer_id in all DynamoDB queries |

**Evidence:**
- `backend/agents/supply_match_agent.py` lines 50-80: No farmer_id validation
- `backend/core/bedrock_orchestrator.py` lines 40-60: farmer_id passed but not validated
- `infrastructure/cloudformation/harvelogix-stack.yaml` lines 50-80: DynamoDB has farmer_id but no LSI for tenant isolation

**Risk:** Farmer A could query Farmer B's data if they know the farmer_id.

---

### A.3 Secrets Management

| Capability | Status | Evidence | Next Step |
|-----------|--------|----------|-----------|
| Bedrock API keys in Secrets Manager | MISSING | No boto3 client initialization with assumed role | Use IAM roles instead of keys; remove any hardcoded keys |
| Database passwords in Secrets Manager | MISSING | backend/config.py line 20: RDS_PASSWORD from env var | Move to AWS Secrets Manager with automatic rotation |
| Weather API key management | MISSING | backend/config.py line 25: WEATHER_API_KEY from env var | Store in Secrets Manager, rotate quarterly |
| Hardcoded secrets in code | NONE FOUND | ✅ No hardcoded keys in source | Continue this practice |

**Evidence:**
- `backend/config.py` lines 15-30: All secrets loaded from environment variables (good)
- `backend/server.js` lines 1-10: No hardcoded credentials (good)
- **Gap:** No Secrets Manager integration for automatic rotation

**Risk:** Environment variables can be exposed in logs or container images.

---

### A.4 Network & API Protection

| Capability | Status | Evidence | Next Step |
|-----------|--------|----------|-----------|
| API Gateway with WAF | PARTIAL | CloudFormation defines API Gateway but NO WAF rules | Add AWS::WAFv2::WebACL with rate limiting, SQL injection, XSS rules |
| Rate limiting (100 req/sec per farmer) | DOCUMENTED ONLY | docs/ARCHITECTURE.md mentions 100 req/sec but NOT implemented | Add API Gateway throttling + usage plans |
| CORS configuration | IMPLEMENTED | backend/server.js line 12: app.use(cors()) | ⚠️ CORS is OPEN - restrict to known origins |
| DDoS protection | MISSING | No Shield Advanced or CloudFront | Add CloudFront distribution + Shield Advanced |
| VPC isolation | MISSING | Lambda functions not in VPC | Move Lambda to VPC with security groups |

**Evidence:**
- `infrastructure/cloudformation/harvelogix-stack.yaml` lines 1-50: API Gateway defined but NO WAF
- `backend/server.js` line 12: `app.use(cors())` - OPEN CORS
- `infrastructure/terraform/main.tf` lines 1-100: No VPC configuration

**Risk:** API is vulnerable to DDoS, rate-based attacks, and injection attacks.

---

### A.5 Bedrock Safety & Guardrails

| Capability | Status | Evidence | Next Step |
|-----------|--------|----------|-----------|
| Bedrock guardrails configuration | MISSING | No guardrails specified in agent code | Add Bedrock Guardrails with content filters |
| System prompt with safety rules | PARTIAL | Agents have prompts but no safety constraints | Add system prompt with farmer data protection rules |
| Input validation before Bedrock | PARTIAL | Some validation in agents (e.g., StorageScout) but inconsistent | Standardize input validation across all agents |
| Output filtering for PII | MISSING | No PII filtering in agent responses | Add regex-based PII masking in response handler |
| Prompt injection prevention | MISSING | No input sanitization for user prompts | Add prompt injection detection + sanitization |

**Evidence:**
- `backend/agents/storage_scout_agent.py` lines 80-120: Bedrock invocation with NO guardrails
- `backend/agents/base_agent.py` lines 50-80: invoke_bedrock() has NO safety checks
- `backend/agents/harvest_ready_agent.py` lines 40-60: Prompt construction with user input (injection risk)

**Risk:** Malicious users could inject prompts to extract farmer data or bypass safety rules.

---

## B. RAG (RETRIEVAL-AUGMENTED GENERATION) AUDIT

| Capability | Status | Evidence | Next Step |
|-----------|--------|----------|-----------|
| Vector store (embeddings index) | MISSING | No embeddings model or vector DB configured | Implement Amazon Titan Embeddings + OpenSearch |
| Retrieval pipeline | MISSING | No retrieval code in any agent | Build retrieval pipeline: query → embed → search → context assembly |
| Content sources (corpora) | MISSING | No indexed documents or knowledge base | Index agronomy PDFs, government schemes, past decisions |
| Tenant/region filtering in retrieval | MISSING | N/A - no retrieval implemented | Add farmer_id + region filters to retrieval queries |
| Embedding model configuration | MISSING | No boto3 bedrock-runtime call for embeddings | Configure Amazon Titan Embeddings v2 |

**Evidence:**
- **No RAG code found** in any agent file
- `backend/agents/harvest_ready_agent.py` lines 1-200: Uses external Weather API but no RAG
- `backend/core/bedrock_orchestrator.py` lines 1-100: No retrieval logic

**Risk:** Agents cannot learn from historical decisions or indexed knowledge. Each request is stateless.

**Recommended RAG Flow for HarvestReady Agent:**
```
1. User query: "When should I harvest my tomato crop?"
2. Embed query using Titan Embeddings
3. Search OpenSearch for similar past decisions + agronomy docs
4. Assemble context: [past decisions, agronomy rules, weather data]
5. Invoke Bedrock with context
6. Return recommendation with sources
```

---

## C. MCP / STRANDS AGENTS INTEGRATION AUDIT

| Capability | Status | Evidence | Next Step |
|-----------|--------|----------|-----------|
| Strands Agents SDK integration | MISSING | No strands-agents imports or configuration | Add Strands SDK to backend/requirements.txt |
| MCP server implementation | MISSING | No MCP manifest or server entrypoints | Create MCP server exposing agent tools |
| Agent tool definitions for Bedrock | MISSING | Agents are Lambda functions, not MCP tools | Define agent capabilities as MCP tools |
| EventBridge orchestration | PARTIAL | EventBridge configured in Terraform but no rules | Add EventBridge rules connecting agents |
| Correlation IDs in events | MISSING | No correlation_id in event payloads | Add correlation_id to all EventBridge events |
| Minimal payloads | PARTIAL | Agents pass full request_data but could be optimized | Implement event payload compression |

**Evidence:**
- `backend/requirements.txt`: No strands-agents dependency
- `backend/core/bedrock_orchestrator.py` lines 40-80: Uses boto3 eventbridge_client but no rules defined
- `infrastructure/terraform/main.tf` lines 200-300: EventBridge bus created but no rules
- `infrastructure/cloudformation/harvelogix-stack.yaml` lines 300-400: No EventBridge rules

**Risk:** Agents are not orchestrated - each runs independently. No event-driven workflows.

**Recommended MCP Integration:**
```
1. Create MCP server with 6 agent tools
2. Register tools with Bedrock Agent Core
3. Bedrock invokes tools via MCP
4. Tools publish events to EventBridge
5. EventBridge routes to downstream agents
```

---

## D. OBSERVABILITY & RELIABILITY AUDIT

### D.1 Logging

| Capability | Status | Evidence | Next Step |
|-----------|--------|----------|-----------|
| Structured JSON logging | IMPLEMENTED | backend/utils/logger.py has JSONFormatter | ✅ Good - continue |
| Correlation IDs in logs | MISSING | No correlation_id in log records | Add correlation_id to all log entries |
| Trace IDs for distributed tracing | MISSING | No X-Ray integration | Add X-Ray daemon + boto3 X-Ray SDK |
| PII filtering in logs | MISSING | No PII masking in logger | Add regex-based PII masking (phone, Aadhaar) |
| Log retention policy | MISSING | No CloudWatch log group retention | Set 30-day retention in CloudFormation |

**Evidence:**
- `backend/utils/logger.py` lines 1-50: JSONFormatter implemented ✅
- `backend/utils/logger.py` lines 40-50: No correlation_id extraction
- `backend/agents/harvest_ready_agent.py` lines 50-60: Logs contain farmer location (PII risk)

**Risk:** Cannot trace requests across agents. PII may be logged.

---

### D.2 Metrics & Tracing

| Capability | Status | Evidence | Next Step |
|-----------|--------|----------|-----------|
| Custom CloudWatch metrics | MISSING | No cloudwatch client calls in agents | Emit metrics: decisions_per_agent, latency_ms, error_rate |
| X-Ray tracing | MISSING | No X-Ray SDK integration | Add X-Ray SDK to trace Lambda invocations |
| Agent performance metrics | MISSING | No latency tracking | Track p50, p95, p99 latency per agent |
| Error rate tracking | MISSING | No error metrics | Emit error_count metric per agent |

**Evidence:**
- `backend/agents/base_agent.py` lines 1-100: No CloudWatch metrics
- `backend/core/bedrock_orchestrator.py` lines 1-100: No X-Ray tracing

**Risk:** Cannot monitor agent performance or detect degradation.

---

### D.3 Error Handling & Resilience

| Capability | Status | Evidence | Next Step |
|-----------|--------|----------|-----------|
| Retry logic with exponential backoff | IMPLEMENTED | backend/utils/retry.py has retry_with_backoff decorator | ✅ Good - applied to Bedrock calls |
| Dead-letter queues (DLQ) | MISSING | No DLQ configured for EventBridge | Add DLQ to EventBridge rules |
| Circuit breaker pattern | MISSING | No circuit breaker for external APIs | Implement circuit breaker for Weather API |
| Graceful degradation | PARTIAL | Agents return mock data on error but not logged | Add fallback strategy documentation |
| Error categorization | IMPLEMENTED | backend/utils/errors.py has custom exceptions | ✅ Good - use consistently |

**Evidence:**
- `backend/utils/retry.py` lines 1-50: Retry decorator implemented ✅
- `backend/agents/harvest_ready_agent.py` lines 100-120: Catches exceptions but no DLQ
- `infrastructure/terraform/main.tf` lines 200-300: No DLQ configuration

**Risk:** Failed events are lost. No visibility into failures.

---

## COMPREHENSIVE AUDIT CHECKLIST

| Capability | Status | Evidence | Next Step |
|-----------|--------|----------|-----------|
| **SECURITY** | | | |
| Cognito JWT auth on APIs | MISSING | backend/server.js | Implement JWT middleware |
| Role-based access control | MISSING | All agents | Add role extraction + authorization |
| Secrets Manager integration | MISSING | backend/config.py | Move secrets to Secrets Manager |
| API Gateway WAF | MISSING | CloudFormation | Add WAFv2 rules |
| Rate limiting | MISSING | API Gateway | Add throttling + usage plans |
| CORS restriction | MISSING | backend/server.js | Restrict to known origins |
| VPC isolation | MISSING | Lambda config | Move Lambda to VPC |
| Bedrock guardrails | MISSING | All agents | Add content filters |
| PII filtering | MISSING | Logger + responses | Add PII masking |
| Prompt injection prevention | MISSING | All agents | Add input sanitization |
| **RAG** | | | |
| Vector store (embeddings) | MISSING | – | Implement Titan Embeddings + OpenSearch |
| Retrieval pipeline | MISSING | – | Build retrieval flow |
| Content indexing | MISSING | – | Index agronomy docs + schemes |
| Tenant filtering in retrieval | MISSING | – | Add farmer_id filters |
| **MCP/STRANDS** | | | |
| Strands SDK integration | MISSING | backend/requirements.txt | Add strands-agents dependency |
| MCP server implementation | MISSING | – | Create MCP server |
| Agent tool definitions | MISSING | – | Define tools for Bedrock |
| EventBridge orchestration | PARTIAL | Terraform | Add EventBridge rules |
| Correlation IDs | MISSING | Events | Add correlation_id to payloads |
| **OBSERVABILITY** | | | |
| Structured JSON logging | IMPLEMENTED | backend/utils/logger.py | ✅ Continue |
| Correlation IDs in logs | MISSING | Logger | Add correlation_id extraction |
| X-Ray tracing | MISSING | – | Add X-Ray SDK |
| CloudWatch metrics | MISSING | Agents | Emit custom metrics |
| PII filtering in logs | MISSING | Logger | Add PII masking |
| Retry logic | IMPLEMENTED | backend/utils/retry.py | ✅ Continue |
| Dead-letter queues | MISSING | EventBridge | Add DLQ configuration |
| Circuit breaker | MISSING | External APIs | Implement circuit breaker |
| Error categorization | IMPLEMENTED | backend/utils/errors.py | ✅ Continue |

---

## PRIORITIZED TO-DO LIST (Next 3-5 Days)

### 🔴 CRITICAL (Day 1-2) - MUST FIX BEFORE DEMO

1. **Add JWT Authentication Middleware** (2 hours)
   - Create `backend/middleware/auth.py` with JWT verification
   - Add middleware to all `/api/*` routes in `backend/server.js`
   - Test with Cognito token

2. **Implement CORS Restriction** (30 minutes)
   - Update `backend/server.js` line 12 to restrict origins
   - Add to CloudFormation

3. **Add Input Validation & Sanitization** (2 hours)
   - Create `backend/middleware/validation.py`
   - Add to all agent endpoints
   - Prevent prompt injection

4. **Add PII Masking in Responses** (1 hour)
   - Create `backend/utils/pii_filter.py`
   - Mask phone numbers, locations in responses
   - Test with sample data

### 🟠 HIGH (Day 2-3) - NEEDED FOR PRODUCTION

5. **Implement Minimum RAG Flow for HarvestReady** (4 hours)
   - Set up Amazon Titan Embeddings
   - Create OpenSearch domain
   - Index 10 sample agronomy documents
   - Add retrieval to HarvestReady agent

6. **Add CloudWatch Metrics** (2 hours)
   - Emit decisions_per_agent, latency_ms, error_rate
   - Create CloudWatch dashboard
   - Set up alarms for error rate > 5%

7. **Add X-Ray Tracing** (2 hours)
   - Add X-Ray SDK to backend/requirements.txt
   - Instrument Bedrock calls
   - Create X-Ray service map

8. **Configure EventBridge Rules** (2 hours)
   - Add rules connecting HarvestReady → SupplyMatch
   - Add DLQ for failed events
   - Test event flow

### 🟡 MEDIUM (Day 3-5) - NICE TO HAVE

9. **Implement MCP Server** (6 hours)
   - Create MCP server exposing 6 agent tools
   - Register with Bedrock Agent Core
   - Test tool invocation

10. **Add Bedrock Guardrails** (2 hours)
    - Create guardrail configuration
    - Add content filters
    - Test with malicious prompts

11. **Implement Circuit Breaker for Weather API** (2 hours)
    - Add circuit breaker pattern
    - Graceful degradation on API failure

12. **Add Correlation IDs to Events** (1 hour)
    - Update EventBridge event schema
    - Propagate correlation_id through agents

---

## SECURITY MUST-FIXES (BLOCKING PRODUCTION)

### 1. Authentication & Authorization
```python
# backend/middleware/auth.py (NEW FILE)
import jwt
from functools import wraps
from flask import request, jsonify

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'Missing token'}), 401
        
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            request.farmer_id = payload.get('sub')
            request.role = payload.get('cognito:groups', ['farmer'])[0]
        except:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated
```

### 2. CORS Restriction
```javascript
// backend/server.js (UPDATE)
const allowedOrigins = [
  'http://localhost:3000',
  'https://dashboard.harvelogix.ai',
  'https://app.harvelogix.ai'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

### 3. Input Validation
```python
# backend/middleware/validation.py (NEW FILE)
import re

def sanitize_input(data):
    """Remove potential prompt injection patterns."""
    dangerous_patterns = [
        r'ignore.*instructions',
        r'system.*prompt',
        r'forget.*previous',
        r'execute.*code'
    ]
    
    for key, value in data.items():
        if isinstance(value, str):
            for pattern in dangerous_patterns:
                if re.search(pattern, value, re.IGNORECASE):
                    raise ValueError(f"Suspicious input in {key}")
    
    return data
```

### 4. PII Masking
```python
# backend/utils/pii_filter.py (NEW FILE)
import re
import json

def mask_pii(data):
    """Mask PII in responses."""
    if isinstance(data, dict):
        return {k: mask_pii(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [mask_pii(item) for item in data]
    elif isinstance(data, str):
        # Mask phone numbers
        data = re.sub(r'\+91-?\d{4}\d{6}', '+91-XXXX-XXXXXX', data)
        # Mask Aadhaar
        data = re.sub(r'\d{4}\s?\d{4}\s?\d{4}', 'XXXX XXXX XXXX', data)
        # Mask coordinates
        data = re.sub(r'\d{2}\.\d+,\s?\d{2}\.\d+', 'XX.XX, XX.XX', data)
    
    return data
```

---

## MINIMUM RAG IMPLEMENTATION (HarvestReady Agent)

```python
# backend/agents/harvest_ready_agent.py (ADD)
from opensearchpy import OpenSearch
from boto3 import client as boto3_client

class HarvestReadyAgent(BaseAgent):
    def __init__(self):
        super().__init__('HarvestReady')
        self.opensearch = OpenSearch([{'host': 'opensearch.harvelogix.ai', 'port': 443}])
        self.bedrock_embeddings = boto3_client('bedrock-runtime')
    
    def retrieve_context(self, query: str, farmer_id: str) -> str:
        """Retrieve relevant agronomy docs and past decisions."""
        # Embed query
        embedding = self._embed_text(query)
        
        # Search OpenSearch
        results = self.opensearch.search(
            index='agronomy_docs',
            body={
                'query': {
                    'knn': {
                        'embedding': {
                            'vector': embedding,
                            'k': 5
                        }
                    }
                },
                'filter': {
                    'term': {'farmer_id': farmer_id}  # Tenant isolation
                }
            }
        )
        
        # Assemble context
        context = '\n'.join([hit['_source']['content'] for hit in results['hits']['hits']])
        return context
    
    def process(self, request_data):
        # ... existing code ...
        
        # NEW: Retrieve context
        context = self.retrieve_context(
            query=f"Harvest timing for {crop_type}",
            farmer_id=request_data.get('farmer_id')
        )
        
        # Invoke Bedrock with context
        prompt = f"""Context from knowledge base:
{context}

User query: When should I harvest my {crop_type}?
"""
        response = self.invoke_bedrock(prompt)
        # ... rest of code ...
```

---

## DEPLOYMENT READINESS CHECKLIST

- [ ] JWT authentication implemented and tested
- [ ] CORS restricted to known origins
- [ ] Input validation + sanitization on all endpoints
- [ ] PII masking in all responses
- [ ] Bedrock guardrails configured
- [ ] CloudWatch metrics emitted
- [ ] X-Ray tracing enabled
- [ ] EventBridge rules configured with DLQ
- [ ] Minimum RAG flow for HarvestReady working
- [ ] Secrets Manager integration for all credentials
- [ ] VPC security groups configured
- [ ] WAF rules deployed
- [ ] Rate limiting enabled
- [ ] Correlation IDs in all logs
- [ ] Error handling tested with circuit breaker
- [ ] Load testing completed (target: 100 req/sec)
- [ ] Security scan passed (OWASP Top 10)
- [ ] Penetration testing completed

---

## CONCLUSION

**HarveLogix AI has excellent architectural foundations** but requires **critical security hardening** before production deployment. The 12 must-fix items above should be completed within 3-5 days.

**Recommendation:** Deploy to staging environment with fixes, conduct security review, then proceed to production.

**Next Review:** After implementing all CRITICAL items, schedule follow-up audit.

---

**Report Generated:** February 28, 2026  
**Auditor:** Principal Cloud Architect  
**Classification:** INTERNAL - CONFIDENTIAL
