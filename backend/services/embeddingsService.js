/**
 * Embeddings Service
 * Handles text/document embeddings using Bedrock or mock fallback
 * Supports local development with mock embeddings and production with real Bedrock
 */

import AWS from 'aws-sdk'
import crypto from 'crypto'

const bedrock = new AWS.BedrockRuntime({
  region: process.env.AWS_REGION || 'us-east-1',
})

const EMBEDDING_MODEL_ID = 'amazon.titan-embed-text-v2:0'
const EMBEDDING_DIMENSION = 512
const USE_MOCK = process.env.USE_MOCK_EMBEDDINGS === 'true' || process.env.USE_DEMO_DATA === 'true'

/**
 * Generate mock embedding (deterministic based on text for consistency)
 * @param {string} text - Text to embed
 * @returns {Array<number>} Mock embedding vector
 */
function generateMockEmbedding(text) {
  // Use hash to generate consistent "random" vector from text
  const hash = crypto.createHash('sha256').update(text).digest()
  const embedding = []
  
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    // Convert hash bytes to normalized floats
    const byte = hash[i % hash.length]
    embedding.push((byte - 128) / 256) // normalize to ~[-0.5, 0.5]
  }
  
  return embedding
}

/**
 * Embed text using Bedrock (or mock if in dev mode)
 * @param {string} text - Text to embed
 * @returns {Promise<Array<number>>} Embedding vector
 */
async function embedText(text) {
  try {
    if (USE_MOCK) {
      return generateMockEmbedding(text)
    }

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
    console.warn('Bedrock embedding error, using mock:', error.message)
    return generateMockEmbedding(text)
  }
}

/**
 * Embed multiple texts (batch)
 * @param {Array<string>} texts - Texts to embed
 * @returns {Promise<Array<Array<number>>>} Embedding vectors
 */
async function embedTexts(texts) {
  return Promise.all(texts.map((text) => embedText(text)))
}

/**
 * Embed document metadata and content
 * @param {Object} doc - Document with id, content, metadata
 * @returns {Promise<Object>} Document with embedding
 */
async function embedDocument(doc) {
  try {
    // Combine metadata and content for embedding
    const textToEmbed = `${doc.metadata?.title || ''} ${doc.metadata?.source || ''} ${doc.content}`.trim()
    const embedding = await embedText(textToEmbed)

    return {
      ...doc,
      embedding,
      embedding_dimension: EMBEDDING_DIMENSION,
    }
  } catch (error) {
    console.error('Document embedding error:', error)
    throw error
  }
}

export default {
  embedText,
  embedTexts,
  embedDocument,
  EMBEDDING_DIMENSION,
  USE_MOCK,
}
