# 🚀 Railway Deployment Guide for Zinema Backend

## ✅ **Railway Configuration Steps**

### 1. **Set Root Directory in Railway Dashboard**
- Go to your Railway project dashboard
- Click on **Settings** → **Source**
- Set **Root Directory** to: `server`
- This tells Railway to only work with the server folder

### 2. **Environment Variables**
Add these environment variables in Railway dashboard under **Variables**:

```env
MONGODB_URI=mongodb+srv://Deepak:123@cluster0.5pdgn48.mongodb.net
CLERK_PUBLISHABLE_KEY=pk_test_ZHJpdmVuLXBhcnJvdC01LmNsZXJrLmFjY291bnRzLmRldiQ   
CLERK_SECRET_KEY=sk_test_dBImOa1mHi3jf2DIDPejgitfvpVbnzkrh4lTfsFWCs
PORT=5000
TMDB_API_KEY=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4NTMwYWJjYjY2ZWFhN2VhZjgzYTYxYjYyMDQxYTgzMyIsIm5iZiI6MTc1NDIzMzMwOC40OTMsInN1YiI6IjY4OGY3OWRjZTg1ZTkxNDM2ZWYzZTJhMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.lZ0Gu4hAgUm8wcn1DgaQ0_0BweS90sRiXj3PuMc7Ohc
SENDER_EMAIL=deepakkl8754764540@gmail.com
SMTP_USER=957e9d001@smtp-brevo.com
SMTP_PASS=xsmtpsib-96cddd5d3cafc481a7f8bce240a0a522c89d21dd620c94d5a99b8c3b1f36a660-WxkXQCz9dpO5bhYA
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_ALT_PORT=2525
BREVO_API_KEY=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
INNGEST_EVENT_KEY=qoRilihQIKuO314WBVeXAo3P8VaDilWs3agxVI0noCnmItp9WH_X-f97DHNvDcOLLtfSYAS6VZ4VDP6Mu1-BBA
INNGEST_SIGNING_KEY=signkey-prod-079a0ad02983324a33fcfd13172ef759a20fa389da817a7ebdab4db1b76791ed
STRIPE_PUBLISHABLE_KEY=pk_test_51S7Jf0BfgnGO1jm17laYbnaTu1H4AqZrE65QIme3CIcSRVqyEbsB5HRveaUkAVY5krGIUsJWyaEzQUjRM3idLZcp00uYy5KzRD
STRIPE_SECRET_KEY=sk_test_51S7Jf0BfgnGO1jm1EzEM3k4OgUFsrcxsssnvRKkNkLbohoS0aWgMgWHczNi5zCv7VbPeetyf9sjZxfHY1VgHp46L00pkEF5i07
STRIPE_WEBHOOK_SECRET=whsec_jFWWzI0YHY2czvciF376kJlwcEPmPqlW
```

### 3. **Deploy Settings**
- **Build Command:** `npm install` (Railway will run this in the server directory)
- **Start Command:** `npm start` (Railway will run this in the server directory)
- **Port:** Railway will automatically assign a port (don't set PORT=5000)

### 4. **After Deployment**
Once deployed, you'll get a URL like: `https://your-app-name.railway.app`

### 5. **Update Frontend Configuration**
Update `client/src/config/api.js`:
```javascript
export const API_CONFIG = {
  BASE_URL: 'https://your-app-name.railway.app',
  API_URL: 'https://your-app-name.railway.app/api',
  // ... rest of config
}
```

### 6. **Test Your Backend**
- Visit: `https://your-app-name.railway.app` (should show "Server is Live!")
- Test API: `https://your-app-name.railway.app/api/show/all`

## 🔧 **Troubleshooting**

### If Build Still Fails:
1. **Check Root Directory** is set to `server`
2. **Verify Environment Variables** are all added
3. **Check Build Logs** for specific errors
4. **Try Manual Deploy** from Railway dashboard

### Common Issues:
- **Missing Environment Variables** → Add all variables from server/.env
- **Wrong Root Directory** → Set to `server` not root
- **Port Issues** → Don't set PORT=5000, let Railway assign it
- **Dependencies** → Railway will install from server/package.json

## 🎯 **Success Indicators**
- ✅ Build completes without errors
- ✅ Backend URL shows "Server is Live!"
- ✅ API endpoints respond correctly
- ✅ Frontend can connect to backend
