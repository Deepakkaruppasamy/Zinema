# DeepAI Setup Guide

## 🔧 **Setup Instructions**

### 1. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variables

#### For Local Development:
Create a `.env` file in the `server` directory:

```bash
# In server/.env
GEMINI_API_KEY=your_actual_google_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-pro
```

#### For Production (Render/Railway/Vercel):
Add these environment variables in your hosting platform:

```bash
GEMINI_API_KEY=your_actual_google_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-pro
```

### 3. Verify Configuration

Check if DeepAI is properly configured:

```bash
# Local test
curl http://localhost:5000/api/deepai/health

# Production test
curl https://your-app.onrender.com/api/deepai/health
```

Expected response when configured:
```json
{
  "status": "configured",
  "hasApiKey": true,
  "modelName": "gemini-1.5-pro",
  "message": "DeepAI service is properly configured"
}
```

### 4. Test DeepAI Functionality

```bash
# Test the assistant endpoint
curl -X POST https://your-app.onrender.com/api/deepai/assistant \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","text":"Hello"}],"user":{}}'
```

## 🔍 **Common Issues & Solutions**

### Issue 1: "GEMINI_API_KEY is not configured"
**Solution:** Set the GEMINI_API_KEY environment variable

### Issue 2: "Gemini model not found"
**Solution:** Use `gemini-1.5-pro` instead of `gemini-1.5-pro-latest`

### Issue 3: "Gemini API access denied"
**Solution:** Check your API key is valid and has quota remaining

### Issue 4: Frontend shows "DeepAI is unavailable"
**Solution:** 
1. Check backend health endpoint
2. Verify environment variables are set
3. Check browser console for specific errors

## 📋 **Valid Gemini Models**

- ✅ `gemini-1.5-pro` (Recommended)
- ✅ `gemini-1.0-pro` (Basic version)
- ❌ `gemini-1.5-pro-latest` (Invalid)
- ❌ `gemini-1.5-flash` (Not available in v1beta)

## 🚀 **Deployment Steps**

1. **Update Environment Variables** in your hosting platform
2. **Redeploy** your backend service
3. **Test** the health endpoint
4. **Verify** DeepAI works in the frontend

## 🎯 **Features Enabled**

Once configured, DeepAI provides:
- ✅ Movie recommendations
- ✅ Seat availability checks
- ✅ Movie comparisons
- ✅ Site navigation help
- ✅ General movie knowledge
- ✅ Opinion-based suggestions
