# Underwater 2 - Financial Planning App

## Project Overview
A full-stack financial planning application with:
- **Frontend**: Static site (HTML/CSS/JS) - Deploy to Vercel
- **Backend**: Node.js/Express API with MongoDB - Deploy to Railway
- **Database**: MongoDB Atlas

## Current Status
- Configured for separate deployments (Vercel frontend, Railway backend)
- CORS and environment variables set up for cross-platform communication

## Deployment Instructions

### Backend (Railway)
1. Push backend folder to Railway
2. Set environment variables in Railway dashboard:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `CORS_ORIGINS`: Include your Vercel frontend URL
   - `PORT`: 5000

### Frontend (Vercel)
1. Push frontend folder to Vercel
2. Set environment variables:
   - `VITE_API_BASE_URL`: Your Railway backend URL (e.g., https://your-app.up.railway.app)
3. Frontend automatically injects the API URL from environment variables

## Key Files
- `backend/server.js`: Express server with CORS configuration
- `frontend/js/config.js`: API wrapper that uses window.__API_BASE_URL__
- `backend/.env.example`: Environment variables template
- `frontend/.env.example`: Vercel environment variables template

## Recent Changes (Nov 30, 2025)
- Fixed CORS to accept environment variable instead of hardcoded origin
- Added environment variable support for both deployments
- Created Vercel and Railway configuration files
- Updated server to listen on 0.0.0.0 (required for Railway)
