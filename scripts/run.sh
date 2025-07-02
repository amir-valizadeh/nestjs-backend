#!/bin/bash

# Docker Compose Run Script
# Usage: ./scripts/run.sh [environment]

set -e

# Configuration
ENVIRONMENT=${1:-production}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Portfolio API${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose is not installed. Please install it first.${NC}"
    exit 1
fi

# Set environment
export NODE_ENV=${ENVIRONMENT}

# Stop existing containers
echo -e "${GREEN}🛑 Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true

# Start services
echo -e "${GREEN}🚀 Starting services...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${GREEN}⏳ Waiting for services to be ready...${NC}"
sleep 15

# Check service status
echo -e "${GREEN}📊 Checking service status...${NC}"
docker-compose ps

# Show recent logs
echo -e "${GREEN}📋 Recent logs:${NC}"
docker-compose logs --tail=10

echo -e "${GREEN}🎉 Services are running!${NC}"
echo -e "${YELLOW}API: http://localhost:3001${NC}"
echo -e "${YELLOW}API Docs: http://localhost:3001/api${NC}"
echo -e "${YELLOW}To view logs: docker-compose logs -f${NC}"
echo -e "${YELLOW}To stop: docker-compose down${NC}" 