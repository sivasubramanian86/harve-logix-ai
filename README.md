# HarveLogix AI - Intelligent Post-Harvest Logistics Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AWS](https://img.shields.io/badge/AWS-Native-FF9900?logo=amazon-aws)](https://aws.amazon.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776ab?logo=python)](https://www.python.org)
[![React Native](https://img.shields.io/badge/React%20Native-0.72+-61dafb?logo=react)](https://reactnative.dev)

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

## Solution Overview

### Six Autonomous Agents

1. **HarvestReady Agent** → Optimal harvest timing using crop phenology + market + weather (₹4,500 benefit)
2. **StorageScout Agent** → Zero-loss storage protocol using ambient data + crop type (₹7,500 benefit)
3. **SupplyMatch Agent** → Direct farmer-processor buyer matching (eliminates middleman, ₹20K benefit)
4. **WaterWise Agent** → Water optimization for post-harvest operations (₹8,000 benefit)
5. **QualityHub Agent** → Automated quality certification using Rekognition (₹5,000 benefit)
6. **CollectiveVoice Agent** → Aggregation + collective bargaining (₹3,000 benefit)

### Architecture Highlights

- **Orchestration:** AWS Bedrock Agent Core + EventBridge
- **Real-Time State:** DynamoDB (10,000 WCU, <1ms p99 latency)
- **Historical Data:** RDS Aurora (50M+ market prices, 1M+ crop phenology records)
- **Analytics:** Redshift + QuickSight (government dashboards)
- **Mobile:** React Native/Flutter with offline-first SQLite
- **Security:** Cognito + KMS + WAF + CloudTrail
- **Performance:** <100ms p99 agent response time, 99.99% uptime

## Quick Start

### Prerequisites

- AWS Account with appropriate permissions
- Python 3.11+
- Node.js 18+
- Terraform or AWS CloudFormation

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sivasubramanian86/harve-logix-ai.git
   cd harvelogix-ai
   ```

2. **Quick Start (30 seconds)**
   ```bash
   # Windows
   start.bat
   
   # macOS/Linux
   chmod +x start.sh
   ./start.sh
   ```

3. **Manual Setup**
   ```bash
   # Backend
   cd backend
   npm install
   npm start
   
   # Frontend (new terminal)
   cd web-dashboard
   npm install
   npm run dev
   ```

4. **Open Dashboard**
   ```
   http://localhost:3000
   ```

## Project Structure

```
harvelogix-ai/
├── .kiro/
│   └── specs/
│       └── harvelogix-ai/
│           ├── requirements.md      # Functional & non-functional requirements
│           ├── design.md            # System architecture & data models
│           └── tasks.md             # Implementation task list
├── backend/
│   ├── agents/
│   │   ├── harvest_ready_agent.py
│   │   ├── storage_scout_agent.py
│   │   ├── supply_match_agent.py
│   │   ├── water_wise_agent.py
│   │   ├── quality_hub_agent.py
│   │   └── collective_voice_agent.py
│   ├── core/
│   │   ├── bedrock_orchestrator.py
│   │   ├── eventbridge_handler.py
│   │   └── context_manager.py
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── property_based/
│   └── requirements.txt
├── mobile-app/
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── app.json
├── infrastructure/
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── modules/
│   └── cloudformation/
├── scripts/
│   ├── deploy-agents.sh
│   ├── deploy-infrastructure.sh
│   └── run-tests.sh
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
├── README.md
├── LICENSE
├── SECURITY.md
└── .gitignore
```

## Key Features

### For Farmers
- **Phone-based authentication** with OTP and biometric support
- **Offline-first mobile app** (works 7 days without internet)
- **6 one-click agent buttons** for decision support
- **Multi-language support** (Hindi, Tamil, Kannada, Telugu, Marathi, Bengali)
- **Real-time notifications** for supply matches, payments, scheme eligibility
- **Income tracking dashboard** with decision history

### For Processors
- **Direct farmer connections** (no middlemen)
- **Supply forecasting** (30-day demand prediction)
- **Quality certification** (automated via Rekognition)
- **Collective aggregation** (bulk discounts, shared logistics)

### For Government
- **Real-time dashboards** (food security, farmer welfare, supply chain)
- **50M farmer data** (Redshift analytics)
- **Policy insights** (waste reduction trajectory, income distribution)
- **Scheme eligibility matching** (50+ government schemes)

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Agent response time | <100ms p99 | 🎯 |
| DynamoDB latency | <1ms p99 | 🎯 |
| API Gateway latency | <60ms p99 | 🎯 |
| App cold start | <2 seconds | 🎯 |
| Uptime SLA | 99.99% | 🎯 |
| Test coverage | 87%+ | 🎯 |
| Farmer income increase | ₹30-50K/acre | 🎯 |
| Waste reduction | 30% | 🎯 |

## Technology Stack

### Backend
- **Runtime:** Python 3.11+ (AWS Lambda)
- **AI/ML:** AWS Bedrock (Claude 3.5 Sonnet), AWS Rekognition
- **Orchestration:** AWS EventBridge, Strands MCP
- **Databases:** DynamoDB, RDS Aurora, Redshift, S3
- **Testing:** pytest, Hypothesis (property-based testing)

### Frontend
- **Mobile:** React Native or Flutter
- **Web Dashboard:** React + D3.js
- **State Management:** Redux/Provider
- **Offline:** SQLite, AppSync delta sync
- **Auth:** AWS Cognito

### Infrastructure
- **IaC:** Terraform / CloudFormation
- **CI/CD:** GitHub Actions / AWS CodePipeline
- **Monitoring:** CloudWatch, QuickSight
- **Security:** KMS, WAF, CloudTrail

## API Endpoints

```
GET  /api/harvest-ready          # Get optimal harvest timing
GET  /api/storage-scout          # Get storage recommendations
GET  /api/supply-match           # Find buyer matches
GET  /api/water-wise             # Optimize water usage
POST /api/quality-assessment     # Assess crop quality
GET  /api/collective-voice       # Join farmer collective
WS   /ws/notifications           # Real-time notifications
```

See [API.md](docs/API.md) for detailed documentation.

## Data Models

### Farmer Document (DynamoDB)
```json
{
  "farmer_id": "uuid-123",
  "phone": "+91-9876543210",
  "state": "Karnataka",
  "crop_type": "tomato",
  "current_growth_stage": 8,
  "decisions_made": {
    "harvest_ready": {"harvest_date": "2026-01-28", "confidence": 0.94},
    "storage_scout": {"method": "shade_storage", "temp_c": 22}
  },
  "pending_decisions": ["supply_match", "water_wise"]
}
```

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for complete data models.

## Deployment

### Development
```bash
./scripts/deploy-infrastructure.sh dev
./scripts/deploy-agents.sh dev
```

### Staging
```bash
./scripts/deploy-infrastructure.sh staging
./scripts/deploy-agents.sh staging
```

### Production
```bash
./scripts/deploy-infrastructure.sh prod
./scripts/deploy-agents.sh prod
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## Testing

### Unit Tests
```bash
pytest backend/tests/unit/ -v --cov=backend --cov-report=html
```

### Integration Tests
```bash
pytest backend/tests/integration/ -v
```

### Property-Based Tests
```bash
pytest backend/tests/property_based/ -v
```

### Load Tests
```bash
./scripts/load-test.sh
```

## Security

This project follows security best practices including:
- Encryption at rest (KMS AES-256)
- Encryption in transit (TLS 1.3)
- Authentication (Cognito + MFA)
- Authorization (IAM roles)
- Audit logging (CloudTrail)
- Rate limiting (100 req/sec per farmer)
- WAF protection (DDoS, SQL injection, XSS)

See [SECURITY.md](SECURITY.md) for detailed security guidelines.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Python: PEP 8, type hints, 87%+ test coverage
- JavaScript: ESLint, Prettier, 87%+ test coverage
- Commit messages: Conventional Commits format

## Roadmap

### Phase 1 (Weeks 1-2)
- Core agent logic & Bedrock integration
- Data models & storage setup

### Phase 2 (Weeks 3-4)
- Orchestration & communication
- Mobile app & frontend

### Phase 3 (Weeks 5-6)
- Testing & optimization
- MVP deployment (1K farmers in Belgaum)

### Phase 4 (Months 2-3)
- Scale to 50M farmers
- Government integration
- Model retraining & optimization

## Monitoring & Observability

- **CloudWatch Dashboards:** Real-time system health
- **CloudWatch Alarms:** Error rate, latency, availability
- **QuickSight Dashboards:** Government analytics
- **CloudTrail Logs:** Audit trail for compliance

## Cost Estimation

- **AWS Usage:** ~₹80K-2L/month (scales with users)
- **Server Cost:** $0 (serverless Lambda, DynamoDB on-demand)
- **Cost per Farmer:** <₹5/month

## Support

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/yourusername/harvelogix-ai/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/harvelogix-ai/discussions)
- **Email:** support@harvelogix.ai

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- AWS for cloud infrastructure
- Bedrock for AI/ML capabilities
- eNAM for market data
- Government of India for agricultural support
- Farming communities for inspiration

## Citation

If you use HarveLogix AI in your research or project, please cite:

```bibtex
@software{harvelogix2026,
  title={HarveLogix AI: Intelligent Post-Harvest Logistics Platform},
  author={Your Organization},
  year={2026},
  url={https://github.com/yourusername/harvelogix-ai}
}
```

## Disclaimer

This project is designed to support agricultural decision-making. While we strive for accuracy, farmers should always consult with local agricultural experts before making critical decisions.

---

**Made with ❤️ for Indian Agriculture | Viksit Bharat 2047**
