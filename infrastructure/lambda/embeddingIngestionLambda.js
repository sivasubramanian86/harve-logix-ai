/**
 * Embedding Ingestion Lambda
 * Triggered by S3 events; embeds documents and indexes them in OpenSearch
 */

import AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'

const bedrock = new AWS.BedrockRuntime({
  region: process.env.AWS_REGION || 'us-east-1',
})

const s3 = new AWS.S3({
  region: process.env.AWS_REGION || 'us-east-1',
})

const EMBEDDING_MODEL_ID = 'amazon.titan-embed-text-v2:0'
const OPENSEARCH_ENDPOINT = process.env.OPENSEARCH_ENDPOINT
const OPENSEARCH_INDEX = process.env.OPENSEARCH_INDEX || 'harvelogix-rag'

/**
 * Generate embedding for text using Bedrock
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
 * Index document in OpenSearch
 */
async function indexDocumentInOpenSearch(doc) {
  try {
    const docId = uuidv4()
    const url = `${OPENSEARCH_ENDPOINT}/${OPENSEARCH_INDEX}/_doc/${docId}`

    const options = {
      hostname: new URL(OPENSEARCH_ENDPOINT).hostname,
      port: 443,
      path: `/${OPENSEARCH_INDEX}/_doc/${docId}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }

    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        content: doc.content,
        embedding: doc.embedding,
        metadata: doc.metadata,
        indexed_at: new Date().toISOString(),
      })

      // Note: In production, use AWS SDK v3 OpenSearch client or signed requests
      // This is a simplified example
      const https = require('https')
      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          resolve(JSON.parse(data))
        })
      })

      req.on('error', reject)
      req.write(body)
      req.end()
    })
  } catch (error) {
    console.error('OpenSearch indexing error:', error)
    throw error
  }
}

/**
 * Parse document from S3
 */
async function parseDocumentFromS3(bucket, key) {
  try {
    const obj = await s3.getObject({ Bucket: bucket, Key: key }).promise()
    const content = obj.Body.toString('utf-8')

    // Extract metadata from S3 object tags or key
    const metadata = {
      source: key,
      mime_type: obj.ContentType,
      size_bytes: obj.ContentLength,
      bucket: bucket,
    }

    // Try to extract crop type from key (e.g., documents/tomato/info.txt)
    const pathParts = key.split('/')
    if (pathParts.length > 1) {
      metadata.crop_type = pathParts[pathParts.length - 2]
    }

    return {
      content,
      metadata,
    }
  } catch (error) {
    console.error('Document parsing error:', error)
    throw error
  }
}

/**
 * Lambda handler
 */
export async function handler(event, context) {
  console.log('Event:', JSON.stringify(event, null, 2))

  try {
    const results = []

    // Process S3 events
    for (const record of event.Records) {
      const bucket = record.s3.bucket.name
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '))

      console.log(`Processing: s3://${bucket}/${key}`)

      try {
        // Parse document from S3
        const doc = await parseDocumentFromS3(bucket, key)

        // Generate embedding
        console.log('Generating embedding...')
        const embedding = await generateEmbedding(doc.content)

        // Index in OpenSearch
        console.log('Indexing in OpenSearch...')
        const indexed = await indexDocumentInOpenSearch({
          ...doc,
          embedding,
        })

        results.push({
          status: 'success',
          key: key,
          documentId: indexed._id,
        })

        console.log(`Successfully indexed: ${key}`)
      } catch (err) {
        console.error(`Error processing ${key}:`, err)
        results.push({
          status: 'error',
          key: key,
          error: err.message,
        })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Ingestion complete',
        results: results,
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
