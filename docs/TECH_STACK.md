# HarveLogixAI Tech Stack

HarveLogixAI is a state-of-the-art agricultural intelligence platform built on a multi-modal, agentic architecture.

## Core Architecture
- **Agentic Orchestration**: Multi-agent system utilizing **Amazon Bedrock** for high-reasoning tasks.
- **Inference Profile**: Uses `us.amazon.nova-lite-v1:0` for high-speed, cost-effective multimodal inference.
- **Model Context Protocol (MCP)**: Custom tool execution layer for real-time data retrieval (Weather, Crop Yields, Pricing).
- **RAG (Retrieval-Augmented Generation)**: Knowledge-based grounding using Bedrock Knowledge Bases and vector search.

## Frontend (Dashboard)
- **Framework**: React.js with Vite.
- **Styling**: Vanilla CSS with a custom "Forest to Tech" premium design system.
- **State Management**: React Context (Theme, I18n, DataMode).
- **Icons**: Lucide-React.
- **Internationalization**: Custom i18n implementation with support for 8+ Indian regional languages.
- **Visuals**: Multimodal support (Photo/Video/Voice) for AI scanning.
- **Deployment**: AWS Amplify (CloudFront CDN) at `https://d2autvkcn7doq.cloudfront.net`

## Backend (Agent Engine)
- **Runtime**: **Node.js 22 LTS** (v22.14.0, supported until April 2027)
- **Primary Language**: Node.js (Express.js) + Python 3.10+ for agent scripts.
- **Web Server**: Express.js for API routing and orchestration.
- **AI Clients**: Boto3 (Python) and AWS SDK (Node.js) for Bedrock integration.
- **Database**:
  - **PostgreSQL**: Primary data store for Farmers, Crops, and Processors (AWS RDS Free Tier).
  - **Prisma ORM**: Type-safe database access.
- **Agent Scripts**: Specialized Python agents (`StrandsAnalysisAgent`) for deep agricultural reasoning.
- **Process Manager**: **PM2** for zero-downtime process management on EC2.

## API Layer
- **Transport**: AWS API Gateway HTTP API (V2) as HTTPS proxy to EC2 backend.
- **Endpoint**: `https://<aws_ec2_host>/prod`
- **Routing**: Gateway strips stage prefix, adds `/api` prefix, forwards to EC2:5000.
- **CORS**: Restricted to CloudFront domain and localhost for development.

## Infrastructure & Cloud
- **Cloud Provider**: Amazon Web Services (AWS) — Region: `ap-south-2` (India/Hyderabad)
- **Key Services**:
  - Amazon Bedrock (Nova Lite via cross-region inference profile)
  - **Amazon EC2** — `t3.micro` running Amazon Linux 2023 (Node.js 22 backend)
  - **AWS API Gateway HTTP API** — HTTPS proxy in front of EC2
  - Amazon RDS PostgreSQL (Free Tier)
  - Amazon S3 — Multimodal asset storage (`ap-south-2`)
  - AWS CloudFormation — Infrastructure as Code for API Gateway
  - AWS Systems Manager (SSM) — Remote deployment without SSH keys
  - AWS Amplify + CloudFront — Frontend hosting & CDN

## Tech Summary Table

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **LLM** | Amazon Nova Lite | Core Reasoning & Multimodal Analysis |
| **Logic** | Python / Node.js 22 | Agent Orchestration & API |
| **UI** | React + Vite | Premium Real-time Dashboard |
| **DB** | PostgreSQL + Prisma | Structural & Vector Data |
| **Tools** | MCP (Custom) | Real-world Data Connectivity |
| **I18n** | Custom JSON Engine | Multi-regional Accessibility |
| **API** | API Gateway HTTP + EC2 | Secure HTTPS backend proxy |
| **CDN** | AWS CloudFront + Amplify | Global frontend delivery |

---
*Last Updated: March 2026*
