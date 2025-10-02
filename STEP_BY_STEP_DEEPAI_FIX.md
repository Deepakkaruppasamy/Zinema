# 🚀 Step-by-Step DeepAI Fix

## **Current Issue:** 502 Bad Gateway errors because GEMINI_API_KEY is missing

---

## **Step 1: Get Google Gemini API Key** 🔑

### 1.1 Open Google AI Studio
- **Click this link:** https://makersuite.google.com/app/apikey
- Sign in with your Google account

### 1.2 Create API Key
- Click the **"Create API Key"** button
- Choose **"Create API key in new project"** (recommended)
- Copy the generated key (it will look like: `AIza...`)
- **⚠️ IMPORTANT:** Save this key somewhere safe - you won't see it again!

---

## **Step 2: Add API Key to Render** ⚙️

### 2.1 Login to Render
- Go to: https://render.com
- Sign in to your account

### 2.2 Find Your Backend Service
- Look for your service (likely named "zinema" or similar)
- Click on it to open the service dashboard

### 2.3 Add Environment Variable
- In the left sidebar, click **"Environment"**
- Click **"Add Environment Variable"**
- Fill in:
  - **Key:** `GEMINI_API_KEY`
  - **Value:** [Paste your API key from Step 1]
- Click **"Save Changes"**

### 2.4 Add Model Configuration (Optional but recommended)
- Click **"Add Environment Variable"** again
- Fill in:
  - **Key:** `GEMINI_MODEL`
  - **Value:** `gemini-1.5-pro`
- Click **"Save Changes"**

---

## **Step 3: Wait for Redeploy** 🚀

### 3.1 Automatic Deployment
- Render will automatically start redeploying your service
- Watch the **"Events"** tab to see deployment progress
- Wait for "Deploy succeeded" message

### 3.2 Manual Deploy (if needed)
- If automatic deployment doesn't start, click **"Manual Deploy"**
- Select **"Deploy latest commit"**
- Wait for completion

---

## **Step 4: Test the Fix** ✅

### 4.1 Quick Health Check
Open this URL in your browser:
```
https://zinema-clvk.onrender.com/api/deepai/health
```

**Expected Result (SUCCESS):**
```json
{
  "status": "configured",
  "hasApiKey": true,
  "modelName": "gemini-1.5-pro",
  "message": "DeepAI service is properly configured"
}
```

**If you see this (STILL NEEDS SETUP):**
```json
{
  "status": "missing_api_key",
  "hasApiKey": false,
  "message": "GEMINI_API_KEY environment variable is not set"
}
```

### 4.2 Test in Your App
- Go to your Zinema app: https://zinema-mu.vercel.app
- Click the DeepAI chat button (💬 icon)
- Send a test message like "Hello"
- Should get a response without 502 errors

---

## **Step 5: Troubleshooting** 🔍

### If you still get 502 errors:

1. **Check Render Logs**
   - In Render dashboard → click **"Logs"** tab
   - Look for any error messages

2. **Verify Environment Variables**
   - Go back to **"Environment"** tab
   - Make sure `GEMINI_API_KEY` is listed
   - Check there are no typos

3. **Force Redeploy**
   - Click **"Manual Deploy"** → **"Deploy latest commit"**
   - Wait for "Deploy succeeded"

4. **Check API Key**
   - Make sure your API key starts with `AIza`
   - Try creating a new API key if current one doesn't work

---

## **What This Fixes** 🎯

Once completed, your DeepAI will:
- ✅ Respond to user messages
- ✅ Recommend movies
- ✅ Check seat availability
- ✅ Compare movies
- ✅ Help with site navigation
- ✅ Answer general movie questions

---

## **Need Help?** 📞

If you get stuck on any step:
1. Check the specific error in Render logs
2. Verify your Google AI Studio API key is active
3. Make sure you clicked "Save Changes" after adding environment variables
4. Wait for the deployment to complete before testing

**Most common issue:** Forgetting to save environment variables or not waiting for redeploy to complete.
