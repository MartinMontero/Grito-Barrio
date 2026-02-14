# Deployment & CI/CD Pipeline - Protocolo CDMX

## Overview

This document describes the complete deployment infrastructure for Protocolo CDMX, including continuous integration, automated testing, and deployment to production.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CI/CD PIPELINE                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │   Push   │───▶│   Lint   │───▶│  Type    │             │
│  │   / PR   │    │  Check   │    │  Check   │             │
│  └──────────┘    └──────────┘    └──────────┘             │
│                                       │                     │
│                                       ▼                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │   Unit   │───▶│   Int.   │───▶│   A11y   │             │
│  │  Tests   │    │  Tests   │    │  Tests   │             │
│  └──────────┘    └──────────┘    └──────────┘             │
│                                       │                     │
│                                       ▼                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │   Build  │───▶│ Security │───▶│  Deploy  │             │
│  │          │    │  Audit   │    │  to GH   │             │
│  │          │    │          │    │  Pages   │             │
│  └──────────┘    └──────────┘    └──────────┘             │
│                                       │                     │
│                                       ▼                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │  Create  │───▶│  Notify  │───▶│  Verify  │             │
│  │ Release  │    │ Community│    │ Deploy   │             │
│  └──────────┘    └──────────┘    └──────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## GitHub Actions Workflows

### 1. CI Pipeline (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main`, `develop`, or `feature/**` branches
- Pull requests to `main` or `develop`

**Jobs:**

#### Lint
- ✅ ESLint validation
- ✅ Prettier format checking
- ✅ Secret detection (TruffleHog)

#### Type Check
- ✅ TypeScript compilation
- ✅ Circular dependency detection (Madge)

#### Unit Tests (Parallelized)
- ✅ Split into 4 shards for faster execution
- ✅ Coverage reporting
- ✅ Artifact upload

#### Integration Tests
- ✅ Full workflow testing
- ✅ Component integration

#### Accessibility Tests
- ✅ WCAG compliance (Axe)
- ✅ Screen reader compatibility
- ✅ Keyboard navigation

#### Build
- ✅ Vite production build
- ✅ PWA asset generation
- ✅ Bundle size analysis
- ✅ Size limit enforcement (< 10MB)

#### Security Audit
- ✅ npm audit
- ✅ Dependency check
- ✅ Snyk scan

#### Performance Tests
- ✅ Lighthouse CI
- ✅ Performance benchmarks
- ✅ Core Web Vitals

#### Coverage Report
- ✅ Codecov integration
- ✅ Coverage summary comment on PR

### 2. Deploy Pipeline (`.github/workflows/deploy.yml`)

**Triggers:**
- Tag push: `v*` or `release-*`
- Manual workflow dispatch

**Jobs:**

#### Verify Release
- ✅ Version/tag consistency check
- ✅ Package.json validation

#### Build Production
- ✅ Complete test suite
- ✅ Production build with optimizations
- ✅ Asset compression (gzip + brotli)
- ✅ Service worker generation
- ✅ Checksum generation

#### Security Scan
- ✅ Build artifact scanning
- ✅ Security policy validation

#### Deploy to GitHub Pages
- ✅ gh-pages branch deployment
- ✅ Custom domain support (CNAME)
- ✅ Deployment verification

#### Create Release
- ✅ Changelog generation
- ✅ GitHub release creation
- ✅ Asset upload

#### Notify Community
- ✅ Discord notification
- ✅ Release notes posting

## Scripts

### Build Script (`scripts/build.sh`)

**Purpose:** Production-ready build with optimizations

**Steps:**
1. Clean previous builds
2. Install dependencies
3. Run linter
4. TypeScript type check
5. Run tests
6. Build with Vite
7. Generate PWA assets
8. Generate service worker
9. Copy static files
10. Optimize build (compression)
11. Verify build
12. Create build info

**Usage:**
```bash
# Standard build
./scripts/build.sh

# Skip tests
./scripts/build.sh --skip-tests

# Skip linting
./scripts/build.sh --skip-lint
```

### Deploy Script (`scripts/deploy.sh`)

**Purpose:** Full deployment pipeline

**Steps:**
1. Pre-deployment checks
2. Build application
3. Run full test suite
4. Deploy to GitHub Pages
5. Create git tag
6. Invalidate cache
7. Notify community
8. Verify deployment

**Usage:**
```bash
# Deploy to production
./scripts/deploy.sh

# Skip tests
./scripts/deploy.sh --skip-tests

# Skip tag creation
./scripts/deploy.sh --skip-tag
```

## Docker Support

### Development Environment

**Dockerfile:** Multi-stage build
- Stage 1: Development (hot reload)
- Stage 2: Build (production)
- Stage 3: Production (nginx)

**docker-compose.yml:**
```yaml
# Development
- Hot reload
- Volume mounts
- Port 5173

# Production (optional)
- Nginx server
- Port 8080

# Testing
- Test runner
- CI environment
```

**Usage:**
```bash
# Development with hot reload
docker-compose up app

# Production build test
docker-compose --profile prod up prod

# Run tests
docker-compose --profile test up test
```

## PWA Configuration

### Manifest (`public/manifest.json`)

**Features:**
- App name and description
- Icons (72x72 to 512x512)
- Maskable icons for adaptive shapes
- Screenshots for install prompt
- App shortcuts
- Share target
- Protocol handlers

**Generated Files:**
- `icons/icon-*.png` - Standard icons
- `icons/maskable-icon-*.png` - Adaptive icons
- `manifest.json` - Web app manifest
- `sw.js` - Service worker
- `favicon.ico` - Browser favicon

### Service Worker

**Caching Strategies:**
- **Precache:** JS, CSS, HTML, fonts
- **Runtime:** API calls, images
- **Network First:** Dynamic content
- **Cache First:** Static assets

**Features:**
- Offline functionality
- Background sync
- Push notifications (future)
- Automatic updates

## Deployment Environments

### Production

**URL:** `https://<user>.github.io/<repo>/`

**Requirements:**
- Tag push (e.g., `v1.0.0`)
- All tests passing
- Security scan clean

### Preview (PR)

**URL:** `https://<user>.github.io/<repo>/preview/<pr-number>/`

**Features:**
- Automatic deployment on PR
- PR comment with preview URL
- Cleanup on merge

### Local Development

**URL:** `http://localhost:5173`

**Features:**
- Hot module replacement
- Source maps
- Dev tools enabled

## Environment Variables

### Build Time
```bash
VITE_APP_VERSION      # App version (from package.json)
VITE_BUILD_DATE       # Build timestamp
VITE_BUILD_COMMIT     # Git commit hash
VITE_SENTRY_DSN       # Error tracking (optional)
NODE_ENV              # production | development
```

### CI/CD Secrets
```bash
GITHUB_TOKEN          # GitHub Actions token
SENTRY_DSN            # Sentry error tracking
SNYK_TOKEN            # Snyk security scanning
DISCORD_WEBHOOK_URL   # Discord notifications
LHCI_GITHUB_APP_TOKEN # Lighthouse CI
CUSTOM_DOMAIN         # Custom domain for CNAME
```

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing locally
- [ ] Version bumped in package.json
- [ ] CHANGELOG.md updated
- [ ] No uncommitted changes
- [ ] Security audit passed

### Deployment
- [ ] Create git tag: `git tag -a v1.0.0 -m "Release v1.0.0"`
- [ ] Push tag: `git push origin v1.0.0`
- [ ] Wait for CI pipeline
- [ ] Verify deployment URL
- [ ] Check build info endpoint

### Post-Deployment
- [ ] Test critical user flows
- [ ] Verify PWA install prompt
- [ ] Check offline functionality
- [ ] Monitor error tracking
- [ ] Announce to community

## Rollback Procedure

### GitHub Pages Rollback

```bash
# Find previous successful deployment
git log gh-pages --oneline

# Revert to previous commit on gh-pages branch
git checkout gh-pages
git revert HEAD --no-edit
git push origin gh-pages
```

### Tag Rollback

```bash
# Delete tag locally and remotely
git tag -d v1.0.0
git push --delete origin v1.0.0

# Create new corrected tag
git tag -a v1.0.1 -m "Release v1.0.1 (hotfix)"
git push origin v1.0.1
```

## Monitoring

### Health Checks
- Build status badge in README
- Lighthouse score tracking
- Bundle size monitoring
- Error rate tracking

### Alerts
- Deployment failures → GitHub notifications
- Security vulnerabilities → Snyk alerts
- Performance regression → Lighthouse CI
- High error rates → Sentry alerts

## Best Practices

### 1. Versioning
- Use Semantic Versioning (SemVer)
- Tag format: `v1.0.0`
- Match tag with package.json version

### 2. Git Workflow
- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Releases: `release/v1.0.0`

### 3. Testing
- Unit tests for all new features
- Integration tests for workflows
- E2E tests for critical paths
- A11y tests for UI components

### 4. Security
- Regular dependency updates
- Secret scanning enabled
- Security audit on every build
- No secrets in code

### 5. Performance
- Bundle size monitoring
- Lazy loading for routes
- Image optimization
- Caching strategies

## Troubleshooting

### Common Issues

#### Build Fails
```bash
# Clean and rebuild
rm -rf node_modules dist
npm ci
npm run build
```

#### Tests Fail in CI but Pass Locally
- Check for environment differences
- Verify test isolation
- Check for timing issues

#### Service Worker Not Updating
- Clear browser cache
- Unregister service worker in DevTools
- Wait for skipWaiting

#### PWA Not Installing
- Check manifest.json validity
- Verify HTTPS (required)
- Check icon sizes

### Support

**Issues:** https://github.com/protocolo-cdmx/protocolo-cdmx/issues
**Documentation:** https://github.com/protocolo-cdmx/protocolo-cdmx/docs
**Discussions:** https://github.com/protocolo-cdmx/protocolo-cdmx/discussions

## License

GPL v3 - Part of Protocolo CDMX
