# Multimodal AI Scanner - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Option 1: Demo Mode (No AWS Required)

Perfect for development and testing without AWS credentials.

```bash
# 1. Clone repository
git clone https://github.com/sivasubramanian86/harve-logix-ai.git
cd harve-logix-ai

# 2. Install dependencies
cd backend && npm install
cd ../web-dashboard && npm install

# 3. Start backend (Terminal 1)
cd backend
npm start

# 4. Start frontend (Terminal 2)
cd web-dashboard
npm run dev

# 5. Open browser
# Navigate to: http://localhost:3000
# Click "AI Scanner" in sidebar
```

**Demo Mode Features:**
- ✅ All 5 scan types work with fixture data
- ✅ No AWS credentials needed
- ✅ Instant responses
- ✅ Perfect for UI development

### Option 2: Live Mode (AWS Required)

For production deployment with real AI analysis.

```bash
# 1. Setup AWS credentials
cd backend
cp .env.example .env
nano .env  # Add your AWS credentials

# 2. Create S3 bucket
aws s3 mb s3://harvelogix-multimodal --region ap-south-2

# 3. Enable Bedrock model
# Go to AWS Console → Bedrock → Model Access
# Enable: Claude Sonnet 4.6

# 4. Get Weather API key (optional)
# Sign up: https://openweathermap.org/api
# Add to backend/.env: WEATHER_API_KEY=your_key

# 5. Update environment
# backend/.env: USE_DEMO_DATA=false
# web-dashboard/.env: VITE_USE_DEMO_DATA=false

# 6. Start services
cd backend && npm start
cd web-dashboard && npm run dev
```

## 📱 Using the AI Scanner

### 1. Crop Health Scan
1. Click "Crop Health Scan" tab
2. Upload image or use camera
3. Click "Analyze"
4. View health status, issues, and recommendations

### 2. Field Irrigation Scan
1. Click "Field Irrigation Scan" tab
2. Upload field image
3. Click "Analyze"
4. View irrigation status and water-saving tips

### 3. Sky & Weather Scan
1. Click "Sky & Weather Scan" tab
2. Upload sky image
3. Click "Analyze"
4. View weather forecast and harvest advice

### 4. Voice Assistant
1. Click "Voice Assistant" tab
2. Click "Start Recording"
3. Ask your question (e.g., "When should I harvest?")
4. Click "Stop Recording"
5. Click "Analyze"
6. View transcript and AI response

### 5. Video Scan
1. Click "Video Scan" tab
2. Upload field video (max 5 min, 100MB)
3. Click "Analyze"
4. View comprehensive field analysis

## 🎯 Example Queries

### Voice Assistant Examples
- "When should I harvest my tomatoes?"
- "How much water does my field need?"
- "What's the current market price?"
- "Which processor should I contact?"

### Expected Responses
The AI will provide context-aware responses based on:
- Current crop maturity
- Weather conditions
- Market prices
- Available processors

## 🔧 Configuration

### Backend (.env)
```bash
# AWS Configuration
AWS_REGION=ap-south-2
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here

# S3 Configuration
S3_BUCKET_NAME=harvelogix-multimodal

# Weather API (optional)
WEATHER_API_KEY=your_key_here

# Mode: true = demo, false = live
USE_DEMO_DATA=true

# Server
PORT=5000
```

### Frontend (.env)
```bash
# API URL
VITE_API_URL=http://localhost:5000

# Mode: true = demo, false = live
VITE_USE_DEMO_DATA=true
```

## 📊 API Testing

### Test Crop Health Endpoint
```bash
curl -X POST http://localhost:5000/api/multimodal/crop-health \
  -F "media=@test-crop.jpg"
```

### Test Voice Query Endpoint
```bash
curl -X POST http://localhost:5000/api/multimodal/voice-query \
  -F "media=@test-audio.wav"
```

### Test Weather Endpoint
```bash
curl -X POST http://localhost:5000/api/multimodal/sky-weather \
  -F "media=@test-sky.jpg"
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Node version (need 18+)
node --version

# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend won't start
```bash
# Check Node version
node --version

# Reinstall dependencies
cd web-dashboard
rm -rf node_modules package-lock.json
npm install
```

### "Module not found" errors
```bash
# Make sure you're using ES6 modules
# Check package.json has: "type": "module"
```

### AWS errors in Live Mode
```bash
# Verify credentials
aws sts get-caller-identity

# Check S3 bucket exists
aws s3 ls s3://harvelogix-multimodal

# Check Bedrock access
aws bedrock list-foundation-models --region ap-south-2
```

## 📚 Documentation

- **Full Documentation**: [docs/MULTIMODAL.md](docs/MULTIMODAL.md)
- **Implementation Status**: [MULTIMODAL_STATUS.md](MULTIMODAL_STATUS.md)
- **API Reference**: [docs/API.md](docs/API.md)
- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 🎓 Video Tutorials

Coming soon:
- Setting up AWS services
- Using the AI Scanner
- Deploying to production
- Customizing prompts

## 💡 Tips

1. **Start with Demo Mode** - Get familiar with the UI first
2. **Use Camera Capture** - Faster than file upload
3. **Check Processing Time** - Displayed at bottom of results
4. **Try Voice Queries** - More natural than typing
5. **Review Recommendations** - AI provides actionable advice

## 🚀 Next Steps

1. ✅ Complete this quick start
2. 📖 Read full documentation
3. 🧪 Run tests: `npm test`
4. 🌐 Deploy to production
5. 📊 Monitor performance
6. 🔧 Customize for your needs

## 🤝 Contributing

Found a bug? Have a feature request?
- Open an issue: [GitHub Issues](https://github.com/sivasubramanian86/harve-logix-ai/issues)
- Submit a PR: [Contributing Guide](docs/CONTRIBUTING.md)

## 📞 Support

- **Email**: support@harvelogix.ai
- **Slack**: #harvelogix-dev
- **Docs**: docs/MULTIMODAL.md

---

**Happy Scanning! 🌾📸🎤**
