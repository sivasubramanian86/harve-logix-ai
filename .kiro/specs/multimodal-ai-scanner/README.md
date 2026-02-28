# Multimodal AI Scanner Specification

## Overview

This specification extends HarveLogixAI with multimodal AI capabilities, enabling farmers to capture and analyze:
- **Crop Health**: Close-up images for disease/pest detection
- **Field Irrigation**: Wide-angle field images for water status assessment
- **Sky & Weather**: Sky images combined with weather forecasts for harvest timing
- **Voice Queries**: Farmer speech in native languages for AI recommendations
- **Video Scans** (optional): Short video clips for advanced analysis

## Key Features

### Frontend
- Reusable capture components (ImageCapture, AudioCapture, VideoCapture)
- AI Scanner page with 5 scan types
- Recent Scans section on Farmer detail page
- Aggregated metrics on Government View page
- Full i18n and theme support

### Backend
- 5 REST API endpoints for multimodal operations
- AWS Bedrock (Claude Sonnet 4.6) multimodal integration
- Amazon Rekognition Custom Labels (optional)
- Amazon Transcribe for speech-to-text
- Weather API integration for sky scans
- S3 media storage with proper lifecycle management
- DynamoDB logging for audit and analytics
- Demo mode for local development without AWS services

### AWS Services
- **Amazon Bedrock**: Claude Sonnet 4.6 multimodal for image+text reasoning
- **Amazon Rekognition**: Custom Labels for crop/field computer vision
- **Amazon Transcribe**: Speech-to-text for voice queries
- **Amazon S3**: Media storage with lifecycle policies
- **Amazon DynamoDB**: Scan logging and aggregation
- **Weather API**: Authoritative forecast data

## Documents

1. **requirements.md** - Functional and non-functional requirements (12 requirements)
2. **design.md** - System architecture, data models, API specifications, correctness properties
3. **tasks.md** - Implementation task list (19 major tasks, 80+ subtasks)
4. **IMPLEMENTATION_GUIDE.md** - Frontend component implementation with code examples
5. **BACKEND_GUIDE.md** - Backend API and service implementation with code examples
6. **README.md** - This file

## Quick Start

### Development (Demo Mode)

```bash
# Set environment variable
export VITE_USE_DEMO_DATA=true

# Start backend
cd backend
npm install
npm start

# Start frontend (new terminal)
cd web-dashboard
npm install
npm run dev

# Open http://localhost:3000
# Navigate to "AI Scanner" in left navigation
```

### Production (Live Mode)

```bash
# Set environment variables
export VITE_USE_DEMO_DATA=false
export AWS_REGION=ap-south-1
export BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
export MULTIMODAL_S3_BUCKET=harvelogix-multimodal
export WEATHER_API_KEY=your_key

# Deploy backend and frontend
# (See DEPLOYMENT.md for detailed instructions)
```

## Architecture

```
Frontend (React)
├── ImageCapture, AudioCapture, VideoCapture components
├── AiScannerUpgraded page
├── Enhanced Farmer detail page
└── Enhanced Government View page
        ↓
Backend (Node.js/Express)
├── Multimodal API routes
├── Service layer (S3, Bedrock, Transcribe, Weather)
├── Demo data stubs
└── DynamoDB logging
        ↓
AWS Services
├── Amazon Bedrock (Claude Sonnet 4.6)
├── Amazon Rekognition (Custom Labels)
├── Amazon Transcribe
├── Amazon S3
├── Amazon DynamoDB
└── Weather API
```

## Key Design Decisions

1. **Modular Components**: Reusable capture components for flexibility
2. **Service Abstraction**: Separate service layer for AWS integration
3. **Demo Mode**: Full local development without AWS services
4. **Fallback Strategy**: Graceful degradation to demo data on AWS failures
5. **Data Persistence**: DynamoDB logging for audit and analytics
6. **Safety Guardrails**: System prompts prevent hallucination and ensure accuracy
7. **Multilingual**: Full i18n support for all 8 Indian languages
8. **Theme Support**: Light/dark theme with CSS variables

## Correctness Properties

The design includes 8 formal correctness properties:
1. Image Validation
2. Bedrock Multimodal Invocation
3. Weather Data Precedence
4. Transcription Accuracy
5. S3 Media Persistence
6. Demo Mode Consistency
7. Error Handling
8. Scan Aggregation

## Implementation Timeline

- **Phase 1 (Week 1)**: Frontend capture components + AI Scanner page
- **Phase 2 (Week 2)**: Backend APIs + AWS service integration
- **Phase 3 (Week 3)**: Dashboard integration + testing
- **Phase 4 (Week 4)**: Optimization + documentation

## Testing Strategy

- **Unit Tests**: Component rendering, API validation, service layer
- **Property-Based Tests**: Image validation, Bedrock invocation, weather precedence
- **Integration Tests**: End-to-end scan workflows, demo/live mode switching
- **Performance Tests**: Response time targets (<5s for crop health, <3s for voice)

## Security Considerations

- File type and size validation
- S3 encryption at rest (KMS)
- TLS encryption in transit
- No PII in plaintext logs
- System prompts prevent malicious inputs
- Rate limiting on API endpoints
- AWS IAM roles for service access

## Performance Targets

- Crop health scan: <5 seconds (p95)
- Voice query: <3 seconds (p95)
- Field irrigation scan: <4 seconds (p95)
- Sky & weather scan: <3 seconds (p95)
- S3 upload: <1 second
- DynamoDB logging: <100ms

## Cost Estimation

- **Bedrock**: ~₹0.50-1.00 per scan (Claude Sonnet 4.6 multimodal)
- **Rekognition**: ~₹0.10-0.20 per image (Custom Labels)
- **Transcribe**: ~₹0.02-0.04 per minute
- **S3**: ~₹0.023 per GB stored
- **DynamoDB**: On-demand pricing (~₹0.25 per million writes)
- **Total per farmer**: ~₹1-2 per month (assuming 5 scans/month)

## Next Steps

1. Review and approve specification
2. Create feature branch: `feature/multimodal-ai-scanner`
3. Implement Phase 1 (frontend components)
4. Implement Phase 2 (backend APIs)
5. Implement Phase 3 (dashboard integration)
6. Implement Phase 4 (testing and optimization)
7. Deploy to staging environment
8. Conduct user testing with farmers
9. Deploy to production

## References

- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Amazon Rekognition Custom Labels](https://docs.aws.amazon.com/rekognition/latest/dg/custom-labels.html)
- [Amazon Transcribe](https://docs.aws.amazon.com/transcribe/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [getUserMedia API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

