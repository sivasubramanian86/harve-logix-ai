/**
 * Bedrock Service
 * Handles multimodal analysis using AWS Bedrock Claude Sonnet 4.6
 */

import AWS from 'aws-sdk'

const bedrock = new AWS.BedrockRuntime({
  region: process.env.AWS_REGION || 'us-east-1',
})

const MODEL_ID = 'anthropic.claude-sonnet-4-20250514'

/**
 * Analyze crop health from image
 */
async function analyzeCropHealth(imageUri) {
  const systemPrompt = `You are an expert agricultural AI assistant specializing in crop health analysis.
Analyze the provided crop image and provide:
1. health_status: 'healthy', 'at_risk', or 'diseased'
2. detected_issues: Array of specific issues found
3. recommended_actions: Array of actionable recommendations
4. confidence_score: 0-1 confidence in your assessment

Respond ONLY with valid JSON, no additional text.`

  const userPrompt = `Analyze this crop image for health status: ${imageUri}`

  return invokeBedrockModel(systemPrompt, userPrompt)
}

/**
 * Analyze field irrigation from image
 */
async function analyzeIrrigation(imageUri) {
  const systemPrompt = `You are an expert agricultural AI assistant specializing in irrigation management.
Analyze the provided field image and provide:
1. irrigation_status: 'under_watered', 'optimal', 'over_watered', or 'waterlogging'
2. recommendations: Array of irrigation recommendations
3. risk_notes: Array of potential risks
4. water_saving_tips: Array of water conservation tips

Respond ONLY with valid JSON, no additional text.`

  const userPrompt = `Analyze this field image for irrigation status: ${imageUri}`

  return invokeBedrockModel(systemPrompt, userPrompt)
}

/**
 * Analyze sky and weather from image
 */
async function analyzeSkyWeather(imageUri, weatherData) {
  const systemPrompt = `You are an expert agricultural AI assistant specializing in weather analysis.
Analyze the provided sky image and weather data, then provide:
1. sky_description: Description of current sky conditions
2. forecast_summary: Summary of weather forecast
3. rainfall_probability: 0-100 percentage
4. temperature_range: Expected temperature range
5. wind_speed: Expected wind speed
6. harvest_window_advice: Advice for harvest timing
7. risk_level: 'LOW', 'MEDIUM', or 'HIGH'

Respond ONLY with valid JSON, no additional text.`

  const userPrompt = `Analyze this sky image and weather data for harvest planning: ${imageUri}. Weather data: ${JSON.stringify(weatherData)}`

  return invokeBedrockModel(systemPrompt, userPrompt)
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

  const userPrompt = `Analyze this field video for overall crop health: ${videoUri}`

  return invokeBedrockModel(systemPrompt, userPrompt)
}

/**
 * Invoke Bedrock model with system and user prompts
 */
async function invokeBedrockModel(systemPrompt, userPrompt) {
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
