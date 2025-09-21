# 🚀 Deploy Zinema Backend to Cloud

## Option 1: Railway (Recommended - Free)

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your Zinema repository**
5. **Set Root Directory to `server`**
6. **Add Environment Variables:**
   - Copy all variables from `server/.env`
   - Add them in Railway dashboard under "Variables" tab
7. **Deploy!**

## Option 2: Render (Free Alternative)

1. **Go to [Render.com](https://render.com)**
2. **Sign up with GitHub**
3. **Click "New" → "Web Service"**
4. **Connect your GitHub repository**
5. **Configure:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Root Directory:** `server`
6. **Add Environment Variables from `server/.env`**
7. **Deploy!**

## Option 3: Vercel (If you prefer)

1. **Install Vercel CLI:** `npm install -g vercel`
2. **Login:** `vercel login`
3. **Deploy:** `vercel --prod`
4. **Set Environment Variables in Vercel Dashboard**

## After Deployment

Once your backend is deployed, you'll get a URL like:
- Railway: `https://your-app-name.railway.app`
- Render: `https://your-app-name.onrender.com`
- Vercel: `https://your-app-name.vercel.app`

## Update Frontend Configuration

Update `client/src/config/api.js`:
```javascript
export const API_CONFIG = {
  BASE_URL: 'https://your-deployed-backend-url.com',
  API_URL: 'https://your-deployed-backend-url.com/api',
  // ... rest of config
}
```

## Test Your Deployment

1. **Visit your backend URL** - should show "Server is Live!"
2. **Test API endpoint:** `https://your-backend-url.com/api/show/all`
3. **Update your frontend** with the new backend URL
4. **Redeploy your frontend**

## Environment Variables Needed

Make sure to add these in your cloud platform:
- `MONGODB_URI`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `TMDB_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- All other variables from `server/.env`
