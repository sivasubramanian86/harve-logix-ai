# Requirements Document: Multimodal AI Scanner for HarveLogixAI

## Introduction

The Multimodal AI Scanner extends HarveLogixAI with real-time computer vision and audio capabilities, enabling farmers to capture crop health, field irrigation status, sky conditions, and voice queries. The system leverages AWS Bedrock (Claude Sonnet 4.6 multimodal), Amazon Rekognition, and Amazon Transcribe to deliver actionable AI recommendations directly to farmers and government dashboards.

## Glossary

- **Multimodal Input**: Combination of text, image, audio, and/or video data
- **Crop Health Scan**: Close-up image analysis of leaves, fruits, or plants for disease/pest detection
- **Field Irrigation Scan**: Wide-angle field image analysis for water status assessment
- **Sky & Weather Scan**: Sky image combined with weather forecast for harvest window prediction
- **Voice Query**: Farmer speech input transcribed and processed by AI agents
- **Bedrock Multimodal**: Claude Sonnet 4.6 model capable of reasoning over images + text
- **Rekognition Custom Labels**: AWS ML service for domain-specific image classification
- **Demo Mode**: Stub responses using fixture data (no AWS service calls)
- **Live Mode**: Real AWS service integration (Bedrock, Rekognition, Transcribe, S3)

## Requirements

### Requirement 1: Multimodal Capture Components

**User Story:** As a farmer, I want to capture images, audio, and video using my device camera or file upload, so that I can submit multimodal queries to the AI system.

#### Acceptance Criteria

1. WHEN a farmer navigates to the AI Scanner section, THE Dashboard SHALL display tabs or cards for: Crop Health Scan, Field Irrigation Scan, Sky & Weather Scan, Voice Assistant, and (optional) Video Scan
2. WHEN a farmer selects "Crop Health Scan", THE Dashboard SHALL display an ImageCapture component with: file upload button, camera capture button, preview thumbnail, re-take/re-upload option
3. WHEN a farmer selects "Voice Assistant", THE Dashboard SHALL display an AudioCapture component with: record button, stop button, recording duration timer, simple waveform visualization
4. WHEN a farmer selects "Video Scan" (optional), THE Dashboard SHALL display a VideoCapture component with: file upload for MP4/WebM, max 15 seconds, preview thumbnail
5. WHEN a farmer captures/uploads media, THE Dashboard SHALL validate: file type (JPEG/PNG for images, WAV/OGG for audio, MP4/WebM for video), file size (<10MB for images, <50MB for video)
6. WHEN validation fails, THE Dashboard SHALL display a clear error message and allow retry
7. WHEN media is captured, THE Dashboard SHALL show a preview and "Analyze" button to submit to backend

### Requirement 2: Crop Health Scan

**User Story:** As a farmer, I want to take a close-up photo of my crop and receive AI-powered diagnosis of health issues, so that I can take preventive or corrective action.

#### Acceptance Criteria

1. WHEN a farmer submits a crop health image, THE Backend SHALL store the image in S3 and call Claude Sonnet 4.6 multimodal with crop metadata
2. WHEN Rekognition Custom Labels is configured, THE Backend SHALL optionally call it to detect disease/weed/pest signals before Bedrock
3. WHEN Bedrock returns analysis, THE Dashboard SHALL display: health_status (Healthy/At Risk/Diseased), detected_issues (array with type, severity, confidence), recommended_actions (array of actionable steps), farmer-friendly explanation
4. WHEN a farmer views results, THE Dashboard SHALL show: issue thumbnail, severity badge (green/yellow/red), recommended action with urgency level
5. WHEN a farmer clicks an issue, THE Dashboard SHALL expand to show: detailed explanation, confidence score, suggested treatment options, estimated cost/benefit

### Requirement 3: Field Irrigation Scan

**User Story:** As a farmer, I want to capture a wide-angle field photo and receive irrigation status assessment, so that I can optimize water usage and prevent waterlogging.

#### Acceptance Criteria

1. WHEN a farmer submits a field irrigation image, THE Backend SHALL store the image in S3 and call Claude Sonnet 4.6 multimodal with location, crop, and season metadata
2. WHEN Rekognition Custom Labels is configured for irrigation, THE Backend SHALL optionally detect dry/wet/patchy field patterns
3. WHEN Bedrock returns analysis, THE Dashboard SHALL display: irrigation_status (Under-watered/Optimal/Over-watered/Waterlogging Risk), water_saving_recommendations (array), risk_notes
4. WHEN status is "Under-watered", THE Dashboard SHALL recommend: irrigation schedule, water volume, timing
5. WHEN status is "Over-watered" or "Waterlogging Risk", THE Dashboard SHALL recommend: drainage actions, reduced irrigation, monitoring frequency

### Requirement 4: Sky & Weather Scan

**User Story:** As a farmer, I want to photograph the sky and receive harvest window advice combined with weather forecast, so that I can make informed harvest timing decisions.

#### Acceptance Criteria

1. WHEN a farmer submits a sky image with location and time, THE Backend SHALL store the image in S3 and call a weather API for forecast at that location
2. WHEN Bedrock analyzes the sky image, THE Dashboard SHALL display: sky_description (e.g., "dense dark clouds"), forecast_summary (from authoritative weather API), harvest_window_advice (e.g., "High chance of rain in 6 hours — delay harvest"), risk_level (LOW/MED/HIGH)
3. WHEN risk_level is HIGH, THE Dashboard SHALL highlight in red and recommend: delay harvest, cover crops, move to storage
4. WHEN risk_level is LOW, THE Dashboard SHALL highlight in green and recommend: safe harvest window (next 24-48 hours)
5. WHEN forecast shows rain probability >70%, THE Dashboard SHALL NOT rely solely on vision; instead combine vision description with forecast data

### Requirement 5: Voice Assistant

**User Story:** As a farmer, I want to ask questions in my native language via voice, so that I can get AI recommendations without typing.

#### Acceptance Criteria

1. WHEN a farmer clicks the microphone button, THE Dashboard SHALL start recording audio using Web Audio API
2. WHEN a farmer stops recording, THE Dashboard SHALL send audio to Backend for transcription via Amazon Transcribe
3. WHEN Transcribe returns transcript, THE Backend SHALL pass transcribed text to existing HarveLogix AI agents (e.g., HarvestReady, SupplyMatch)
4. WHEN agents return response, THE Dashboard SHALL display: transcript_text, language_detected, ai_response_text
5. WHEN a farmer clicks "Play Reply" (optional), THE Dashboard SHALL call Amazon Polly to generate speech and play audio response
6. WHEN transcription fails, THE Dashboard SHALL display error and allow re-recording

### Requirement 6: Multimodal API Endpoints

**User Story:** As a backend developer, I want well-defined REST APIs for multimodal operations, so that I can integrate with frontend and AWS services.

#### Acceptance Criteria

1. WHEN a farmer submits a crop health image, THE Backend SHALL expose `POST /api/multimodal/crop-health` accepting: image (multipart/form-data), crop_type, region, farmer_id
2. WHEN a farmer submits a field image, THE Backend SHALL expose `POST /api/multimodal/field-irrigation` accepting: image, location (lat/long), crop, season
3. WHEN a farmer submits a sky image, THE Backend SHALL expose `POST /api/multimodal/sky-weather` accepting: image, location (lat/long), time
4. WHEN a farmer submits audio, THE Backend SHALL expose `POST /api/multimodal/voice-query` accepting: audio file (WAV/OGG), language_hint, farmer_id
5. WHEN a farmer submits video (optional), THE Backend SHALL expose `POST /api/multimodal/video-scan` accepting: video file, metadata
6. WHEN any endpoint is called, THE Backend SHALL return: status (success/error), structured JSON output, confidence scores, explanation text

### Requirement 7: Data Models & Logging

**User Story:** As a system operator, I want to track all multimodal scans for auditing and analytics, so that I can monitor system performance and farmer engagement.

#### Acceptance Criteria

1. WHEN a multimodal scan is processed, THE Backend SHALL create a `MultimodalScan` record with: type (CROP_HEALTH/FIELD_IRRIGATION/SKY_WEATHER/VOICE_QUERY/VIDEO_SCAN), farmer_id, region, timestamp, S3 URIs, high-level outcome, confidence scores
2. WHEN a scan is logged, THE Backend SHALL NOT store PII in plaintext; instead use farmer_id and anonymized fields
3. WHEN a scan is stored, THE Backend SHALL include: media_url (S3), analysis_result (JSON), model_version, processing_time_ms
4. WHEN querying scans, THE Backend SHALL support: filter by farmer_id, type, date range, region

### Requirement 8: Safety & Guardrails

**User Story:** As a system architect, I want to ensure multimodal AI outputs are safe and accurate, so that farmers receive reliable recommendations.

#### Acceptance Criteria

1. WHEN Bedrock is called for weather prediction, THE Backend SHALL NOT allow model to make hard guarantees; instead require deferral to forecast data
2. WHEN Bedrock is called for disease diagnosis, THE Backend SHALL NOT recommend medical/chemical dosages beyond safe, generic recommendations
3. WHEN Bedrock is called for any analysis, THE Backend SHALL include system prompt that: prevents hallucination, requires confidence scores, defers to authoritative data sources
4. WHEN input validation fails, THE Backend SHALL reject request with clear error message
5. WHEN AWS service call fails, THE Backend SHALL fall back to demo data and log error for monitoring

### Requirement 9: Demo vs Live Mode

**User Story:** As a developer, I want to test multimodal features without calling AWS services, so that I can develop and test locally.

#### Acceptance Criteria

1. WHEN `VITE_USE_DEMO_DATA=true` is set, THE Backend SHALL stub multimodal endpoints and return hard-coded JSON responses from fixtures
2. WHEN `VITE_USE_DEMO_DATA=false` is set, THE Backend SHALL call real AWS services (Bedrock, Rekognition, Transcribe, S3)
3. WHEN in demo mode, THE Dashboard SHALL display "Demo data" badge on all multimodal results
4. WHEN in live mode, THE Dashboard SHALL display "Live data" badge on all multimodal results
5. WHEN switching modes, THE Dashboard SHALL NOT require page reload; instead update badge and data source

### Requirement 10: Dashboard Integration

**User Story:** As a government official, I want to see aggregated multimodal insights on the dashboard, so that I can monitor regional crop health and irrigation trends.

#### Acceptance Criteria

1. WHEN viewing Farmer detail page, THE Dashboard SHALL display "Recent Scans" section with: last crop health scans (thumbnail + status), last irrigation scans, last sky scans, voice queries
2. WHEN viewing Government View page, THE Dashboard SHALL display aggregated metrics: count of at-risk crops by region, regions with waterlogging, correlation of sky scans + rainfall events
3. WHEN viewing Overview page, THE Dashboard SHALL display WOW badges: "X crop health scans in last 7 days", "Y fields flagged as irrigation risk", "Z sky scans used to validate harvest windows"
4. WHEN a farmer clicks a scan entry, THE Dashboard SHALL open detail drawer with: original media, structured JSON fields, farmer-friendly explanation

### Requirement 11: Multilingual & Theme Support

**User Story:** As a farmer in India, I want multimodal UI in my native language and theme preference, so that I can use the system comfortably.

#### Acceptance Criteria

1. WHEN a farmer selects a language, THE Dashboard SHALL display all multimodal labels, instructions, and results in that language (using existing i18n system)
2. WHEN a farmer selects a theme, THE Dashboard SHALL render capture components with good contrast and visible controls in both light and dark themes
3. WHEN Transcribe detects language, THE Backend SHALL return language_detected field for display

### Requirement 12: Performance & Reliability

**User Story:** As a system operator, I want multimodal operations to be fast and reliable, so that farmers have a smooth experience.

#### Acceptance Criteria

1. WHEN a farmer submits a crop health image, THE Backend SHALL process and return results within 5 seconds (p95)
2. WHEN a farmer records audio, THE Backend SHALL transcribe and return results within 3 seconds (p95)
3. WHEN AWS services are unavailable, THE Backend SHALL fall back to demo data and display error message
4. WHEN a farmer retries a failed scan, THE Backend SHALL not duplicate S3 uploads; instead reuse previous media

</content>
