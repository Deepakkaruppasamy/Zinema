# 🚀 Zinema Deployment Guide - Step by Step

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- npm 8+ installed
- Git installed
- A code editor (VS Code recommended)
- Accounts for: MongoDB Atlas, Stripe, Clerk, Vercel

---

## 🎯 Option 1: Vercel Deployment (Recommended)

### Step 1: Prepare Your Environment

1. **Open Terminal/Command Prompt**
2. **Navigate to your project directory**
   ```bash
   cd path/to/your/zinema/project
   ```

3. **Install dependencies**
   ```bash
   npm run install:all
   ```

### Step 2: Set Up Environment Variables

1. **Copy the environment template**
   ```bash
   cp env.production.template .env.production
   ```

2. **Edit the environment file**
   ```bash
   # Open in your editor
   code .env.production
   # or
   nano .env.production
   ```

3. **Fill in your actual values**
   ```env
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zinema_production
   
   # Authentication (Get from Clerk Dashboard)
   CLERK_PUBLISHABLE_KEY=pk_live_your_actual_key_here
   CLERK_SECRET_KEY=sk_live_your_actual_secret_here
   
   # Payment (Get from Stripe Dashboard)
   STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_key_here
   STRIPE_SECRET_KEY=sk_live_your_actual_secret_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   
   # Email Service
   NODEMAILER_EMAIL=your-email@gmail.com
   NODEMAILER_PASSWORD=your-app-password
   
   # Cloudinary (Get from Cloudinary Dashboard)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # TMDB API (Get from TMDB)
   TMDB_API_KEY=your_tmdb_api_key
   
   # Server Configuration
   PORT=5000
   CORS_ORIGIN=https://your-domain.vercel.app
   ```

### Step 3: Set Up Required Services

#### A. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Create a database user
5. Get your connection string
6. Add it to your `.env.production` file

#### B. Clerk Authentication Setup
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Get your publishable and secret keys
4. Add them to your `.env.production` file

#### C. Stripe Payment Setup
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your publishable and secret keys
3. Set up webhook endpoints
4. Add keys to your `.env.production` file

#### D. Cloudinary Setup (Optional)
1. Go to [Cloudinary](https://cloudinary.com)
2. Create a free account
3. Get your cloud name, API key, and secret
4. Add them to your `.env.production` file

### Step 4: Build Your Application

1. **Build the client**
   ```bash
   cd client
   npm run build
   cd ..
   ```

2. **Test the build**
   ```bash
   # Test locally
   npm start
   ```

### Step 5: Deploy to Vercel

#### Method A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy your application**
   ```bash
   vercel --prod
   ```

4. **Follow the prompts**
   - Link to existing project? No
   - Project name: zinema
   - Directory: ./
   - Override settings? No

#### Method B: Using GitHub Integration

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub
   - Select your repository

3. **Configure deployment**
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `client/dist`
   - Install Command: `npm run install:all`

### Step 6: Configure Environment Variables in Vercel

1. **Go to your project dashboard**
2. **Click on Settings**
3. **Go to Environment Variables**
4. **Add all variables from your `.env.production` file**
5. **Save the configuration**

### Step 7: Test Your Deployment

1. **Visit your deployed URL**
2. **Test the application**
3. **Check mobile responsiveness**
4. **Test PWA installation**

---

## 🎯 Option 2: Netlify + Railway Deployment

### Step 1: Deploy Frontend to Netlify

1. **Build your client**
   ```bash
   cd client
   npm run build
   ```

2. **Go to Netlify**
   - Visit [netlify.com](https://netlify.com)
   - Drag and drop your `client/dist` folder
   - Or connect your GitHub repository

3. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

### Step 2: Deploy Backend to Railway

1. **Go to Railway**
   - Visit [railway.app](https://railway.app)
   - Connect your GitHub account
   - Create a new project

2. **Configure your server**
   - Select your repository
   - Choose Node.js
   - Set start command: `npm start`

3. **Add environment variables**
   - Copy all variables from your `.env.production`
   - Add them to Railway dashboard

### Step 3: Connect Frontend and Backend

1. **Update CORS settings**
   - In your server code, update CORS origin
   - Point to your Netlify domain

2. **Update frontend API calls**
   - Update API base URL to Railway domain

---

## 🎯 Option 3: Manual Deployment

### Step 1: Prepare Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Test locally**
   ```bash
   npm start
   ```

### Step 2: Choose Your Hosting

#### For Frontend (Static Hosting)
- **Netlify**: Drag and drop `client/dist` folder
- **Vercel**: Upload `client/dist` folder
- **AWS S3**: Upload to S3 bucket
- **GitHub Pages**: Push to gh-pages branch

#### For Backend (Server Hosting)
- **Heroku**: Connect GitHub repository
- **Railway**: Connect GitHub repository
- **AWS EC2**: Deploy to EC2 instance
- **DigitalOcean**: Deploy to Droplet

### Step 3: Configure Domain and SSL

1. **Set up custom domain**
2. **Configure SSL certificates**
3. **Update DNS records**
4. **Test HTTPS functionality**

---

## 📱 Mobile Testing & PWA Setup

### Step 1: Test PWA Installation

1. **Open your deployed site on mobile**
2. **Look for "Add to Home Screen" prompt**
3. **Install the app**
4. **Test offline functionality**

### Step 2: Test Mobile Features

1. **Test responsive design**
2. **Test touch interactions**
3. **Test mobile navigation**
4. **Test PWA features**

### Step 3: Verify PWA Functionality

1. **Check manifest file**
2. **Verify service worker**
3. **Test push notifications**
4. **Test offline mode**

---

## 🔧 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Environment Variables Not Working
1. Check variable names match exactly
2. Ensure no spaces around `=`
3. Restart your deployment

#### CORS Issues
1. Update CORS origin in server
2. Check domain configuration
3. Verify HTTPS setup

#### PWA Not Working
1. Check manifest.json
2. Verify service worker
3. Test on HTTPS
4. Check browser console

### Debug Commands

```bash
# Check build
npm run build

# Test locally
npm start

# Check dependencies
npm run install:all

# Lint code
npm run lint
```

---

## ✅ Final Checklist

Before going live, ensure:

- [ ] All environment variables configured
- [ ] Database connection working
- [ ] Authentication working
- [ ] Payment processing working
- [ ] PWA installation working
- [ ] Mobile responsiveness perfect
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Analytics tracking setup
- [ ] Error monitoring active

---

## 🎉 Success!

Once deployed, your Zinema app will be:

✅ **Accessible worldwide** via your domain
✅ **Installable on mobile** as a PWA
✅ **Works offline** with cached content
✅ **Sends push notifications** to users
✅ **Provides native app experience** in browser

### Share Your App
- **Web**: Share your domain URL
- **Mobile**: Users can install from browser
- **Social**: Share on social media
- **Marketing**: Use for user acquisition

---

## 🆘 Need Help?

If you encounter issues:

1. **Check the logs** in your hosting platform
2. **Verify environment variables** are set correctly
3. **Test locally** before deploying
4. **Check browser console** for errors
5. **Review deployment documentation**

Your Zinema movie booking platform is now ready to revolutionize how people book movies! 🎬📱✨
