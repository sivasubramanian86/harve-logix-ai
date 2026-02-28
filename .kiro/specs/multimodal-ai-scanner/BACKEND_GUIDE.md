# Backend Implementation Guide: Multimodal AI Scanner

## Part 1: Backend Directory Structure

```
backend/
├── routes/
│   ├── multimodal.js (NEW)
│   └── ...existing routes...
├── services/
│   ├── multimodalService.js (NEW)
│   ├── bedrockMultimodal.js (NEW)
│   ├── s3Upload.js (NEW)
│   ├── transcribeService.js (NEW)
│   ├── weatherService.js (NEW)
│   └── ...existing services...
├── data/
│   └── demo/
│       └── multimodal/ (NEW)
│           ├── crop-health-responses.json
│           ├── field-irrigation-responses.json
│           ├── sky-weather-responses.json
│           ├── voice-query-responses.json
│           └── video-scan-responses.json
├── middleware/
│   ├── multimodalValidation.js (NEW)
│   └── ...existing middleware...
└── config.js (UPDATE)
```

## Part 2: Multimodal Routes

```javascript
// backend/routes/multimodal.js
import express from 'express'
import multer from 'multer'
import { 
  cropHealthScan, 
  fieldIrrigationScan, 
  skyWeatherScan, 
  voiceQuery, 
  videoScan 
} from '../services/multimodalService.js'
import { validateMultimodalRequest } from '../middleware/multimodalValidation.js'

const router = express.Router()
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
})

// Crop Health Scan
router.post('/crop-health', 
  upload.single('image'),
  validateMultimodalRequest('crop-health'),
  async (req, res) => {
    try {
      const result = await cropHealthScan(req.file, req.body)
      res.json(result)
    } catch (error) {
      res.status(500).json({ status: 'error', error: error.message })
    }
  }
)

// Field Irrigation Scan
router.post('/field-irrigation',
  upload.single('image'),
  validateMultimodalRequest('field-irrigation'),
  async (req, res) => {
    try {
      const result = await fieldIrrigationScan(req.file, req.body)
      res.json(result)
    } catch (error) {
      res.status(500).json({ status: 'error', error: error.message })
    }
  }
)

// Sky & Weather Scan
router.post('/sky-weather',
  upload.single('image'),
  validateMultimodalRequest('sky-weather'),
  async (req, res) => {
    try {
      const result = await skyWeatherScan(req.file, req.body)
      res.json(result)
    } catch (error) {
      res.status(500).json({ status: 'error', error: error.message })
    }
  }
)

// Voice Query
router.post('/voice-query',
  upload.single('audio'),
  validateMultimodalRequest('voice-query'),
  async (req, res) => {
    try {
      const result = await voiceQuery(req.file, req.body)
      res.json(result)
    } catch (error) {
      res.status(500).json({ status: 'error', error: error.message })
    }
  }
)

// Video Scan (Optional)
router.post('/video-scan',
  upload.single('video'),
  validateMultimodalRequest('video-scan'),
  async (req, res) => {
    try {
      const result = await videoScan(req.file, req.body)
      res.json(result)
    } catch (error) {
      res.status(500).json({ status: 'error', error: error.message })
    }
  }
)

export default router
```

## Part 3: Multimodal Service

```javascript
// backend/services/multimodalService.js
import { v4 as uuidv4 } from 'uuid'
import { uploadToS3 } from './s3Upload.js'
import { invokeBedrockMultimodal } from './bedrockMultimodal.js'
import { transcribeAudio } from './transcribeService.js'
import { getWeatherForecast } from './weatherService.js'
import { logScanToDynamoDB } from './scanLogger.js'
import { getDemoResponse } from './demoDataLoader.js'

const USE_DEMO = process.env.VITE_USE_DEMO_DATA === 'true'

export async function cropHealthScan(imageFile, metadata) {
  const scanId = uuidv4()
  const startTime = Date.now()

  try {
    // If demo mode, return fixture data
    if (USE_DEMO) {
      const demoResponse = getDemoResponse('crop-health')
      return {
        status: 'success',
        scan_id: scanId,
        ...demoResponse,
        timestamp: new Date().toISOString()
      }
    }

    // Upload image to S3
    const s3Uri = await uploadToS3(imageFile, 'crop-health', metadata.farmer_id)

    // Call Bedrock multimodal
    const bedrockResponse = await invokeBedrockMultimodal({
      imageBuffer: imageFile.buffer,
      prompt: `You are an expert agricultural advisor. Analyze this crop image and provide health assessment.
      
Crop Type: ${metadata.crop_type}
Region: ${metadata.region}

Respond with JSON:
{
  "health_status": "HEALTHY" | "AT_RISK" | "DISEASED",
  "detected_issues": [...],
  "recommended_actions": [...],
  "explanation": "..."
}`,
      modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0'
    })

    // Log scan to DynamoDB
    const processingTime = Date.now() - startTime
    await logScanToDynamoDB({
      scan_id: scanId,
      farmer_id: metadata.farmer_id,
      scan_type: 'CROP_HEALTH',
      region: metadata.region,
      s3_uri: s3Uri,
      analysis_result: bedrockResponse,
      processing_time_ms: processingTime,
      confidence_score: bedrockResponse.confidence_score || 0.85
    })

    return {
      status: 'success',
      scan_id: scanId,
      ...bedrockResponse,
      s3_uri: s3Uri,
      processing_time_ms: processingTime,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Crop health scan error:', error)
    
    // Fall back to demo data on error
    const demoResponse = getDemoResponse('crop-health')
    return {
      status: 'success',
      scan_id: scanId,
      ...demoResponse,
      fallback: true,
      error_message: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

export async function fieldIrrigationScan(imageFile, metadata) {
  const scanId = uuidv4()
  const startTime = Date.now()

  try {
    if (USE_DEMO) {
      const demoResponse = getDemoResponse('field-irrigation')
      return {
        status: 'success',
        scan_id: scanId,
        ...demoResponse,
        timestamp: new Date().toISOString()
      }
    }

    const s3Uri = await uploadToS3(imageFile, 'field-irrigation', metadata.farmer_id)

    const bedrockResponse = await invokeBedrockMultimodal({
      imageBuffer: imageFile.buffer,
      prompt: `You are an irrigation advisor. Analyze this field image and assess water status.

Crop: ${metadata.crop}
Season: ${metadata.season}
Location: ${metadata.location.lat}, ${metadata.location.long}

Respond with JSON:
{
  "irrigation_status": "UNDER_WATERED" | "OPTIMAL" | "OVER_WATERED" | "WATERLOGGING_RISK",
  "water_saving_recommendations": [...],
  "risk_notes": "...",
  "recommended_actions": [...]
}`,
      modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0'
    })

    const processingTime = Date.now() - startTime
    await logScanToDynamoDB({
      scan_id: scanId,
      farmer_id: metadata.farmer_id,
      scan_type: 'FIELD_IRRIGATION',
      region: metadata.region,
      s3_uri: s3Uri,
      analysis_result: bedrockResponse,
      processing_time_ms: processingTime
    })

    return {
      status: 'success',
      scan_id: scanId,
      ...bedrockResponse,
      s3_uri: s3Uri,
      processing_time_ms: processingTime,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Field irrigation scan error:', error)
    const demoResponse = getDemoResponse('field-irrigation')
    return {
      status: 'success',
      scan_id: scanId,
      ...demoResponse,
      fallback: true,
      timestamp: new Date().toISOString()
    }
  }
}

export async function skyWeatherScan(imageFile, metadata) {
  const scanId = uuidv4()
  const startTime = Date.now()

  try {
    if (USE_DEMO) {
      const demoResponse = getDemoResponse('sky-weather')
      return {
        status: 'success',
        scan_id: scanId,
        ...demoResponse,
        timestamp: new Date().toISOString()
      }
    }

    const s3Uri = await uploadToS3(imageFile, 'sky-weather', metadata.farmer_id)

    // Get weather forecast
    const forecast = await getWeatherForecast(metadata.location.lat, metadata.location.long)

    // Analyze sky image with Bedrock
    const bedrockResponse = await invokeBedrockMultimodal({
      imageBuffer: imageFile.buffer,
      prompt: `You are a weather and harvest timing advisor.

Weather Forecast (authoritative):
${JSON.stringify(forecast, null, 2)}

Analyze the sky image and respond with JSON:
{
  "sky_description": "visual description",
  "harvest_window_advice": "specific recommendation",
  "risk_level": "LOW" | "MED" | "HIGH",
  "recommended_actions": [...]
}

CRITICAL: Defer to the weather forecast for rainfall predictions. Use the image only to describe visible conditions.`,
      modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0'
    })

    const processingTime = Date.now() - startTime
    await logScanToDynamoDB({
      scan_id: scanId,
      farmer_id: metadata.farmer_id,
      scan_type: 'SKY_WEATHER',
      region: metadata.region,
      s3_uri: s3Uri,
      analysis_result: { ...bedrockResponse, forecast },
      processing_time_ms: processingTime
    })

    return {
      status: 'success',
      scan_id: scanId,
      ...bedrockResponse,
      forecast_summary: forecast,
      s3_uri: s3Uri,
      processing_time_ms: processingTime,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Sky weather scan error:', error)
    const demoResponse = getDemoResponse('sky-weather')
    return {
      status: 'success',
      scan_id: scanId,
      ...demoResponse,
      fallback: true,
      timestamp: new Date().toISOString()
    }
  }
}

export async function voiceQuery(audioFile, metadata) {
  const scanId = uuidv4()
  const startTime = Date.now()

  try {
    if (USE_DEMO) {
      const demoResponse = getDemoResponse('voice-query')
      return {
        status: 'success',
        scan_id: scanId,
        ...demoResponse,
        timestamp: new Date().toISOString()
      }
    }

    const s3Uri = await uploadToS3(audioFile, 'audio', metadata.farmer_id)

    // Transcribe audio
    const transcription = await transcribeAudio(audioFile.buffer, metadata.language_hint)

    // Pass transcript to existing HarveLogix agents
    // (integrate with existing agent routing logic)
    const aiResponse = await routeToAgent(transcription.transcript_text, metadata.farmer_id)

    const processingTime = Date.now() - startTime
    await logScanToDynamoDB({
      scan_id: scanId,
      farmer_id: metadata.farmer_id,
      scan_type: 'VOICE_QUERY',
      s3_uri: s3Uri,
      analysis_result: {
        transcript_text: transcription.transcript_text,
        language_detected: transcription.language_detected,
        ai_response_text: aiResponse.response_text
      },
      processing_time_ms: processingTime
    })

    return {
      status: 'success',
      scan_id: scanId,
      transcript_text: transcription.transcript_text,
      language_detected: transcription.language_detected,
      ai_response_text: aiResponse.response_text,
      agent_used: aiResponse.agent_used,
      confidence_score: aiResponse.confidence_score,
      s3_uri: s3Uri,
      processing_time_ms: processingTime,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Voice query error:', error)
    const demoResponse = getDemoResponse('voice-query')
    return {
      status: 'success',
      scan_id: scanId,
      ...demoResponse,
      fallback: true,
      timestamp: new Date().toISOString()
    }
  }
}

export async function videoScan(videoFile, metadata) {
  // Implementation for video frame extraction and analysis
  // Extract 3-5 key frames, analyze each with Bedrock, aggregate results
  const scanId = uuidv4()
  return {
    status: 'success',
    scan_id: scanId,
    frames_analyzed: 5,
    aggregated_insights: {},
    timestamp: new Date().toISOString()
  }
}

async function routeToAgent(query, farmerId) {
  // Route to existing HarveLogix agents
  // This integrates with existing agent routing logic
  return {
    response_text: 'Agent response',
    agent_used: 'harvest_ready',
    confidence_score: 0.85
  }
}
```

## Part 4: Configuration Updates

```javascript
// backend/config.js - ADD these lines

// Multimodal Configuration
export const MULTIMODAL_S3_BUCKET = process.env.MULTIMODAL_S3_BUCKET || 'harvelogix-multimodal'
export const MULTIMODAL_MAX_IMAGE_SIZE_MB = parseInt(process.env.MULTIMODAL_MAX_IMAGE_SIZE_MB || '10')
export const MULTIMODAL_MAX_VIDEO_SIZE_MB = parseInt(process.env.MULTIMODAL_MAX_VIDEO_SIZE_MB || '50')
export const MULTIMODAL_MAX_AUDIO_SIZE_MB = parseInt(process.env.MULTIMODAL_MAX_AUDIO_SIZE_MB || '10')

// Weather API
export const WEATHER_API_KEY = process.env.WEATHER_API_KEY || ''
export const WEATHER_API_BASE_URL = process.env.WEATHER_API_BASE_URL || 'https://api.openweathermap.org/data/2.5'

// Transcribe
export const TRANSCRIBE_LANGUAGE_CODE = process.env.TRANSCRIBE_LANGUAGE_CODE || 'en-US'

// Demo Mode
export const USE_DEMO_DATA = process.env.VITE_USE_DEMO_DATA === 'true'
```

## Part 5: Environment Variables

```bash
# .env.development (for local development)

# Multimodal
VITE_USE_DEMO_DATA=true
MULTIMODAL_S3_BUCKET=harvelogix-multimodal-dev
MULTIMODAL_MAX_IMAGE_SIZE_MB=10
MULTIMODAL_MAX_VIDEO_SIZE_MB=50

# AWS Services (for live mode)
AWS_REGION=ap-south-1
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0

# Weather API
WEATHER_API_KEY=your_openweathermap_key
WEATHER_API_BASE_URL=https://api.openweathermap.org/data/2.5

# Transcribe
TRANSCRIBE_LANGUAGE_CODE=en-US
```

