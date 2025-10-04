# 🔍 Check Render Status - DeepAI Still Getting 502 Errors

## **Current Issue:** Still getting 502 errors means API key not added to Render yet

---

## **Step 1: Verify Current Status**

**Open this URL in your browser:** 
```
https://zinema-clvk.onrender.com/api/deepai/health
```

### **If you see this (NEEDS SETUP):**
```json
{
  "status": "missing_api_key",
  "hasApiKey": false,
  "message": "GEMINI_API_KEY environment variable is not set"
}
```
**→ API key not added to Render yet**

### **If you see this (CONFIGURED):**
```json
{
  "status": "configured",
  "hasApiKey": true,
  "message": "DeepAI service is properly configured"
}
```
**→ API key is configured properly**

---

## **Step 2: Add API Key to Render (If Missing)**

### 2.1 Go to Render Dashboard
**Open:** https://render.com and sign in

### 2.2 Find Your Backend Service
- Look for service named "zinema" or similar
- Click on it

### 2.3 Check Environment Variables
- Click **"Environment"** in left sidebar
- Look for `GEMINI_API_KEY` variable
- If missing, add it:

### 2.4 Add Environment Variable
- Click **"Add Environment Variable"**
- **Key:** `GEMINI_API_KEY`
- **Value:** `AIzaSyAC11SMd2r8EAmHlXO5ZgjBKPa3ulN0GlU`
- Click **"Save Changes"**

### 2.5 Wait for Redeploy
- Render will automatically redeploy
- Watch **"Events"** tab for "Deploy succeeded"
- Usually takes 2-3 minutes

---

## **Step 3: Force Manual Deploy (If Needed)**

If automatic deploy doesn't happen:
- Click **"Manual Deploy"** button
- Select **"Deploy latest commit"**
- Wait for completion

---

## **Step 4: Test Again**

After deployment completes:
1. **Refresh:** https://zinema-clvk.onrender.com/api/deepai/health
2. **Should show:** `{"status":"configured","hasApiKey":true}`
3. **Test app:** DeepAI chat should work without 502 errors

---

## **Common Issues:**

❌ **Forgot to click "Save Changes"** - Environment variable not saved
❌ **Service didn't redeploy** - Need to manually deploy
❌ **Typo in API key** - Copy/paste exactly: `AIzaSyAw5KOWC-_4_t4TVagYL6Fz1qwzgQE5dqY`
❌ **Wrong service** - Make sure you're editing the backend service, not frontend

---

## **Screenshots of What You Should See:**

### Render Environment Tab:
```
Environment Variables:
✅ GEMINI_API_KEY = AIzaSyAw5KOWC-_4_t4TVagYL6Fz1qwzgQE5dqY
```

### Health Check Success:
```json
{"status":"configured","hasApiKey":true}
```

---

**Check the health URL first, then follow the steps if it shows "missing_api_key"!** 🔧
