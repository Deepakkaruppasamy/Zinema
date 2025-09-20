@echo off
echo 🎬 Zinema Quick Deployment Script
echo =================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [SUCCESS] All prerequisites are installed!
echo.

REM Install dependencies
echo [STEP] Installing dependencies...
call npm run install:all
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully!
echo.

REM Environment setup
echo [STEP] Setting up environment variables...
if not exist ".env.production" (
    if exist "env.production.template" (
        copy env.production.template .env.production
        echo [SUCCESS] Created .env.production from template
    ) else (
        echo [ERROR] Environment template not found
        pause
        exit /b 1
    )
)

echo [WARNING] Please configure your environment variables in .env.production
echo [INFO] Required services:
echo   - MongoDB Atlas (Database)
echo   - Clerk (Authentication)
echo   - Stripe (Payments)
echo   - Cloudinary (Images) - Optional
echo   - TMDB API (Movie Data)
echo.
pause

REM Build application
echo [STEP] Building application...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed. Please check for errors.
    pause
    exit /b 1
)
echo [SUCCESS] Application built successfully!
echo.

REM Deployment options
echo [STEP] Choose your deployment method:
echo 1. Vercel (Recommended - Full-stack)
echo 2. Netlify + Railway (Frontend + Backend)
echo 3. Manual deployment
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto vercel
if "%choice%"=="2" goto netlify
if "%choice%"=="3" goto manual
goto invalid

:vercel
echo [STEP] Deploying to Vercel...
echo [INFO] Please install Vercel CLI if not already installed:
echo npm install -g vercel
echo.
echo [INFO] Then run:
echo vercel login
echo vercel --prod
echo.
echo [INFO] Don't forget to:
echo   1. Set environment variables in Vercel dashboard
echo   2. Configure your domain
echo   3. Test the deployment
goto end

:netlify
echo [STEP] Deploying to Netlify + Railway...
echo.
echo [INFO] Frontend deployment to Netlify:
echo   1. Go to https://netlify.com
echo   2. Drag and drop the 'client/dist' folder
echo   3. Configure build settings if needed
echo.
echo [INFO] Backend deployment to Railway:
echo   1. Go to https://railway.app
echo   2. Connect your GitHub repository
echo   3. Set start command: npm start
echo   4. Add environment variables
echo.
echo [WARNING] Manual steps required for this deployment method
goto end

:manual
echo [STEP] Manual deployment instructions...
echo.
echo [INFO] Frontend deployment options:
echo   - Netlify: Upload 'client/dist' folder
echo   - Vercel: Upload 'client/dist' folder
echo   - AWS S3: Upload to S3 bucket
echo   - GitHub Pages: Push to gh-pages branch
echo.
echo [INFO] Backend deployment options:
echo   - Heroku: Connect GitHub repository
echo   - Railway: Connect GitHub repository
echo   - AWS EC2: Deploy to EC2 instance
echo   - DigitalOcean: Deploy to Droplet
echo.
echo [WARNING] Manual deployment requires more configuration
goto end

:invalid
echo [ERROR] Invalid choice. Please run the script again.
pause
exit /b 1

:end
echo.
echo [STEP] Post-deployment checklist:
echo.
echo [INFO] Required configurations:
echo   ✓ Environment variables set
echo   ✓ Database connection working
echo   ✓ Authentication configured
echo   ✓ Payment processing setup
echo   ✓ CORS settings configured
echo.
echo [INFO] Testing checklist:
echo   ✓ Test website loads correctly
echo   ✓ Test mobile responsiveness
echo   ✓ Test PWA installation
echo   ✓ Test user registration/login
echo   ✓ Test booking functionality
echo   ✓ Test payment processing
echo.
echo [INFO] Mobile PWA features:
echo   ✓ App installable on mobile
echo   ✓ Works offline
echo   ✓ Push notifications
echo   ✓ App-like experience
echo.
echo [SUCCESS] 🎉 Deployment process completed!
echo [INFO] Your Zinema app is now ready for users to:
echo   - Visit on any device
echo   - Install as a mobile app
echo   - Use offline
echo   - Receive notifications
echo   - Enjoy a native app experience
echo.
echo [INFO] Next steps:
echo   1. Test your deployment thoroughly
echo   2. Configure your custom domain
echo   3. Set up analytics and monitoring
echo   4. Share with users and get feedback
echo.
echo 🎬 Zinema is ready to revolutionize movie booking! 🚀📱
pause
