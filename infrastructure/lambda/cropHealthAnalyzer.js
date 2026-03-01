/**
 * AWS Lambda Function: Crop Health Analyzer
 * Analyzes crop images using Bedrock Claude Sonnet 4.6
 * Triggered by API Gateway or S3 events
 */

const AWS = require('aws-sdk')
const bedrock = new AWS.BedrockRuntime({
  region: process.env.AWS_REGION || 'us-east-1',
})

const MODEL_ID = 'anthropic.claude-sonnet-4-20250514'

/**
 * Lambda handler for crop health analysis
 */
exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event, null, 2))

  try {
    // Parse request
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
    const { imageUri, farmerId, cropType } = body

    if (!imageUri) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'imageUri is required' }),
      }
    }

    // Invoke Bedrock
    const analysis = await analyzeCropHealth(imageUri, cropType)

    // Log to CloudWatch
    console.log('Analysis result:', JSON.stringify(analysis, null, 2))

    // Return response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        scan_id: generateScanId(),
        scan_type: 'crop-health',
        timestamp: new Date().toISOString(),
        status: 'completed',
        data: analysis,
        processing_time_ms: Date.now(),
      }),
    }
  } catch (error) {
    console.error('Error:', error)

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: error.message || 'Internal server error',
      }),
    }
  }
}

/**
 * Analyze crop health using Bedrock
 */
async function analyzeCropHealth(imageUri, cropType = 'unknown') {
  const systemPrompt = `You are an expert agricultural AI assistant specializing in crop health analysis.
Analyze the provided crop image and provide a detailed assessment in JSON format.

Return ONLY valid JSON with this structure:
{
  "health_status": "healthy" | "at_risk" | "diseased",
  "detected_issues": ["issue1", "issue2"],
  "recommended_actions": ["action1", "action2"],
  "confidence_score": 0.85,
  "crop_type_detected": "wheat",
  "growth_stage": "flowering",
  "severity_level": "low" | "medium" | "high"
}

Do not include any text outside the JSON.`

  const userPrompt = `Analyze this ${cropType} crop image for health status: ${imageUri}

Provide detailed assessment of:
1. Overall plant health
2. Visible diseases or deficiencies
3. Pest damage
4. Environmental stress indicators
5. Recommended interventions`

  try {
    const params = {
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-06-01',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    }

    const response = await bedrock.invokeModel(params).promise()
    const responseBody = JSON.parse(response.body.toString())

    // Extract text from response
    const text = responseBody.content[0].text

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in Bedrock response')
    }

    const analysis = JSON.parse(jsonMatch[0])

    return analysis
  } catch (error) {
    console.error('Bedrock invocation error:', error)
    throw new Error(`Failed to analyze crop health: ${error.message}`)
  }
}

/**
 * Generate unique scan ID
 */
function generateScanId() {
  return `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Handler for S3 trigger
 */
exports.s3Handler = async (event) => {
  console.log('S3 Event received:', JSON.stringify(event, null, 2))

  try {
    // Extract S3 details
    const bucket = event.Records[0].s3.bucket.name
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))

    const s3Uri = `s3://${bucket}/${key}`

    // Analyze image
    const analysis = await analyzeCropHealth(s3Uri)

    // Store result in DynamoDB or RDS
    await storeAnalysisResult(key, analysis)

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Analysis completed',
        s3Uri,
        analysis,
      }),
    }
  } catch (error) {
    console.error('S3 handler error:', error)
    throw error
  }
}

/**
 * Store analysis result in database
 */
async function storeAnalysisResult(imageKey, analysis) {
  // TODO: Implement database storage
  // This could be DynamoDB or RDS
  console.log('Storing analysis result for:', imageKey)
}
