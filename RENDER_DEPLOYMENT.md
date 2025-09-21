# 🚀 Render Deployment Guide for Zinema Backend

## ✅ **Render Configuration Steps**

### 1. **Go to Render Dashboard**
- Visit [render.com](https://render.com)
- Sign up/Login with GitHub
- Click **"New +"** → **"Web Service"**

### 2. **Connect Your Repository**
- **Connect your GitHub repository** (Zinema)
- **Select the repository** from the list
- **Choose "Deploy"**

### 3. **Configure Your Web Service**

#### **Basic Settings:**
- **Name:** `zinema-backend` (or any name you prefer)
- **Environment:** `Node`
- **Region:** Choose closest to your users
- **Branch:** `main` (or your default branch)

#### **Build & Deploy Settings:**
- **Root Directory:** `server`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

#### **Advanced Settings:**
- **Node Version:** `18` (or latest)
- **Auto-Deploy:** `Yes` (deploys on every push)

### 4. **Environment Variables**
Add these in the **Environment Variables** section:

```env
MONGODB_URI=mongodb+srv://Deepak:123@cluster0.5pdgn48.mongodb.net
CLERK_PUBLISHABLE_KEY=pk_test_ZHJpdmVuLXBhcnJvdC01LmNsZXJrLmFjY291bnRzLmRldiQ   
CLERK_SECRET_KEY=sk_test_dBImOa1mHi3jf2DIDPejgitfvpVbnzkrh4lTfsFWCs
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

### 5. **Deploy!**
- Click **"Create Web Service"**
- Render will automatically start building and deploying
- Wait for deployment to complete (usually 2-5 minutes)

### 6. **Get Your Backend URL**
After successful deployment, you'll get a URL like:
`https://zinema-backend.onrender.com`

### 7. **Update Frontend Configuration**
Update `client/src/config/api.js`:
```javascript
export const API_CONFIG = {
  BASE_URL: 'https://zinema-backend.onrender.com',
  API_URL: 'https://zinema-backend.onrender.com/api',
  FRONTEND_URL: 'https://zinema-iota.vercel.app',
  // ... rest of config
}
```

### 8. **Test Your Backend**
- Visit: `https://zinema-backend.onrender.com` (should show "Server is Live!")
- Test API: `https://zinema-backend.onrender.com/api/show/all`

## 🔧 **Render-Specific Configuration**

### **Create render.yaml (Optional)**
Create this file in your repository root for advanced configuration:

```yaml
services:
  - type: web
    name: zinema-backend
    env: node
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        value: mongodb+srv://Deepak:123@cluster0.5pdgn48.mongodb.net
      # Add all other environment variables here
```

## 🎯 **Render Advantages**

- ✅ **Free tier available** (with some limitations)
- ✅ **Automatic deployments** from GitHub
- ✅ **Easy environment variable management**
- ✅ **Built-in SSL certificates**
- ✅ **Custom domains support**
- ✅ **Better for Node.js applications**

## 🔧 **Troubleshooting**

### **Common Issues:**
1. **Build Fails** → Check that Root Directory is set to `server`
2. **Environment Variables Missing** → Add all variables from server/.env
3. **Port Issues** → Render automatically assigns PORT, don't override it
4. **Dependencies** → Make sure server/package.json has all dependencies

### **Render Free Tier Limitations:**
- **Sleeps after 15 minutes** of inactivity (takes ~30 seconds to wake up)
- **750 hours/month** of uptime
- **Perfect for development and testing**

## 🚀 **After Successful Deployment**

1. **Test your backend URL** - should show "Server is Live!"
2. **Update frontend** with new backend URL
3. **Redeploy your frontend** to Vercel
4. **Test the full application** - frontend should now connect to backend!

## 📱 **Next Steps**

Once your backend is deployed on Render:
1. **Update your frontend** to use the new backend URL
2. **Redeploy your frontend** to Vercel
3. **Test the complete application**
4. **Your Zinema app will be fully functional!**
