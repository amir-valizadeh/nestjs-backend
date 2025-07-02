# Deployment Guide

This guide covers different deployment options for the Portfolio Management API.

## 🐳 Docker Deployment (Recommended)

### Prerequisites

- Docker
- Docker Compose

### 1. Create Dockerfile

```dockerfile
# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:prod"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: portfolio_mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USERNAME}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    ports:
      - '3306:3306'
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - portfolio_network

  backend:
    build: .
    container_name: portfolio_backend
    restart: always
    env_file:
      - .env
    ports:
      - '3001:3001'
    depends_on:
      - mysql
    networks:
      - portfolio_network

volumes:
  mysql_data:

networks:
  portfolio_network:
    driver: bridge
```

### 3. Environment Variables for Docker

Create a `.env` file:

```env
# Database
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=edy
DB_PASSWORD=edy@123
DB_NAME=portfolio_db
DB_ROOT_PASSWORD=root_password_here

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# API
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3000

# Bitazza API
BITAZZA_API_URL=https://apexapi.bitazza.com:8443/AP/GetLevel1SummaryMin?OMSId=1
```

### 4. Deploy with Docker Compose

```bash
# Build and start services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☁️ Cloud Deployment

### AWS Deployment

#### Option 1: AWS ECS with Fargate

1. **Create ECR Repository**

```bash
aws ecr create-repository --repository-name portfolio-api
```

2. **Build and Push Docker Image**

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t portfolio-api .

# Tag image
docker tag portfolio-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/portfolio-api:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/portfolio-api:latest
```

3. **Create ECS Task Definition**

```json
{
  "family": "portfolio-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "portfolio-api",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/portfolio-api:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:portfolio/db-password"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:portfolio/jwt-secret"
        }
      ]
    }
  ]
}
```

#### Option 2: AWS Lambda with API Gateway

1. **Install Serverless Framework**

```bash
npm install -g serverless
```

2. **Create serverless.yml**

```yaml
service: portfolio-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    NODE_ENV: production
    DB_HOST: ${ssm:/portfolio/db-host}
    DB_PORT: ${ssm:/portfolio/db-port}
    DB_USERNAME: ${ssm:/portfolio/db-username}
    DB_PASSWORD: ${ssm:/portfolio/db-password}
    DB_NAME: ${ssm:/portfolio/db-name}
    JWT_SECRET: ${ssm:/portfolio/jwt-secret}

functions:
  api:
    handler: dist/lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
```

### Google Cloud Platform (GCP)

#### Option 1: Cloud Run

1. **Build and Deploy**

```bash
# Build image
gcloud builds submit --tag gcr.io/PROJECT_ID/portfolio-api

# Deploy to Cloud Run
gcloud run deploy portfolio-api \
  --image gcr.io/PROJECT_ID/portfolio-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Option 2: App Engine

1. **Create app.yaml**

```yaml
runtime: nodejs18
env: standard

env_variables:
  NODE_ENV: production
  DB_HOST: /cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
  DB_PORT: 3306
  DB_USERNAME: portfolio_user
  DB_PASSWORD: your_password
  DB_NAME: portfolio_db
  JWT_SECRET: your_jwt_secret

beta_settings:
  cloud_sql_instances: PROJECT_ID:REGION:INSTANCE_NAME
```

### Azure

#### Option 1: Azure Container Instances

```bash
# Build and push to Azure Container Registry
az acr build --registry myregistry --image portfolio-api .

# Deploy to Container Instances
az container create \
  --resource-group myResourceGroup \
  --name portfolio-api \
  --image myregistry.azurecr.io/portfolio-api:latest \
  --ports 3001 \
  --environment-variables \
    NODE_ENV=production \
    DB_HOST=your-db-host \
    DB_PORT=3306
```

## 🚀 Production Considerations

### 1. Environment Variables

Use environment-specific configuration:

```bash
# Development
NODE_ENV=development
DB_HOST=localhost

# Production
NODE_ENV=production
DB_HOST=your-production-db-host
```

### 2. Database Setup

For production, consider:

- **Managed Database Service**: AWS RDS, GCP Cloud SQL, Azure Database
- **Connection Pooling**: Configure TypeORM connection pool
- **Backup Strategy**: Automated backups
- **Monitoring**: Database performance monitoring

### 3. Security

- **HTTPS**: Use SSL/TLS certificates
- **Secrets Management**: Use AWS Secrets Manager, GCP Secret Manager, or Azure Key Vault
- **Network Security**: Configure VPC, firewall rules
- **CORS**: Restrict to specific domains

### 4. Monitoring and Logging

```typescript
// Add logging to main.ts
import { Logger } from '@nestjs/common';

const logger = new Logger('Bootstrap');

// Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### 5. Performance Optimization

```typescript
// In app.module.ts
TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    // ... existing config
    extra: {
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
    },
    logging: configService.get('NODE_ENV') === 'development',
  }),
});
```

## 📊 Health Checks

Add health check endpoints:

```typescript
// health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build

      - name: Build Docker image
        run: docker build -t portfolio-api .

      - name: Deploy to AWS ECS
        run: |
          # Deploy commands here
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check firewall rules
   - Verify connection string
   - Test database connectivity

2. **Memory Issues**
   - Monitor memory usage
   - Increase container memory limits
   - Optimize TypeORM queries

3. **Performance Issues**
   - Enable query logging
   - Add database indexes
   - Implement caching

### Logs and Monitoring

```bash
# View application logs
docker-compose logs -f backend

# Monitor resource usage
docker stats

# Check database connectivity
mysql -h your-db-host -u your-username -p
```

## 📈 Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml with multiple instances
services:
  backend:
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
```

### Load Balancer Configuration

```nginx
upstream portfolio_api {
    server backend1:3001;
    server backend2:3001;
    server backend3:3001;
}

server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://portfolio_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
