# Design Document: Multimodal AI Scanner for HarveLogixAI

## Overview

The Multimodal AI Scanner extends HarveLogixAI with real-time computer vision and audio capabilities. The system architecture follows a modular, production-ready design with clear separation between frontend capture UX, backend APIs, AWS service integration, and data persistence.

## Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    React Web Dashboard                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         AI Scanner Section (New)                     │   │
│  │  ├─ Crop Health Scan (ImageCapture)                 │   │
│  │  ├─ Field Irrigation Scan (ImageCapture)            │   │
│  │  ├─ Sky & Weather Scan (ImageCapture)               │   │
│  │  ├─ Voice Assistant (AudioCapture)                  │   │
│  │  └─ Video Scan (VideoCapture - optional)            │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                   │
│  ┌────────────────────────┴────────────────────────────┐    │
│  │         Farmer Detail Page (Enhanced)               │    │
│  │  ├─ Recent Scans section                            │    │
│  │  ├─ Scan detail drawer                              │    │
│  │  └─ Linked to AI Insights                           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Government View (Enhanced)                  │    │
│  │  ├─ Aggregated multimodal metrics                   │    │
│  │  ├─ Regional crop health heatmap                    │    │
│  │  ├─ Irrigation risk by region                       │    │
│  │  └─ Sky scan + rainfall correlation                 │    │
│  └────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Node.js Backend (Express)                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Multimodal API Routes (New)                 │   │
│  │  ├─ POST /api/multimodal/crop-health               │   │
│  │  ├─ POST /api/multimodal/field-irrigation          │   │
│  │  ├─ POST /api/multimodal/sky-weather               │   │
│  │  ├─ POST /api/multimodal/voice-query               │   │
│  │  └─ POST /api/multimodal/video-scan (optional)     │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                   │
│  ┌────────────────────────┴────────────────────────────┐    │
│  │         Multimodal Service Layer (New)              │    │
│  │  ├─ S3 upload handler                               │    │
│  │  ├─ Bedrock multimodal invoker                      │    │
│  │  ├─ Rekognition caller                              │    │
│  │  ├─ Transcribe caller                               │    │
│  │  ├─ Weather API caller                              │    │
│  │  └─ Demo data stub                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                   │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
    ┌────────┐         ┌────────┐        ┌────────┐
    │   S3   │         │DynamoDB│        │Weather │
    │ Media  │         │ Scans  │        │  API   │
    └────────┘         └────────┘        └────────┘
        │                  │
        └──────────────────┼──────────────────┐
                           ▼                  ▼
                    ┌────────────┐      ┌──────────────┐
                    │  Bedrock   │      │ Rekognition  │
                    │  Multimodal│      │ Custom Labels│
                    └────────────┘      └──────────────┘
                           │
                           ▼
                    ┌────────────┐
                    │ Transcribe │
                    └────────────┘
```

## Frontend Components

### 1. Multimodal Capture Components

#### ImageCapture Component
```typescript
interface ImageCaptureProps {
  onCaptured: (file: File) => void
  onError: (error: string) => void
  maxSizeMB?: number
  acceptedFormats?: string[]
  instructions?: string
}

// Features:
// - File upload input
// - Camera capture via getUserMedia
// - Preview thumbnail
// - Re-take/re-upload buttons
// - File validation (type, size)
// - Error display
// - i18n labels
// - Theme support (CSS variables)
```

#### AudioCapture Component
```typescript
interface AudioCaptureProps {
  onCaptured: (file: File) => void
  onError: (error: string) => void
  maxDurationSeconds?: number
  instructions?: string
}

// Features:
// - Record/stop buttons
// - Recording duration timer
// - Simple waveform visualization
// - Playback preview
// - Re-record option
// - File validation
// - i18n labels
// - Theme support
```

#### VideoCapture Component (Optional)
```typescript
interface VideoCaptureProps {
  onCaptured: (file: File) => void
  onError: (error: string) => void
  maxDurationSeconds?: number
  maxSizeMB?: number
}

// Features:
// - File upload for MP4/WebM
// - Duration validation
// - Size validation
// - Preview thumbnail
// - Re-upload option
```

### 2. AI Scanner Page

New page: `src/pages/AiScannerUpgraded.jsx`

```typescript
// Layout:
// - Header: "AI Scanner" title + data badge
// - Tabs/Cards for:
//   1. Crop Health Scan
//   2. Field Irrigation Scan
//   3. Sky & Weather Scan
//   4. Voice Assistant
//   5. Video Scan (optional)
// - Each tab contains:
//   - Instructions (i18n)
//   - Capture component
//   - "Analyze" button
//   - Results area (loading, error, success states)
//   - Detail drawer on click
```

### 3. Recent Scans Section (Farmer Detail Page)

Enhancement to `src/pages/FarmersUpgraded.jsx`:

```typescript
// New section in farmer detail panel:
// - "Recent Scans" heading
// - Grid of scan cards:
//   - Thumbnail (image or audio icon)
//   - Scan type badge
//   - Status badge (Healthy/At Risk/Diseased, etc.)
//   - Timestamp
//   - Click to open detail drawer
// - Detail drawer shows:
//   - Original media (image/audio transcript)
//   - Structured JSON fields
//   - Farmer-friendly explanation
//   - Recommended actions
```

### 4. Aggregated Metrics (Government View)

Enhancement to `src/pages/GovernmentViewUpgraded.jsx`:

```typescript
// New section: "Multimodal Insights"
// - Cards showing:
//   - "X crop health scans in last 7 days"
//   - "Y fields flagged as irrigation risk"
//   - "Z sky scans used to validate harvest windows"
// - Charts:
//   - Crop health status by region (pie/bar)
//   - Irrigation risk heatmap by state
//   - Sky scan + rainfall correlation (scatter)
```

## Backend APIs

### 1. Crop Health Scan Endpoint

```
POST /api/multimodal/crop-health

Request:
{
  "image": <multipart file>,
  "crop_type": "tomato",
  "region": "Karnataka",
  "farmer_id": "farmer-123"
}

Response (Success):
{
  "status": "success",
  "scan_id": "scan-uuid-123",
  "health_status": "AT_RISK",
  "detected_issues": [
    {
      "type": "early_blight",
      "severity": "high",
      "confidence": 0.92,
      "description": "Early blight detected on lower leaves"
    }
  ],
  "recommended_actions": [
    {
      "action": "Apply fungicide",
      "urgency": "high",
      "details": "Use copper-based fungicide within 24 hours",
      "estimated_cost_rupees": 500
    }
  ],
  "explanation": "Your tomato plants show signs of early blight. Apply fungicide immediately to prevent spread.",
  "raw_model_reasoning": "...",
  "s3_uri": "s3://harvelogix-multimodal/crop-health/farmer-123/2026-01-28-143000.jpg",
  "processing_time_ms": 2340,
  "timestamp": "2026-01-28T14:30:00Z"
}

Response (Error):
{
  "status": "error",
  "error": "Invalid image format",
  "timestamp": "2026-01-28T14:30:00Z"
}
```

### 2. Field Irrigation Scan Endpoint

```
POST /api/multimodal/field-irrigation

Request:
{
  "image": <multipart file>,
  "location": {"lat": 15.3173, "long": 75.7139},
  "crop": "wheat",
  "season": "rabi",
  "farmer_id": "farmer-123"
}

Response (Success):
{
  "status": "success",
  "scan_id": "scan-uuid-456",
  "irrigation_status": "UNDER_WATERED",
  "water_saving_recommendations": [
    "Increase irrigation frequency to every 2 days",
    "Use drip irrigation to reduce water loss"
  ],
  "risk_notes": "Field shows visible dryness in patches. Risk of yield loss if not addressed within 48 hours.",
  "recommended_actions": [
    {
      "action": "Irrigate field",
      "urgency": "high",
      "water_volume_liters": 50000,
      "timing": "Next 24 hours"
    }
  ],
  "s3_uri": "s3://harvelogix-multimodal/field-irrigation/farmer-123/2026-01-28-143000.jpg",
  "processing_time_ms": 1890,
  "timestamp": "2026-01-28T14:30:00Z"
}
```

### 3. Sky & Weather Scan Endpoint

```
POST /api/multimodal/sky-weather

Request:
{
  "image": <multipart file>,
  "location": {"lat": 15.3173, "long": 75.7139},
  "time": "2026-01-28T14:30:00Z"
}

Response (Success):
{
  "status": "success",
  "scan_id": "scan-uuid-789",
  "sky_description": "Dense dark cumulus clouds, horizon visible, wind from northwest",
  "forecast_summary": {
    "source": "openweathermap",
    "rainfall_probability": 75,
    "rainfall_mm": 12,
    "wind_speed_kmh": 18,
    "temperature_celsius": 28,
    "forecast_window": "next_6_hours"
  },
  "harvest_window_advice": "High chance of rain in next 6 hours. Recommend delaying harvest until tomorrow morning.",
  "risk_level": "HIGH",
  "recommended_actions": [
    {
      "action": "Delay harvest",
      "urgency": "high",
      "reason": "Rain expected within 6 hours"
    }
  ],
  "s3_uri": "s3://harvelogix-multimodal/sky-weather/farmer-123/2026-01-28-143000.jpg",
  "processing_time_ms": 1450,
  "timestamp": "2026-01-28T14:30:00Z"
}
```

### 4. Voice Query Endpoint

```
POST /api/multimodal/voice-query

Request:
{
  "audio": <multipart file>,
  "language_hint": "hi",
  "farmer_id": "farmer-123"
}

Response (Success):
{
  "status": "success",
  "scan_id": "scan-uuid-101",
  "transcript_text": "मेरे टमाटर के पत्तों पर काले धब्बे हैं, क्या करूं?",
  "language_detected": "hi",
  "ai_response_text": "आपके टमाटर के पत्तों पर अर्ली ब्लाइट दिख रहा है। अगले 24 घंटों में कॉपर-आधारित कवकनाशी लगाएं।",
  "agent_used": "harvest_ready",
  "confidence_score": 0.88,
  "s3_uri": "s3://harvelogix-multimodal/audio/farmer-123/2026-01-28-143000.wav",
  "processing_time_ms": 2100,
  "timestamp": "2026-01-28T14:30:00Z"
}
```

### 5. Video Scan Endpoint (Optional)

```
POST /api/multimodal/video-scan

Request:
{
  "video": <multipart file>,
  "scan_type": "crop_health",
  "metadata": {...}
}

Response (Success):
{
  "status": "success",
  "scan_id": "scan-uuid-202",
  "frames_analyzed": 5,
  "aggregated_insights": {
    "health_status": "AT_RISK",
    "detected_issues": [...],
    "recommended_actions": [...]
  },
  "s3_uri": "s3://harvelogix-multimodal/video/farmer-123/2026-01-28-143000.mp4",
  "processing_time_ms": 4500,
  "timestamp": "2026-01-28T14:30:00Z"
}
```

## Data Models

### MultimodalScan (DynamoDB)

```typescript
interface MultimodalScan {
  scan_id: string                    // UUID
  farmer_id: string                  // Farmer identifier
  scan_type: 'CROP_HEALTH' | 'FIELD_IRRIGATION' | 'SKY_WEATHER' | 'VOICE_QUERY' | 'VIDEO_SCAN'
  region: string                     // State/region
  timestamp: string                  // ISO 8601
  s3_uri: string                     // S3 location of media
  analysis_result: {
    status: string                   // e.g., "HEALTHY", "AT_RISK", "DISEASED"
    detected_issues?: Array<{
      type: string
      severity: string
      confidence: number
      description: string
    }>
    recommended_actions?: Array<{
      action: string
      urgency: string
      details: string
      estimated_cost_rupees?: number
    }>
    explanation: string
  }
  model_version: string              // e.g., "claude-3-5-sonnet-20241022"
  processing_time_ms: number
  confidence_score: number           // 0-1
  metadata: {
    crop_type?: string
    location?: {lat: number, long: number}
    language_detected?: string
  }
  ttl: number                        // Unix timestamp for DynamoDB TTL (90 days)
}
```

### MultimodalMetrics (Aggregated)

```typescript
interface MultimodalMetrics {
  region: string
  date: string
  crop_health_scans_count: number
  crop_health_at_risk_count: number
  crop_health_diseased_count: number
  irrigation_scans_count: number
  irrigation_under_watered_count: number
  irrigation_over_watered_count: number
  sky_scans_count: number
  voice_queries_count: number
  avg_processing_time_ms: number
  avg_confidence_score: number
}
```

## AWS Service Integration

### 1. Amazon Bedrock (Claude Sonnet 4.6 Multimodal)

**Crop Health Analysis Prompt:**
```
You are an expert agricultural advisor specializing in crop disease diagnosis.

Farmer Context:
- Crop Type: {crop_type}
- Region: {region}
- Growth Stage: {growth_stage}

Rekognition Signals (if available):
{rekognition_labels}

Analyze the provided image and respond with a JSON object containing:
{
  "health_status": "HEALTHY" | "AT_RISK" | "DISEASED",
  "detected_issues": [
    {
      "type": "disease_name" | "pest_name" | "nutrient_deficiency",
      "severity": "low" | "medium" | "high",
      "confidence": 0.0-1.0,
      "description": "farmer-friendly description"
    }
  ],
  "recommended_actions": [
    {
      "action": "action_name",
      "urgency": "low" | "medium" | "high",
      "details": "specific instructions",
      "estimated_cost_rupees": number
    }
  ],
  "explanation": "brief farmer-friendly explanation"
}

IMPORTANT:
- Do not hallucinate diseases or pests not visible in the image
- Provide confidence scores for all detections
- Recommend only safe, generic treatments
- If uncertain, indicate low confidence and recommend farmer consultation
```

**Sky & Weather Analysis Prompt:**
```
You are a weather and harvest timing advisor.

Farmer Context:
- Location: {lat}, {long}
- Crop: {crop}
- Time: {time}

Weather Forecast (from authoritative source):
{forecast_json}

Analyze the sky image and respond with JSON:
{
  "sky_description": "visual description of sky conditions",
  "harvest_window_advice": "specific recommendation based on sky + forecast",
  "risk_level": "LOW" | "MED" | "HIGH",
  "recommended_actions": [...]
}

CRITICAL:
- Do NOT make rainfall predictions based solely on the image
- Always defer to the provided weather forecast for authoritative data
- Use the image only to describe visible conditions and validate forecast
- If forecast shows >70% rain probability, recommend delaying harvest
```

### 2. Amazon Rekognition Custom Labels

**Crop Health Model:**
- Input: Crop close-up image
- Output: Labels like "early_blight", "powdery_mildew", "pest_damage", "nutrient_deficiency"
- Confidence threshold: 0.7+

**Field Irrigation Model:**
- Input: Wide-angle field image
- Output: Labels like "dry_patches", "waterlogging", "optimal_moisture", "wilting"
- Confidence threshold: 0.7+

### 3. Amazon Transcribe

**Configuration:**
- Language: Auto-detect or use language_hint
- Output format: JSON with transcript_text, confidence_score
- Vocabulary: Optional custom vocabulary for agricultural terms

### 4. Weather API Integration

**OpenWeatherMap (or similar):**
- Endpoint: `GET /forecast?lat={lat}&lon={long}&appid={key}`
- Response: 5-day forecast with hourly rainfall probability
- Fallback: If API fails, use Bedrock vision-only analysis

### 5. S3 Media Storage

**Bucket Structure:**
```
s3://harvelogix-multimodal/
├── crop-health/{farmer_id}/{timestamp}.jpg
├── field-irrigation/{farmer_id}/{timestamp}.jpg
├── sky-weather/{farmer_id}/{timestamp}.jpg
├── audio/{farmer_id}/{timestamp}.wav
└── video/{farmer_id}/{timestamp}.mp4
```

**Lifecycle Policy:**
- Transition to Glacier after 90 days
- Delete after 1 year

## Demo Mode Implementation

**Demo Fixtures Location:** `backend/data/demo/multimodal/`

```
backend/data/demo/multimodal/
├── crop-health-responses.json
├── field-irrigation-responses.json
├── sky-weather-responses.json
├── voice-query-responses.json
└── video-scan-responses.json
```

**Example Fixture:**
```json
{
  "crop-health": {
    "healthy": {
      "health_status": "HEALTHY",
      "detected_issues": [],
      "recommended_actions": [],
      "explanation": "Your tomato plants look healthy. Continue current care routine."
    },
    "at-risk": {
      "health_status": "AT_RISK",
      "detected_issues": [
        {
          "type": "early_blight",
          "severity": "medium",
          "confidence": 0.85,
          "description": "Early blight detected on lower leaves"
        }
      ],
      "recommended_actions": [
        {
          "action": "Apply fungicide",
          "urgency": "high",
          "details": "Use copper-based fungicide within 24 hours",
          "estimated_cost_rupees": 500
        }
      ],
      "explanation": "Your tomato plants show signs of early blight. Apply fungicide immediately."
    }
  }
}
```

## Correctness Properties

### Property 1: Image Validation
*For any* image upload, the system should validate file type (JPEG/PNG) and size (<10MB) before processing.

### Property 2: Bedrock Multimodal Invocation
*For any* crop health scan, the system should invoke Bedrock with both image and text prompt, and return structured JSON with health_status, detected_issues, and recommended_actions.

### Property 3: Weather Data Precedence
*For any* sky & weather scan, the system should prioritize authoritative weather forecast data over vision-only predictions for rainfall probability.

### Property 4: Transcription Accuracy
*For any* voice query, the system should transcribe audio to text with confidence score and language detection.

### Property 5: S3 Media Persistence
*For any* multimodal scan, the system should store media in S3 with proper path structure and return S3 URI in response.

### Property 6: Demo Mode Consistency
*For any* demo mode request, the system should return fixture data without calling AWS services.

### Property 7: Error Handling
*For any* failed AWS service call, the system should fall back to demo data and log error for monitoring.

### Property 8: Scan Aggregation
*For any* government view query, the system should aggregate multimodal scans by region and date, returning counts and status distributions.

</content>
