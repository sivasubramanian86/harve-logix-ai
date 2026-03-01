# Multimodal AI Scanner - Quick Reference Guide

## 📋 Specification Overview

**Status**: ✅ Complete and Ready for Implementation
**Scope**: Extend HarveLogixAI with multimodal AI (image, audio, video, text)
**Timeline**: 4 weeks (phased implementation)
**AWS Services**: Bedrock, Rekognition, Transcribe, S3, DynamoDB

## 📁 Specification Files

| File | Purpose | Key Content |
|------|---------|-------------|
| **requirements.md** | Functional requirements | 12 requirements with acceptance criteria |
| **design.md** | System architecture | APIs, data models, correctness properties |
| **tasks.md** | Implementation plan | 19 major tasks, 80+ subtasks |
| **IMPLEMENTATION_GUIDE.md** | Frontend code | React component examples |
| **BACKEND_GUIDE.md** | Backend code | Node.js/Express examples |
| **README.md** | Overview | Quick start, architecture, timeline |
| **SUMMARY.md** | Executive summary | What was delivered, next steps |
| **VISUAL_OVERVIEW.md** | Diagrams | Architecture, workflows, data flow |
| **QUICK_REFERENCE.md** | This file | Quick lookup guide |

## 🎯 Key Features

### Frontend
- ✅ ImageCapture (file upload + camera)
- ✅ AudioCapture (record + playback)
- ✅ VideoCapture (file upload)
- ✅ AI Scanner page (5 scan types)
- ✅ Recent Scans section
- ✅ Aggregated metrics
- ✅ i18n + theme support

### Backend
- ✅ 5 REST API endpoints
- ✅ S3 media storage
- ✅ DynamoDB logging
- ✅ Demo mode support
- ✅ Error handling + fallback
- ✅ Request validation

### AWS Services
- ✅ Bedrock (Claude Sonnet 4.6)
- ✅ Rekognition (Custom Labels)
- ✅ Transcribe (speech-to-text)
- ✅ S3 (media storage)
- ✅ DynamoDB (logging)
- ✅ Weather API (forecast)

## 🚀 Quick Start

### Demo Mode (Local Development)
```bash
export VITE_USE_DEMO_DATA=true
cd backend && npm start
cd web-dashboard && npm run dev
# Open http://localhost:3000 → AI Scanner
```

### Live Mode (Production)
```bash
export VITE_USE_DEMO_DATA=false
export AWS_REGION=ap-south-1
export BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
export MULTIMODAL_S3_BUCKET=harvelogix-multimodal
export WEATHER_API_KEY=your_key
# Deploy backend and frontend
```

## 📊 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/multimodal/crop-health` | POST | Analyze crop health from image |
| `/api/multimodal/field-irrigation` | POST | Assess field irrigation status |
| `/api/multimodal/sky-weather` | POST | Predict harvest window from sky |
| `/api/multimodal/voice-query` | POST | Process farmer voice query |
| `/api/multimodal/video-scan` | POST | Analyze short video clip |

## 🔧 Implementation Phases

### Phase 1: Frontend Components (Week 1)
- [ ] ImageCapture component
- [ ] AudioCapture component
- [ ] VideoCapture component
- [ ] AI Scanner page
- [ ] Integration with i18n + theme

### Phase 2: Backend APIs (Week 2)
- [ ] Multimodal routes
- [ ] S3 upload service
- [ ] Bedrock multimodal invoker
- [ ] Transcribe caller
- [ ] Weather API caller
- [ ] Demo data stubs

### Phase 3: Dashboard Integration (Week 3)
- [ ] Recent Scans on Farmer detail page
- [ ] Aggregated metrics on Government View
- [ ] WOW badges on Overview page
- [ ] Testing and bug fixes

### Phase 4: Testing & Optimization (Week 4)
- [ ] Unit tests
- [ ] Property-based tests
- [ ] Integration tests
- [ ] Performance optimization

## 📈 Performance Targets

| Operation | Target | Status |
|-----------|--------|--------|
| Crop health scan | <5s (p95) | 🎯 |
| Voice query | <3s (p95) | 🎯 |
| Field irrigation scan | <4s (p95) | 🎯 |
| Sky & weather scan | <3s (p95) | 🎯 |
| S3 upload | <1s | 🎯 |
| DynamoDB logging | <100ms | 🎯 |

## 💰 Cost Estimation

| Service | Cost per Scan | Monthly (5 scans) |
|---------|---------------|-------------------|
| Bedrock | ₹0.50-1.00 | ₹2.50-5.00 |
| Rekognition | ₹0.10-0.20 | ₹0.50-1.00 |
| Transcribe | ₹0.02-0.04 | ₹0.10-0.20 |
| S3 | ₹0.001-0.005 | ₹0.01-0.05 |
| DynamoDB | ₹0.001-0.005 | ₹0.01-0.05 |
| **Total** | **₹0.60-1.30** | **₹3-6** |

## 🔐 Safety Guardrails

- ✅ File type and size validation
- ✅ System prompts prevent hallucination
- ✅ Weather forecast precedence
- ✅ No medical/chemical dosage advice
- ✅ Error handling with fallback
- ✅ Rate limiting on APIs
- ✅ Audit logging (no PII)

## ✅ Correctness Properties

1. **Image Validation**: File type/size validation
2. **Bedrock Invocation**: Structured JSON response
3. **Weather Precedence**: Forecast prioritized
4. **Transcription**: Audio→text with confidence
5. **S3 Persistence**: Media stored correctly
6. **Demo Consistency**: Fixture data without AWS
7. **Error Handling**: Fallback to demo data
8. **Scan Aggregation**: Correct by region/date

## 📝 Testing Strategy

| Test Type | Coverage | Iterations |
|-----------|----------|-----------|
| Unit Tests | Components + Services | 100+ |
| Property-Based Tests | Correctness properties | 100+ |
| Integration Tests | End-to-end workflows | 50+ |
| Performance Tests | Response times | 10+ |

## 🌍 Multilingual Support

Supported languages (8 total):
- English (en)
- Hindi (hi)
- Tamil (ta)
- Telugu (te)
- Malayalam (ml)
- Kannada (kn)
- Gujarati (gu)
- Marathi (mr)

## 🎨 Theme Support

- ✅ Light theme
- ✅ Dark theme
- ✅ System preference detection
- ✅ CSS variables for all colors
- ✅ Smooth transitions

## 📊 Data Models

### MultimodalScan (DynamoDB)
```
scan_id: UUID
farmer_id: String
scan_type: CROP_HEALTH | FIELD_IRRIGATION | SKY_WEATHER | VOICE_QUERY | VIDEO_SCAN
region: String
timestamp: ISO 8601
s3_uri: S3 path
analysis_result: JSON
processing_time_ms: Number
confidence_score: 0-1
ttl: Unix timestamp (90 days)
```

### MultimodalMetrics (Aggregated)
```
region: String
date: String
crop_health_scans_count: Number
crop_health_at_risk_count: Number
irrigation_scans_count: Number
irrigation_under_watered_count: Number
sky_scans_count: Number
voice_queries_count: Number
avg_processing_time_ms: Number
avg_confidence_score: Number
```

## 🔗 Integration Points

### Existing Systems
- ✅ I18nProvider (language support)
- ✅ ThemeProvider (light/dark mode)
- ✅ DataModeProvider (demo/live mode)
- ✅ HarveLogix agents (voice query routing)
- ✅ Farmer detail page (recent scans)
- ✅ Government View page (aggregated metrics)

### New Systems
- ✅ AI Scanner page
- ✅ Multimodal service layer
- ✅ AWS service integration
- ✅ DynamoDB logging

## 📚 Documentation

- **README.md**: Overview and quick start
- **IMPLEMENTATION_GUIDE.md**: Frontend code examples
- **BACKEND_GUIDE.md**: Backend code examples
- **VISUAL_OVERVIEW.md**: Architecture diagrams
- **SUMMARY.md**: Executive summary
- **QUICK_REFERENCE.md**: This file

## 🎓 Learning Resources

- [AWS Bedrock Docs](https://docs.aws.amazon.com/bedrock/)
- [Amazon Rekognition Custom Labels](https://docs.aws.amazon.com/rekognition/latest/dg/custom-labels.html)
- [Amazon Transcribe](https://docs.aws.amazon.com/transcribe/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [getUserMedia API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

## ❓ FAQ

**Q: Can I use demo mode in production?**
A: No, demo mode is for development only. Use live mode with real AWS services in production.

**Q: What if AWS services are unavailable?**
A: The system falls back to demo data and displays an error message. Retries are automatic.

**Q: How long are scans stored?**
A: Scans are stored in DynamoDB for 90 days, then automatically deleted via TTL.

**Q: Can I customize the AI prompts?**
A: Yes, system prompts are in the backend code and can be customized per scan type.

**Q: What languages does Transcribe support?**
A: Transcribe supports 100+ languages. Configure via TRANSCRIBE_LANGUAGE_CODE.

**Q: How do I add a new scan type?**
A: Add a new endpoint in multimodal.js, create a service function, and add demo fixtures.

## 🚦 Status

| Component | Status | Notes |
|-----------|--------|-------|
| Specification | ✅ Complete | Ready for implementation |
| Requirements | ✅ Complete | 12 requirements defined |
| Design | ✅ Complete | Architecture + data models |
| Tasks | ✅ Complete | 19 major tasks, 80+ subtasks |
| Code Examples | ✅ Complete | Frontend + backend examples |
| Documentation | ✅ Complete | 8 comprehensive documents |

## 🎯 Next Steps

1. **Review**: Get stakeholder approval on specification
2. **Plan**: Create feature branch and sprint plan
3. **Implement**: Follow phased approach (4 weeks)
4. **Test**: Unit, property-based, integration tests
5. **Deploy**: Staging → Production
6. **Monitor**: Track performance and adoption

## 📞 Support

For questions or clarifications:
1. Review the relevant specification document
2. Check VISUAL_OVERVIEW.md for diagrams
3. Review code examples in IMPLEMENTATION_GUIDE.md
4. Check FAQ section above

---

**Last Updated**: 2026-01-28
**Version**: 1.0
**Status**: Ready for Implementation

