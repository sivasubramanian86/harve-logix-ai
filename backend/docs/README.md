# HarveLogixAI Backend Engine

The backend of HarveLogixAI is a hybrid Node.js and Python environment designed for high-performance agent orchestration and data processing.

## Architecture Overiew
- **Orchestration Layer**: Express.js server handling API requests, authentication, and routing logic.
- **Agent Layer**: Specialized Python scripts (located in `/agents`) that implement the Bedrock/Nova reasoning loops.
- **Database Layer**: PostgreSQL managed via Prisma ORM for structured data (Farmers, Crops, Market Prices).
- **Communication**: Seamless bridge between Node.js and Python using `stdin/stdout` streaming for real-time agent output.

## Module Structure

```
backend/
├── agents/                  # Autonomous Reasoning Logic
│   ├── strands_analysis_agent.py # Core agricultural intelligence
│   └── ...                  # Specialized agents
├── core/                    # System Infrastructure
│   ├── bedrock_client.py    # AWS inference bridge
│   ├── mcp_tools.py         # Real-time data connectors
│   └── context_manager.py   # Farmer state orchestration
├── routes/                  # API Layer
│   ├── agent_routes.js      # AI triggers & streams
│   ├── farmer_routes.js     # Profile & impact data
│   └── scanner_routes.js    # Multimodal analysis endpoints
├── prisma/                  # Persistence Layer
│   └── schema.prisma        # PostgreSQL entity definitions
├── docs/                    # Backend-specific documentation
└── server.js                # Express entry point
```

## Key Components
- `server.js`: Main entry point for the Express server.
- `/agents`: Contains `strands_analysis_agent.py` and other autonomous agents.
- `/routes`: API endpoint definitions for agents, metrics, and farmers.
- `/core`: Shared utilities like the `bedrock_client.py` for AWS interactions.
- `/prisma`: Database schema and migration definitions.

## Getting Started
1. Install dependencies: `npm install`
2. Configure environment: `.env` file with AWS and DB credentials.
3. Start development server: `npm run dev`

## Agent Orchestration
Agents use the **Model Context Protocol (MCP)** to interact with real-world data. When an agent is triggered, it follows these steps:
1. **Context Building**: Gathering farmer and regional metadata.
2. **Nova Reasoning**: Invoking Bedrock with a system prompt and available tools.
3. **Tool Execution**: Executing Python/Node tools to fetch live weather or market data.
4. **Synthesis**: Formatting the finalized insights into structured JSON for the frontend.

---
*Viksit Bharat 2047 | Powered by Amazon Nova*
