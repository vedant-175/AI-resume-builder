# Render Deployment Guide

This guide walks you through deploying your AI Resume Builder to [Render](https://render.com).

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com) (free tier available)
2. **GitHub Repository**: Push your code to GitHub
3. **GROQ API Key**: Get a free key at [console.groq.com](https://console.groq.com) (recommended)
4. **Node.js Setup**: Ensure both `resume-ai/` and `server/` folders are properly configured

## Deployment Steps

### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Setup Render deployment"
git push origin main
```

### Step 2: Create a New Web Service on Render

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Fill in the configuration:
   - **Name**: `resume-ai-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or paid if needed)

### Step 3: Add Environment Variables

In the Render dashboard, add these environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `10000` | Render's default port |
| `GROQ_API_KEY` | Your API key | Get from [console.groq.com](https://console.groq.com) |
| `GROQ_MODEL` | `llama-3.1-8b-instant` | Or your preferred model |
| `AI_PROVIDER` | `groq` | Which AI provider to use |

### Step 4: Deploy

1. Click **Create Web Service**
2. Render will automatically:
   - Build the frontend (React/TypeScript)
   - Install server dependencies
   - Start the application
3. Your app will be available at: `https://resume-ai-backend.onrender.com`

## Project Structure

The deployment is configured to:
- **Build Phase**: Builds the React frontend → `resume-ai/dist/`
- **Runtime**: Backend server serves the frontend as static files
- **API Routes**: `/api/*` endpoints are handled by the Express server
- **SPA Fallback**: Unmatched routes serve `index.html` for React Router

## File Changes Made

- ✅ `render.yaml` - Render deployment configuration
- ✅ `package.json` - Root-level package.json with build scripts
- ✅ `server/src/index.js` - Now serves the built frontend
- ✅ `server/package.json` - Added build script

## Troubleshooting

### Build Fails
- Check that `resume-ai/package.json` has all dependencies installed locally first
- Verify TypeScript compilation: `npm run build` in `resume-ai/` folder

### Environment Variables Not Working
- Ensure you added them in the Render dashboard (not in `.env` file)
- Render doesn't read `.env` files in production

### API Calls Fail
- Check GROQ_API_KEY is set correctly
- Verify the API provider is set to `groq` or `gemini`
- Check the health endpoint: `https://your-app.onrender.com/api/health`

### Free Tier Limitations
- Apps spin down after 15 minutes of inactivity
- 50 hours/month CPU time
- For production, upgrade to a paid instance

## Local Testing

Before deploying, test the build locally:

```bash
# Install all dependencies
npm install --prefix resume-ai
npm install --prefix server

# Build the frontend
npm run build --prefix resume-ai

# Start the server (it will serve the frontend)
npm start
```

Then visit `http://localhost:10000`

## Monitoring & Logs

In the Render dashboard:
- **Logs**: View real-time logs to debug issues
- **Metrics**: Monitor CPU, memory, and request rates
- **Drain Logs**: Check connection logs

## Auto-Deploys

Render will automatically redeploy when you push to GitHub (if you connected the repo during setup). To trigger manual deploys:
1. Go to your service in Render dashboard
2. Click **Manual Deploy** → **Deploy latest commit**

## Next Steps

- Set up a custom domain (in Render settings)
- Enable auto-deploy on every push
- Monitor logs for any runtime errors
- Upgrade from free tier if needed

## Support

- Render Docs: https://render.com/docs
- Common Issues: https://render.com/docs/deploy-node-express-app
