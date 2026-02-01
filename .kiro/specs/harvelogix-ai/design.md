# HarveLogix AI - Design Document

## System Architecture

### Layered Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  Farmer Mobile App (React Native/Flutter) | Gov Dashboard   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
│  API Gateway (6 REST endpoints + 1 WebSocket)               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    COMPUTE LAYER                             │
│  Bedrock Agent Core | 6 Lambda Agents | Orchestration       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 ORCHESTRATION LAYER                          │
│  EventBridge | Strands MCP | Context Propagation            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│  DynamoDB | RDS Aurora | S3 | Redshift                      │
└─────────────────────────────────────────────────────────────┘
```

### Presentation Layer

#### Farmer Mobile App
- **Framework:** React Native or Flutter
- **UI Structure:**
  - Tab 1: Home (6 agent cards, quick actions)
  - Tab 2: My Crops (crop list, growth tracking)
  - Tab 3: Buyers (supply matches, direct connections)
  - Tab 4: Community (collective voice, farmer groups)
  - Tab 5: Settings (profile, language, notifications)
- **Offline Storage:** SQLite local database
- **Sync:** AppSync delta sync when online
- **State Management:** Redux or Provider pattern
- **Notifications:** Firebase Cloud Messaging (FCM) for push

#### Government Web Dashboard
- **Framework:** React + D3.js
- **Dashboards:**
  - Food Security: Waste reduction trajectory, state-wise distribution
  - Farmer Welfare: Income distribution, retention rate, gender metrics
  - Supply Chain: Processor utilization, cost reduction, logistics optimization
- **Data Source:** Redshift via QuickSight
- **Real-time Refresh:** Every 5 minutes
- **Map Visualization:** State-by-state waste, farmer adoption, supply density

### API Layer

#### REST Endpoints
```
GET  /api/harvest-ready
     Input: {crop_type, growth_stage, weather_forecast, market_demand}
     Output: {harvest_date, harvest_time, expected_income_gain, confidence}

GET  /api/storage-scout
     Input: {crop_type, storage_duration, ambient_conditions}
     Output: {storage_method, temperature, humidity, waste_reduction}

GET  /api/supply-match
     Input: {farmer_id, crop_type, quantity, quality_grade, location}
     Output: {top_3_buyers, direct_connection_link, price_per_kg}

GET  /api/water-wise
     Input: {crop_type, operations, climate_data, cost_per_liter}
     Output: {protocol, water_savings, cost_savings, environmental_impact}

POST /api/quality-assessment
     Input: {image_file, crop_type, batch_size}
     Output: {quality_grade, defect_%, price_premium, certification_json}

GET  /api/collective-voice
     Input: {farmer_profiles, crop_type, region}
     Output: {aggregation_proposal, collective_size, discount_%, logistics_plan}
```

#### WebSocket Endpoint
```
WS /ws/notifications
   - Supply match found
   - Payment received
   - Scheme eligibility
   - Weather alerts
   - Agent decision updates
```

### Compute Layer

#### Bedrock Agent Core
- **Role:** Central orchestration and reasoning
- **Model:** Claude 3.5 Sonnet
- **Capabilities:**
  - Routes farmer requests to appropriate agent(s)
  - Maintains farmer session state
  - Invokes Lambda, DynamoDB, RDS, Rekognition as tools
  - Handles multi-agent workflows
- **Latency Target:** <100ms p99

#### Lambda Functions (6 Agents)

**1. HarvestReady Agent (harvelogix-harvest-ready-agent.py)**
- Query RDS crop_phenology: optimal ripeness window
- Query Weather API: rain-free harvest windows
- Query RDS market_prices: price trend analysis
- Query DynamoDB processor_orders: buyer demand alignment
- Bedrock reasoning: synthesize inputs → harvest recommendation
- Publish to EventBridge: event_type = "harvest_ready"

**2. StorageScout Agent (harvelogix-storage-scout-agent.py)**
- Query DynamoDB storage_templates: crop-specific protocols
- Analyze ambient conditions: temperature, humidity, light
- Calculate waste reduction vs default storage
- Estimate shelf-life extension
- Publish to EventBridge: event_type = "storage_recommended"

**3. SupplyMatch Agent (harvelogix-supply-match-agent.py)**
- Query DynamoDB processor_profiles: matching demand
- Calculate match score: distance + price + reliability
- Rank top 3 matches
- Enable direct farmer-processor connection
- Publish to EventBridge: event_type = "supply_matched"

**4. WaterWise Agent (harvelogix-water-wise-agent.py)**
- Analyze post-harvest operations: washing, cooling, processing
- Query climate data: temperature, humidity, rainfall
- Calculate water-efficient protocols
- Estimate water savings and cost savings
- Publish to EventBridge: event_type = "water_optimized"

**5. QualityHub Agent (harvelogix-quality-hub-agent.py)**
- Use AWS Rekognition: analyze crop photo
- Assign quality grade (A/B/C) with defect %
- Estimate market price premium
- Generate standardized certification JSON
- Publish to EventBridge: event_type = "quality_certified"

**6. CollectiveVoice Agent (harvelogix-collective-voice-agent.py)**
- Query DynamoDB farmers: identify 50+ farmers with same crop
- Propose aggregation with collective size
- Calculate bulk discount percentage
- Plan shared logistics
- Publish to EventBridge: event_type = "collective_proposed"

### Orchestration Layer

#### AWS EventBridge
- **Event Bus:** harvelogix-events
- **Rules:**
  - Rule 1: harvest_ready → Route to SupplyMatch
  - Rule 2: supply_matched → Trigger WaterWise + QualityHub (parallel)
  - Rule 3: 50+ harvest_confirmed + same_crop → Trigger CollectiveVoice
  - Rule 4: Failed events → Dead-letter queue (retry 3x, 2-min intervals)
- **Latency:** <100ms p99
- **Reliability:** 99.99% delivery

#### Strands MCP Context Propagation
- **Message Format:** Standardized JSON
- **Context Flow:**
  ```json
  {
    "farmer_id": "uuid-123",
    "crop_type": "tomato",
    "location": {"lat": 15.8, "lon": 75.6},
    "decisions_made": {
      "harvest_ready": {"harvest_date": "2026-01-28", "harvest_time": "5pm"},
      "storage_scout": {"method": "shade_storage", "temp_c": 22}
    },
    "pending_decisions": ["supply_match", "water_wise"]
  }
  ```
- **Propagation Latency:** <50ms
- **Consistency:** 99.99%

### Data Layer

#### DynamoDB (Real-Time State)

**Table: farmers**
- PK: farmer_id (UUID)
- SK: timestamp (ISO 8601)
- Attributes:
  - phone (encrypted)
  - state, district, location (coordinates)
  - crop_type, field_size_acres
  - current_growth_stage (0-10)
  - decisions_made (JSON)
  - pending_decisions (array)
  - last_updated (timestamp)
- GSI: (crop_type, timestamp) for regional queries
- Throughput: 10,000 WCU
- Latency: <1ms p99

**Table: agent_decisions**
- PK: farmer_id (UUID)
- SK: decision_timestamp (ISO 8601)
- Attributes:
  - agent_name (string)
  - decision_output (JSON)
  - reasoning (string)
  - confidence_score (0-1)
  - input_data (JSON)
- TTL: 90 days (GDPR compliance)
- Throughput: 10,000 WCU
- Encryption: KMS AES-256

#### RDS Aurora (PostgreSQL) (Historical Data)

**Table: crop_phenology**
- Columns: crop_id, growth_stage (0-10), ripeness_%, optimal_harvest_window, expected_yield_kg_per_acre
- Rows: 1M+ (10 crops × 50 varieties × 2000 variants)
- Indexes: (crop_id, growth_stage)
- Purpose: Optimal harvest timing lookup

**Table: market_prices**
- Columns: crop_id, mandi_code, date, min_price, max_price, avg_price, volume_traded, trend
- Rows: 50M+ (eNAM data from 1000+ mandis over 5 years)
- Indexes: (crop_id, date)
- Purpose: Price trend analysis, market intelligence

**Table: government_schemes**
- Columns: scheme_id, scheme_name, eligibility_criteria_json, subsidy_amount_rupees, documents_required, processing_time_days
- Rows: 50+
- Purpose: Scheme eligibility matching

**Configuration:**
- Read Replica: 1 (high-availability)
- Automated Backups: Daily, 30-day retention
- Encryption: KMS AES-256

#### S3 Data Lake

**Bucket: harvelogix-models/**
- crop_ripeness_model.pkl (99.2MB, XGBoost)
- storage_quality_classifier.pkl (150MB, CNN, 95.2% accuracy)
- demand_forecaster.pkl (45MB, LSTM)
- Versioning: Enabled for model rollback

**Bucket: harvelogix-images/**
- farmer_crop_photos/ (50M images, 1TB, labeled by crop + quality)
- training_data/ (10M images for retraining)
- Lifecycle: Move to Glacier after 1 year (cost optimization)
- Encryption: KMS AES-256

#### Redshift Analytics

**Fact Table: farmer_decisions**
- Columns: farmer_id, state, crop, agent_name, decision_type, decision_date, income_impact_rupees, water_savings_liters
- Rows: 50M
- Purpose: Income impact analysis, farmer welfare metrics

**Fact Table: processor_supply**
- Columns: processor_id, state, crop, date, demand_quantity, supply_matched_quantity, cost_reduction_%
- Rows: 10M
- Purpose: Supply chain metrics, processor utilization

**ETL Pipeline:**
- Frequency: Nightly batch
- Data Volume: 6TB → Redshift in <30 minutes
- Tool: AWS Glue + Spectrum

### Security Layer

#### AWS Cognito (Authentication)
- **User Pool:** harvelogix-farmer-pool
- **Registration:** Phone number + OTP verification
- **Login:** Phone + password OR biometric
- **Tokens:**
  - access_token: 1 hour (API calls)
  - refresh_token: 30 days (cached locally for offline re-auth)
- **MFA:** Optional for transactions >₹50K
- **Success Rate:** 99.9%

#### AWS KMS (Encryption)
- **Master Key:** harvelogix-master-key (AWS-managed)
- **Data Encryption:** All DynamoDB tables encrypted
- **In-Transit:** TLS 1.3 on all API calls
- **PII Encryption:** Farmer phone + Aadhaar with separate KMS key
- **Audit:** CloudTrail logs all key operations

#### AWS WAF (Web Application Firewall)
- **Attachment:** API Gateway
- **Rules:**
  - Rate limiting: 100 req/sec per farmer
  - SQL injection prevention
  - XSS prevention
  - DDoS protection

### Analytics Layer

#### AWS QuickSight (Government Dashboard)

**Dashboard 1: Food Security Insights**
- KPI: Current annual waste = ₹37K Cr (down from ₹92K Cr)
- Time-series: Waste reduction trajectory (6-month forecast)
- Map: State-wise waste distribution

**Dashboard 2: Farmer Welfare**
- Distribution: Income increase (% farmers earning ₹20-30K vs ₹30-50K vs ₹50K+)
- Retention: Re-engagement rate, recommendation rate
- Gender: % women users, income gap vs men

**Dashboard 3: Supply Chain**
- Processor utilization: 65% → 89%
- Cost reduction: 32% → 10%
- Logistics: Eliminated 12K middleman touchpoints

#### AWS CloudWatch (Monitoring)
- **Metrics:**
  - Lambda duration (avg 45ms)
  - Error rate (<0.1%)
  - API latency (avg 60ms)
  - DynamoDB latency (<1ms p99)
- **Alarms:**
  - Error rate >0.1% → Page on-call
  - DynamoDB latency >100ms → Page on-call
  - EventBridge delivery failure >0.01% → Alert
- **Logs:** All Lambda executions logged, searchable
- **Dashboard:** Real-time system health view

## Data Models

### Farmer Document (DynamoDB)
```json
{
  "farmer_id": "uuid-123",
  "phone": "+91-9876543210",
  "state": "Karnataka",
  "district": "Belgaum",
  "location": {"lat": 15.8, "lon": 75.6},
  "crop_type": "tomato",
  "field_size_acres": 2.5,
  "current_growth_stage": 8,
  "decisions_made": {
    "harvest_ready": {
      "decision": "harvest_on_2026-01-28",
      "time": "5pm",
      "confidence": 0.94
    },
    "storage_scout": {
      "method": "shade_storage",
      "temp_c": 22,
      "humidity_%": 65
    },
    "supply_match": {
      "buyer_id": "processor-456",
      "price_per_kg": 48
    }
  },
  "pending_decisions": ["water_wise", "quality_hub"],
  "last_updated": "2026-01-25T14:30:00Z"
}
```

### Agent Decision Output (DynamoDB)
```json
{
  "farmer_id": "uuid-123",
  "agent": "HarvestReady",
  "decision_timestamp": "2026-01-25T14:30:00Z",
  "input": {
    "crop": "tomato",
    "growth_stage": 8,
    "ripeness_%": 87,
    "weather_forecast": "no_rain_48hrs",
    "market_price": 48
  },
  "output": {
    "harvest_date": "2026-01-28",
    "harvest_time": "5pm",
    "expected_income_gain_rupees": 4500,
    "reasoning": "ripeness 87% + no rain 48hrs + market peak on day-4"
  },
  "confidence_score": 0.94,
  "ttl": 2524608000
}
```

### Processor Profile (RDS)
```json
{
  "processor_id": "proc-789",
  "name": "FreshMart Cooperative",
  "location": "Bengaluru",
  "crops_needed": ["tomato", "capsicum", "onion"],
  "daily_requirement_kg": 5000,
  "quality_requirement": "A_grade",
  "price_offered": 48,
  "transport_available": true,
  "payment_terms": "same_day_cash",
  "historical_reliability": 0.98
}
```

### Market Price Record (RDS)
```json
{
  "crop_id": "tomato-001",
  "mandi_code": "BELGAUM_MANDI",
  "date": "2026-01-25",
  "min_price_per_kg": 45,
  "max_price_per_kg": 52,
  "avg_price_per_kg": 48,
  "volume_traded_kg": 125000,
  "trend": "up_8%_from_yesterday"
}
```

## Deployment & Infrastructure

### AWS CloudFormation/Terraform Resources

**Compute:**
- 6 Lambda functions (agents)
- 1 Bedrock Agent Core instance
- API Gateway (6 REST + 1 WebSocket)

**Data:**
- DynamoDB: 2 tables (farmers, agent_decisions)
- RDS Aurora: PostgreSQL cluster with 1 read replica
- S3: 2 buckets (models, images)
- Redshift: 1 cluster (dense compute, 2 nodes minimum)

**Orchestration:**
- EventBridge: 1 event bus + 10+ rules
- Cognito: 1 user pool
- AppSync: 1 GraphQL API

**Security:**
- KMS: 1 master key + 1 PII key
- WAF: 1 rule set on API Gateway
- CloudTrail: Enabled for audit

**Monitoring:**
- CloudWatch: Dashboards + Alarms
- QuickSight: 3 government dashboards

### Infrastructure as Code
- **Tool:** Terraform or CloudFormation
- **Modules:** Compute, Data, Orchestration, Security, Monitoring
- **Environments:** Dev, Staging, Production
- **CI/CD:** GitHub Actions or AWS CodePipeline

## Testing & Quality Assurance

### Unit Tests (pytest)
- Test each agent logic in isolation (mock Bedrock, RDS, DynamoDB)
- Expected coverage: 87%+
- Test framework: pytest with fixtures

### Integration Tests
- Test agent orchestration: HarvestReady → EventBridge → SupplyMatch flow
- Test DynamoDB conflict resolution (offline sync scenarios)
- Test Bedrock reasoning with sample inputs
- Test framework: pytest + moto (AWS mocking)

### Property-Based Tests
- Use Hypothesis or fast-check for property testing
- Test core logic across many inputs
- Validate correctness properties

### Load Tests
- Simulate 10K concurrent requests (Apache JMeter)
- Verify <100ms p99 response time
- Verify 99.99% uptime (4.32 sec downtime max)

### Security Tests
- SQL injection attempts on RDS
- DDoS simulation (verify WAF blocks)
- Encryption verification (KMS key rotation)
- Penetration testing: Quarterly

## Timeline & Milestones

- **Week 1:** Core agent logic (6 Lambda functions, Bedrock integration)
- **Week 2:** Data models (DynamoDB, RDS, S3 setup)
- **Week 3:** Orchestration (EventBridge, Strands MCP, context propagation)
- **Week 4:** Mobile app (React Native, offline-first SQLite, AppSync sync)
- **Week 5:** Testing & optimization (load testing, latency tuning)
- **Week 6:** MVP deployment (1K farmers pilot in Belgaum)

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Agent response time | <100ms p99 | CloudWatch metrics |
| DynamoDB latency | <1ms p99 | CloudWatch metrics |
| Uptime | 99.99% | Monthly SLA report |
| Test coverage | 87%+ | Code coverage tools |
| Farmer income increase | ₹30-50K/acre (Year 1: ₹15K) | Farmer surveys |
| Adoption rate | 2% Year 1, 20% Year 3 | User analytics |
| Waste reduction | 30% | Government data |
| Processor utilization | 60-70% → 89% | Supply chain metrics |
