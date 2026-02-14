#!/bin/bash

# ============================================================================
# Setup Script for Protocolo CDMX Development Environment
# ============================================================================
# This script sets up the development environment including:
# - Git hooks
# - VS Code settings
# - Initial dependencies
# - Environment files
# ============================================================================

set -e

echo "🔧 Protocolo CDMX - Development Setup"
echo "======================================"
echo ""

# Check Node.js version
echo "📋 Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18 or later."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or later required. Found: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check npm
echo "📋 Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi
echo "✅ npm $(npm -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm ci

# Setup Git hooks
echo ""
echo "🪝 Setting up Git hooks..."

# Pre-commit hook
cat > .git/hooks/pre-commit <<'EOF'
#!/bin/bash
# Pre-commit hook for Protocolo CDMX

echo "Running pre-commit checks..."

# Run linting
echo "  - Running ESLint..."
npm run lint || exit 1

# Run type checking
echo "  - Running TypeScript check..."
npm run typecheck || exit 1

# Run unit tests
echo "  - Running unit tests..."
npm run test:unit -- --run || exit 1

echo "✅ All checks passed!"
EOF

chmod +x .git/hooks/pre-commit

# Pre-push hook
cat > .git/hooks/pre-push <<'EOF'
#!/bin/bash
# Pre-push hook for Protocolo CDMX

echo "Running pre-push checks..."

# Run all tests
echo "  - Running full test suite..."
npm run test:unit -- --run || exit 1
npm run test:integration -- --run || exit 1

# Build to ensure no build errors
echo "  - Building application..."
npm run build || exit 1

echo "✅ All checks passed!"
EOF

chmod +x .git/hooks/pre-push

echo "✅ Git hooks installed"

# Create environment files
echo ""
echo "📝 Creating environment files..."

if [ ! -f ".env.local" ]; then
    cat > .env.local <<EOF
# Local environment variables
# Copy this file to .env.local and customize

# App Configuration
VITE_APP_NAME="Protocolo CDMX"
VITE_APP_VERSION="local-dev"

# Optional: Error tracking
# VITE_SENTRY_DSN=your_sentry_dsn_here

# Optional: API endpoints
# VITE_API_URL=http://localhost:3000/api

# Development settings
VITE_ENABLE_MOCKS=true
VITE_DEBUG_MODE=true
EOF
    echo "✅ Created .env.local"
fi

# Create VS Code settings
echo ""
echo "🔧 Setting up VS Code configuration..."
mkdir -p .vscode

cat > .vscode/settings.json <<EOF
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
EOF

cat > .vscode/extensions.json <<EOF
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-playwright.playwright"
  ]
}
EOF

echo "✅ VS Code settings created"

# Create .vscode/launch.json for debugging
cat > .vscode/launch.json <<EOF
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "request": "launch",
      "type": "chrome",
      "url": "http://localhost:5173",
      "webRoot": "\${workspaceFolder}"
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "\${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "--reporter", "verbose"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
EOF

echo "✅ VS Code launch configuration created"

# Run initial build
echo ""
echo "🏗️  Running initial build..."
npm run build

# Final message
echo ""
echo "======================================"
echo "✅ Setup complete!"
echo "======================================"
echo ""
echo "🚀 Getting Started:"
echo ""
echo "  Development server:"
echo "    npm run dev"
echo ""
echo "  Run tests:"
echo "    npm test"
echo ""
echo "  Build for production:"
echo "    npm run build"
echo ""
echo "  Preview production build:"
echo "    npm run preview"
echo ""
echo "📚 Documentation:"
echo "    ./docs/README.md"
echo ""
echo "🐳 Docker (optional):"
echo "    docker-compose up app"
echo ""
echo "Happy coding! 🎉"
