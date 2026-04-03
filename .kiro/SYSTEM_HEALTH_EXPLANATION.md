# System Health Status Explanation

## Current Status: "Degraded" EventBridge

### What Does This Mean?

**Overall System Status**: "Some systems experiencing issues"  
**EventBridge Status**: "Degraded" - Status of event routing infrastructure

---

## System Health Metrics Breakdown

### 1. **Agent Latency** (ms)
- **What it measures**: Average response time for AI agent decisions
- **Threshold**: 500ms (healthy), >500ms (warning), >700ms (critical)
- **Current**: Varies based on Bedrock availability
- **Impact**: Affects how quickly farmers get recommendations

### 2. **Error Rate** (%)
- **What it measures**: Percentage of failed API calls
- **Threshold**: 5% (healthy), >5% (warning), >10% (critical)
- **Current**: Depends on agent health
- **Impact**: Indicates system reliability

### 3. **Bedrock API Call Volume** (calls)
- **What it measures**: Number of calls to Amazon Bedrock AI service
- **Current**: ~15,234 calls (demo data)
- **Impact**: Shows AI model usage intensity

### 4. **EventBridge Status** (Degraded)
- **What it measures**: Status of AWS EventBridge event routing infrastructure
- **Current Status**: **DEGRADED**
- **What this means**: One or more agents are not responding properly

---

## Why Is EventBridge Showing "Degraded"?

### Root Cause Analysis

The EventBridge status is determined by the `/api/agents/health` endpoint, which:

1. **Tests each agent** (HarvestReady, StorageScout, SupplyMatch, WaterWise, QualityHub, CollectiveVoice)
2. **Checks Bedrock connectivity** for each agent
3. **Sets overall status** based on agent health:
   - ✅ **Healthy**: All agents responding + Bedrock available
   - ⚠️ **Degraded**: One or more agents not responding OR Bedrock unavailable
   - 🔴 **Critical**: Multiple agents down OR Bedrock completely unavailable

### Common Reasons for Degradation

| Issue | Cause | Solution |
|-------|-------|----------|
| **Bedrock Unavailable** | AWS Bedrock service down or credentials invalid | Check AWS credentials, verify Bedrock region |
| **Agent Timeout** | Python agent process taking >30 seconds | Restart backend, check system resources |
| **Missing Dependencies** | Python packages not installed | Run `pip install -r requirements.txt` |
| **Lambda Function Error** | Lambda function for agent invocation failing | Check Lambda logs in CloudWatch |
| **EventBridge Rules Disabled** | EventBridge rules not active | Enable rules in AWS EventBridge console |
| **Network Issues** | Backend can't reach Bedrock API | Check VPC, security groups, NAT gateway |

---

## Current Architecture

```
Frontend (React) 
    ↓
API Gateway (/api/agents/health)
    ↓
Express Backend (Node.js)
    ↓
Python Agents (6 agents)
    ↓
Amazon Bedrock (Nova Lite/Pro models)
    ↓
EventBridge (Event routing)
```

---

## What Happens When EventBridge Is Degraded?

### User Impact

1. **AI Recommendations Delayed**: Farmers may not get timely insights
2. **Fallback to Demo Data**: System uses cached/demo data instead of live analysis
3. **Reduced Accuracy**: Recommendations based on older data
4. **Feature Limitations**: Some AI features may be unavailable

### System Behavior

- Dashboard shows ⚠️ warning badge
- System Health page displays "Degraded" status
- Agent endpoints may return errors or fallback responses
- EventBridge events may not be processed

---

## How to Fix EventBridge Degradation

### Step 1: Check Agent Health
```bash
curl http://localhost:5000/api/agents/health
```

### Step 2: Verify Bedrock Access
```bash
aws bedrock list-foundation-models --region ap-south-2
```

### Step 3: Check EventBridge Rules
```bash
aws events list-rules --query "Rules[].{Name:Name,State:State}"
```

### Step 4: Restart Backend
```bash
# Kill existing process
pkill -f "node server.js"

# Restart
npm start
```

### Step 5: Verify System Health
```bash
curl http://localhost:5000/api/agents/health
```

---

## Monitoring & Alerts

### Key Metrics to Watch

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Agent Latency | <500ms | 500-700ms | >700ms |
| Error Rate | <5% | 5-10% | >10% |
| Bedrock Status | Available | Slow | Unavailable |
| EventBridge | Healthy | Degraded | Critical |

### Auto-Refresh

The System Health dashboard auto-refreshes every **30 seconds** to provide real-time monitoring.

---

## Next Steps

1. **Monitor the health endpoint** regularly
2. **Set up CloudWatch alarms** for critical metrics
3. **Enable EventBridge logging** for debugging
4. **Configure auto-recovery** for failed agents
5. **Plan Phase 3 upgrade** to Bedrock Agent Core for better reliability

---

## Related Documentation

- `.kiro/BEDROCK_AGENT_CORE_ANALYSIS.md` - Cost analysis of current vs. future architecture
- `backend/docs/IMPLEMENTATION.md` - Backend implementation details
- `backend/docs/BEDROCK_QUICK_START.md` - Bedrock setup guide
