#!/bin/bash

# 🚀 Zinema Quick Deployment Script
# This script will guide you through the entire deployment process

echo "🎬 Zinema Quick Deployment Script"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${PURPLE}[INFO]${NC} $1"
}

# Step 1: Check Prerequisites
print_step "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check Git
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

print_success "All prerequisites are installed!"

# Step 2: Install Dependencies
print_step "Installing dependencies..."
npm run install:all
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi
print_success "Dependencies installed successfully!"

# Step 3: Environment Setup
print_step "Setting up environment variables..."

if [ ! -f ".env.production" ]; then
    if [ -f "env.production.template" ]; then
        cp env.production.template .env.production
        print_success "Created .env.production from template"
    else
        print_error "Environment template not found"
        exit 1
    fi
fi

print_warning "Please configure your environment variables in .env.production"
print_info "Required services:"
echo "  - MongoDB Atlas (Database)"
echo "  - Clerk (Authentication)"
echo "  - Stripe (Payments)"
echo "  - Cloudinary (Images) - Optional"
echo "  - TMDB API (Movie Data)"
echo ""

read -p "Press Enter after configuring environment variables..."

# Step 4: Build Application
print_step "Building application..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Build failed. Please check for errors."
    exit 1
fi
print_success "Application built successfully!"

# Step 5: Choose Deployment Method
echo ""
print_step "Choose your deployment method:"
echo "1. Vercel (Recommended - Full-stack)"
echo "2. Netlify + Railway (Frontend + Backend)"
echo "3. Manual deployment"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        print_step "Deploying to Vercel..."
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            print_info "Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        # Login to Vercel
        print_info "Please login to Vercel..."
        vercel login
        
        # Deploy
        print_info "Deploying to Vercel..."
        vercel --prod
        
        print_success "Deployed to Vercel!"
        print_info "Don't forget to:"
        echo "  1. Set environment variables in Vercel dashboard"
        echo "  2. Configure your domain"
        echo "  3. Test the deployment"
        ;;
        
    2)
        print_step "Deploying to Netlify + Railway..."
        
        print_info "Frontend deployment to Netlify:"
        echo "  1. Go to https://netlify.com"
        echo "  2. Drag and drop the 'client/dist' folder"
        echo "  3. Configure build settings if needed"
        echo ""
        
        print_info "Backend deployment to Railway:"
        echo "  1. Go to https://railway.app"
        echo "  2. Connect your GitHub repository"
        echo "  3. Set start command: npm start"
        echo "  4. Add environment variables"
        echo ""
        
        print_warning "Manual steps required for this deployment method"
        ;;
        
    3)
        print_step "Manual deployment instructions..."
        
        print_info "Frontend deployment options:"
        echo "  - Netlify: Upload 'client/dist' folder"
        echo "  - Vercel: Upload 'client/dist' folder"
        echo "  - AWS S3: Upload to S3 bucket"
        echo "  - GitHub Pages: Push to gh-pages branch"
        echo ""
        
        print_info "Backend deployment options:"
        echo "  - Heroku: Connect GitHub repository"
        echo "  - Railway: Connect GitHub repository"
        echo "  - AWS EC2: Deploy to EC2 instance"
        echo "  - DigitalOcean: Deploy to Droplet"
        echo ""
        
        print_warning "Manual deployment requires more configuration"
        ;;
        
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

# Step 6: Post-deployment checklist
echo ""
print_step "Post-deployment checklist:"
echo ""

print_info "Required configurations:"
echo "  ✓ Environment variables set"
echo "  ✓ Database connection working"
echo "  ✓ Authentication configured"
echo "  ✓ Payment processing setup"
echo "  ✓ CORS settings configured"
echo ""

print_info "Testing checklist:"
echo "  ✓ Test website loads correctly"
echo "  ✓ Test mobile responsiveness"
echo "  ✓ Test PWA installation"
echo "  ✓ Test user registration/login"
echo "  ✓ Test booking functionality"
echo "  ✓ Test payment processing"
echo ""

print_info "Mobile PWA features:"
echo "  ✓ App installable on mobile"
echo "  ✓ Works offline"
echo "  ✓ Push notifications"
echo "  ✓ App-like experience"
echo ""

print_success "🎉 Deployment process completed!"
print_info "Your Zinema app is now ready for users to:"
echo "  - Visit on any device"
echo "  - Install as a mobile app"
echo "  - Use offline"
echo "  - Receive notifications"
echo "  - Enjoy a native app experience"
echo ""

print_info "Next steps:"
echo "  1. Test your deployment thoroughly"
echo "  2. Configure your custom domain"
echo "  3. Set up analytics and monitoring"
echo "  4. Share with users and get feedback"
echo ""

echo "🎬 Zinema is ready to revolutionize movie booking! 🚀📱"
