# HarveLogixAI Tech Stack & Production Roadmap

HarveLogixAI is a multi-agent post-harvest decision intelligence platform built natively on AWS to solve the "distress sale" crisis for Indian farmers.

---

## 1. Demo Architecture (Implemented Today)
The current prototype is fully functional and deployed at [d2autvkcn7doq.cloudfront.net](https://d2autvkcn7doq.cloudfront.net).

### **Core AI & Orchestration**
- **Agentic Orchestration**: Multi-agent system utilizing **Amazon Bedrock** (Claude Haiku 4.5 & Nova Lite) for high-reasoning and multimodal tasks.
- **Agent Mesh**: 6 Specialized Python Agents (`harvest_ready`, `quality_hub`, `storage_scout`, `supply_match`, `water_wise`, `collective_voice`).
- **Model Context Protocol (MCP)**: Custom tool execution layer in `mcp_tools.py` for real-time data retrieval (Weather, Crop Yields, Pricing).
- **RAG (Retrieval-Augmented Generation)**: Grounding using Bedrock Knowledge Bases and vector search (RAG integration active in logic).

### **Execution Layer (Serverless & Compute)**
- **AWS Lambda (Node.js 22)**:
  - `video-analyzer`: Multimodal field video processing.
  - `weather-analyzer`: Real-time climate integration.
  - `voice-query-processor`: Local language to structured prompt translation.
  - `irrigation-analyzer`: Water pattern detection via field imagery.
- **Amazon EC2**: `t3.micro` instance running Node.js 22 backend for core orchestration and API routing.
- **Amazon EventBridge**: Decouples high-fidelity agent reasoning from the UI for responsive UX.

### **Data & Infrastructure**
- **Databases**:
  - **PostgreSQL (Amazon RDS)**: Relational data for Farmer/FPO profiles and historical decisions.
  - **Amazon DynamoDB**: Scalable NoSQL store for scan events and KPI aggregations.
- **Storage**:
  - **Amazon S3**: High-durability storage for raw multimodal assets (images/videos) and audit logs.
- **Security & IAM**: Multi-layered IAM policies with least-privilege review. Bedrock Guardrails for safety in regional languages.
- **Connectivity**: **AWS API Gateway** (HTTP API V2) acting as a secure HTTPS proxy to the backend.

### **Frontend & Delivery**
- **React 18 + Vite**: High-performance dashboard with a "Forest to Tech" design system.
- **AWS Amplify & CloudFront**: Global CDN delivery optimized for low-latency rural connectivity.
- **I18n Engine**: Custom localization support for 8+ Indian regional languages.

---

## 2. Production Roadmap (Next Gen)

### **Short Term (0–3 Months): Pilot & Hardening**
- **Identity & Security**: Integrate **AWS Cognito** for auth, **AWS WAF** for Edge protection, and **AWS Secrets Manager** for credentials.
- **Real RAG Expansion**: Replace mock embeddings with an **Amazon OpenSearch Service** vector store, indexing thousands of pages of official government schemes and agronomy docs.
- **Monitoring**: Implement **Amazon CloudWatch** Alarms and X-Ray tracing for professional agentic observability.

### **Mid Term (3–12 Months): Bedrock AgentCore & Multi-Channel**
- **Unified Orchestration**: Migrate to **Amazon Bedrock AgentCore**. Expose existing tools via AgentCore Gateway and manage the agent lifecycle natively.
- **Multi-Channel Access**: Add **IVR/SMS/WhatsApp** channels so farmers without smartphones can benefit via FPO intermediaries.

### **Long Term (12–36 Months): Scale & Portability**
- **Decision Brain**: Evolve into a "Decision Brain-as-a-Service" for state-level platforms and government agritech programs.
- **Compute Portability**: Containerize the agent backbone for hybrid-cloud deployments using **Amazon EKS**.

---

## 3. Tech Summary Table

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **LLM** | Amazon Bedrock (Nova / Claude) | Core Reasoning & Multimodal Analysis |
| **Logic** | Python / Node.js 22 | Agent Orchestration & API |
| **UI** | React + Vite | Premium Real-time Dashboard |
| **DB** | PostgreSQL + DynamoDB | Structural & Event-based Data |
| **Tools** | MCP (Custom) | Real-world Data Connectivity |
| **I18n** | Custom JSON Engine | Multi-regional Accessibility (8+ Languages) |
| **API** | API Gateway + EC2 | Secure HTTPS backend proxy |
| **CDN** | AWS CloudFront + Amplify | Global frontend delivery |

---

## 4. Well-Architected Alignment

- **Reliability**: Decoupled, event-driven architecture using EventBridge and Serverless compute prevents cascading failures.
- **Security**: IAM least-privilege review completed; Bedrock Guardrails added for regional language safety.
- **Cost Optimization**: Pay-per-use Lambdas and right-sized `t3.micro` EC2 tier ensure minimum operational overhead.

---
*Last Updated: April 2026*
