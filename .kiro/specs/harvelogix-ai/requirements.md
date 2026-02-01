# HarveLogix AI - Requirements Document

## Vision
Transform ₹92,000 crore annual post-harvest agricultural loss into prosperity through coordinated AI-driven decision support. Connect 50M smallholder farmers + 5M processors + Government through 6 autonomous agents that orchestrate harvest timing, storage, supply, water, quality, and aggregation decisions.

**Target Outcomes:**
- ₹30-50K/acre farmer income increase
- 30% waste reduction
- 50M-user scale
- 99.99% uptime
- AWS-native architecture

## Problem Statement
- 15 million tonnes of produce wasted annually (₹92K crore loss)
- Farmers make post-harvest decisions gut-based (harvest timing, storage, buyer selection)
- 40% of farmer value captured by middlemen
- 5M processors operate at 60-70% capacity (can't find consistent supply)
- No system connects all post-harvest decisions end-to-end
- Rural broadband reality: 29% of farmers lack reliable internet

## Functional Requirements

### 1. Six Autonomous Agents

#### 1.1 HarvestReady Agent
**Purpose:** Optimal harvest timing using crop phenology + market + weather

**Input:**
- crop_type (string)
- current_growth_stage (0-10 scale)
- weather_forecast_7d (array of daily forecasts)
- market_price_trend (historical + current prices)
- processor_orders (list of buyer requirements)

**Output:**
- harvest_date (ISO 8601 date)
- harvest_time (HH:mm format)
- expected_income_gain_rupees (₹ amount)
- reasoning (explanation of decision)
- confidence_score (0-1)

**Acceptance Criteria:**
- 1.1.1 Agent queries RDS crop_phenology table to determine optimal ripeness window
- 1.1.2 Agent integrates 7-day weather forecast to identify rain-free harvest windows
- 1.1.3 Agent analyzes market price trends to recommend harvest timing for maximum value
- 1.1.4 Agent considers processor orders to align harvest with buyer demand
- 1.1.5 Agent provides income impact estimate (₹4,500 average benefit)
- 1.1.6 Agent response time <100ms p99
- 1.1.7 Confidence score reflects data quality and forecast certainty

#### 1.2 StorageScout Agent
**Purpose:** Zero-loss storage protocol using ambient data + crop type

**Input:**
- crop_type (string)
- storage_duration_days (integer)
- ambient_conditions (temperature, humidity, light)
- current_storage_facilities (list of available options)

**Output:**
- storage_method (string: shade_storage, cold_storage, modified_atmosphere, etc.)
- temperature_setpoint_celsius (float)
- humidity_setpoint_percent (float)
- waste_reduction_percent (float)
- estimated_shelf_life_days (integer)

**Acceptance Criteria:**
- 1.2.1 Agent recommends storage method based on crop type and duration
- 1.2.2 Agent provides precise temperature and humidity setpoints
- 1.2.3 Agent estimates waste reduction percentage vs default storage
- 1.2.4 Agent provides shelf-life extension estimate
- 1.2.5 Agent response time <100ms p99
- 1.2.6 Recommendations reduce post-harvest loss by minimum 20%

#### 1.3 SupplyMatch Agent
**Purpose:** Direct farmer-processor buyer matching (eliminates middleman)

**Input:**
- farmer_id (UUID)
- crop_type (string)
- quantity_kg (float)
- quality_grade (A/B/C)
- location (coordinates or district)
- harvest_date (ISO 8601)

**Output:**
- top_3_buyer_matches (array with scores)
- direct_connection_link (URL for farmer-processor chat)
- no_middleman_flag (boolean)
- price_per_kg (₹ amount)
- estimated_income_rupees (total transaction value)

**Acceptance Criteria:**
- 1.3.1 Agent queries processor profiles to find matching demand
- 1.3.2 Agent ranks matches by location distance, price, reliability
- 1.3.3 Agent eliminates middleman by enabling direct farmer-processor connection
- 1.3.4 Agent provides top 3 matches with confidence scores
- 1.3.5 Agent response time <100ms p99
- 1.3.6 Average farmer income increase from direct sales: ₹20,000/transaction

#### 1.4 WaterWise Agent
**Purpose:** Water optimization for post-harvest operations

**Input:**
- crop_type (string)
- post_harvest_operations (list: washing, cooling, processing)
- climate_data (temperature, humidity, rainfall)
- cost_per_liter_rupees (float)

**Output:**
- water_optimized_protocol (JSON with operation-specific recommendations)
- water_savings_liters (float)
- cost_savings_rupees (float)
- environmental_impact (CO2 saved kg)

**Acceptance Criteria:**
- 1.4.1 Agent recommends water-efficient protocols for each operation
- 1.4.2 Agent calculates water savings vs standard practices
- 1.4.3 Agent estimates cost savings in rupees
- 1.4.4 Agent provides environmental impact metrics
- 1.4.5 Agent response time <100ms p99
- 1.4.6 Average water savings: ₹8,000/season

#### 1.5 QualityHub Agent
**Purpose:** Automated quality certification using Rekognition

**Input:**
- farmer_photo_of_crop (image file or S3 URL)
- crop_type (string)
- batch_size_kg (float)

**Output:**
- quality_grade (A/B/C)
- defect_percent (float)
- market_price_premium_percent (float)
- certification_json (standardized quality certificate)
- confidence_score (0-1)

**Acceptance Criteria:**
- 1.5.1 Agent uses AWS Rekognition to analyze crop quality from photo
- 1.5.2 Agent assigns quality grade (A/B/C) with defect percentage
- 1.5.3 Agent estimates market price premium for quality grade
- 1.5.4 Agent generates standardized certification JSON
- 1.5.5 Agent response time <100ms p99 (excluding image upload)
- 1.5.6 Rekognition accuracy: 95.2% on labeled dataset
- 1.5.7 Average farmer income increase from quality certification: ₹5,000

#### 1.6 CollectiveVoice Agent
**Purpose:** Aggregation + collective bargaining

**Input:**
- farmer_profiles_nearby (array of 50+ farmer objects)
- crop_type (string)
- region (state/district)

**Output:**
- aggregation_proposal (JSON with collective details)
- collective_size (number of farmers)
- expected_discount_percent (float)
- shared_logistics_plan (JSON)
- collective_id (UUID for group)

**Acceptance Criteria:**
- 1.6.1 Agent identifies 50+ farmers with same crop in region
- 1.6.2 Agent proposes aggregation with collective size
- 1.6.3 Agent estimates bulk discount percentage
- 1.6.4 Agent plans shared logistics (transport, storage)
- 1.6.5 Agent response time <100ms p99
- 1.6.6 Average farmer income increase from collective: ₹3,000

### 2. Farmer Mobile App

#### 2.1 Authentication
**Acceptance Criteria:**
- 2.1.1 Phone-based login with OTP verification (Cognito)
- 2.1.2 Biometric support (iOS Face ID, Android fingerprint)
- 2.1.3 Token management: 1-hour access token + 30-day refresh token
- 2.1.4 Offline token caching for offline re-authentication
- 2.1.5 Optional MFA for transactions >₹50K
- 2.1.6 Login success rate: 99.9%

#### 2.2 Offline-First Architecture
**Acceptance Criteria:**
- 2.2.1 SQLite local cache stores farmer state + agent outputs
- 2.2.2 App functions without internet for 7 days
- 2.2.3 Auto-sync when WiFi available (AppSync delta sync)
- 2.2.4 Conflict resolution: Bedrock reconciles offline decisions with new online data
- 2.2.5 Sync success rate: 99.95%
- 2.2.6 Data consistency maintained across offline/online transitions

#### 2.3 Multi-Language Support
**Acceptance Criteria:**
- 2.3.1 Support languages: English, Hindi, Tamil, Kannada, Telugu, Marathi, Bengali, Malayalam, Gujarati and more Indian languages
- 2.3.2 Bedrock Claude multilingual for agent responses
- 2.3.3 UI localization for all screens
- 2.3.4 Language preference persisted in user profile
- 2.3.5 Translation accuracy: 98%+

#### 2.4 Real-Time Notifications
**Acceptance Criteria:**
- 2.4.1 WebSocket push notifications for supply matches
- 2.4.2 Payment received notifications
- 2.4.3 Scheme eligibility alerts
- 2.4.4 Weather alerts for harvest planning
- 2.4.5 Notification delivery latency: <2 seconds
- 2.4.6 Notification delivery success rate: 99.9%

#### 2.5 Agent Integration UI
**Acceptance Criteria:**
- 2.5.1 Six one-click buttons for each agent (Get Harvest Time, Get Storage, Get Buyer, Optimize Water, Get Quality Grade, Join Collective)
- 2.5.2 Tab-based navigation (Home, My Crops, Buyers, Community, Settings)
- 2.5.3 Real-time decision history display
- 2.5.4 Income impact tracking dashboard
- 2.5.5 UI response time: <500ms for all interactions

### 3. Data Management

#### 3.1 DynamoDB (Real-Time State)
**Acceptance Criteria:**
- 3.1.1 farmers table: PK farmer_id, SK timestamp, stores location, crop, growth_stage, decisions
- 3.1.2 agent_decisions table: PK farmer_id, SK decision_timestamp, stores all agent outputs
- 3.1.3 GSI on (crop_type, timestamp) for regional queries
- 3.1.4 TTL: 90 days for agent_decisions (GDPR compliance)
- 3.1.5 Throughput: 10,000 WCU for 10K concurrent farmers
- 3.1.6 Latency: <1ms p99
- 3.1.7 Encryption at rest with KMS AES-256

#### 3.2 RDS Aurora (Historical Data)
**Acceptance Criteria:**
- 3.2.1 crop_phenology table: 1M+ records (10 crops × 50 varieties × 2000 variants)
- 3.2.2 market_prices table: 50M+ records (eNAM data from 1000+ mandis over 5 years)
- 3.2.3 government_schemes table: 50+ schemes with eligibility criteria
- 3.2.4 Indexes on (crop_id, growth_stage) and (crop_id, date) for fast lookups
- 3.2.5 1 read replica for high-availability
- 3.2.6 Automated backups (daily, 30-day retention)
- 3.2.7 Encryption at rest with KMS

#### 3.3 S3 Data Lake
**Acceptance Criteria:**
- 3.3.1 ML models bucket: ripeness_classifier.pkl, storage_quality_classifier.pkl, demand_forecaster.pkl
- 3.3.2 Images bucket: 50M labeled farmer crop photos (1TB)
- 3.3.3 Training data: 10M images for model retraining
- 3.3.4 Lifecycle policy: Move to Glacier after 1 year
- 3.3.5 Versioning enabled for model rollback
- 3.3.6 Encryption at rest with KMS

#### 3.4 Redshift Analytics
**Acceptance Criteria:**
- 3.4.1 farmer_decisions fact table: 50M rows for income impact analysis
- 3.4.2 processor_supply fact table: 10M rows for supply chain metrics
- 3.4.3 Nightly ETL: 6TB data → Redshift in <30 minutes
- 3.4.4 Query latency: <5 seconds for government dashboards
- 3.4.5 Data retention: 3 years

### 4. Orchestration & Communication

#### 4.1 Bedrock Agent Core
**Acceptance Criteria:**
- 4.1.1 Routes farmer requests to appropriate agent(s)
- 4.1.2 Maintains farmer session state (current crop, decisions made, next actions)
- 4.1.3 Can invoke Lambda, DynamoDB, RDS, Rekognition as tools
- 4.1.4 Reasoning model: Claude 3.5 Sonnet
- 4.1.5 Response time: <100ms p99
- 4.1.6 Uptime: 99.99%

#### 4.2 EventBridge Orchestration
**Acceptance Criteria:**
- 4.2.1 Rule 1: harvest_ready event → Route to SupplyMatch
- 4.2.2 Rule 2: supply_matched event → Trigger WaterWise, QualityHub in parallel
- 4.2.3 Rule 3: 50+ farmers with harvest_confirmed + same_crop → Trigger CollectiveVoice
- 4.2.4 Dead-letter queue: harvelogix-dlq with 3x retry (2-min intervals)
- 4.2.5 Event delivery latency: <100ms p99
- 4.2.6 Event delivery success rate: 99.99%

#### 4.3 Strands MCP Context Propagation
**Acceptance Criteria:**
- 4.3.1 Standardized JSON message format for agent communication
- 4.3.2 HarvestReady output → SupplyMatch receives harvest_date context
- 4.3.3 Context includes farmer_id, crop_type, location, decisions_made
- 4.3.4 Context propagation latency: <50ms
- 4.3.5 Context consistency: 99.99%

### 5. External Integrations

#### 5.1 eNAM (National Agricultural Market)
**Acceptance Criteria:**
- 5.1.1 Real-time mandi prices for 1000+ mandis
- 5.1.2 Price update frequency: Every 30 minutes
- 5.1.3 Historical price data: 5 years
- 5.1.4 API availability: 99.9%

#### 5.2 Weather API
**Acceptance Criteria:**
- 5.2.1 7-day weather forecasts with micro-location accuracy
- 5.2.2 Data points: temperature, rainfall, humidity, wind
- 5.2.3 Update frequency: Every 6 hours
- 5.2.4 Accuracy: 85%+ for 48-hour forecasts
- 5.2.5 API availability: 99.9%

#### 5.3 Razorpay Payment Integration
**Acceptance Criteria:**
- 5.3.1 Farmer-processor payment escrow
- 5.3.2 Settlement within 24 hours
- 5.3.3 Transaction success rate: 99.95%
- 5.3.4 PCI DSS compliance
- 5.3.5 Fraud detection: <0.1% false positive rate

#### 5.4 Government Scheme Database
**Acceptance Criteria:**
- 5.4.1 50+ government schemes with eligibility criteria
- 5.4.2 Manual updates (weekly)
- 5.4.3 Eligibility matching for farmers
- 5.4.4 Scheme notification to eligible farmers

## Non-Functional Requirements

### 1. Performance
**Acceptance Criteria:**
- 1.1 Agent response time: <100ms p99 (measured via CloudWatch)
- 1.2 DynamoDB latency: <1ms p99
- 1.3 API Gateway latency: <60ms p99
- 1.4 App cold start: <2 seconds
- 1.5 Mobile app UI responsiveness: <500ms for all interactions

### 2. Scalability
**Acceptance Criteria:**
- 2.1 Support 50M concurrent farmers (Bedrock Agent Core + Lambda auto-scaling)
- 2.2 Handle 10K decision requests/second at peak (EventBridge capacity)
- 2.3 1TB+ historical data (S3 + Redshift)
- 2.4 DynamoDB auto-scaling: 10,000 WCU
- 2.5 Lambda concurrent executions: 1,000+

### 3. Reliability
**Acceptance Criteria:**
- 3.1 99.99% uptime SLA (measured per month, 4.32 sec max downtime)
- 3.2 Automated failover (multi-AZ RDS, DynamoDB replication)
- 3.3 Dead-letter queues (EventBridge retries failed events 3x with 2-min intervals)
- 3.4 Health checks: Every 30 seconds
- 3.5 MTTR (Mean Time To Recovery): <5 minutes

### 4. Security
**Acceptance Criteria:**
- 4.1 Encryption at rest (KMS AES-256, DynamoDB encrypted)
- 4.2 Encryption in transit (TLS 1.3)
- 4.3 Authentication: Cognito with MFA option
- 4.4 Audit: CloudTrail logs all key operations
- 4.5 WAF on API Gateway (prevent DDoS, SQL injection)
- 4.6 PII encryption: Farmer phone + Aadhaar with separate KMS key
- 4.7 Rate limiting: 100 req/sec per farmer
- 4.8 Penetration testing: Quarterly

### 5. Offline Capability
**Acceptance Criteria:**
- 5.1 App works without internet for 7 days
- 5.2 Local SQLite cache stores farmer state + agent outputs
- 5.3 Auto-sync when WiFi available (AppSync delta sync)
- 5.4 Conflict resolution: If farmer made decision offline + received new market data online, Bedrock reconciles
- 5.5 Sync success rate: 99.95%
- 5.6 Data consistency: 99.99%

### 6. Cost Efficiency
**Acceptance Criteria:**
- 6.1 AWS usage: ~₹80K-2L/month (scales with users, not fixed infrastructure)
- 6.2 Server cost: $0 (serverless Lambda, DynamoDB on-demand)
- 6.3 Data cost: Optimized (S3 Glacier archival, Redshift Spectrum for cold analytics)
- 6.4 Cost per farmer per month: <₹5

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
