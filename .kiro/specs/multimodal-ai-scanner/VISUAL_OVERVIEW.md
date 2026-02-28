# Multimodal AI Scanner - Visual Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FARMER / GOVERNMENT OFFICIAL                     │
│                         (Web Dashboard / Mobile App)                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │   Capture    │ │   Capture    │ │   Capture    │
            │   Image      │ │   Audio      │ │   Video      │
            │              │ │              │ │              │
            │ • File       │ │ • Record     │ │ • Upload     │
            │ • Camera     │ │ • Playback   │ │ • Duration   │
            │ • Preview    │ │ • Duration   │ │ • Preview    │
            └──────────────┘ └──────────────┘ └──────────────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
        ┌──────────────────────────┐    ┌──────────────────────────┐
        │   AI Scanner Page        │    │  Recent Scans Section    │
        │                          │    │  (Farmer Detail Page)    │
        │ • Crop Health Scan       │    │                          │
        │ • Field Irrigation Scan  │    │ • Last 5 scans           │
        │ • Sky & Weather Scan     │    │ • Thumbnail + status     │
        │ • Voice Assistant        │    │ • Click for details      │
        │ • Video Scan (optional)  │    │                          │
        └──────────────────────────┘    └──────────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │   Aggregated Metrics          │
                    │   (Government View Page)      │
                    │                               │
                    │ • Crop health by region       │
                    │ • Irrigation risk heatmap     │
                    │ • Sky scan + rainfall corr.   │
                    │ • WOW badges                  │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Backend API Routes          │
                    │   (Node.js/Express)           │
                    │                               │
                    │ POST /api/multimodal/         │
                    │   • crop-health               │
                    │   • field-irrigation          │
                    │   • sky-weather               │
                    │   • voice-query               │
                    │   • video-scan                │
                    └───────────────┬───────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
    ┌────────────┐         ┌────────────────┐         ┌────────────────┐
    │   S3       │         │   Bedrock      │         │  Rekognition   │
    │   Upload   │         │   Multimodal   │         │  Custom Labels │
    │            │         │                │         │                │
    │ • Media    │         │ • Image+Text   │         │ • Disease      │
    │ • Storage  │         │ • Reasoning    │         │ • Pest         │
    │ • Lifecycle│         │ • JSON output  │         │ • Irrigation   │
    └────────────┘         └────────────────┘         └────────────────┘
        │                           │                           │
        └───────────────┬───────────┴───────────────┬───────────┘
                        ▼                           ▼
                    ┌────────────┐         ┌────────────────┐
                    │ Transcribe │         │  Weather API   │
                    │            │         │                │
                    │ • Audio→   │         │ • Forecast     │
                    │   Text     │         │ • Rainfall %   │
                    │ • Language │         │ • Authoritative│
                    └────────────┘         └────────────────┘
                        │                           │
                        └───────────────┬───────────┘
                                        ▼
                            ┌──────────────────────┐
                            │   DynamoDB Logging   │
                            │                      │
                            │ • Scan records       │
                            │ • Audit trail        │
                            │ • Analytics          │
                            │ • 90-day retention   │
                            └──────────────────────┘
```

## User Workflows

### Workflow 1: Crop Health Scan

```
Farmer
  │
  ├─ Opens "AI Scanner" page
  │
  ├─ Selects "Crop Health Scan" tab
  │
  ├─ Takes close-up photo of leaf/fruit
  │   (or uploads existing image)
  │
  ├─ Clicks "Analyze" button
  │
  ├─ Backend:
  │   ├─ Uploads image to S3
  │   ├─ Calls Bedrock multimodal
  │   ├─ (Optional) Calls Rekognition
  │   ├─ Logs scan to DynamoDB
  │   └─ Returns structured JSON
  │
  ├─ Frontend displays results:
  │   ├─ Health status (Healthy/At Risk/Diseased)
  │   ├─ Detected issues (disease, pest, deficiency)
  │   ├─ Recommended actions (spray, pruning, etc.)
  │   └─ Farmer-friendly explanation
  │
  └─ Farmer can click for more details
```

### Workflow 2: Voice Query

```
Farmer
  │
  ├─ Opens "AI Scanner" page
  │
  ├─ Selects "Voice Assistant" tab
  │
  ├─ Clicks microphone button
  │
  ├─ Speaks question in native language
  │   (e.g., "मेरे टमाटर के पत्तों पर काले धब्बे हैं")
  │
  ├─ Clicks stop button
  │
  ├─ Backend:
  │   ├─ Uploads audio to S3
  │   ├─ Calls Amazon Transcribe
  │   ├─ Routes transcript to HarveLogix agents
  │   ├─ Gets AI response
  │   ├─ Logs to DynamoDB
  │   └─ Returns transcript + response
  │
  ├─ Frontend displays:
  │   ├─ Transcribed text
  │   ├─ Language detected
  │   ├─ AI response text
  │   └─ (Optional) Play reply button
  │
  └─ Farmer reads or listens to response
```

### Workflow 3: Government Analytics

```
Government Official
  │
  ├─ Opens "Government View" page
  │
  ├─ Sees new "Multimodal Insights" section
  │
  ├─ Views aggregated metrics:
  │   ├─ "X crop health scans in last 7 days"
  │   ├─ "Y fields flagged as irrigation risk"
  │   ├─ "Z sky scans used to validate harvest windows"
  │
  ├─ Views charts:
  │   ├─ Crop health status by region (pie chart)
  │   ├─ Irrigation risk heatmap (state-level)
  │   ├─ Sky scan + rainfall correlation (scatter)
  │
  ├─ Clicks on region to drill down
  │
  ├─ Sees detailed scans for that region
  │   ├─ Filter by scan type
  │   ├─ Filter by date range
  │   ├─ View individual scan details
  │
  └─ Uses insights for policy decisions
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│                                                               │
│  ImageCapture → Validate → Preview → Send to Backend        │
│  AudioCapture → Record → Playback → Send to Backend         │
│  VideoCapture → Upload → Validate → Send to Backend         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js)                         │
│                                                               │
│  Receive Request → Validate → Upload to S3 → Call AWS       │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ AWS Service Calls (Parallel)                        │   │
│  │                                                      │   │
│  │ • Bedrock: Image + Text → JSON Response            │   │
│  │ • Rekognition: Image → Labels + Confidence         │   │
│  │ • Transcribe: Audio → Text + Language              │   │
│  │ • Weather API: Location → Forecast                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                 │
│  Aggregate Results → Log to DynamoDB → Return to Frontend   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│                                                               │
│  Display Results → Show Details → Store in Recent Scans     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Results Display                                     │   │
│  │                                                      │   │
│  │ • Health Status Badge (color-coded)                │   │
│  │ • Detected Issues (with severity)                  │   │
│  │ • Recommended Actions (with urgency)               │   │
│  │ • Farmer-friendly Explanation                      │   │
│  │ • Confidence Scores                                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── I18nProvider
├── ThemeProvider
├── DataModeProvider
│
└── Layout
    ├── Navbar
    │   ├── Language Switcher
    │   ├── Theme Toggle
    │   └── Data Badge
    │
    ├── Sidebar
    │   ├── Overview
    │   ├── Farmers
    │   ├── Processors
    │   ├── Agents
    │   ├── Government View
    │   ├── System Health
    │   └── AI Scanner (NEW)
    │
    └── Routes
        ├── OverviewUpgraded
        ├── FarmersUpgraded
        │   └── Recent Scans Section (NEW)
        │       └── ScanDetailDrawer (NEW)
        ├── GovernmentViewUpgraded
        │   └── Multimodal Insights (NEW)
        ├── SystemHealthUpgraded
        └── AiScannerUpgraded (NEW)
            ├── CropHealthScan
            │   ├── ImageCapture (NEW)
            │   └── ScanResultsDisplay (NEW)
            ├── FieldIrrigationScan
            │   ├── ImageCapture (NEW)
            │   └── ScanResultsDisplay (NEW)
            ├── SkyWeatherScan
            │   ├── ImageCapture (NEW)
            │   └── ScanResultsDisplay (NEW)
            ├── VoiceAssistant
            │   ├── AudioCapture (NEW)
            │   └── ScanResultsDisplay (NEW)
            └── VideoScan (Optional)
                ├── VideoCapture (NEW)
                └── ScanResultsDisplay (NEW)
```

## API Response Examples

### Crop Health Scan Response

```json
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
  "s3_uri": "s3://harvelogix-multimodal/crop-health/farmer-123/2026-01-28-143000.jpg",
  "processing_time_ms": 2340,
  "timestamp": "2026-01-28T14:30:00Z"
}
```

### Voice Query Response

```json
{
  "status": "success",
  "scan_id": "scan-uuid-456",
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

## Implementation Timeline

```
Week 1: Frontend Components
├─ Day 1-2: ImageCapture component
├─ Day 2-3: AudioCapture component
├─ Day 3-4: VideoCapture component (optional)
└─ Day 4-5: AI Scanner page + integration

Week 2: Backend APIs
├─ Day 1-2: Multimodal routes + validation
├─ Day 2-3: S3 upload service
├─ Day 3-4: Bedrock multimodal invoker
├─ Day 4-5: Transcribe + Weather services

Week 3: Dashboard Integration
├─ Day 1-2: Recent Scans on Farmer detail page
├─ Day 2-3: Aggregated metrics on Government View
├─ Day 3-4: WOW badges on Overview page
└─ Day 4-5: Testing and bug fixes

Week 4: Testing & Optimization
├─ Day 1-2: Unit tests
├─ Day 2-3: Property-based tests
├─ Day 3-4: Integration tests
└─ Day 4-5: Performance optimization
```

## Demo Mode vs Live Mode

```
┌─────────────────────────────────────────────────────────────┐
│                    DEMO MODE                                 │
│                                                               │
│  Environment: VITE_USE_DEMO_DATA=true                       │
│                                                               │
│  ✓ No AWS service calls                                     │
│  ✓ Fixture data from JSON files                             │
│  ✓ Instant responses (<100ms)                               │
│  ✓ Perfect for local development                            │
│  ✓ No AWS credentials needed                                │
│  ✓ Realistic responses for all scan types                   │
│                                                               │
│  Use Case: Development, testing, demos                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    LIVE MODE                                 │
│                                                               │
│  Environment: VITE_USE_DEMO_DATA=false                      │
│                                                               │
│  ✓ Real AWS service calls                                   │
│  ✓ Bedrock multimodal analysis                              │
│  ✓ Rekognition custom labels (optional)                     │
│  ✓ Transcribe speech-to-text                                │
│  ✓ Weather API integration                                  │
│  ✓ S3 media storage                                         │
│  ✓ DynamoDB logging                                         │
│                                                               │
│  Use Case: Production, real farmer usage                    │
└─────────────────────────────────────────────────────────────┘
```

## Success Metrics

```
Performance Metrics:
├─ Crop health scan: <5 seconds (p95)
├─ Voice query: <3 seconds (p95)
├─ Field irrigation scan: <4 seconds (p95)
├─ Sky & weather scan: <3 seconds (p95)
└─ S3 upload: <1 second

Adoption Metrics:
├─ Scans per farmer per month: >5
├─ Voice queries per farmer per month: >2
├─ Government dashboard usage: >80%
└─ Farmer satisfaction: >4.5/5

Quality Metrics:
├─ Test coverage: >87%
├─ Property-based test iterations: >100
├─ Correctness properties: 8/8 passing
└─ Zero critical bugs in production
```

