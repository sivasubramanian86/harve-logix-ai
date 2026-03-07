#!/bin/bash
# HarveLogix AI - AWS Amplify Deployment Guide
# Run this script step-by-step to deploy to AWS Amplify

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 HarveLogix AI - AWS Amplify Deployment"
echo "=========================================="
echo ""
echo "This script will:"
echo "  1. Initialize an Amplify project"
echo "  2. Configure hosting"
echo "  3. Build and publish to AWS"
echo ""
echo "Prerequisites:"
echo "  ✓ AWS CLI configured with credentials"
echo "  ✓ Amplify CLI installed globally"
echo ""

# Check AWS credentials
echo "🔐 Verifying AWS credentials..."
aws sts get-caller-identity || {
    echo "❌ AWS CLI not configured. Run: aws configure"
    exit 1
}

# Check Amplify CLI
echo "✓ AWS credentials verified"
echo ""

# Step 1: Initialize Amplify
if [ ! -d "amplify" ]; then
    echo "🔧 STEP 1: Initialize Amplify Project"
    echo "======================================"
    echo ""
    echo "When prompted, provide the following values:"
    echo ""
    echo "  Project name: harvelogixai"
    echo "  Environment: dev"
    echo "  Default editor: visual studio code (or your choice)"
    echo "  App type: javascript"
    echo "  Framework: react"
    echo "  Source directory path: web-dashboard"
    echo "  Distribution directory path: web-dashboard/dist"
    echo "  Build command: npm run build"
    echo "  Start command: npm run preview"
    echo "  Use a profile? (Y/n): n"
    echo "  Allow unauthenticated logins: (Y/n): y"
    echo ""
    read -p "Press ENTER to continue with amplify init..."
    
    amplify init
else
    echo "✓ Amplify project already initialized"
fi

echo ""

# Step 2: Add Hosting
if [ ! -d "amplify/backend/hosting" ]; then
    echo "🏠 STEP 2: Configure Hosting"
    echo "============================"
    echo ""
    echo "When prompted:"
    echo "  - Select: Hosting with Amplify Console"
    echo "  - Drag and drop is useful: (Y/n) n"
    echo ""
    read -p "Press ENTER to continue with amplify add hosting..."
    
    amplify add hosting
else
    echo "✓ Hosting already configured"
fi

echo ""

# Step 3: Publish
echo "📦 STEP 3: Building and Publishing to AWS"
echo "=========================================="
echo ""
echo "This will:"
echo "  1. Build the React dashboard"
echo "  2. Create S3 bucket and CloudFront distribution"
echo "  3. Deploy to AWS Amplify"
echo ""
echo "This may take 5-10 minutes on first deployment."
echo ""
read -p "Press ENTER to start deployment..."

amplify publish

echo ""
echo "✨ Deployment Complete!"
echo "======================"
echo ""
echo "Your app is now live!"
echo ""
echo "Next steps:"
echo "  1. View your live app URL above"
echo "  2. To view logs: amplify console"
echo "  3. To make changes, commit and push to GitHub"
echo "  4. Amplify will auto-deploy on push if connected to GitHub"
echo ""
echo "To add your backend API:"
echo "  export REACT_APP_API_URL=https://your-api-endpoint.com"
echo "  amplify publish"
echo ""
