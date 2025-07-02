#!/bin/bash

# Lightweight Docker Build Script
# Optimized for smallest possible images

set -e

# Configuration
REGISTRY="docker.arvancloud.ir"
IMAGE_NAME="portfolio-api"
VERSION=${1:-latest}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Building Ultra-Lightweight Docker Image${NC}"
echo -e "${BLUE}Registry: ${REGISTRY}${NC}"
echo -e "${BLUE}Image: ${IMAGE_NAME}:${VERSION}${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Enable BuildKit for better caching and smaller images
export DOCKER_BUILDKIT=1

# Build with maximum optimization
echo -e "${GREEN}📦 Building optimized Docker image...${NC}"
docker build \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    --cache-from ${REGISTRY}/${IMAGE_NAME}:latest \
    --tag ${REGISTRY}/${IMAGE_NAME}:${VERSION} \
    --tag ${REGISTRY}/${IMAGE_NAME}:latest \
    --target production \
    --progress=plain \
    .

# Show image size
echo -e "${GREEN}📊 Image size analysis:${NC}"
docker images ${REGISTRY}/${IMAGE_NAME}:${VERSION} --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Login to registry (if needed)
echo -e "${GREEN}🔐 Checking registry login...${NC}"
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}Please login to ArvanCloud Registry:${NC}"
    docker login ${REGISTRY}
fi

# Push images
echo -e "${GREEN}📤 Pushing images to registry...${NC}"
docker push ${REGISTRY}/${IMAGE_NAME}:${VERSION}
docker push ${REGISTRY}/${IMAGE_NAME}:latest

echo -e "${GREEN}✅ Successfully built and pushed lightweight images:${NC}"
echo -e "${YELLOW}  - ${REGISTRY}/${IMAGE_NAME}:${VERSION}${NC}"
echo -e "${YELLOW}  - ${REGISTRY}/${IMAGE_NAME}:latest${NC}"

# Show final image info
echo -e "${GREEN}📋 Final image information:${NC}"
docker images ${REGISTRY}/${IMAGE_NAME}:${VERSION} --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

echo -e "${GREEN}🎉 Lightweight build completed!${NC}"
echo -e "${YELLOW}To run: docker-compose up -d${NC}" 