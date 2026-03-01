import axios from '../config/axios'

/**
 * Multimodal Service Layer
 * Handles API calls for all multimodal scan types
 */

export interface ScanResult {
  scan_id: string
  scan_type: string
  timestamp: string
  status: string
  data: Record<string, any>
  processing_time_ms: number
  confidence_score?: number
}

export interface CropHealthResult extends ScanResult {
  data: {
    health_status: 'healthy' | 'at_risk' | 'diseased'
    detected_issues: string[]
    recommended_actions: string[]
    confidence_score: number
  }
}

export interface IrrigationResult extends ScanResult {
  data: {
    irrigation_status: 'under_watered' | 'optimal' | 'over_watered' | 'waterlogging'
    recommendations: string[]
    risk_notes: string[]
    water_saving_tips: string[]
  }
}

export interface WeatherResult extends ScanResult {
  data: {
    sky_description: string
    forecast_summary: string
    rainfall_probability: number
    temperature_range: string
    wind_speed: string
    harvest_window_advice: string
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
  }
}

export interface VoiceQueryResult extends ScanResult {
  data: {
    transcript: string
    language_detected: string
    ai_response: string
    confidence_score: number
  }
}

export interface VideoScanResult extends ScanResult {
  data: {
    duration_seconds: number
    frames_analyzed: number
    aggregated_insights: string[]
    detected_issues: string[]
    overall_health_score: number
  }
}

/**
 * Analyze crop health from image
 */
export async function analyzeCropHealth(imageFile: File): Promise<CropHealthResult> {
  const formData = new FormData()
  formData.append('media', imageFile)

  const response = await axios.post<CropHealthResult>('/api/multimodal/crop-health', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}

/**
 * Analyze field irrigation from image
 */
export async function analyzeFieldIrrigation(imageFile: File): Promise<IrrigationResult> {
  const formData = new FormData()
  formData.append('media', imageFile)

  const response = await axios.post<IrrigationResult>('/api/multimodal/field-irrigation', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}

/**
 * Analyze sky and weather from image
 */
export async function analyzeSkyWeather(imageFile: File): Promise<WeatherResult> {
  const formData = new FormData()
  formData.append('media', imageFile)

  const response = await axios.post<WeatherResult>('/api/multimodal/sky-weather', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}

/**
 * Process voice query from audio
 */
export async function processVoiceQuery(audioFile: File): Promise<VoiceQueryResult> {
  const formData = new FormData()
  formData.append('media', audioFile)

  const response = await axios.post<VoiceQueryResult>('/api/multimodal/voice-query', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}

/**
 * Analyze video scan
 */
export async function analyzeVideoScan(videoFile: File): Promise<VideoScanResult> {
  const formData = new FormData()
  formData.append('media', videoFile)

  const response = await axios.post<VideoScanResult>('/api/multimodal/video-scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}

/**
 * Get recent scans for a farmer
 */
export async function getRecentScans(farmerId: string, limit: number = 5): Promise<ScanResult[]> {
  const response = await axios.get<ScanResult[]>(`/api/multimodal/scans/${farmerId}`, {
    params: { limit },
  })

  return response.data
}

/**
 * Get scan details
 */
export async function getScanDetails(scanId: string): Promise<ScanResult> {
  const response = await axios.get<ScanResult>(`/api/multimodal/scans/${scanId}`)

  return response.data
}
