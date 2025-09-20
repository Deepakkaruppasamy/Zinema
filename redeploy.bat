@echo off
echo 🚀 Redeploying Zinema Frontend and Backend
echo ==========================================

REM Step 1: Build and deploy frontend
echo [STEP] Building and deploying frontend...
cd client
call npm run build
if errorlevel 1 (
    echo Frontend build failed!
    pause
    exit /b 1
)

REM Deploy frontend to Vercel
call vercel --prod
if errorlevel 1 (
    echo Frontend deployment failed!
    pause
    exit /b 1
)

echo [SUCCESS] Frontend deployed successfully!

REM Step 2: Deploy backend
echo [STEP] Deploying backend...
cd ..\server
call vercel --prod
if errorlevel 1 (
    echo Backend deployment failed!
    pause
    exit /b 1
)

echo [SUCCESS] Backend deployed successfully!

REM Step 3: Summary
echo.
echo [SUCCESS] 🎉 Deployment completed!
echo.
echo Your Zinema app is now live:
echo Frontend: https://zinema-iota.vercel.app/
echo Backend: https://zinema-02.vercel.app/
echo.
echo Next steps:
echo 1. Test the full-stack functionality
echo 2. Test mobile PWA installation
echo 3. Configure environment variables in Vercel dashboard
echo 4. Test user registration and booking flow
echo.
echo 🎬 Zinema is ready to revolutionize movie booking! 🚀📱
pause
