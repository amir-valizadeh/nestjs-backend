#!/bin/bash

# Generic Docker Build Script
# Usage: ./scripts/build.sh [version] [registry] [image-name]

set -e

# Configuration
VERSION=${1:-latest}
REGISTRY=${2:-""}
IMAGE_NAME=${3:-"portfolio-api"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Building Docker Image${NC}"
echo -e "${BLUE}Version: ${VERSION}${NC}"
echo -e "${BLUE}Registry: ${REGISTRY:-"local"}${NC}"
echo -e "${BLUE}Image: ${IMAGE_NAME}${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Enable BuildKit for better caching and smaller images
export DOCKER_BUILDKIT=1

# Build image
echo -e "${GREEN}📦 Building Docker image...${NC}"
if [ -n "$REGISTRY" ]; then
    # Build with registry
    docker build \
        --build-arg BUILDKIT_INLINE_CACHE=1 \
        --tag ${REGISTRY}/${IMAGE_NAME}:${VERSION} \
        --tag ${REGISTRY}/${IMAGE_NAME}:latest \
        --target production \
        --progress=plain \
        .
else
    # Build locally
    docker build \
        --build-arg BUILDKIT_INLINE_CACHE=1 \
        --tag ${IMAGE_NAME}:${VERSION} \
        --tag ${IMAGE_NAME}:latest \
        --target production \
        --progress=plain \
        .
fi

# Show image size
echo -e "${GREEN}📊 Image size analysis:${NC}"
if [ -n "$REGISTRY" ]; then
    docker images ${REGISTRY}/${IMAGE_NAME}:${VERSION} --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
else
    docker images ${IMAGE_NAME}:${VERSION} --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
fi

echo -e "${GREEN}✅ Successfully built image!${NC}"

# Optional: Push to registry if specified
if [ -n "$REGISTRY" ]; then
    echo -e "${GREEN}📤 Pushing to registry...${NC}"
    docker push ${REGISTRY}/${IMAGE_NAME}:${VERSION}
    docker push ${REGISTRY}/${IMAGE_NAME}:latest
    echo -e "${GREEN}✅ Successfully pushed to registry!${NC}"
fi

echo -e "${GREEN}🎉 Build completed!${NC}"
echo -e "${YELLOW}To run: docker-compose up -d${NC}" 