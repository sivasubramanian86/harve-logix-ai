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

## Backend (Agent Engine)
- **Primary Language**: Python 3.10+ / Node.js.
- **Web Server**: Express.js (Node.js) for API routing and orchestration.
- **AI Clients**: Boto3 (Python) and AWS SDK (Node.js) for Bedrock integration.
- **Database**: 
  - **PostgreSQL**: Primary data store for Farmers, Crops, and Processors.
  - **Prisma ORM**: Type-safe database access.
- **Agent Scripts**: Specialized Python agents (`StrandsAnalysisAgent`) for deep agricultural reasoning.

## Infrastructure & Cloud
- **Cloud Provider**: Amazon Web Services (AWS).
- **Key Services**:
  - Amazon Bedrock (Nova Lite, Claude 3).
  - AWS Lambda (for serverless tool execution).
  - Amazon RDS (PostgreSQL).
  - Amazon S3 (Multimodal asset storage).
- **CI/CD**: Prepared for Vercel (Frontend) and Firebase/AWS (Backend) deployment.

## Tech Summary Table

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **LLM** | Amazon Nova Lite | Core Reasoning & Multimodal Analysis |
| **Logic** | Python / Node.js | Agent Orchestration & API |
| **UI** | React + Vite | Premium Real-time Dashboard |
| **DB** | PostgreSQL + Prisma | Structural & Vector Data |
| **Tools** | MCP (Custom) | Real-world Data Connectivity |
| **I18n** | Custom JSON Engine | Multi-regional Accessibility |

---
*Last Updated: March 2026*
