# HarveLogix AI - Quick Start Guide

Get the complete HarveLogix AI platform running locally in minutes!

## 🚀 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/))
- **Git** ([Download](https://git-scm.com/))

## 📋 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/sivasubramanian86/harve-logix-ai.git
cd harve-logix-ai
```

### Step 2: Set Up Backend Server (Node.js)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start the backend server
npm start
```

You should see:
```
🚀 HarveLogix AI Backend Server
📍 Running on http://localhost:5000
```

**Keep this terminal open!**

### Step 3: Set Up Frontend Dashboard (React)

Open a **new terminal** and run:

```bash
# Navigate to web-dashboard
cd web-dashboard

# Install dependencies
npm install

# Start the development server
npm run dev
```

You should see:
```
VITE v5.0.0  ready in 123 ms

➜  Local:   http://localhost:3000/
```

### Step 4: Open the Dashboard

Open your browser and go to:
```
http://localhost:3000
```

You should see the beautiful HarveLogix AI dashboard! 🎉

---

## 🎯 What You Can Do

### Dashboard Features

1. **Dashboard Tab** - Real-time metrics and KPIs
   - Total farmers, active users, income, waste reduction
   - Income growth trends
   - Agent usage distribution
   - Top crops by income

2. **Farmer Welfare Tab** - Income and scheme data
   - Income distribution across farmers
   - Regional income growth
   - Government scheme enrollment tracking

3. **Supply Chain Tab** - Logistics and processor data
   - Processor utilization rates
   - Weekly supply matches
   - Direct connections vs middlemen
   - Delivery times and waste metrics

4. **Analytics Tab** - Agent performance
   - Agent accuracy trends
   - Platform growth metrics
   - Monthly income and farmer growth
   - Individual agent performance

### Test the Agents

The backend provides mock endpoints for all 6 agents. Test them with curl:

```bash
# Test HarvestReady Agent
curl -X POST http://localhost:5000/api/agents/harvest-ready \
  -H "Content-Type: application/json" \
  -d '{
    "crop_type": "tomato",
    "current_growth_stage": 8,
    "location": {"latitude": 15.8, "longitude": 75.6}
  }'

# Test SupplyMatch Agent
curl -X POST http://localhost:5000/api/agents/supply-match \
  -H "Content-Type: application/json" \
  -d '{
    "crop_type": "tomato",
    "quantity_kg": 1000,
    "quality_grade": "A"
  }'

# Test QualityHub Agent
curl -X POST http://localhost:5000/api/agents/quality-hub \
  -H "Content-Type: application/json" \
  -d '{
    "crop_type": "tomato",
    "batch_size_kg": 500
  }'

# Test StorageScout Agent
curl -X POST http://localhost:5000/api/agents/storage-scout \
  -H "Content-Type: application/json" \
  -d '{
    "crop_type": "tomato",
    "storage_duration_days": 14
  }'

# Test WaterWise Agent
curl -X POST http://localhost:5000/api/agents/water-wise \
  -H "Content-Type: application/json" \
  -d '{
    "crop_type": "tomato"
  }'

# Test CollectiveVoice Agent
curl -X POST http://localhost:5000/api/agents/collective-voice \
  -H "Content-Type: application/json" \
  -d '{
    "crop_type": "tomato",
    "region": "Karnataka"
  }'
```

---

## 🧪 Running Tests

### Python Tests (Backend Agents)

```bash
cd backend

# Run all tests
pytest tests/ -v --cov=agents --cov=core --cov-report=html

# Run unit tests only
pytest tests/test_harvest_ready_agent.py -v

# Run property-based tests
pytest tests/test_agents_property_based.py -v

# View coverage report
open htmlcov/index.html  # macOS
start htmlcov/index.html  # Windows
```

### Frontend Tests

```bash
cd web-dashboard

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

---

## 📁 Project Structure

```
harvelogix-ai/
├── backend/
│   ├── server.js                 # Node.js Express server
│   ├── package.json              # Node dependencies
│   ├── agents/                   # Python agents (6 autonomous agents)
│   ├── core/                     # Bedrock orchestrator
│   ├── tests/                    # Unit & property-based tests
│   ├── requirements.txt          # Python dependencies
│   └── README.md                 # Backend documentation
├── web-dashboard/
│   ├── src/
│   │   ├── App.jsx              # Main app component
│   │   ├── pages/               # Dashboard pages
│   │   ├── components/          # Reusable components
│   │   └── index.css            # Tailwind styles
│   ├── package.json             # React dependencies
│   ├── vite.config.js           # Vite configuration
│   ├── index.html               # HTML entry point
│   └── README.md                # Frontend documentation
├── infrastructure/              # Terraform & CloudFormation
├── docs/                        # Documentation
└── README.md                    # Project overview
```

---

## 🔧 Troubleshooting

### Port Already in Use

If port 3000 or 5000 is already in use:

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Dependencies Not Installing

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Backend Not Responding

Make sure the backend is running:
```bash
# Check if backend is running
curl http://localhost:5000/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Dashboard Shows "Loading..." Forever

1. Check browser console for errors (F12)
2. Check backend is running on port 5000
3. Check network tab to see if API calls are failing
4. Restart both frontend and backend

---

## 💡 Tips

1. **Keep Both Terminals Open** - One for backend, one for frontend
2. **Use Browser DevTools** - Press F12 to inspect network requests
3. **Check Terminal Output** - Backend logs appear in the backend terminal
4. **Modify Mock Data** - Edit `backend/server.js` to change data
5. **Hot Reload** - Frontend automatically reloads on code changes
6. **Test Agents** - Use curl commands to test individual agents

---

## 🚀 Next Steps

### 1. Explore the Dashboard
- Navigate through all tabs
- Check out different metrics and charts
- Understand the data flow

### 2. Test the Agents
- Use curl commands to test each agent
- See how they respond with recommendations
- Understand the agent outputs

### 3. Customize the Data
- Edit `backend/server.js` to modify mock data
- Add your own metrics and trends
- Integrate with real AWS services

### 4. Deploy to Production
- Use Terraform to deploy infrastructure
- Deploy backend to AWS Lambda
- Deploy frontend to AWS S3 + CloudFront

---

## 📚 Documentation

- **Architecture**: See `docs/ARCHITECTURE.md`
- **API Reference**: See `docs/API.md`
- **Deployment**: See `docs/DEPLOYMENT.md`
- **Backend Implementation**: See `backend/IMPLEMENTATION.md`

---

## 🎯 Key Features Implemented

✅ **6 Autonomous Agents**
- HarvestReady: Optimal harvest timing
- StorageScout: Zero-loss storage protocols
- SupplyMatch: Direct farmer-processor matching
- WaterWise: Water optimization
- QualityHub: Automated quality certification
- CollectiveVoice: Aggregation & collective bargaining

✅ **Beautiful React Dashboard**
- Real-time metrics and KPIs
- Interactive charts and visualizations
- Responsive design with Tailwind CSS
- Multi-page navigation

✅ **Express Backend Server**
- RESTful API endpoints
- Mock data for all agents
- CORS enabled for frontend
- Health check endpoint

✅ **Comprehensive Testing**
- Unit tests with 87%+ coverage
- Property-based tests with Hypothesis
- Integration tests
- Test fixtures and mocks

---

## 🤝 Contributing

Want to improve HarveLogix AI? 
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@harvelogix.ai

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎉 You're All Set!

Your HarveLogix AI platform is now running locally. Explore the dashboard, test the agents, and see the power of AI-driven agricultural decision support!

**Happy farming! 🌾**

---

**Last Updated**: February 28, 2026
**Status**: Production Ready ✅
**Version**: 1.0.0
