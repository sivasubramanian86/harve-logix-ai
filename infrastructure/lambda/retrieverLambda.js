/**
 * Retriever Lambda Function
 * Provides RAG retrieval endpoint to fetch relevant documents from OpenSearch
 * Integrates with agents to augment prompts with context
 */

import AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'

const bedrock = new AWS.BedrockRuntime({
  region: process.env.AWS_REGION || 'us-east-1',
})

const EMBEDDING_MODEL_ID = 'amazon.titan-embed-text-v2:0'
const OPENSEARCH_ENDPOINT = process.env.OPENSEARCH_ENDPOINT
const OPENSEARCH_INDEX = process.env.OPENSEARCH_INDEX || 'harvelogix-rag'

/**
 * Generate embedding for query
 */
async function generateEmbedding(text) {
  try {
    const params = {
      modelId: EMBEDDING_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        inputText: text,
      }),
    }

    const response = await bedrock.invokeModel(params).promise()
    const responseBody = JSON.parse(response.body.toString())

    return responseBody.embedding
  } catch (error) {
    console.error('Embedding error:', error)
    throw new Error(`Failed to generate embedding: ${error.message}`)
  }
}

/**
 * Search OpenSearch for similar documents (k-NN)
 */
async function searchOpenSearch(embedding, k = 3) {
  try {
    const query = {
      size: k,
      query: {
        knn: {
          embedding: {
            vector: embedding,
            k: k,
          },
        },
      },
      _source: ['content', 'metadata', 'indexed_at'],
    }

    const https = require('https')
    const url = new URL(OPENSEARCH_ENDPOINT)

    const options = {
      hostname: url.hostname,
      port: 443,
      path: `/${OPENSEARCH_INDEX}/_search`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = ''

        res.on('data', (chunk) => {
          data += chunk
        })

        res.on('end', () => {
          try {
            const response = JSON.parse(data)
            const hits = response.hits?.hits || []
            resolve(
              hits.map((hit) => ({
                id: hit._id,
                score: hit._score,
                content: hit._source.content,
                metadata: hit._source.metadata,
              }))
            )
          } catch (err) {
            reject(new Error(`Failed to parse OpenSearch response: ${err.message}`))
          }
        })
      })

      req.on('error', reject)

      req.write(JSON.stringify(query))
      req.end()
    })
  } catch (error) {
    console.error('OpenSearch search error:', error)
    throw error
  }
}

/**
 * Format retrieved documents for agent prompt
 */
function formatContextForPrompt(documents) {
  if (!documents || documents.length === 0) {
    return ''
  }

  const contextParts = ['### Retrieved Context:']

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i]
    const relevance = 1 / (1 + doc.score)

    contextParts.push(`\n[Document ${i + 1}] (relevance: ${relevance.toFixed(2)})`)

    if (doc.metadata) {
      if (doc.metadata.source) {
        contextParts.push(`Source: ${doc.metadata.source}`)
      }
      if (doc.metadata.crop_type) {
        contextParts.push(`Crop: ${doc.metadata.crop_type}`)
      }
      if (doc.metadata.region) {
        contextParts.push(`Region: ${doc.metadata.region}`)
      }
    }

    contextParts.push(`\n${doc.content}\n`)
  }

  return contextParts.join('\n')
}

/**
 * Lambda handler
 */
export async function handler(event, context) {
  console.log('Event:', JSON.stringify(event, null, 2))

  try {
    const { query, k = 3, format = 'json' } = JSON.parse(event.body || '{}')

    if (!query) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing query parameter',
        }),
      }
    }

    console.log(`Retrieving ${k} documents for query: ${query}`)

    // Generate embedding for query
    const embedding = await generateEmbedding(query)

    // Search OpenSearch
    const documents = await searchOpenSearch(embedding, k)

    // Format response
    if (format === 'prompt') {
      // Return formatted context for agent prompt
      const context = formatContextForPrompt(documents)
      return {
        statusCode: 200,
        body: JSON.stringify({
          query: query,
          context: context,
          document_count: documents.length,
        }),
      }
    }

    // Default: return JSON with all details
    return {
      statusCode: 200,
      body: JSON.stringify({
        query: query,
        documents: documents,
        document_count: documents.length,
      }),
    }
  } catch (error) {
    console.error('Lambda error:', error)

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
      }),
    }
  }
}

/**
 * Exported for local testing
 */
export { generateEmbedding, searchOpenSearch, formatContextForPrompt }
