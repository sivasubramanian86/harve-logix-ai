# Multimodal AI Scanner - Testing Guide

## 🧪 Testing Strategy

This guide covers all testing approaches for the Multimodal AI Scanner.

---

## 1. Manual Testing (Quick Validation)

### Demo Mode Testing (5 minutes)

#### Setup
```bash
cd backend && npm start
cd web-dashboard && npm run dev
# Open: http://localhost:3000
```

#### Test Cases

**Test 1: Crop Health Scan**
1. Navigate to AI Scanner
2. Click "Crop Health Scan" tab
3. Upload any image or use camera
4. Click "Analyze"
5. ✅ Verify: Results show health status, issues, recommendations

**Test 2: Field Irrigation Scan**
1. Click "Field Irrigation Scan" tab
2. Upload any image
3. Click "Analyze"
4. ✅ Verify: Results show irrigation status, water tips

**Test 3: Sky & Weather Scan**
1. Click "Sky & Weather Scan" tab
2. Upload any image
3. Click "Analyze"
4. ✅ Verify: Results show weather forecast, harvest advice

**Test 4: Voice Assistant**
1. Click "Voice Assistant" tab
2. Click "Start Recording"
3. Speak for 3-5 seconds
4. Click "Stop Recording"
5. Click "Analyze"
6. ✅ Verify: Results show transcript and response

**Test 5: Video Scan**
1. Click "Video Scan" tab
2. Upload any video (MP4/WebM)
3. Click "Analyze"
4. ✅ Verify: Results show video analysis

**Test 6: Error Handling**
1. Try uploading invalid file type
2. ✅ Verify: Error message displayed
3. Try uploading oversized file
4. ✅ Verify: Error message displayed

**Test 7: Demo/Live Toggle**
1. Toggle "Demo Data" checkbox
2. ✅ Verify: Mode changes reflected

---

## 2. API Testing (Postman/cURL)

### Setup
```bash
# Start backend
cd backend && npm start
```

### Test Crop Health Endpoint
```bash
curl -X POST http://localhost:5000/api/multimodal/crop-health \
  -F "media=@test-images/crop.jpg" \
  -H "Content-Type: multipart/form-data"
```

**Expected Response:**
```json
{
  "scan_id": "uuid",
  "scan_type": "crop-health",
  "health_status": "HEALTHY|AT_RISK|DISEASED",
  "detected_issues": [...],
  "recommended_actions": [...]
}
```

### Test Irrigation Endpoint
```bash
curl -X POST http://localhost:5000/api/multimodal/field-irrigation \
  -F "media=@test-images/field.jpg"
```

### Test Weather Endpoint
```bash
curl -X POST http://localhost:5000/api/multimodal/sky-weather \
  -F "media=@test-images/sky.jpg"
```

### Test Voice Query Endpoint
```bash
curl -X POST http://localhost:5000/api/multimodal/voice-query \
  -F "media=@test-audio/query.wav"
```

### Test Video Scan Endpoint
```bash
curl -X POST http://localhost:5000/api/multimodal/video-scan \
  -F "media=@test-videos/field.mp4"
```

---

## 3. Unit Testing (Jest)

### Setup Jest
```bash
cd backend
npm install --save-dev jest @jest/globals
```

### Update package.json
```json
{
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
    "test:watch": "npm test -- --watch",
    "test:coverage": "npm test -- --coverage"
  }
}
```

### Run Tests
```bash
npm test
```

### Test Files

**backend/tests/test_multimodal_services.js**
- Tests all 5 scan types
- Validates response structure
- Checks error handling

**Expected Output:**
```
PASS  tests/test_multimodal_services.js
  Multimodal Services
    analyzeCropHealth
      ✓ should return crop health analysis (50ms)
    analyzeFieldIrrigation
      ✓ should return irrigation analysis (45ms)
    analyzeSkyWeather
      ✓ should return weather analysis (48ms)
    processVoiceQuery
      ✓ should return voice query response (52ms)
    analyzeVideoScan
      ✓ should return video analysis (47ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
```

---

## 4. Integration Testing

### Test Full Flow (Demo Mode)

**Test Script:**
```javascript
// test-integration.js
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'

async function testCropHealthFlow() {
  const formData = new FormData()
  formData.append('media', fs.createReadStream('test-crop.jpg'))
  
  const response = await axios.post(
    'http://localhost:5000/api/multimodal/crop-health',
    formData,
    { headers: formData.getHeaders() }
  )
  
  console.assert(response.status === 200, 'Status should be 200')
  console.assert(response.data.scan_id, 'Should have scan_id')
  console.assert(response.data.health_status, 'Should have health_status')
  console.log('✅ Crop Health Flow: PASSED')
}

testCropHealthFlow()
```

**Run:**
```bash
node test-integration.js
```

---

## 5. Load Testing (Artillery)

### Setup Artillery
```bash
npm install -g artillery
```

### Create Load Test Config
```yaml
# load-test.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
scenarios:
  - name: "Crop Health Scan"
    flow:
      - post:
          url: "/api/multimodal/crop-health"
          formData:
            media: "@test-crop.jpg"
```

### Run Load Test
```bash
artillery run load-test.yml
```

**Expected Metrics:**
- Response time p95: <2s
- Response time p99: <3s
- Success rate: >99%
- Errors: <1%

---

## 6. E2E Testing (Cypress)

### Setup Cypress
```bash
cd web-dashboard
npm install --save-dev cypress
npx cypress open
```

### Create E2E Test
```javascript
// cypress/e2e/multimodal.cy.js
describe('Multimodal AI Scanner', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
    cy.contains('AI Scanner').click()
  })

  it('should analyze crop health', () => {
    cy.contains('Crop Health Scan').click()
    cy.get('input[type="file"]').selectFile('test-crop.jpg')
    cy.contains('Analyze').click()
    cy.contains('Analysis Complete', { timeout: 5000 })
    cy.contains('health_status')
  })

  it('should record and analyze voice query', () => {
    cy.contains('Voice Assistant').click()
    cy.contains('Start Recording').click()
    cy.wait(3000)
    cy.contains('Stop Recording').click()
    cy.contains('Analyze').click()
    cy.contains('Transcript', { timeout: 10000 })
  })

  it('should handle errors gracefully', () => {
    cy.contains('Crop Health Scan').click()
    cy.get('input[type="file"]').selectFile('invalid.txt')
    cy.contains('Invalid file type')
  })
})
```

### Run E2E Tests
```bash
npx cypress run
```

---

## 7. AWS Integration Testing (Live Mode)

### Prerequisites
- AWS credentials configured
- S3 bucket created
- Bedrock access enabled

### Test AWS Services

**Test S3 Upload:**
```javascript
import s3Service from './services/s3Service.js'

const testFile = {
  buffer: Buffer.from('test'),
  mimetype: 'image/jpeg'
}

const uri = await s3Service.uploadFile(testFile, 'crop-health')
console.log('S3 URI:', uri)
```

**Test Bedrock Analysis:**
```javascript
import bedrockService from './services/bedrockService.js'

const result = await bedrockService.analyzeCropHealth('s3://bucket/image.jpg')
console.log('Bedrock Result:', result)
```

**Test Transcribe:**
```javascript
import transcribeService from './services/transcribeService.js'

const result = await transcribeService.transcribeAudio('s3://bucket/audio.wav')
console.log('Transcript:', result.transcript)
```

---

## 8. Performance Testing

### Metrics to Track

**Backend:**
- API response time (target: <2s)
- S3 upload time (target: <5s)
- Bedrock analysis time (target: <3s)
- Transcribe time (target: <10s)
- Memory usage (target: <512MB)
- CPU usage (target: <50%)

**Frontend:**
- Page load time (target: <1s)
- Time to interactive (target: <2s)
- Image upload time (target: <3s)
- Results render time (target: <100ms)

### Performance Test Script
```javascript
// performance-test.js
import { performance } from 'perf_hooks'

async function measurePerformance() {
  const start = performance.now()
  
  // Test API call
  await fetch('http://localhost:5000/api/multimodal/crop-health', {
    method: 'POST',
    body: formData
  })
  
  const end = performance.now()
  console.log(`Response time: ${end - start}ms`)
}
```

---

## 9. Security Testing

### Test Cases

**Test 1: File Upload Validation**
- Upload .exe file → Should reject
- Upload 200MB file → Should reject
- Upload malicious script → Should sanitize

**Test 2: API Rate Limiting**
- Send 1000 requests/second → Should throttle
- Verify 429 status code

**Test 3: Authentication**
- Call API without auth → Should reject (if auth enabled)
- Call with invalid token → Should reject

**Test 4: Input Sanitization**
- Send SQL injection in filename → Should sanitize
- Send XSS in metadata → Should sanitize

---

## 10. Regression Testing

### Test Checklist

After each code change, verify:

- [ ] All 5 scan types still work
- [ ] Demo mode still works
- [ ] Live mode still works (if AWS configured)
- [ ] Error handling still works
- [ ] File validation still works
- [ ] Results display correctly
- [ ] No console errors
- [ ] No memory leaks
- [ ] Performance not degraded

---

## 11. Test Data

### Sample Test Files

Create `test-data/` directory with:

```
test-data/
├── images/
│   ├── crop-healthy.jpg
│   ├── crop-diseased.jpg
│   ├── field-dry.jpg
│   ├── field-wet.jpg
│   ├── sky-clear.jpg
│   └── sky-cloudy.jpg
├── audio/
│   ├── query-harvest.wav
│   ├── query-water.wav
│   └── query-price.wav
└── videos/
    ├── field-walkthrough.mp4
    └── crop-closeup.mp4
```

---

## 12. Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Multimodal Scanner

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend && npm install
          cd ../web-dashboard && npm install
      
      - name: Run backend tests
        run: cd backend && npm test
      
      - name: Run frontend tests
        run: cd web-dashboard && npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## 📊 Test Coverage Goals

- **Unit Tests**: 87%+ coverage
- **Integration Tests**: All critical paths
- **E2E Tests**: All user flows
- **Performance Tests**: All endpoints
- **Security Tests**: All attack vectors

---

## ✅ Testing Checklist

Before deployment, ensure:

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] E2E tests passing
- [ ] Performance targets met
- [ ] Security tests passing
- [ ] No console errors
- [ ] No memory leaks
- [ ] Documentation updated
- [ ] Test coverage >87%

---

## 🐛 Bug Reporting

When reporting bugs, include:

1. **Environment**: Demo/Live mode, browser, OS
2. **Steps to reproduce**: Exact steps
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happened
5. **Screenshots**: If applicable
6. **Console logs**: Any errors
7. **Network logs**: API responses

---

## 📞 Support

- **Issues**: GitHub Issues
- **Email**: support@harvelogix.ai
- **Docs**: docs/MULTIMODAL.md

---

**Happy Testing! 🧪✅**
