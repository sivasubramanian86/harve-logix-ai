# Implementation Plan: Multimodal AI Scanner for HarveLogixAI

## Overview

This implementation plan extends HarveLogixAI with multimodal AI capabilities (image, audio, video) for crop health, field irrigation, sky/weather, and voice query analysis. The approach follows an incremental strategy: build capture components, implement backend APIs, integrate AWS services, and surface insights in dashboards.

## Tasks

- [ ] 1. Create multimodal capture components
  - [ ] 1.1 Create ImageCapture component
    - Build reusable React component with file upload + camera capture
    - Implement preview, re-take, validation
    - Use i18n for labels, CSS variables for theming
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 1.2 Create AudioCapture component
    - Build React component with Web Audio API
    - Implement record/stop, duration timer, waveform visualization
    - Add playback preview and re-record option
    - _Requirements: 1.1, 1.5_
  
  - [ ] 1.3 Create VideoCapture component (optional)
    - Build React component for video file upload
    - Implement duration and size validation
    - Add preview thumbnail
    - _Requirements: 1.1_
  
  - [ ]* 1.4 Write unit tests for capture components
    - Test file validation (type, size)
    - Test preview rendering
    - Test error states
    - _Requirements: 1.1_

- [ ] 2. Create AI Scanner page
  - [ ] 2.1 Create AiScannerUpgraded page component
    - Set up layout with tabs/cards for 5 scan types
    - Integrate capture components
    - Wire to backend APIs
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 2.2 Implement Crop Health Scan UI
    - Instructions, ImageCapture, Analyze button
    - Results display: health_status, detected_issues, recommended_actions
    - Detail drawer on click
    - _Requirements: 2.1, 2.2_
  
  - [ ] 2.3 Implement Field Irrigation Scan UI
    - Instructions, ImageCapture, Analyze button
    - Results display: irrigation_status, recommendations, risk_notes
    - Detail drawer on click
    - _Requirements: 3.1, 3.2_
  
  - [ ] 2.4 Implement Sky & Weather Scan UI
    - Instructions, ImageCapture, Analyze button
    - Results display: sky_description, forecast_summary, harvest_window_advice
    - Risk level badge (LOW/MED/HIGH)
    - _Requirements: 4.1, 4.2_
  
  - [ ] 2.5 Implement Voice Assistant UI
    - Mic button, recording timer, transcript display
    - AI response text display
    - Optional: Play reply button (Polly integration later)
    - _Requirements: 5.1, 5.2_
  
  - [ ] 2.6 Implement Video Scan UI (optional)
    - File upload, duration validation
    - Results display with aggregated insights
    - _Requirements: 1.1_
  
  - [ ]* 2.7 Write unit tests for AI Scanner page
    - Test tab switching
    - Test results display
    - Test error states
    - _Requirements: 1.1_

- [ ] 3. Create backend multimodal API routes
  - [ ] 3.1 Create multimodal routes file
    - Set up Express routes for 5 endpoints
    - Add request validation middleware
    - Add error handling
    - _Requirements: 6.1, 6.2_
  
  - [ ] 3.2 Implement POST /api/multimodal/crop-health
    - Accept image + metadata (multipart/form-data)
    - Validate file type and size
    - Call S3 upload handler
    - Call Bedrock multimodal (or demo stub)
    - Return structured JSON response
    - _Requirements: 2.1, 2.2, 6.1_
  
  - [ ] 3.3 Implement POST /api/multimodal/field-irrigation
    - Accept image + location/crop/season metadata
    - Validate and upload to S3
    - Call Bedrock multimodal with irrigation context
    - Return irrigation_status + recommendations
    - _Requirements: 3.1, 3.2, 6.1_
  
  - [ ] 3.4 Implement POST /api/multimodal/sky-weather
    - Accept image + location + time
    - Validate and upload to S3
    - Call weather API for forecast
    - Call Bedrock multimodal with forecast context
    - Return sky_description + harvest_window_advice
    - _Requirements: 4.1, 4.2, 6.1_
  
  - [ ] 3.5 Implement POST /api/multimodal/voice-query
    - Accept audio file + language_hint
    - Validate and upload to S3
    - Call Amazon Transcribe (or demo stub)
    - Pass transcript to existing HarveLogix agents
    - Return transcript + AI response
    - _Requirements: 5.1, 5.2, 6.1_
  
  - [ ] 3.6 Implement POST /api/multimodal/video-scan (optional)
    - Accept video file + metadata
    - Validate duration and size
    - Upload to S3
    - Extract frames and analyze
    - Return aggregated insights
    - _Requirements: 1.1, 6.1_
  
  - [ ]* 3.7 Write unit tests for API routes
    - Test request validation
    - Test error handling
    - Test response structure
    - _Requirements: 6.1_

- [ ] 4. Create multimodal service layer
  - [ ] 4.1 Create S3 upload service
    - Implement file upload to S3 with proper path structure
    - Add error handling and retry logic
    - Return S3 URI
    - _Requirements: 6.1, 7.1_
  
  - [ ] 4.2 Create Bedrock multimodal invoker
    - Implement image + text prompt invocation
    - Add system prompts for each scan type
    - Parse JSON response
    - Add error handling
    - _Requirements: 2.1, 3.1, 4.1_
  
  - [ ] 4.3 Create Rekognition caller (optional)
    - Implement image analysis with Rekognition Custom Labels
    - Return detected labels with confidence
    - Add error handling
    - _Requirements: 2.1, 3.1_
  
  - [ ] 4.4 Create Transcribe caller
    - Implement audio transcription
    - Return transcript + language_detected
    - Add error handling
    - _Requirements: 5.1_
  
  - [ ] 4.5 Create weather API caller
    - Implement forecast retrieval
    - Return rainfall probability + forecast data
    - Add error handling and caching
    - _Requirements: 4.1_
  
  - [ ] 4.6 Create demo data stub
    - Load fixture data from JSON files
    - Return realistic responses without AWS calls
    - Support all 5 scan types
    - _Requirements: 9.1, 9.2_
  
  - [ ]* 4.7 Write unit tests for service layer
    - Test S3 upload
    - Test Bedrock invocation
    - Test demo stub
    - _Requirements: 6.1_

- [ ] 5. Create data models and logging
  - [ ] 5.1 Create MultimodalScan DynamoDB table
    - Define schema with scan_id, farmer_id, scan_type, timestamp, etc.
    - Add TTL for 90-day retention
    - Add GSI for querying by farmer_id + timestamp
    - _Requirements: 7.1, 7.2_
  
  - [ ] 5.2 Create scan logging service
    - Implement function to log scans to DynamoDB
    - Ensure no PII in plaintext
    - Include processing_time_ms and confidence_score
    - _Requirements: 7.1, 7.2_
  
  - [ ] 5.3 Create scan query service
    - Implement function to query scans by farmer_id, type, date range
    - Support pagination
    - Return aggregated metrics
    - _Requirements: 7.1_
  
  - [ ]* 5.4 Write unit tests for data models
    - Test scan logging
    - Test scan queries
    - _Requirements: 7.1_

- [ ] 6. Implement safety and guardrails
  - [ ] 6.1 Add input validation
    - Validate file types (JPEG/PNG for images, WAV/OGG for audio, MP4/WebM for video)
    - Validate file sizes (<10MB for images, <50MB for video)
    - Validate metadata fields
    - _Requirements: 8.1, 8.2_
  
  - [ ] 6.2 Add Bedrock system prompts
    - Create system prompts that prevent hallucination
    - Require confidence scores
    - Defer to authoritative data sources (weather API)
    - Prevent medical/chemical dosage advice
    - _Requirements: 8.1, 8.2_
  
  - [ ] 6.3 Add error handling and fallback
    - Wrap AWS service calls with try-catch
    - Fall back to demo data on failure
    - Log errors for monitoring
    - _Requirements: 8.3_
  
  - [ ]* 6.4 Write unit tests for safety guardrails
    - Test input validation
    - Test system prompt effectiveness
    - Test error fallback
    - _Requirements: 8.1, 8.2_

- [ ] 7. Implement demo vs live mode
  - [ ] 7.1 Create demo mode configuration
    - Add VITE_USE_DEMO_DATA environment variable
    - Load demo fixtures from backend/data/demo/multimodal/
    - Return fixture data without AWS calls
    - _Requirements: 9.1, 9.2_
  
  - [ ] 7.2 Create live mode configuration
    - Add AWS service configuration (S3, Bedrock, Rekognition, Transcribe)
    - Add environment variables for API keys and endpoints
    - Call real AWS services
    - _Requirements: 9.1, 9.2_
  
  - [ ] 7.3 Create mode switcher
    - Implement function to switch between demo and live
    - Update data badge on frontend
    - No page reload required
    - _Requirements: 9.1, 9.2_
  
  - [ ]* 7.4 Write unit tests for demo/live mode
    - Test demo mode returns fixture data
    - Test live mode calls AWS services
    - Test mode switching
    - _Requirements: 9.1, 9.2_

- [ ] 8. Enhance Farmer detail page
  - [ ] 8.1 Add Recent Scans section
    - Display last 5 scans with thumbnail + status + timestamp
    - Make each entry clickable
    - _Requirements: 10.1, 10.2_
  
  - [ ] 8.2 Create scan detail drawer
    - Show original media (image/audio transcript)
    - Show structured JSON fields
    - Show farmer-friendly explanation
    - Show recommended actions
    - _Requirements: 10.1, 10.2_
  
  - [ ] 8.3 Link scans to AI Insights
    - Show AI insights from scan results
    - Integrate with existing AiInsightsPanel component
    - _Requirements: 10.1, 10.2_
  
  - [ ]* 8.4 Write unit tests for Farmer detail enhancements
    - Test Recent Scans display
    - Test detail drawer
    - _Requirements: 10.1_

- [ ] 9. Enhance Government View page
  - [ ] 9.1 Add Multimodal Insights section
    - Display WOW badges: "X crop health scans", "Y irrigation risks", "Z sky scans"
    - _Requirements: 10.3, 10.4_
  
  - [ ] 9.2 Add aggregated metrics charts
    - Crop health status by region (pie/bar chart)
    - Irrigation risk heatmap by state
    - Sky scan + rainfall correlation (scatter plot)
    - _Requirements: 10.3, 10.4_
  
  - [ ] 9.3 Add regional drill-down
    - Click on region to see detailed scans
    - Filter by scan type and date range
    - _Requirements: 10.3, 10.4_
  
  - [ ]* 9.4 Write unit tests for Government View enhancements
    - Test metrics aggregation
    - Test chart rendering
    - _Requirements: 10.3_

- [ ] 10. Ensure multilingual and theme support
  - [ ] 10.1 Add i18n keys for multimodal UI
    - Add keys for all labels, instructions, results
    - Support all 8 languages (en, hi, ta, te, ml, kn, gu, mr)
    - _Requirements: 11.1_
  
  - [ ] 10.2 Test theme support
    - Verify capture components render correctly in light/dark themes
    - Verify good contrast and visible controls
    - _Requirements: 11.1_
  
  - [ ]* 10.3 Write unit tests for i18n and theme
    - Test language switching
    - Test theme switching
    - _Requirements: 11.1_

- [ ] 11. Create demo fixtures
  - [ ] 11.1 Create crop-health-responses.json
    - Include healthy, at-risk, diseased examples
    - Include various crop types
    - _Requirements: 9.1, 9.2_
  
  - [ ] 11.2 Create field-irrigation-responses.json
    - Include under-watered, optimal, over-watered, waterlogging examples
    - _Requirements: 9.1, 9.2_
  
  - [ ] 11.3 Create sky-weather-responses.json
    - Include low, medium, high risk examples
    - Include forecast data
    - _Requirements: 9.1, 9.2_
  
  - [ ] 11.4 Create voice-query-responses.json
    - Include various farmer questions
    - Include transcripts in multiple languages
    - _Requirements: 9.1, 9.2_
  
  - [ ] 11.5 Create video-scan-responses.json (optional)
    - Include aggregated insights from video analysis
    - _Requirements: 9.1, 9.2_

- [ ] 12. Implement performance and reliability
  - [ ] 12.1 Add request timeout handling
    - Set 5-second timeout for crop health scans
    - Set 3-second timeout for voice queries
    - Fall back to demo data on timeout
    - _Requirements: 12.1, 12.2_
  
  - [ ] 12.2 Add caching for weather API
    - Cache forecast data for 1 hour
    - Reduce API calls
    - _Requirements: 12.1, 12.2_
  
  - [ ] 12.3 Add retry logic for AWS services
    - Implement exponential backoff
    - Max 3 retries
    - Fall back to demo data after retries exhausted
    - _Requirements: 12.1, 12.2_
  
  - [ ]* 12.4 Write unit tests for performance
    - Test timeout handling
    - Test caching
    - Test retry logic
    - _Requirements: 12.1_

- [ ] 13. Update documentation
  - [ ] 13.1 Update README with multimodal section
    - Explain multimodal capture workflow
    - Document demo vs live mode
    - Document AWS service configuration
    - _Requirements: 12.1_
  
  - [ ] 13.2 Create MULTIMODAL.md guide
    - Detailed API documentation
    - Example requests/responses
    - Configuration guide
    - _Requirements: 12.1_
  
  - [ ] 13.3 Update API.md with new endpoints
    - Document all 5 multimodal endpoints
    - Include request/response examples
    - _Requirements: 12.1_

- [ ] 14. Checkpoint - Ensure all core features work
  - Verify ImageCapture works with file upload and camera
  - Verify AudioCapture works with recording and playback
  - Verify all 5 scan types return correct results
  - Verify demo mode returns fixture data
  - Verify live mode calls AWS services
  - Verify Recent Scans display on Farmer detail page
  - Verify aggregated metrics on Government View page
  - Verify i18n and theme support
  - Ensure all tests pass

- [ ] 15. Write comprehensive property-based tests
  - [ ]* 15.1 Write property tests for image validation
    - **Property 1: Image Validation**
    - **Validates: Requirements 1.1, 1.2**
    - Test that invalid file types are rejected
  
  - [ ]* 15.2 Write property tests for Bedrock invocation
    - **Property 2: Bedrock Multimodal Invocation**
    - **Validates: Requirements 2.1, 3.1, 4.1**
    - Test that Bedrock returns structured JSON with required fields
  
  - [ ]* 15.3 Write property tests for weather data precedence
    - **Property 3: Weather Data Precedence**
    - **Validates: Requirements 4.1, 4.2**
    - Test that weather forecast is prioritized over vision-only predictions
  
  - [ ]* 15.4 Write property tests for transcription
    - **Property 4: Transcription Accuracy**
    - **Validates: Requirements 5.1, 5.2**
    - Test that audio is transcribed with confidence score
  
  - [ ]* 15.5 Write property tests for S3 persistence
    - **Property 5: S3 Media Persistence**
    - **Validates: Requirements 6.1, 7.1**
    - Test that media is stored in S3 with correct path structure
  
  - [ ]* 15.6 Write property tests for demo mode
    - **Property 6: Demo Mode Consistency**
    - **Validates: Requirements 9.1, 9.2**
    - Test that demo mode returns fixture data without AWS calls
  
  - [ ]* 15.7 Write property tests for error handling
    - **Property 7: Error Handling**
    - **Validates: Requirements 8.3, 12.1**
    - Test that failed AWS calls fall back to demo data
  
  - [ ]* 15.8 Write property tests for scan aggregation
    - **Property 8: Scan Aggregation**
    - **Validates: Requirements 10.3, 10.4**
    - Test that scans are aggregated correctly by region and date

- [ ] 16. Write unit tests for edge cases
  - [ ]* 16.1 Write unit tests for capture components
    - Test with various file sizes
    - Test with invalid file types
    - Test with network errors
  
  - [ ]* 16.2 Write unit tests for API routes
    - Test with missing required fields
    - Test with malformed JSON
    - Test with oversized files
  
  - [ ]* 16.3 Write unit tests for service layer
    - Test S3 upload failures
    - Test Bedrock timeout
    - Test Transcribe errors
  
  - [ ]* 16.4 Write unit tests for data models
    - Test DynamoDB operations
    - Test query filters
    - Test TTL expiration

- [ ] 17. Integration testing
  - [ ]* 17.1 Test end-to-end crop health scan
    - Upload image → Bedrock analysis → Display results
  
  - [ ]* 17.2 Test end-to-end voice query
    - Record audio → Transcribe → Agent response → Display
  
  - [ ]* 17.3 Test demo vs live mode switching
    - Switch modes and verify data source changes
  
  - [ ]* 17.4 Test multimodal dashboard integration
    - Verify Recent Scans display
    - Verify aggregated metrics
    - Verify drill-down functionality

- [ ] 18. Final checkpoint - Ensure all tests pass
  - Run all unit tests and verify passing
  - Run all property-based tests (100+ iterations each)
  - Run all integration tests
  - Verify no console errors or warnings
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 19. Documentation and code cleanup
  - [ ]* 19.1 Document new components and services
    - Add JSDoc comments to all new components
    - Document API endpoints
    - Document data models
  
  - [ ]* 19.2 Update README with multimodal guide
    - Explain multimodal capture workflow
    - Document AWS service configuration
    - Document demo vs live mode
  
  - [ ]* 19.3 Code cleanup and optimization
    - Remove unused code
    - Optimize component rendering
    - Ensure consistent code style

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints (14 and 18) ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All components use i18n keys and CSS variables for flexibility
- Demo mode enables local development without AWS services
- Live mode integrates with real AWS services for production

</content>
