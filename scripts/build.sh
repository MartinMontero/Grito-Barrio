#!/bin/bash

# ============================================================================
# Build Script for Protocolo CDMX
# ============================================================================
# This script handles the complete build process including:
# - Cleaning previous builds
# - Type checking
# - Building with Vite
# - Generating PWA assets
# - Copying static files
# - Verifying build output
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="dist"
SRC_DIR="src"
PUBLIC_DIR="public"

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

# Step 1: Clean previous build
clean_build() {
    log_info "Step 1: Cleaning previous build..."
    
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        log_success "Previous build cleaned"
    else
        log_info "No previous build found"
    fi
    
    # Clean temporary files
    rm -rf .temp
    rm -f tsconfig.tsbuildinfo
}

# Step 2: Install dependencies
install_deps() {
    log_info "Step 2: Installing dependencies..."
    
    if [ ! -d "node_modules" ]; then
        npm ci
    else
        log_info "Dependencies already installed"
    fi
    
    log_success "Dependencies ready"
}

# Step 3: Run linting
run_lint() {
    log_info "Step 3: Running linter..."
    
    npm run lint
    
    log_success "Linting passed"
}

# Step 4: Run type checking
run_typecheck() {
    log_info "Step 4: Running TypeScript compiler..."
    
    npm run typecheck
    
    log_success "Type checking passed"
}

# Step 5: Run tests
run_tests() {
    log_info "Step 5: Running tests..."
    
    # Run unit tests
    npm run test:unit -- --run
    
    log_success "Tests passed"
}

# Step 6: Build application
build_app() {
    log_info "Step 6: Building application with Vite..."
    
    # Set production environment
    export NODE_ENV=production
    
    # Get version info
    export VITE_APP_VERSION=$(node -p "require('./package.json').version")
    export VITE_BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    export VITE_BUILD_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    
    log_info "Building version: $VITE_APP_VERSION"
    log_info "Build date: $VITE_BUILD_DATE"
    log_info "Git commit: $VITE_BUILD_COMMIT"
    
    # Build with Vite
    npm run build
    
    log_success "Application built successfully"
}

# Step 7: Generate PWA assets
generate_pwa_assets() {
    log_info "Step 7: Generating PWA assets..."
    
    # Create icons directory
    mkdir -p "$BUILD_DIR/icons"
    
    # Generate icons from source (assuming logo.svg exists)
    if [ -f "public/logo.svg" ]; then
        log_info "Generating icons from logo.svg..."
        
        # Check if ImageMagick is available
        if command -v convert &> /dev/null; then
            # Generate various icon sizes
            convert public/logo.svg -resize 72x72 "$BUILD_DIR/icons/icon-72x72.png"
            convert public/logo.svg -resize 96x96 "$BUILD_DIR/icons/icon-96x96.png"
            convert public/logo.svg -resize 128x128 "$BUILD_DIR/icons/icon-128x128.png"
            convert public/logo.svg -resize 144x144 "$BUILD_DIR/icons/icon-144x144.png"
            convert public/logo.svg -resize 152x152 "$BUILD_DIR/icons/icon-152x152.png"
            convert public/logo.svg -resize 192x192 "$BUILD_DIR/icons/icon-192x192.png"
            convert public/logo.svg -resize 384x384 "$BUILD_DIR/icons/icon-384x384.png"
            convert public/logo.svg -resize 512x512 "$BUILD_DIR/icons/icon-512x512.png"
            
            # Generate maskable icon
            convert public/logo.svg -resize 192x192 -background white "$BUILD_DIR/icons/icon-maskable-192x192.png"
            convert public/logo.svg -resize 512x512 -background white "$BUILD_DIR/icons/icon-maskable-512x512.png"
            
            # Generate favicon
            convert public/logo.svg -resize 32x32 "$BUILD_DIR/favicon.ico"
            convert public/logo.svg -resize 180x180 "$BUILD_DIR/apple-touch-icon.png"
            
            log_success "Icons generated"
        else
            log_warning "ImageMagick not found. Using existing icons..."
        fi
    else
        log_warning "logo.svg not found. Skipping icon generation."
    fi
    
    # Generate manifest.json
    log_info "Generating manifest.json..."
    
    cat > "$BUILD_DIR/manifest.json" <<EOF
{
  "name": "Protocolo CDMX",
  "short_name": "Protocolo",
  "description": "Aplicación de respuesta a emergencias comunitarias en CDMX",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#dc2626",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "es-MX",
  "dir": "ltr",
  "icons": [
    {
      "src": "icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-maskable-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "icons/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "categories": ["utilities", "social"],
  "screenshots": [
    {
      "src": "screenshots/mobile-1.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Pantalla principal de Protocolo CDMX"
    },
    {
      "src": "screenshots/desktop-1.png",
      "sizes": "1280x800",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Vista de escritorio de Protocolo CDMX"
    }
  ],
  "shortcuts": [
    {
      "name": "Nueva Emergencia",
      "short_name": "Emergencia",
      "description": "Reportar una emergencia rápidamente",
      "url": "/emergency",
      "icons": [{ "src": "icons/icon-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "Protocolos",
      "short_name": "Protocolos",
      "description": "Ver protocolos de respuesta",
      "url": "/protocols",
      "icons": [{ "src": "icons/icon-96x96.png", "sizes": "96x96" }]
    }
  ],
  "related_applications": [],
  "prefer_related_applications": false
}
EOF
    
    log_success "manifest.json generated"
}

# Step 8: Generate service worker
generate_service_worker() {
    log_info "Step 8: Generating service worker..."
    
    # Run workbox to generate service worker
    npx workbox generateSW workbox-config.js
    
    log_success "Service worker generated"
}

# Step 9: Copy static files
copy_static_files() {
    log_info "Step 9: Copying static files..."
    
    # Copy robots.txt
    if [ -f "$PUBLIC_DIR/robots.txt" ]; then
        cp "$PUBLIC_DIR/robots.txt" "$BUILD_DIR/"
    fi
    
    # Copy sitemap.xml
    if [ -f "$PUBLIC_DIR/sitemap.xml" ]; then
        cp "$PUBLIC_DIR/sitemap.xml" "$BUILD_DIR/"
    fi
    
    # Copy any additional static assets
    if [ -d "$PUBLIC_DIR/assets" ]; then
        cp -r "$PUBLIC_DIR/assets" "$BUILD_DIR/"
    fi
    
    log_success "Static files copied"
}

# Step 10: Optimize build
optimize_build() {
    log_info "Step 10: Optimizing build..."
    
    # Optimize images
    if command -v npx &> /dev/null; then
        log_info "Optimizing images..."
        find "$BUILD_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) -exec npx imagemin {} --out-dir="$BUILD_DIR" --plugin=pngquant --plugin=mozjpeg \; 2>/dev/null || true
    fi
    
    # Precompress assets for gzip
    log_info "Precompressing assets..."
    find "$BUILD_DIR" -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.json" \) -exec gzip -k -9 {} \; 2>/dev/null || true
    
    # Create brotli compressed versions
    if command -v brotli &> /dev/null; then
        log_info "Creating brotli compressed versions..."
        find "$BUILD_DIR" -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec brotli -k -q 11 {} \; 2>/dev/null || true
    fi
    
    log_success "Build optimized"
}

# Step 11: Verify build
verify_build() {
    log_info "Step 11: Verifying build..."
    
    # Check that build directory exists
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Build directory not found!"
        exit 1
    fi
    
    # Check for required files
    required_files=(
        "index.html"
        "manifest.json"
        "sw.js"
        "icons/icon-192x192.png"
        "icons/icon-512x512.png"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$BUILD_DIR/$file" ]; then
            log_error "Required file missing: $file"
            exit 1
        fi
    done
    
    # Check for JavaScript files
    if [ ! "$(find "$BUILD_DIR" -name "*.js" | wc -l)" -gt 0 ]; then
        log_error "No JavaScript files found in build!"
        exit 1
    fi
    
    # Check for CSS files
    if [ ! "$(find "$BUILD_DIR" -name "*.css" | wc -l)" -gt 0 ]; then
        log_error "No CSS files found in build!"
        exit 1
    fi
    
    # Check bundle size
    BUNDLE_SIZE=$(du -sb "$BUILD_DIR" | cut -f1)
    MAX_SIZE=$((10 * 1024 * 1024))  # 10MB
    
    if [ $BUNDLE_SIZE -gt $MAX_SIZE ]; then
        log_warning "Build size ($(numfmt --to=iec $BUNDLE_SIZE)) exceeds limit ($(numfmt --to=iec $MAX_SIZE))"
    else
        log_info "Build size: $(numfmt --to=iec $BUNDLE_SIZE)"
    fi
    
    # Generate build report
    cat > "$BUILD_DIR/build-report.txt" <<EOF
Build Report
============
Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
Version: $VITE_APP_VERSION
Commit: $VITE_BUILD_COMMIT
Size: $(numfmt --to=iec $BUNDLE_SIZE)
Files: $(find "$BUILD_DIR" -type f | wc -l)

File Breakdown:
$(find "$BUILD_DIR" -type f -name "*.js" -o -name "*.css" | while read f; do
    echo "  $(basename $f): $(numfmt --to=iec $(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null || echo 0))"
done)

Status: ✓ Build verified successfully
EOF
    
    log_success "Build verified"
}

# Step 12: Create build info
create_build_info() {
    log_info "Step 12: Creating build info..."
    
    cat > "$BUILD_DIR/build-info.json" <<EOF
{
  "version": "${VITE_APP_VERSION}",
  "commit": "${VITE_BUILD_COMMIT}",
  "date": "${VITE_BUILD_DATE}",
  "buildNumber": "${BUILD_NUMBER:-local}",
  "builtBy": "${BUILD_BY:-local}",
  "environment": "${NODE_ENV:-production}",
  "nodeVersion": "$(node -v)",
  "npmVersion": "$(npm -v)"
}
EOF
    
    log_success "Build info created"
}

# Main execution
main() {
    echo "========================================"
    echo "Protocolo CDMX - Build Script"
    echo "========================================"
    echo ""
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Are you in the project root?"
        exit 1
    fi
    
    # Parse arguments
    SKIP_TESTS=false
    SKIP_LINT=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-lint)
                SKIP_LINT=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --skip-tests    Skip running tests"
                echo "  --skip-lint     Skip linting"
                echo "  --help          Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run build steps
    clean_build
    install_deps
    
    if [ "$SKIP_LINT" = false ]; then
        run_lint
    fi
    
    run_typecheck
    
    if [ "$SKIP_TESTS" = false ]; then
        run_tests
    fi
    
    build_app
    generate_pwa_assets
    generate_service_worker
    copy_static_files
    optimize_build
    verify_build
    create_build_info
    
    echo ""
    echo "========================================"
    log_success "Build completed successfully!"
    echo "========================================"
    echo ""
    echo "Build output: $BUILD_DIR/"
    echo "To test locally: npx serve $BUILD_DIR"
    echo "To deploy: Run scripts/deploy.sh"
    echo ""
}

# Run main function
main "$@"
