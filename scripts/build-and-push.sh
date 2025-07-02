#!/bin/bash

# Build and Push Script for ArvanCloud Registry
# Usage: ./scripts/build-and-push.sh [version]

set -e

# Configuration
REGISTRY="docker.arvancloud.ir"
IMAGE_NAME="portfolio-api"
VERSION=${1:-latest}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Building and pushing to ArvanCloud Registry${NC}"
echo -e "${YELLOW}Registry: ${REGISTRY}${NC}"
echo -e "${YELLOW}Image: ${IMAGE_NAME}:${VERSION}${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Build with cache
echo -e "${GREEN}📦 Building Docker image with cache...${NC}"
docker build \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    --cache-from ${REGISTRY}/${IMAGE_NAME}:latest \
    --tag ${REGISTRY}/${IMAGE_NAME}:${VERSION} \
    --tag ${REGISTRY}/${IMAGE_NAME}:latest \
    --target production \
    .

# Login to ArvanCloud Registry (if needed)
echo -e "${GREEN}🔐 Logging into ArvanCloud Registry...${NC}"
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}Please login to ArvanCloud Registry:${NC}"
    docker login ${REGISTRY}
fi

# Push images
echo -e "${GREEN}📤 Pushing images to registry...${NC}"
docker push ${REGISTRY}/${IMAGE_NAME}:${VERSION}
docker push ${REGISTRY}/${IMAGE_NAME}:latest

echo -e "${GREEN}✅ Successfully built and pushed:${NC}"
echo -e "${YELLOW}  - ${REGISTRY}/${IMAGE_NAME}:${VERSION}${NC}"
echo -e "${YELLOW}  - ${REGISTRY}/${IMAGE_NAME}:latest${NC}"

# Optional: Pull and run locally for testing
echo -e "${GREEN}🧪 Testing the pushed image...${NC}"
docker pull ${REGISTRY}/${IMAGE_NAME}:${VERSION}

echo -e "${GREEN}🎉 Build and push completed successfully!${NC}"
echo -e "${YELLOW}You can now run: docker-compose up -d${NC}" 