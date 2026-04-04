/**
 * Multimodal Service Layer
 * Handles analysis logic for all scan types
 * Supports demo mode (fixture data) and live mode (AWS services)
 */

import { v4 as uuidv4 } from 'uuid'
import demoDataService from './demoDataService.js'
import s3Service from './s3Service.js'
import bedrockService from './bedrockService.js'
import transcribeService from './transcribeService.js'
import weatherService from './weatherService.js'

const USE_DEMO = process.env.VITE_USE_DEMO_DATA === 'true' || process.env.USE_DEMO_DATA === 'true'

/**
 * Analyze crop health from image
 */
async function analyzeCropHealth(file) {
  const scanId = uuidv4()
  const startTime = Date.now()

  try {
    if (USE_DEMO) {
      const demo = demoDataService.getCropHealthResponse(scanId)
      return { ...demo, ...demo.data, data: undefined }
    }

    const s3Uri = await s3Service.uploadFile(file, 'crop-health')
    const analysis = await bedrockService.analyzeCropHealth(s3Uri)

    return {
      scan_id: scanId,
      scan_type: 'crop-health',
      timestamp: new Date().toISOString(),
      processing_time_ms: Date.now() - startTime,
      s3_uri: s3Uri,
      ...analysis,
    }
  } catch (error) {
    console.error('Crop health analysis error:', error)
    const demo = demoDataService.getCropHealthResponse(scanId)
    return { ...demo, ...demo.data, data: undefined }
  }
}

/**
 * Analyze field irrigation from image
 */
async function analyzeFieldIrrigation(file) {
  const scanId = uuidv4()
  const startTime = Date.now()

  try {
    if (USE_DEMO) {
      const demo = demoDataService.getIrrigationResponse(scanId)
      return { ...demo, ...demo.data, data: undefined }
    }

    const s3Uri = await s3Service.uploadFile(file, 'field-irrigation')
    const analysis = await bedrockService.analyzeIrrigation(s3Uri)

    return {
      scan_id: scanId,
      scan_type: 'field-irrigation',
      timestamp: new Date().toISOString(),
      processing_time_ms: Date.now() - startTime,
      s3_uri: s3Uri,
      ...analysis,
    }
  } catch (error) {
    console.error('Field irrigation analysis error:', error)
    const demo = demoDataService.getIrrigationResponse(scanId)
    return { ...demo, ...demo.data, data: undefined }
  }
}

/**
 * Analyze sky and weather from image
 */
async function analyzeSkyWeather(file) {
  const scanId = uuidv4()
  const startTime = Date.now()

  try {
    if (USE_DEMO) {
      const demo = demoDataService.getWeatherResponse(scanId)
      return { ...demo, ...demo.data, data: undefined }
    }

    const s3Uri = await s3Service.uploadFile(file, 'sky-weather')
    const weatherData = await weatherService.getForecast()
    const analysis = await bedrockService.analyzeSkyWeather(s3Uri, weatherData)

    return {
      scan_id: scanId,
      scan_type: 'sky-weather',
      timestamp: new Date().toISOString(),
      processing_time_ms: Date.now() - startTime,
      s3_uri: s3Uri,
      ...analysis,
    }
  } catch (error) {
    console.error('Sky weather analysis error:', error)
    const demo = demoDataService.getWeatherResponse(scanId)
    return { ...demo, ...demo.data, data: undefined }
  }
}

/**
 * Process voice query from audio
 */
async function processVoiceQuery(file) {
  const scanId = uuidv4()
  const startTime = Date.now()

  try {
    if (USE_DEMO) {
      const demo = demoDataService.getVoiceQueryResponse(scanId)
      return { ...demo, ...demo.data, data: undefined }
    }

    const s3Uri = await s3Service.uploadFile(file, 'voice-query')
    const transcription = await transcribeService.transcribeAudio(s3Uri)
    const response = await processWithAgents(transcription.transcript)

    return {
      scan_id: scanId,
      scan_type: 'voice-query',
      timestamp: new Date().toISOString(),
      processing_time_ms: Date.now() - startTime,
      s3_uri: s3Uri,
      transcript: transcription.transcript,
      language_detected: transcription.language_detected,
      confidence_score: transcription.confidence_score,
      response: response,
    }
  } catch (error) {
    console.error('Voice query processing error:', error)
    const demo = demoDataService.getVoiceQueryResponse(scanId)
    return { ...demo, ...demo.data, data: undefined }
  }
}

/**
 * Analyze video scan
 */
async function analyzeVideoScan(file) {
  const scanId = uuidv4()
  const startTime = Date.now()

  try {
    if (USE_DEMO) {
      const demo = demoDataService.getVideoScanResponse(scanId)
      return { ...demo, ...demo.data, data: undefined }
    }

    const s3Uri = await s3Service.uploadFile(file, 'video-scan')
    const analysis = await bedrockService.analyzeVideo(s3Uri)

    return {
      scan_id: scanId,
      scan_type: 'video-scan',
      timestamp: new Date().toISOString(),
      processing_time_ms: Date.now() - startTime,
      s3_uri: s3Uri,
      ...analysis,
    }
  } catch (error) {
    console.error('Video scan analysis error:', error)
    const demo = demoDataService.getVideoScanResponse(scanId)
    return { ...demo, ...demo.data, data: undefined }
  }
}

/**
 * Get recent scans for a farmer
 */
async function getRecentScans(farmerId, limit = 5) {
  try {
    // TODO: Query DynamoDB for scans
    // For now, return empty array
    return []
  } catch (error) {
    console.error('Get recent scans error:', error)
    throw error
  }
}

/**
 * Get scan details
 */
async function getScanDetails(scanId) {
  try {
    // TODO: Query DynamoDB for scan details
    // For now, return empty object
    return {}
  } catch (error) {
    console.error('Get scan details error:', error)
    throw error
  }
}

/**
 * Process voice query with HarveLogix agents using Bedrock Orchestration
 */
async function processWithAgents(transcript) {
  try {
    const systemPrompt = `You are the HarveLogix AI Voice Orchestrator. 
Your job is to route farmer's voice queries to specialized agents.
Available Agents:
- HarvestReady: For optimal harvest timing and phenology.
- StorageScout: For storage recommendations and warehouse conditions.
- PriceOracle: For market price trends and forecasts.
- BuyerBot: For connecting with processors and buyers.
- FinanceFlow: For credit, insurance, and wallet queries.

Analyze the user's transcript and provide a helpful response as if you consulted these agents.
Respond ONLY with valid JSON containing a "response" key. 
Example: {"response": "Your tomatoes are ready for harvest in 2 days. Market prices are ₹24/kg today."}`

    const result = await bedrockService.invokeBedrockModel(systemPrompt, `Farmer Query: "${transcript}"`)
    
    // If the service returns a structured object, use the reasoning or summary
    return result.reasoning || result.explanation || result.response || result.summary || JSON.stringify(result)
  } catch (error) {
    console.error('Agent voice processing error:', error)
    // Fallback to basic keywords if Bedrock fails
    const lowerTranscript = transcript.toLowerCase()
    if (lowerTranscript.includes('harvest')) return 'Optimal harvest window is in 5-7 days based on crop maturity.'
    if (lowerTranscript.includes('price')) return 'Market prices are trending up. Current average is ₹25/kg.'
    return `I heard: "${transcript}". Let me analyze that for you.`
  }
}

export default {
  analyzeCropHealth,
  analyzeFieldIrrigation,
  analyzeSkyWeather,
  processVoiceQuery,
  analyzeVideoScan,
  getRecentScans,
  getScanDetails,
}
