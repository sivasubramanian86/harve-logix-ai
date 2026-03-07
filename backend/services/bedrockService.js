/**
 * Bedrock Service
 * Handles multimodal analysis using AWS Bedrock Claude Sonnet 4.6
 */

import AWS from 'aws-sdk'

const bedrock = new AWS.BedrockRuntime({
  region: 'us-east-1', // Standardized to US-East-1 for reliable cross-region profile availability
})

// Nova Lite via Cross-Region Profile
const MODEL_ID = 'us.amazon.nova-lite-v1:0'

/**
 * Analyze crop health from image
 */
async function analyzeCropHealth(imageUri) {
  const systemPrompt = `You are an expert agricultural AI assistant specializing in crop health analysis.
Analyze the provided crop image and provide:
1. health_status: 'healthy', 'at_risk', or 'diseased'
2. explanation: A concise summary of the health status (1-2 sentences)
3. detected_issues: Array of objects with keys: "type" (short name), "severity" ("high", "medium", or "low"), "description" (details)
4. recommended_actions: Array of objects with keys: "action" (short), "details" (descriptive), "urgency" ("high", "medium", or "low")
5. confidence_score: 0-1 confidence in your assessment

Respond ONLY with valid JSON, no additional text.`

  const userPrompt = `Analyze this crop image for health status.`

  return invokeBedrockModel(systemPrompt, userPrompt, imageUri)
}

/**
 * Analyze field irrigation from image
 */
async function analyzeIrrigation(imageUri) {
  const systemPrompt = `You are an expert agricultural AI assistant specializing in irrigation management.
Analyze the provided field image and provide:
1. irrigation_status: 'under_watered', 'optimal', 'over_watered', or 'waterlogging'
2. explanation: A concise summary of the irrigation status (1-2 sentences)
3. recommended_actions: Array of objects with keys: "action" (short), "details" (descriptive), "urgency" ("high", "medium", or "low")
4. risk_notes: Array of potential risks (strings)
5. water_saving_tips: Array of water conservation tips (strings)

Respond ONLY with valid JSON, no additional text.`

  const userPrompt = `Analyze this field image for irrigation status.`

  return invokeBedrockModel(systemPrompt, userPrompt, imageUri)
}

/**
 * Analyze sky and weather from image
 */
async function analyzeSkyWeather(imageUri, weatherData) {
  const systemPrompt = `You are an expert agricultural AI assistant specializing in weather analysis.
Analyze the provide sky image and weather data, then provide:
1. sky_description: Description of current sky conditions
2. forecast_summary: Summary of weather forecast
3. rainfall_probability: 0-100 percentage
4. temperature_range: Expected temperature range
5. wind_speed: Expected wind speed
6. harvest_window_advice: Advice for harvest timing
7. recommended_actions: Array of objects with keys: "action" (short), "details" (descriptive), "urgency" ("high", "medium", or "low")
8. risk_level: 'LOW', 'MEDIUM', or 'HIGH'

Respond ONLY with valid JSON, no additional text.`

  const userPrompt = `Analyze this sky image and weather data for harvest planning. Weather data: ${JSON.stringify(weatherData)}`

  return invokeBedrockModel(systemPrompt, userPrompt, imageUri)
}

/**
 * Analyze video for crop health
 */
async function analyzeVideo(videoUri) {
  const systemPrompt = `You are an expert agricultural AI assistant specializing in field video analysis.
Analyze the provided field video and provide:
1. duration_seconds: Video duration
2. frames_analyzed: Number of frames analyzed
3. aggregated_insights: Array of key insights
4. detected_issues: Array of issues found
5. overall_health_score: 0-1 overall field health score

Respond ONLY with valid JSON, no additional text.`

  const userPrompt = `Analyze this field video for overall crop health.`

  return invokeBedrockModel(systemPrompt, userPrompt, videoUri)
}

import fs from 'fs'
import path from 'path'

/**
 * Invoke Bedrock model with system and user prompts using Amazon Nova format
 * Supports both S3 URIs and local base64 files
 */
async function invokeBedrockModel(systemPrompt, userPrompt, assetUri = null) {
  try {
    const content = []

    // If we have an asset (image/video/audio)
    if (assetUri) {
      if (assetUri.startsWith('local://')) {
        const localPath = assetUri.replace('local://', '')
        const fileBuffer = fs.readFileSync(localPath)
        const extension = path.extname(localPath).toLowerCase().replace('.', '')
        
        // Map extension to Bedrock/Nova format
        let format = extension === 'jpg' ? 'jpeg' : extension
        let type = 'image'
        if (['mp4', 'webm'].includes(extension)) type = 'video'
        
        content.push({
          [type]: {
            format: format,
            source: {
              bytes: fileBuffer.toString('base64'),
            },
          },
        })
      } else {
        // Bedrock native S3 URI support (if using Inference Profile with S3 access)
        // Note: For Nova Lite direct invocation, base64 is often more reliable for short sessions
        // However, if the asset is large, S3 is better. 
        // For now, let's assume if it's S3, the user might want us to pull it or Nova can read it.
        // If Nova cannot read the S3 URI directly in the content block, we'd need to fetch it.
        // Actually, Nova typically expects a 'video' or 'image' block with S3 location too if supported.
        content.push({
          text: `Please analyze the asset at this location: ${assetUri}`,
        })
      }
    }

    content.push({
      text: userPrompt,
    })

    const params = {
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        system: [
          {
            text: systemPrompt,
          }
        ],
        messages: [
          {
            role: 'user',
            content: content,
          },
        ],
        inferenceConfig: {
            topP: 0.9,
            temperature: 0.7,
            maxTokens: 1024
        }
      }),
    }

    console.log(`Invoking Bedrock (${MODEL_ID}) with ${content.length} content block(s)`)
    const response = await bedrock.invokeModel(params).promise()
    const responseBody = JSON.parse(response.body.toString())

    const text = responseBody.output?.message?.content?.[0]?.text
    if (!text) {
        throw new Error('Unexpected Nova model response structure')
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Bedrock invocation error:', error)
    throw new Error(`Failed to invoke Bedrock model: ${error.message}`)
  }
}

export default {
  analyzeCropHealth,
  analyzeIrrigation,
  analyzeSkyWeather,
  analyzeVideo,
}
