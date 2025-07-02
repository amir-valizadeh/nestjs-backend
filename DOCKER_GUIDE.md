# Docker Guide for Portfolio API

This guide covers Docker setup, usage, and troubleshooting for the Portfolio API.

## 🐳 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)

### Environment Setup

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=edy
DB_PASSWORD=edy123
DB_NAME=portfolio_db
DB_ROOT_PASSWORD=root_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# API Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
```

## 🚀 Usage

### Production Mode

```bash
# Build and run production containers
npm run docker:run

# Or manually:
./scripts/run.sh production
```

### Development Mode

```bash
# Run with hot reloading
npm run docker:dev

# Or manually:
docker-compose -f docker-compose.dev.yml up -d
```

### Manual Commands

```bash
# Build image locally
npm run docker:build

# Build and push to registry
npm run docker:build:registry

# Start services
npm run docker:up

# Stop services
npm run docker:down

# View logs
npm run docker:logs

# Clean up
npm run docker:clean
```

## 📦 Docker Images

### Multi-stage Build

The Dockerfile uses multi-stage builds for optimization:

1. **Base Stage**: Common dependencies
2. **Development Stage**: Full dependencies + source code
3. **Build Stage**: Compiles TypeScript to JavaScript
4. **Production Stage**: Minimal runtime with compiled code

### Image Sizes

- **Development**: ~500MB (includes dev dependencies)
- **Production**: ~200MB (optimized runtime)

## 🔧 Configuration

### Environment Variables

| Variable       | Default                 | Description         |
| -------------- | ----------------------- | ------------------- |
| `NODE_ENV`     | `production`            | Node.js environment |
| `PORT`         | `3001`                  | API port            |
| `DB_HOST`      | `mysql`                 | Database host       |
| `DB_PORT`      | `3306`                  | Database port       |
| `DB_USERNAME`  | `edy`                   | Database username   |
| `DB_PASSWORD`  | `edy123`                | Database password   |
| `DB_NAME`      | `portfolio_db`          | Database name       |
| `JWT_SECRET`   | Required                | JWT secret key      |
| `FRONTEND_URL` | `http://localhost:3000` | CORS origin         |

### Ports

- **3001**: API server
- **3306**: MySQL database
- **9229**: Node.js debug (development only)

## 🏗️ Build Scripts

### Generic Build Script

```bash
# Build locally
./scripts/build.sh

# Build with version
./scripts/build.sh v1.0.0

# Build for registry
./scripts/build.sh latest docker.arvancloud.ir portfolio-api
```

### Registry Integration

```bash
# Login to registry
docker login docker.arvancloud.ir

# Build and push
npm run docker:build:registry
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Check what's using the port
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3002 npm run docker:run
```

#### 2. Database Connection Issues

```bash
# Check database logs
docker-compose logs mysql

# Restart database
docker-compose restart mysql

# Reset database
docker-compose down -v
docker-compose up -d
```

#### 3. Permission Issues

```bash
# Fix file permissions
chmod +x scripts/*.sh

# Run with sudo (if needed)
sudo docker-compose up -d
```

#### 4. Build Failures

```bash
# Clean build cache
docker system prune -a

# Rebuild without cache
docker build --no-cache .

# Check disk space
df -h
```

### Health Checks

#### API Health

```bash
# Check API health
curl http://localhost:3001/health

# Check container health
docker-compose ps
```

#### Database Health

```bash
# Check database connection
docker exec portfolio_mysql mysql -u edy -pedy123 -e "SELECT 1"

# Check database logs
docker-compose logs mysql
```

## 🔍 Monitoring

### Logs

```bash
# View all logs
docker-compose logs

# Follow logs
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs mysql
```

### Resource Usage

```bash
# Check container stats
docker stats

# Check disk usage
docker system df

# Check image sizes
npm run docker:size
```

## 🧹 Maintenance

### Cleanup Commands

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Full cleanup
docker system prune -a
```

### Backup Database

```bash
# Create backup
docker exec portfolio_mysql mysqldump -u edy -pedy123 portfolio_db > backup.sql

# Restore backup
docker exec -i portfolio_mysql mysql -u edy -pedy123 portfolio_db < backup.sql
```

## 🔒 Security

### Best Practices

1. **Use non-root user** in production images
2. **Keep secrets in environment variables**
3. **Regular security updates**
4. **Network isolation** with custom networks
5. **Resource limits** for containers

### Security Scanning

```bash
# Scan for vulnerabilities
docker scan portfolio-api:latest

# Update base images regularly
docker pull node:20-alpine
```

## 📊 Performance

### Optimization Tips

1. **Use multi-stage builds** (already implemented)
2. **Leverage BuildKit caching**
3. **Minimize layer count**
4. **Use .dockerignore** (already configured)
5. **Optimize base images**

### Resource Limits

```yaml
# Add to docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

## 🚀 Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Health checks passing
- [ ] Logs monitored
- [ ] Backup strategy in place
- [ ] SSL/TLS configured (if needed)

### Scaling

```bash
# Scale backend service
docker-compose up -d --scale backend=3

# Use load balancer
# Configure nginx or similar
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/deployment)
- [MySQL Docker Image](https://hub.docker.com/_/mysql)

## 🆘 Support

For issues:

1. Check this troubleshooting guide
2. Review Docker logs
3. Check environment configuration
4. Verify network connectivity
5. Create an issue in the repository
