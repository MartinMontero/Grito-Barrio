#!/bin/bash

# ============================================================================
# Deploy Script for Protocolo CDMX
# ============================================================================
# This script handles deployment including:
# - Building the application
# - Running full test suite
# - Deploying to GitHub Pages
# - Invalidating CDN cache
# - Notifying the community
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="dist"
GITHUB_PAGES_BRANCH="gh-pages"
REPO_URL=$(git config --get remote.origin.url 2>/dev/null || echo "")

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${CYAN}[STEP $1]${NC} $2"
}

# Step 1: Pre-deployment checks
pre_deploy_checks() {
    log_step "1" "Running pre-deployment checks..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not a git repository"
        exit 1
    fi
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        log_warning "You have uncommitted changes"
        read -p "Do you want to continue? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Check if we're on main or master branch
    BRANCH=$(git branch --show-current)
    if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "master" ]; then
        log_warning "Not on main/master branch (currently on: $BRANCH)"
        read -p "Do you want to continue? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Get version from package.json
    VERSION=$(node -p "require('./package.json').version")
    log_info "Deploying version: $VERSION"
    
    # Confirm deployment
    echo ""
    echo "========================================"
    echo "Deployment Configuration:"
    echo "  Version: $VERSION"
    echo "  Branch: $BRANCH"
    echo "  Repository: $REPO_URL"
    echo "========================================"
    echo ""
    read -p "Are you sure you want to deploy? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled"
        exit 0
    fi
    
    log_success "Pre-deployment checks passed"
}

# Step 2: Build application
build_application() {
    log_step "2" "Building application..."
    
    # Run build script
    if [ -f "scripts/build.sh" ]; then
        bash scripts/build.sh
    else
        log_info "Using npm build..."
        npm run build
    fi
    
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Build directory not found!"
        exit 1
    fi
    
    log_success "Application built successfully"
}

# Step 3: Run full test suite
run_tests() {
    log_step "3" "Running full test suite..."
    
    # Unit tests
    log_info "Running unit tests..."
    npm run test:unit -- --run
    
    # Integration tests
    log_info "Running integration tests..."
    npm run test:integration -- --run
    
    # E2E tests
    log_info "Running E2E tests..."
    npm run test:e2e -- --run
    
    # Accessibility tests
    log_info "Running accessibility tests..."
    npm run test:a11y -- --run
    
    log_success "All tests passed"
}

# Step 4: Deploy to GitHub Pages
deploy_to_github_pages() {
    log_step "4" "Deploying to GitHub Pages..."
    
    # Get repository info
    if [ -z "$REPO_URL" ]; then
        log_error "Could not determine repository URL"
        exit 1
    fi
    
    # Parse repository name
    REPO_NAME=$(basename -s .git "$REPO_URL")
    USER_NAME=$(basename $(dirname "$REPO_URL"))
    
    # Create a temporary directory for deployment
    DEPLOY_DIR=$(mktemp -d)
    
    # Clone the gh-pages branch or create new
    if git ls-remote --heads origin $GITHUB_PAGES_BRANCH > /dev/null 2>&1; then
        log_info "Cloning existing gh-pages branch..."
        git clone --single-branch --branch $GITHUB_PAGES_BRANCH "$REPO_URL" "$DEPLOY_DIR"
        cd "$DEPLOY_DIR"
        git rm -rf .
        cd - > /dev/null
    else
        log_info "Creating new gh-pages branch..."
        mkdir -p "$DEPLOY_DIR"
        cd "$DEPLOY_DIR"
        git init
        git remote add origin "$REPO_URL"
        git checkout -b $GITHUB_PAGES_BRANCH
        cd - > /dev/null
    fi
    
    # Copy build files to deploy directory
    log_info "Copying build files..."
    cp -r "$BUILD_DIR"/* "$DEPLOY_DIR/"
    
    # Create .nojekyll file (disable Jekyll processing)
    touch "$DEPLOY_DIR/.nojekyll"
    
    # Create CNAME file if domain is configured
    if [ -f "CNAME" ]; then
        cp "CNAME" "$DEPLOY_DIR/"
    fi
    
    # Commit and push
    cd "$DEPLOY_DIR"
    
    git add -A
    
    VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
    git commit -m "Deploy version $VERSION

- Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')
- Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
- Built by: $(whoami)@$(hostname)" || true
    
    log_info "Pushing to GitHub Pages..."
    git push -f origin $GITHUB_PAGES_BRANCH
    
    cd - > /dev/null
    
    # Cleanup
    rm -rf "$DEPLOY_DIR"
    
    log_success "Deployed to GitHub Pages"
    log_info "🌐 https://${USER_NAME}.github.io/${REPO_NAME}/"
}

# Step 5: Create git tag
create_git_tag() {
    log_step "5" "Creating git tag..."
    
    VERSION=$(node -p "require('./package.json').version")
    TAG="v$VERSION"
    
    # Check if tag already exists
    if git rev-parse "$TAG" >/dev/null 2>&1; then
        log_warning "Tag $TAG already exists"
        read -p "Do you want to delete and recreate it? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git tag -d "$TAG"
            git push --delete origin "$TAG" 2>/dev/null || true
        else
            log_info "Skipping tag creation"
            return
        fi
    fi
    
    # Create annotated tag
    git tag -a "$TAG" -m "Release $TAG

$(cat CHANGELOG.md 2>/dev/null | head -50 || echo 'See release notes on GitHub')"
    
    # Push tag
    git push origin "$TAG"
    
    log_success "Created and pushed tag: $TAG"
}

# Step 6: Invalidate cache
invalidate_cache() {
    log_step "6" "Invalidating caches..."
    
    # Note: Actual cache invalidation would depend on your CDN
    # This is a placeholder for common scenarios
    
    log_info "Clearing service worker cache..."
    # Service workers will update automatically on next visit
    
    log_info "Note: If using Cloudflare or similar CDN, manually purge cache from dashboard"
    
    log_success "Cache invalidation instructions provided"
}

# Step 7: Notify community
notify_community() {
    log_step "7" "Notifying community..."
    
    VERSION=$(node -p "require('./package.json').version")
    
    # Create notification message
    MESSAGE="🚀 Protocolo CDMX v$VERSION deployed!

✅ Successfully deployed to production
🌐 Live at: https://$(git config --get remote.origin.url | sed 's/.*github.com[:/]//;s/.git$//' | cut -d'/' -f1).github.io/$(basename -s .git $(git config --get remote.origin.url))/
📦 Release: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]//;s/.git$//')/releases/tag/v$VERSION

New in this version:
$(git log $(git describe --tags --abbrev=0 2>/dev/null || echo '')..HEAD --oneline --no-merges 2>/dev/null | head -10 || echo 'See release notes for details')

Install as PWA on your device for offline access!

#ProtocoloCDMX #Desplazamiento #CDMX"

    # Save notification to file
    echo "$MESSAGE" > "deploy-notification.txt"
    
    log_info "Notification saved to: deploy-notification.txt"
    log_info "Copy and share on your social media channels"
    
    # Display notification
    echo ""
    echo "========================================"
    echo "Deployment Notification:"
    echo "========================================"
    echo "$MESSAGE"
    echo "========================================"
    echo ""
    
    log_success "Notification prepared"
}

# Step 8: Post-deployment verification
verify_deployment() {
    log_step "8" "Verifying deployment..."
    
    USER_NAME=$(basename $(dirname "$REPO_URL"))
    REPO_NAME=$(basename -s .git "$REPO_URL")
    URL="https://${USER_NAME}.github.io/${REPO_NAME}/"
    
    log_info "Waiting for deployment to propagate..."
    sleep 10
    
    # Try to access the deployed site
    if command -v curl &> /dev/null; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL" || echo "000")
        
        if [ "$HTTP_CODE" = "200" ]; then
            log_success "Deployment verified! Site is live"
        else
            log_warning "HTTP status: $HTTP_CODE"
            log_warning "Deployment may still be processing. Check manually in a few minutes."
        fi
    else
        log_info "Please verify manually at: $URL"
    fi
    
    # Check build info
    BUILD_INFO_URL="${URL}build-info.json"
    if command -v curl &> /dev/null; then
        curl -s "$BUILD_INFO_URL" | head -5 || log_warning "Could not fetch build info"
    fi
}

# Step 9: Cleanup
cleanup() {
    log_step "9" "Cleaning up..."
    
    # Remove temporary files
    rm -f deploy-notification.txt
    
    log_success "Cleanup complete"
}

# Main execution
main() {
    echo "========================================"
    echo "Protocolo CDMX - Deploy Script"
    echo "========================================"
    echo ""
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Are you in the project root?"
        exit 1
    fi
    
    # Parse arguments
    SKIP_TESTS=false
    CREATE_TAG=true
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-tag)
                CREATE_TAG=false
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --skip-tests    Skip running tests"
                echo "  --skip-tag      Skip creating git tag"
                echo "  --help          Show this help message"
                echo ""
                echo "Environment Variables:"
                echo "  GITHUB_TOKEN    GitHub personal access token (for private repos)"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run deployment steps
    pre_deploy_checks
    build_application
    
    if [ "$SKIP_TESTS" = false ]; then
        run_tests
    fi
    
    deploy_to_github_pages
    
    if [ "$CREATE_TAG" = true ]; then
        create_git_tag
    fi
    
    invalidate_cache
    notify_community
    verify_deployment
    cleanup
    
    echo ""
    echo "========================================"
    log_success "Deployment completed successfully!"
    echo "========================================"
    echo ""
    echo "🌐 Your app is live!"
    echo "📱 Share with your community"
    echo "⭐ Star the repo if you find it useful"
    echo ""
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"
