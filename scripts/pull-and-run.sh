#!/bin/bash

# Pull and Run Script for ArvanCloud Registry
# Usage: ./scripts/pull-and-run.sh [version]

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

echo -e "${GREEN}📥 Pulling and running from ArvanCloud Registry${NC}"
echo -e "${YELLOW}Registry: ${REGISTRY}${NC}"
echo -e "${YELLOW}Image: ${IMAGE_NAME}:${VERSION}${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Login to ArvanCloud Registry (if needed)
echo -e "${GREEN}🔐 Checking ArvanCloud Registry login...${NC}"
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}Please login to ArvanCloud Registry:${NC}"
    docker login ${REGISTRY}
fi

# Pull the image
echo -e "${GREEN}📥 Pulling image from registry...${NC}"
docker pull ${REGISTRY}/${IMAGE_NAME}:${VERSION}

# Stop existing containers
echo -e "${GREEN}🛑 Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true

# Start services
echo -e "${GREEN}🚀 Starting services...${NC}"
docker-compose up -d

# Wait for services to be healthy
echo -e "${GREEN}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check service status
echo -e "${GREEN}📊 Checking service status...${NC}"
docker-compose ps

# Show logs
echo -e "${GREEN}📋 Recent logs:${NC}"
docker-compose logs --tail=20

echo -e "${GREEN}🎉 Services are running!${NC}"
echo -e "${YELLOW}API: http://localhost:3001${NC}"
echo -e "${YELLOW}API Docs: http://localhost:3001/api${NC}"
echo -e "${YELLOW}To view logs: docker-compose logs -f${NC}"
echo -e "${YELLOW}To stop: docker-compose down${NC}" 