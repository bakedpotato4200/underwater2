# Vercel Frontend Deployment Guide

## Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository with code pushed
- Railway backend deployed and running

## Step 1: Connect to GitHub
1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repository
4. Choose "Frontend" as the root directory

## Step 2: Set Root Directory
- **Root Directory**: `frontend`
- **Framework**: None (vanilla JavaScript)
- **Build Command**: Leave blank (static files)
- **Output Directory**: `.` (current directory)

## Step 3: Set Environment Variables
In Vercel dashboard, add this environment variable:

```
REACT_APP_API_URL=https://your-railway-backend.up.railway.app/api
```

Replace `your-railway-backend` with your actual Railway app URL.

## Step 4: Deploy
Click "Deploy" and Vercel will:
- Deploy your frontend to a live URL
- Automatically redeploy on GitHub push
- Give you a shareable link

## After Deployment
Your frontend will be live at: `https://your-vercel-app.vercel.app`

**Important**: The frontend will make API calls to your Railway backend using the `REACT_APP_API_URL` environment variable.

## Local Development
To test locally before deploying:
```bash
# No build needed - just open frontend/index.html in browser
# Or use a simple server:
python -m http.server 8000 --directory frontend
```

Then navigate to `http://localhost:8000`

## Troubleshooting CORS Issues
If you get CORS errors from Railway:
1. Check that Railway backend has CORS enabled for Vercel domain
2. Add your Vercel URL to Railway backend's CORS whitelist
3. Update backend server.js CORS settings if needed

## Environment Variables
- **REACT_APP_API_URL** - Full URL to your Railway backend API (required)
  - Example: `https://underwater-app.up.railway.app/api`
