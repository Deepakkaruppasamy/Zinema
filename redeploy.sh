#!/bin/bash

echo "🚀 Redeploying Zinema Frontend and Backend"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Step 1: Build and deploy frontend
print_step "Building and deploying frontend..."
cd client
npm run build
if [ $? -ne 0 ]; then
    echo "Frontend build failed!"
    exit 1
fi

# Deploy frontend to Vercel
vercel --prod
if [ $? -ne 0 ]; then
    echo "Frontend deployment failed!"
    exit 1
fi

print_success "Frontend deployed successfully!"

# Step 2: Deploy backend
print_step "Deploying backend..."
cd ../server
vercel --prod
if [ $? -ne 0 ]; then
    echo "Backend deployment failed!"
    exit 1
fi

print_success "Backend deployed successfully!"

# Step 3: Summary
echo ""
print_success "🎉 Deployment completed!"
echo ""
echo "Your Zinema app is now live:"
echo "Frontend: https://zinema-iota.vercel.app/"
echo "Backend: https://zinema-02.vercel.app/"
echo ""
echo "Next steps:"
echo "1. Test the full-stack functionality"
echo "2. Test mobile PWA installation"
echo "3. Configure environment variables in Vercel dashboard"
echo "4. Test user registration and booking flow"
echo ""
echo "🎬 Zinema is ready to revolutionize movie booking! 🚀📱"
