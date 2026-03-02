# AWS Amplify Deployment - Step-by-Step Guide

> **Note:** The Amplify CLI requires interactive input for security reasons. This guide walks you through the manual process.

## Current Status

✅ Amplify CLI is installed  
✅ AWS credentials configured  
✅ Project code ready to deploy

## One-Time Setup (5 minutes)

### Step 1: Initialize Amplify Project

Run this command:

```bash
amplify init
```

When prompted, use these values:

| Prompt | Value | Notes |
|--------|-------|-------|
| Continue with Amplify Gen 1? | `y` | We use Gen 1 for stability |
| Project name | `harvelogixai` | No spaces or special chars |
| Environment name | `dev` | First environment |
| Default editor | `vscode` | Or your choice |
| Type of app | `javascript` | For React |
| Framework | `react` | Our frontend framework |
| Source directory | `web-dashboard` | Where React code is |
| Build command | `npm run build` | Vite default |
| Start command | `npm run preview` | Local preview |
| Distribution directory | `web-dashboard/dist` | Vite output folder |
| Deploy all resources | `y` | Easier for initial setup |

**What this does:**
- Creates `amplify/` directory in your project
- Connects to your AWS account
- Creates CloudFormation stack for backend resources
- Generates `aws-exports.js` for frontend

**Time:** 2-3 minutes

### Step 2: Add Hosting

After init completes, run:

```bash
amplify add hosting
```

Choose:
- **Hosting provider:** Amplify Console (Managed hosting)
- **Drag and drop:** No
- **Deploy all resources:** Yes

**What this does:**
- Sets up S3 bucket for frontend files
- Configures CloudFront CDN
- Creates CI/CD pipeline setup

**Time:** 30 seconds

### Step 3: Publish to AWS (First Deploy)

```bash
amplify publish
```

When asked "Are you sure you want to continue?" → Say `yes`

**What this does:**
1. Installs dependencies (`npm install`)
2. Builds React app (`npm run build`)
3. Uploads to S3
4. Invalidates CloudFront cache
5. Returns a live URL like `https://dxxxxxx.cloudfront.net`

**Time:** 5-10 minutes (first time is slower)

**Output you'll see:**
```
✔ Deployed frontend
✔ Hosted URL: https://dxxxxxx.cloudfront.net
```

🎉 **Your app is now live!**

---

## After Initial Setup

### Redeploy After Code Changes

```bash
amplify publish
```

Takes 1-2 minutes on subsequent deployments.

### Connect GitHub for Auto-Deploy

Once deployment is working:

1. Go to **AWS Amplify Console** → Your app
2. Click **Connect repository**
3. Authorize GitHub → Select your repo
4. Choose branch: `main`
5. Build settings auto-detected

Now every `git push` triggers auto-deployment! 🚀

### View Backend Resources

```bash
amplify console
```

Opens AWS Console to see:
- CloudFormation stack
- S3 bucket
- CloudFront distribution
- Build logs

### Add Environment Variables

If backend needs API endpoint:

```bash
amplify env add
```

Then set in frontend:
```javascript
// src/config.js
export const API_URL = process.env.REACT_APP_API_URL;
```

---

## Troubleshooting

**Q: "AWS credentials not found"**
```bash
aws configure
# Enter your AWS Access Key ID and Secret
```

**Q: "Amplify CLI not installed"**
```bash
npm install -g @aws-amplify/cli
```

**Q: Build fails with "Can't find module X"**
```bash
cd web-dashboard
npm install
```

**Q: CloudFront distribution stuck in "InProgress"**
- Wait 5-10 minutes and check again
- Or delete and redeploy: `amplify delete` then `amplify init`

**Q: Want to delete and start over?**
```bash
amplify delete
# This removes all AWS resources except the Git repo
```

---

## Local Testing

Before deploying, test locally:

```bash
cd web-dashboard
npm run dev
# Open http://localhost:5173
```

---

## Cost Estimates (AWS Free Tier)

As of 2026, free tier covers:

| Service | Free Tier | Our Usage |
|---------|-----------|-----------|
| S3 | 5 GB | ~10 MB | ✅ OK |
| CloudFront | 1 TB egress/mo | ~50 MB | ✅ OK |
| Build minutes | 1000 min/mo | ~5-10 min | ✅ OK |
| Pricing | | + pay-as-you-go | Low cost |

**Typical monthly cost:** $0-2 for small projects

---

## Next Steps

1. Run `amplify init` from the project root
2. Follow the prompts above
3. Run `amplify add hosting`
4. Run `amplify publish`
5. Share the live URL! 🎉

Good luck! 🚀
