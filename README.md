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

## 🌐 Live Deployment

| Component | URL |
|:---|:---|
| **Dashboard (Frontend)** | [https://d2autvkcn7doq.cloudfront.net](https://d2autvkcn7doq.cloudfront.net) |
| **API Gateway (Backend)** | `https://s4sofpxni6.execute-api.ap-south-2.amazonaws.com/prod` |
| **Backend** | Node.js 22 on EC2 (Amazon Linux 2023), proxied via API Gateway |
| **Database** | AWS RDS PostgreSQL (`ap-south-2`) |

## Problem Statement

- 15 million tonnes of produce wasted annually (₹92K crore loss)
- Farmers make post-harvest decisions gut-based (harvest timing, storage, buyer selection)
- 40% of farmer value captured by middlemen
- 5M processors operate at 60-70% capacity (can't find consistent supply)
- No system connects all post-harvest decisions end-to-end
- Rural broadband reality: 29% of farmers lack reliable internet

## Solution Overview

### Six Autonomous Agents (Powered by Amazon Nova)

1. **HarvestReady Agent** → Optimal harvest timing using crop phenology + market + weather.
2. **StorageScout Agent** → Zero-loss storage protocol using ambient data + crop type.
3. **SupplyMatch Agent** → Direct farmer-processor buyer matching (eliminates middleman).
4. **WaterWise Agent** → Water optimization for post-harvest operations.
5. **QualityHub Agent** → Automated quality certification using Multimodal Nova Vision.
6. **CollectiveVoice Agent** → Aggregation + collective bargaining.

### Architecture Highlights

- **Orchestration:** Amazon Bedrock Agent Intelligence with **Nova Lite** inference profiles.
- **Model Context Protocol (MCP):** Real-time tool execution for live sensing data.
- **RAG (Retrieval-Augmented Generation):** Knowledge grounding for hyper-local agricultural advice.
- **Database:** PostgreSQL with **Prisma ORM** for structured and vector data.
- **Multimodal Support:** Voice, Image, and Video analysis for crop health and field status.
- **Internationalization:** Support for 8+ Indian regional languages (Hindi, Gujarati, Tamil, etc.).

## Quick Start

### Prerequisites

- AWS Account with Bedrock access (Nova Lite inference profile enabled)
- Python 3.10+
- **Node.js 22 LTS** (v22+, required — see [nodejs.org](https://nodejs.org))
- PostgreSQL instance

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sivasubramanian86/harve-logix-ai.git
   cd harvelogix-ai
   ```

2. **Quick Start (Auto)**
   ```bash
   # Windows
   start.bat
   ```

3. **Manual Setup**
   ```bash
   # Backend
   cd backend
   npm install
   npm run dev
   
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
├── backend/                 # Agent Engine & API Server
│   ├── agents/              # Autonomous AI Agents (Python)
│   ├── core/                # Shared AI & DB Utilities
│   ├── docs/                # Backend-specific documentation
│   ├── routes/              # API Endpoints
│   └── prisma/              # Database Schema & Migrations
├── web-dashboard/           # Premium React Frontend
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Dashboard screens (Overview, AI Scanner, etc.)
│   │   ├── i18n/            # Multilingual support
│   │   └── theme/           # Premium design system (Forest to Tech)
│   └── docs/                # Dashboard-specific documentation
├── docs/                    # Centralized Project Documentation
│   ├── ARCHITECTURE.md      # System design
│   ├── TECH_STACK.md        # Detailed technology breakdown
│   └── README.md            # Docs index
├── scripts/                 # Utility & Management scripts
├── start.bat                # Automated startup script
└── README.md                # Root project overview
```

## Key Features

### For Farmers
- **AI Actionable Recommendations**: Personalized, real-time advice from Bedrock/Nova.
- **AI Scanner**: Multimodal (Vision/Voice) crop and field health analysis.
- **Multi-language Support**: 8+ Indian regional languages.
- **Income & Waste Tracking**: Real-time impact metrics.

### For Processors
- **Direct Buyer Matching**: AI-driven connection to farmers.
- **Supply Forecasting**: Predictive analytics for inventory management.
- **Quality Verification**: Multimodal evidence-based certification.

### For Government
- **Macro Dashboards**: Regional waste and income uplift analytics.
- **Policy Insights**: Data-driven visibility into agricultural trends.

### AI & Reasoning
- **Primary Reasoning:** Amazon Bedrock (Claude Haiku 4.5 via ap-south-2 Inference Profile)
- **Multimodal AI:** Amazon Nova Lite (`us.amazon.nova-lite-v1:0`)
- **Agent Mesh:** Custom Python/Node.js multi-agent orchestration
- **Tools:** MCP-driven dynamic data retrieval
- **Vector Store:** Amazon OpenSearch Service (k-NN enabled vector store)

### Frontend (Dashboard)
- **Framework:** React + Vite
- **Theming:** Premium "Forest to Tech" glassmorphism
- **I18n:** Multi-language JSON engine

### Backend
- **Core:** Express.js + Python 3.10
- **Database:** PostgreSQL + Prisma ORM
- **AWS Integration:** Boto3, AWS SDK

### Engineering & Standards
- **Runtime:** Node.js 22 (Backend), Python 3.12 (Agents)
- **Infrastructure:** AWS Lambda, EC2, S3, CloudFront
- **Database:** DynamoDB, RDS (PostgreSQL), OpenSearch
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
