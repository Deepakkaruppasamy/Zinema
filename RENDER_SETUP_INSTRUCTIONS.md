# 🚀 Render Environment Setup

## Your API Key: `AIzaSyAw5KOWC-_4_t4TVagYL6Fz1qwzgQE5dqY`

---

## **Step 1: Add to Render Environment Variables**

### 1.1 Go to Render Dashboard
- **Open:** https://render.com
- Sign in to your account

### 1.2 Find Your Backend Service
- Look for your service (probably named "zinema" or similar)
- Click on it to open the service dashboard

### 1.3 Add Environment Variable
- Click **"Environment"** in the left sidebar
- Click **"Add Environment Variable"**
- Enter:
  - **Key:** `GEMINI_API_KEY`
  - **Value:** `AIzaSyAC11SMd2r8EAmHlXO5ZgjBKPa3ulN0GlU`
- Click **"Save Changes"**

### 1.4 Add Model Configuration (Recommended)
- Click **"Add Environment Variable"** again
- Enter:
  - **Key:** `GEMINI_MODEL` 
  - **Value:** `gemini-1.5-pro`
- Click **"Save Changes"**

---

## **Step 2: Wait for Redeploy**
- Render will automatically redeploy your service
- Watch the **"Events"** tab for "Deploy succeeded" message
- This usually takes 2-3 minutes

---

## **Step 3: Test the Fix**

### Quick Test URL:
**Open this in your browser:** https://zinema-clvk.onrender.com/api/deepai/health

### Expected Success Response:
```json
{
  "status": "configured",
  "hasApiKey": true,
  "modelName": "gemini-1.5-pro",
  "message": "DeepAI service is properly configured"
}
```

### If Still Shows Error:
```json
{
  "status": "missing_api_key",
  "hasApiKey": false
}
```
**→ Wait a bit longer for redeploy to complete, then refresh**

---

## **Step 4: Test in Your App**
- Go to: https://zinema-mu.vercel.app
- Click the DeepAI chat button (💬)
- Send a test message: "Hello"
- Should work without 502 errors!

---

## **Screenshots to Help:**

1. **Render Environment Tab:**
   ```
   Environment Variables:
   GEMINI_API_KEY = AIzaSyAC11SMd2r8EAmHlXO5ZgjBKPa3ulN0GlU
   GEMINI_MODEL = gemini-1.5-pro
   ```

2. **Success Response:**
   ```json
   {"status":"configured","hasApiKey":true}
   ```

---

**Let me know when you've added it to Render and I'll help you test!** 🎉
