# Quick Start Guide - HarveLogix Multimodal AI Scanner

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git installed

### Step 1: Clone & Install (2 minutes)

```bash
# Clone repository (if not already done)
git clone https://github.com/your-org/harvelogix-ai.git
cd harvelogix-ai

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../web-dashboard
npm install
```

### Step 2: Start Backend (1 minute)

```bash
cd backend
npm start
```

You should see:
```
🚀 HarveLogix AI Backend Server
📍 Running on http://localhost:5000
```

### Step 3: Start Frontend (1 minute)

In a new terminal:
```bash
cd web-dashboard
npm run dev
```

You should see:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:3000
```

### Step 4: Open AI Scanner (1 minute)

1. Open browser: http://localhost:3000
2. Click "AI Scanner" in sidebar
3. Try uploading an image or recording audio

---

## 📋 What You Can Do

### 1. Crop Health Scan
- Upload a crop image
- Get instant health assessment
- See detected issues and recommendations

### 2. Field Irrigation Scan
- Upload a field image
- Get irrigation status
- See water-saving tips

### 3. Sky & Weather Scan
- Upload a sky image
- Get weather forecast
- See harvest window advice

### 4. Voice Assistant
- Record a question in English or Hindi
- Get AI-powered response
- See transcript and confidence score

### 5. Video Scan
- Upload a field video
- Get aggregated insights
- See overall health score

---

## 🎯 Demo Mode Features

All features work with **demo data** - no AWS account needed!

- ✅ Image capture (file upload + camera)
- ✅ Audio recording (microphone)
- ✅ Video upload
- ✅ Realistic AI responses
- ✅ Error handling
- ✅ Multiple languages
- ✅ Light/dark theme

---

## 🔧 Configuration

### Environment Variables

Create `.env` file in `backend/` directory:

```bash
# Demo mode (default)
VITE_USE_DEMO_DATA=true
USE_DEMO_DATA=true

# For AWS deployment (later)
# AWS_REGION=us-east-1
# S3_BUCKET_NAME=harvelogix-multimodal
# DB_HOST=your-rds-endpoint
```

### Frontend Configuration

Frontend automatically uses demo data when backend is running.

---

## 📱 Testing the Features

### Test Crop Health Scan
```bash
# Using curl
curl -X POST http://localhost:5000/api/multimodal/crop-health \
  -F "media=@test-image.jpg"
```

### Test Voice Query
```bash
# Using curl
curl -X POST http://localhost:5000/api/multimodal/voice-query \
  -F "media=@test-audio.wav"
```

---

## 🌍 Language Support

The app supports 8 languages:
- English (en)
- Hindi (hi)
- Tamil (ta)
- Telugu (te)
- Malayalam (ml)
- Kannada (kn)
- Gujarati (gu)
- Marathi (mr)

Switch languages in the navbar.

---

## 🎨 Theme Support

Toggle between light and dark themes in the navbar.

---

## 📊 API Endpoints

All endpoints are available at `http://localhost:5000/api/multimodal/`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/crop-health` | POST | Analyze crop health |
| `/field-irrigation` | POST | Assess irrigation |
| `/sky-weather` | POST | Analyze weather |
| `/voice-query` | POST | Process voice query |
| `/video-scan` | POST | Analyze video |
| `/scans/:farmerId` | GET | Get recent scans |
| `/scan/:scanId` | GET | Get scan details |

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>

# Try again
npm start
```

### Frontend won't load
```bash
# Check if port 3000 is in use
lsof -i :3000

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### API calls failing
```bash
# Check backend is running
curl http://localhost:5000/api/health

# Check CORS is enabled
# Should see: {"status":"ok","timestamp":"..."}
```

### File upload not working
- Check file size (max 50MB)
- Check file type (JPEG, PNG for images)
- Check browser console for errors

---

## 📚 Next Steps

### For Local Development
1. ✅ You're done! Start building features
2. Modify components in `web-dashboard/src/`
3. Modify services in `backend/services/`
4. Changes auto-reload in dev mode

### For AWS Deployment
1. Read: `infrastructure/AWS_SETUP_GUIDE.md`
2. Follow: `DEPLOYMENT_CHECKLIST.md`
3. Deploy: EC2, Bedrock, Lambda, RDS

### For Production
1. Build frontend: `npm run build`
2. Deploy to S3 + CloudFront
3. Deploy backend to EC2
4. Configure RDS database
5. Enable Bedrock models

---

## 📖 Documentation

- **Setup Guide**: `infrastructure/AWS_SETUP_GUIDE.md`
- **Deployment**: `DEPLOYMENT_CHECKLIST.md`
- **Progress**: `IMPLEMENTATION_PROGRESS.md`
- **AWS Summary**: `.kiro/AWS_IMPLEMENTATION_SUMMARY.md`
- **Spec**: `.kiro/specs/multimodal-ai-scanner/`

---

## 🎓 Learning Resources

### Frontend
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- Lucide Icons: https://lucide.dev

### Backend
- Express.js: https://expressjs.com
- Multer: https://github.com/expressjs/multer
- AWS SDK: https://docs.aws.amazon.com/sdk-for-javascript

### AWS
- Bedrock: https://docs.aws.amazon.com/bedrock
- Lambda: https://docs.aws.amazon.com/lambda
- RDS: https://docs.aws.amazon.com/rds
- S3: https://docs.aws.amazon.com/s3

---

## 💡 Tips & Tricks

### Speed Up Development
```bash
# Use npm ci for faster installs
npm ci

# Use npm run dev for hot reload
npm run dev

# Use browser DevTools for debugging
F12 or Cmd+Option+I
```

### Test with Real Images
```bash
# Use sample images from web
# Or take photos with your phone
# Upload to test different scenarios
```

### Monitor API Calls
```bash
# Open browser DevTools
# Go to Network tab
# Make API calls
# See request/response details
```

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Kill process: `kill -9 <PID>` |
| Module not found | Run: `npm install` |
| CORS error | Check backend is running |
| File too large | Max 50MB, compress image |
| Camera not working | Check browser permissions |
| Microphone not working | Check browser permissions |

---

## 📞 Support

- **Issues**: Check GitHub issues
- **Docs**: Read documentation files
- **AWS Help**: https://console.aws.amazon.com/support
- **Community**: Stack Overflow, GitHub Discussions

---

## 🎉 You're Ready!

You now have a fully functional multimodal AI scanner running locally with demo data.

**Next**: Try uploading an image or recording audio to see it in action!

---

**Last Updated**: March 1, 2026
**Version**: 1.0.0
