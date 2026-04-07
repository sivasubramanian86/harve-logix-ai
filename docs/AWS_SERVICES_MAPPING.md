# HarveLogix AI - AWS Services & User Flow Mapping
**A Hackathon Q&A Reference Guide**

This document connects exactly what the user sees on the React Frontend to the AWS Cloud Infrastructure running in the background. Use this as a cheat sheet if judges ask you to "open the AWS Console and show where this is running."

---

## 1. AI Field Scanner (`/scanner`)
**The Experience:** A farmer captures a photo of a diseased leaf and records a voice note requesting help in their local language.

### AWS Services Triggered:
*   **Amazon S3 (`ap-south-1`)**: The high-res image and audio blob are instantly uploaded to an ingress S3 bucket via `s3Service.js` for durable, secure object storage.
*   **Amazon Transcribe (`ap-south-1`)**: The audio blob triggers `transcribeService.js`. AWS Transcribe performs Automatic Speech Recognition (ASR) to detect the regional language and translate the spoken query into an English text payload.
*   **Amazon Bedrock (Nova Lite model)**: `bedrockService.js` invokes `us.amazon.nova-lite-v1:0`. It analyzes the raw image bytes in parallel with the Transcribe text to identify visual anomalies (e.g., blight) and return structured JSON.

> **Console Demo Tip:** Have the **Amazon S3** console open to your upload bucket to show the raw images, or the **Amazon Bedrock -> Model Access** page to show Nova Lite is enabled.

---

## 2. Farmers Dashboard (`/farmers`)
**The Experience:** A farmer logs in and sees hyper-personalized, real-time Actionable Recommendations (e.g., "Harvest in 3 days", "Water requirements: Low").

### AWS Services Triggered:
*   **Amazon EC2 (`ap-south-2`)**: Your Node.js backend (managed via PM2) acts as the high-throughput traffic director.
*   **AWS Systems Manager (SSM)**: Manages your EC2 instance deployments and restarts remotely without needing SSH access.
*   **AWS Lambda (via Strands Framework)**: The EC2 instance spawns local processes or hits Lambda functions (`harvest_ready_agent`, `water_wise_agent`).
*   **Amazon Bedrock (Cross-Region Profile)**: The analytics agents use the Inference Profile `arn:aws:bedrock:ap-south-1:020513638290:application-inference-profile/hs79u71flmnc` to calculate the final synthesis utilizing Amazon Nova's advanced text-reasoning.

> **Console Demo Tip:** Show the **EC2 Dashboard** and point out your active `i-081aee7a8e818023d` instance. You can also show the **AWS Systems Manager (Run Command)** log history to prove your CI/CD pipeline pushes code directly.

---

## 3. Supply Chain & Storage Engine (`/supply-chain`)
**The Experience:** A logistics provider views real-time market opportunities, cold-storage availability, and transport routes.

### AWS Services Triggered:
*   **Amazon DynamoDB (`ap-south-2`)**: Configured in `config.py` for tables like `storage_templates` and `farmers`. It acts as the high-speed NoSQL cache for storage capacities and real-time market fluctuations.
*   **AWS EventBridge**: Handles the event-driven architecture, triggering the `supply_match_agent` when crop parity levels shift.
*   **Amazon Bedrock**: The agents synthesize the raw DynamoDB capacity metrics into human-readable matchmaking recommendations.

> **Console Demo Tip:** Pull up **DynamoDB tables** if asked about how you store high-throughput streaming data like changing market prices.

---

## 4. Government & Cooperative View (`/government`)
**The Experience:** A macro-level map and statistical dashboard showing yield predictions, regional drought risks, and collective bargaining insights.

### AWS Services Triggered:
*   **Amazon CloudFront**: Caches the heavy mapping UI static assets globally so the dashboard loads instantly even in remote networks.
*   **Amazon RDS (PostgreSQL)**: Serves as the relational backbone (`harvelogix` DB mentioned in `config.py`) to run complex, heavy SQL aggregations over thousands of farmer records.
*   **AWS Lambda (`collective_voice_agent`)**: Aggregates the needs of 50+ local farmers to negotiate bulk fertilizer discounts.

> **Console Demo Tip:** Show the **RDS Database console** to highlight your Postgres instance handling relational scaling for government aggregates. 

---

## 5. Agent Mesh Visualizer (`/agents`)
**The Experience:** A technical dashboard showing the live, parallel interactions of the AI agents.

### AWS Services Triggered:
*   **Amazon CloudWatch**: Behind the scenes, the agent statuses map directly to the health, latency, and invocation metrics of your underlying microservices. 
*   **Amazon Bedrock**: Shows the real-time token utilization and invocation of both the Nova Lite model and the Nova Inference Profile.

> **Console Demo Tip:** Open **Amazon CloudWatch -> Logs**. If judges ask about debugging, show them the `server.log` CloudWatch stream or Lambda log groups containing the exact JSON payloads your Bedrock bots generate.
