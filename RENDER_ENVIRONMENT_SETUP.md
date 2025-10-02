# Setting Up Environment Variables on Render

## 🔑 **Step 1: Get Google Gemini API Key**

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key (starts with `AIza...`)

## ⚙️ **Step 2: Add Environment Variable to Render**

1. **Log into Render Dashboard**
   - Go to [render.com](https://render.com)
   - Sign in to your account

2. **Navigate to Your Service**
   - Click on your backend service (likely named "zinema" or similar)

3. **Open Environment Settings**
   - Click on "Environment" in the left sidebar
   - Or go to the "Environment" tab

4. **Add the Environment Variable**
   - Click "Add Environment Variable"
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your actual API key (paste the key you copied from Google AI Studio)
   - Click "Save Changes"

5. **Optional: Add Model Configuration**
   - Add another environment variable:
   - **Key**: `GEMINI_MODEL`
   - **Value**: `gemini-1.5-pro`

## 🚀 **Step 3: Redeploy Your Service**

After adding the environment variables:

1. **Automatic Redeploy**: Render usually redeploys automatically when environment variables change
2. **Manual Redeploy**: If not, click "Manual Deploy" → "Deploy latest commit"
3. **Wait for Deployment**: Wait for the deployment to complete (check the logs)

## ✅ **Step 4: Verify the Fix**

Once deployed, test the endpoints:

1. **Health Check**:
   ```
   https://zinema-clvk.onrender.com/api/deepai/health
   ```
   Should return: `{"status":"configured","hasApiKey":true}`

2. **Test DeepAI**:
   - Open your app
   - Click the DeepAI chat button
   - Send a test message
   - Should work without 502 errors

## 🔍 **Troubleshooting**

### If you still get 502 errors:

1. **Check Logs**: In Render dashboard → "Logs" tab to see error details
2. **Verify API Key**: Make sure the API key is correct and active
3. **Check Quotas**: Ensure your Google AI Studio account has API quota remaining

### Common Issues:

- ❌ **Wrong API Key Format**: Should start with `AIza`
- ❌ **Quota Exceeded**: Check Google AI Studio usage limits
- ❌ **Environment Variable Not Saved**: Make sure you clicked "Save Changes"
- ❌ **Old Deployment**: Make sure the service redeployed after adding variables

## 📞 **Still Need Help?**

If issues persist:
1. Check the Render logs for specific error messages
2. Verify your Google AI Studio API key is active
3. Try creating a new API key if the current one isn't working
