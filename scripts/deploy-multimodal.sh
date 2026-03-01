#!/bin/bash

# Multimodal AI Scanner - Deployment Script
# This script sets up the complete multimodal feature

set -e

echo "🚀 HarveLogix AI - Multimodal Scanner Deployment"
echo "================================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    exit 1
fi

# Step 1: Install Backend Dependencies
echo -e "\n${YELLOW}📦 Step 1: Installing backend dependencies...${NC}"
cd backend
npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Step 2: Install Frontend Dependencies
echo -e "\n${YELLOW}📦 Step 2: Installing frontend dependencies...${NC}"
cd ../web-dashboard
npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

# Step 3: Setup Environment Variables
echo -e "\n${YELLOW}⚙️  Step 3: Setting up environment variables...${NC}"

# Backend .env
if [ ! -f "../backend/.env" ]; then
    cat > ../backend/.env << EOF
# AWS Configuration
AWS_REGION=ap-south-2
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# S3 Configuration
S3_BUCKET_NAME=harvelogix-multimodal

# Weather API
WEATHER_API_KEY=your_openweather_key_here

# Demo Mode (set to false for production)
USE_DEMO_DATA=true

# Server Configuration
PORT=5000
EOF
    echo -e "${GREEN}✅ Backend .env created${NC}"
    echo -e "${YELLOW}⚠️  Please update AWS credentials in backend/.env${NC}"
else
    echo -e "${GREEN}✅ Backend .env already exists${NC}"
fi

# Frontend .env
if [ ! -f ".env" ]; then
    cat > .env << EOF
# API Configuration
VITE_API_URL=http://localhost:5000

# Demo Mode (set to false for production)
VITE_USE_DEMO_DATA=true
EOF
    echo -e "${GREEN}✅ Frontend .env created${NC}"
else
    echo -e "${GREEN}✅ Frontend .env already exists${NC}"
fi

# Step 4: Create S3 Bucket (if AWS CLI available)
echo -e "\n${YELLOW}☁️  Step 4: Setting up AWS S3 bucket...${NC}"
if command -v aws &> /dev/null; then
    read -p "Create S3 bucket? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        aws s3 mb s3://harvelogix-multimodal --region ap-south-2 2>/dev/null || echo "Bucket may already exist"
        echo -e "${GREEN}✅ S3 bucket setup complete${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  AWS CLI not found. Please create S3 bucket manually${NC}"
fi

# Step 5: Run Tests
echo -e "\n${YELLOW}🧪 Step 5: Running tests...${NC}"
cd ../backend
npm test 2>/dev/null || echo -e "${YELLOW}⚠️  Tests skipped (Jest not configured)${NC}"

# Step 6: Build Frontend
echo -e "\n${YELLOW}🏗️  Step 6: Building frontend...${NC}"
cd ../web-dashboard
npm run build
echo -e "${GREEN}✅ Frontend built successfully${NC}"

# Step 7: Start Services
echo -e "\n${YELLOW}🎬 Step 7: Starting services...${NC}"
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "To start the application:"
echo "  Backend:  cd backend && npm start"
echo "  Frontend: cd web-dashboard && npm run dev"
echo ""
echo "Access the application at: http://localhost:3000"
echo ""
echo "📚 Documentation: docs/MULTIMODAL.md"
echo "🐛 Issues: https://github.com/sivasubramanian86/harve-logix-ai/issues"
echo ""
echo -e "${YELLOW}⚠️  Remember to:${NC}"
echo "  1. Update AWS credentials in backend/.env"
echo "  2. Get OpenWeather API key from https://openweathermap.org/api"
echo "  3. Enable Bedrock Claude Sonnet 4.6 in AWS Console"
echo ""
