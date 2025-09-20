#!/bin/bash

# Zinema Deployment Script
echo "🚀 Starting Zinema Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    print_success "All dependencies are available"
}

# Install dependencies
install_dependencies() {
    print_status "Installing client dependencies..."
    cd client
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install client dependencies"
        exit 1
    fi
    
    print_status "Installing server dependencies..."
    cd ../server
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install server dependencies"
        exit 1
    fi
    
    cd ..
    print_success "Dependencies installed successfully"
}

# Build the application
build_application() {
    print_status "Building client application..."
    cd client
    npm run build
    if [ $? -ne 0 ]; then
        print_error "Failed to build client application"
        exit 1
    fi
    cd ..
    
    print_success "Application built successfully"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    # Check if user is logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        print_warning "Please log in to Vercel first:"
        vercel login
    fi
    
    # Deploy the application
    vercel --prod
    if [ $? -ne 0 ]; then
        print_error "Failed to deploy to Vercel"
        exit 1
    fi
    
    print_success "Deployed to Vercel successfully!"
}

# Set up environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    if [ ! -f "env.production.template" ]; then
        print_error "Environment template not found"
        exit 1
    fi
    
    print_warning "Please configure your environment variables:"
    print_warning "1. Copy env.production.template to .env.production"
    print_warning "2. Fill in your actual values"
    print_warning "3. Set up environment variables in Vercel dashboard"
    
    read -p "Press Enter to continue after setting up environment variables..."
}

# Main deployment function
main() {
    echo "🎬 Zinema Deployment Script"
    echo "========================="
    
    # Check dependencies
    check_dependencies
    
    # Install dependencies
    install_dependencies
    
    # Build application
    build_application
    
    # Setup environment
    setup_environment
    
    # Deploy to Vercel
    deploy_vercel
    
    print_success "🎉 Zinema deployment completed successfully!"
    print_status "Your app is now live and ready for mobile installation!"
    
    echo ""
    echo "📱 Mobile Installation Instructions:"
    echo "1. Visit your deployed URL on mobile"
    echo "2. Tap 'Add to Home Screen' when prompted"
    echo "3. The app will be installed like a native app"
    echo "4. Users can now use it offline with push notifications!"
}

# Run main function
main "$@"
