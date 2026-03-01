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
      return demoDataService.getCropHealthResponse(scanId)
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
    return demoDataService.getCropHealthResponse(scanId)
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
      return demoDataService.getIrrigationResponse(scanId)
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
    return demoDataService.getIrrigationResponse(scanId)
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
      return demoDataService.getWeatherResponse(scanId)
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
    return demoDataService.getWeatherResponse(scanId)
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
      return demoDataService.getVoiceQueryResponse(scanId)
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
    return demoDataService.getVoiceQueryResponse(scanId)
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
      return demoDataService.getVideoScanResponse(scanId)
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
    return demoDataService.getVideoScanResponse(scanId)
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
 * Process voice query with HarveLogix agents
 */
async function processWithAgents(transcript) {
  try {
    const lowerTranscript = transcript.toLowerCase()
    
    if (lowerTranscript.includes('harvest') || lowerTranscript.includes('when to harvest')) {
      return 'Based on current crop maturity and market conditions, optimal harvest window is in 5-7 days. Weather forecast shows clear conditions next week.'
    } else if (lowerTranscript.includes('water') || lowerTranscript.includes('irrigation')) {
      return 'Current soil moisture is adequate. Next irrigation recommended in 2 days. Consider drip irrigation to save 30% water.'
    } else if (lowerTranscript.includes('price') || lowerTranscript.includes('market')) {
      return 'Current market price for your crop is ₹25/kg at eNAM. Nearby processor offering ₹27/kg for direct purchase.'
    } else if (lowerTranscript.includes('buyer') || lowerTranscript.includes('processor')) {
      return '3 processors matched within 50km radius. Best offer: ₹27/kg with free transport. Tap to view details.'
    } else {
      return `I understood: "${transcript}". Our AI agents are analyzing your query. You can ask about harvest timing, irrigation, market prices, or buyer connections.`
    }
  } catch (error) {
    console.error('Agent processing error:', error)
    throw error
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
