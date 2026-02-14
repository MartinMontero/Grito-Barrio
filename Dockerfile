# ============================================================================
# Dockerfile for Protocolo CDMX
# 
# This Dockerfile creates a containerized development environment
# with hot reload support for local development.
# ============================================================================

# Stage 1: Development
FROM node:18-alpine AS development

# Install dependencies for development
RUN apk add --no-cache \
    git \
    openssh-client \
    bash

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start development server with hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 2: Build
FROM node:18-alpine AS build

# Install build dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Build arguments
ARG VITE_APP_VERSION
ARG VITE_BUILD_DATE
ARG VITE_BUILD_COMMIT
ARG NODE_ENV=production

# Set environment variables
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_BUILD_DATE=$VITE_BUILD_DATE
ENV VITE_BUILD_COMMIT=$VITE_BUILD_COMMIT
ENV NODE_ENV=$NODE_ENV

# Build the application
RUN npm run build

# Stage 3: Production
FROM nginx:alpine AS production

# Install additional nginx modules if needed
RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create necessary directories
RUN mkdir -p /usr/share/nginx/html/icons

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
