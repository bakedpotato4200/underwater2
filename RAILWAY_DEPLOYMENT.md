# Railway Deployment Guide

## Prerequisites
- Railway account (https://railway.app)
- GitHub repository with code pushed

## Environment Variables for Railway

Set these in Railway dashboard under "Variables":

```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=underwaterdb
JWT_SECRET=your_secure_secret_key_here
```

## Deployment Steps

1. **Connect to GitHub**
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Authorize and select this repository

2. **Configure Build & Deploy**
   - Railway auto-detects Node.js from package.json
   - Build command: `npm install` (automatic)
   - Start command: `npm start --prefix backend` (set in Procfile or Railway config)

3. **Set Environment Variables**
   - Go to project settings
   - Add all variables from Environment Variables section above
   - Replace example values with your actual credentials

4. **MongoDB Setup**
   - Use existing MongoDB Atlas URI or add Railway's PostgreSQL as database
   - Add MONGO_URI to Railway environment variables

5. **Deploy**
   - Railway automatically deploys on GitHub push
   - Monitor build logs in dashboard
   - App will be live at: https://your-app.up.railway.app

## Key Configuration
- Backend server binds to `0.0.0.0` (required for Railway)
- Reads PORT from environment variable
- CORS enabled for all origins (production: restrict this)
- Frontend served from backend at `/`

## Production Notes
- Update CORS origin whitelist before production
- Use strong JWT_SECRET (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- Enable HTTPS (automatic on Railway)
- Monitor logs in Railway dashboard
