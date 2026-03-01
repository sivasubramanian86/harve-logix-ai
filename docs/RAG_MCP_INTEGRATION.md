# RAG + MCP Integration Guide

This document describes the Retrieval-Augmented Generation (RAG) and Model Context Protocol (MCP) integration in HarveLogix.

## Architecture Overview

HarveLogix now supports three layers of AI reasoning:

1. **Local Demo Mode** (no cost, development)
   - Mock embeddings + FAISS vector store
   - Agents use deterministic logic + fallback responses
   - Perfect for testing without AWS resources

2. **Local RAG Mode** (no cost, development)
   - Real embeddings (from Bedrock or local mock)
   - FAISS vector store running locally
   - Agents retrieve context before prompting LLM
   - Great for building RAG workflows

3. **AWS Production** (cost-optimized, scalable)
   - Bedrock embeddings + OpenSearch k-NN
   - S3 ingestion pipeline
   - Strands MCP orchestration for multi-step workflows
   - EventBridge + SQS for task coordination
   - Full audit trail in DynamoDB

## Components

### 1. Embeddings Service (`backend/services/embeddingsService.js`)

Generates vector embeddings using Bedrock or mock fallback:

```javascript
import embeddingsService from 'backend/services/embeddingsService.js'

// Mock embedding (deterministic, no cost)
const embedding = embeddingsService.generateMockEmbedding("farm irrigation tips")

// Real Bedrock embedding (requires AWS credentials)
// Set USE_MOCK_EMBEDDINGS=false to enable
const embedding = await embeddingsService.embedText("farm irrigation tips")
```

### 2. Vector Store (`backend/services/vectorStoreFaiss.py`)

Local FAISS-based vector store for development:

```python
from services.vectorStoreFaiss import add_documents, search, get_stats

# Add documents
doc_ids = add_documents([
    {
        "content": "Tomato needs 300-400mm water per season",
        "embedding": embedding_vector,
        "metadata": {"crop_type": "tomato", "topic": "irrigation"}
    }
])

# Search
results = search(query_embedding, k=3)
print(results)

# Stats
stats = get_stats()
```

### 3. Retriever Service (`backend/services/retrieverService.py`)

High-level RAG interface:

```python
from services.retrieverService import retrieve_context, format_context_for_prompt, build_rag_prompt

# Retrieve relevant documents
docs = retrieve_context(embedding, k=3)

# Format for LLM prompt
context = format_context_for_prompt(docs)

# Build augmented prompt
rag_prompts = build_rag_prompt(user_prompt, docs, system_prompt)
```

### 4. Base Agent RAG Support (`backend/agents/base_agent.py`)

Agents now support RAG queries:

```python
from agents.harvest_ready_agent import HarvestReadyAgent

agent = HarvestReadyAgent()

# Standard invoke (no RAG)
result = agent.invoke_bedrock(prompt)

# RAG-augmented invoke (with context retrieval)
result = agent.invoke_bedrock_with_rag(
    query="When should I harvest tomatoes?",
    system_prompt="You are an agricultural expert",
    k=3,  # Retrieve top 3 documents
    use_rag=True
)

# Retrieve context without invoking LLM
docs = agent.retrieve_context_for_query("irrigation tips for tomato", k=5)
```

### 5. Document Ingestion (`scripts/index_docs.py`)

Pipeline for embedding and indexing documents:

```bash
# Seed with agricultural knowledge base
python scripts/index_docs.py --seed-data

# Load documents from directory
python scripts/index_docs.py --input docs/ --output backend/data/vector_store

# Load from JSON
python scripts/index_docs.py --json documents.json

# Check vector store stats
python -c "from services.vectorStoreFaiss import get_stats; print(get_stats())"
```

### 6. MCP Orchestrator (`backend/core/mcp_orchestrator.py`)

Coordinates multi-agent workflows with task dependencies:

```python
from backend.core.mcp_orchestrator import create_harvest_workflow, MCPOrchestrator

# Create workflow
workflow = create_harvest_workflow(
    farmer_id="farmer-123",
    crop_type="tomato",
    growth_stage=8,
    location={"latitude": 15.8, "longitude": 75.6}
)

# Tasks are automatically coordinated:
# 1. HarvestReady agent analyzes optimal harvest time
# 2. WaterWise agent checks irrigation status
# 3. SupplyMatch agent finds buyers
# All with dependency management via EventBridge

print(f"Workflow: {workflow.workflow_id}")
print(f"Status: {workflow.status}")
```

## Quick Start

### Development (Local Demo + RAG)

1. **Install dependencies:**
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\Activate.ps1  # PowerShell
   pip install -r requirements.txt
   npm install
   ```

2. **Seed the vector store:**
   ```bash
   python scripts/index_docs.py --seed-data
   ```

3. **Run backend with demo mode:**
   ```bash
   $env:USE_DEMO_DATA='true'
   npm start
   ```

4. **Test RAG in Python:**
   ```bash
   python - <<'PY'
   from agents.harvest_ready_agent import HarvestReadyAgent
   agent = HarvestReadyAgent()
   
   # Retrieve context
   docs = agent.retrieve_context_for_query("tomato harvest timing", k=3)
   for doc in docs:
       print(f"- {doc['content'][:100]}...")
   
   # Process with RAG
   result = agent.process({
       'crop_type': 'tomato',
       'current_growth_stage': 8,
       'location': {'latitude': 15.8, 'longitude': 75.6}
   })
   print(f"Status: {result['status']}")
   print(f"Output: {result['output']}")
   PY
   ```

### Production (AWS: OpenSearch + Bedrock + MCP)

1. **Deploy OpenSearch stack:**
   ```bash
   aws cloudformation create-stack \
     --stack-name harvelogix-rag-prod \
     --template-body file://infrastructure/cloudformation/rag-opensearch-stack.yaml \
     --parameters ParameterKey=EnvironmentName,ParameterValue=prod \
     --capabilities CAPABILITY_NAMED_IAM
   ```

2. **Deploy Lambda functions:**
   ```bash
   # Package and deploy embedding ingestion Lambda
   cd infrastructure/lambda
   zip embeddingIngestion.zip embeddingIngestionLambda.js
   aws lambda create-function \
     --function-name harvelogix-embedding-ingestion \
     --runtime nodejs18.x \
     --role arn:aws:iam::ACCOUNT:role/embedding-lambda-role \
     --handler embeddingIngestionLambda.handler \
     --zip-file fileb://embeddingIngestion.zip
   
   # Deploy retriever Lambda
   zip retriever.zip retrieverLambda.js
   aws lambda create-function \
     --function-name harvelogix-retriever \
     --runtime nodejs18.x \
     --role arn:aws:iam::ACCOUNT:role/retriever-lambda-role \
     --handler retrieverLambda.handler \
     --zip-file fileb://retriever.zip
   ```

3. **Ingest documents to S3:**
   ```bash
   # Upload documents; Lambda will trigger automatically
   aws s3 cp documents/ s3://harvelogix-rag-ingestion-ACCOUNT-prod/ --recursive
   ```

4. **Enable agents to use OpenSearch:**
   ```bash
   # Set environment variables
   export OPENSEARCH_ENDPOINT=https://harvelogix-vectors-prod.es.us-east-1.amazonaws.com
   export OPENSEARCH_INDEX=harvelogix-rag
   export USE_OPENSEARCH=true
   
   # Agents now use  OpenSearch for retrieval
   ```

5. **Create and monitor workflows:**
   ```python
   from backend.core.mcp_orchestrator import create_harvest_workflow
   
   workflow = create_harvest_workflow(
       farmer_id="farmer-123",
       crop_type="tomato",
       growth_stage=8,
       location={"latitude": 15.8, "longitude": 75.6}
   )
   
   # Workflow executes through EventBridge/SQS/Lambda orchestration
   ```

## Testing

### Unit Tests for RAG Components

```bash
cd backend
pytest tests/test_rag_integration.py -v
```

### Integration Test

```bash
python - <<'PY'
import sys
sys.path.insert(0, 'backend')

from services.embeddingsService import generateMockEmbedding
from services.vectorStoreFaiss import add_documents, search
from services.retrieverService import retrieve_context, format_context_for_prompt

# Test embedding
emb = generateMockEmbedding("test")
print(f"✓ Embedding dimension: {len(emb)}")

# Test vector store
doc_ids = add_documents([{
    "content": "tomato phenology",
    "embedding": emb,
    "metadata": {"crop_type": "tomato"}
}])
print(f"✓ Added {len(doc_ids)} documents")

# Test retrieval
results = search(emb, k=1)
print(f"✓ Retrieved {len(results)} documents")

# Test formatting
context = format_context_for_prompt(results)
print(f"✓ Formatted context ({len(context)} chars)")
PY
```

## Cost Considerations

| Mode | Cost | Use Case |
|------|------|----------|
| **Local Demo** | $0 | Development, testing |
| **Local RAG** | $0 (compute) | RAG development, small-scale testing |
| **AWS OpenSearch** | $30-100/mo | Production RAG |
| **Bedrock Embeddings** | $0.02/1K tokens | Production |
| **Bedrock LLM** | $3/1M completion tokens | Production reasoning |
| **Lambda + EventBridge** | $0.20/1M requests | Workflow orchestration |

**Recommendation:** Develop locally, validate with production stack in lower environment, then scale.

## Environment Variables

```bash
# Local Development
USE_DEMO_DATA=true                 # Use mock data (no AWS calls)
USE_MOCK_EMBEDDINGS=true           # Use mock embeddings (no Bedrock)
VECTOR_STORE_PATH=backend/data/vector_store  # Local FAISS index path

# Production AWS
USE_OPENSEARCH=true                # Use OpenSearch for retrieval
OPENSEARCH_ENDPOINT=https://...es.amazonaws.com
OPENSEARCH_INDEX=harvelogix-rag
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-sonnet-4-20250514
```

## FAQ

**Q: Can I use RAG without AWS?**  
A: Yes! Local FAISS + mock embeddings work entirely offline. Perfect for development.

**Q: Does RAG add latency?**  
A: Minimal. Local FAISS queries: <10ms. OpenSearch: 50-200ms. Negligible compared to LLM inference (1-3s).

**Q: Can I switch between LocalRAG and AWS production?**  
A: Yes! Set `USE_OPENSEARCH=false/true` and agents automatically switch backends.

**Q: How do I update the knowledge base?**  
A: Re-run `scripts/index_docs.py` to rebuild the local FAISS index, or upload new documents to S3 in production.

**Q: What if Bedrock is unavailable?**  
A: Agents fall back to mock data and deterministic logic. Demo mode guarantees uptime.

## References

- [FAISS Documentation](https://faiss.ai/)
- [AWS Bedrock](https://aws.amazon.com/bedrock/)
- [Amazon OpenSearch](https://aws.amazon.com/opensearch-service/)
- [EventBridge](https://aws.amazon.com/eventbridge/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
