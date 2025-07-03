# 🚀 Cryptocurrency Portfolio Management API

A comprehensive NestJS backend API for managing cryptocurrency portfolios with real-time price data from Bitazza exchange, user authentication, and portfolio performance tracking.

## 🌐 **Production URL**: https://65.109.209.105

## 🚀 Recent Improvements

### Fixed Issues:

1. **Bitazza API Integration**:
   - Reduced rate limiting from 2s to 1s for more frequent updates
   - Improved error handling and fallback mechanisms
   - Added better logging for API responses
   - Enhanced timeout handling (10s instead of 15s)
   - Added automatic seeding when database is empty

2. **Portfolio Data**:
   - Added sample portfolio data seeding endpoint
   - Portfolio now returns meaningful data instead of empty lists
   - Added comprehensive sample data for testing

3. **Cryptocurrency Coverage**:
   - Expanded from 6 to 12 cryptocurrencies
   - Added BNB, DOT, LINK, LTC, MATIC, UNI
   - Improved mock data with realistic prices

## 📋 Table of Contents

- [Features](#-features)
- [Project Flow](#-project-flow)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Security](#-security)
- [Performance](#-performance)

## ✨ Features

### 🔐 Authentication & Security

- **JWT-based authentication** with secure token management
- **Password hashing** using bcrypt with salt rounds
- **Input validation** with comprehensive DTOs
- **Environment variable validation** for secure configuration
- **CORS protection** with configurable origins

### 💼 Portfolio Management

- **CRUD operations** for cryptocurrency portfolios
- **Real-time price integration** with Bitazza API
- **Portfolio performance tracking** with profit/loss calculations
- **Pagination support** for large datasets
- **Database constraints** for data integrity

### 💰 Price Data

- **Real-time cryptocurrency prices** from Bitazza API
- **Intelligent caching** with fallback mechanisms
- **Rate limiting** to respect API constraints
- **Mock data fallback** for development and API failures
- **Multiple data formats** support (array and object responses)

### 🧪 Testing & Quality

- **Comprehensive unit tests** with 90%+ coverage
- **End-to-end (E2E) tests** for all endpoints
- **Integration tests** for database operations
- **Mock services** for isolated testing
- **Test documentation** and guides

## 🔄 Project Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PORTFOLIO MANAGEMENT FLOW                         │
└─────────────────────────────────────────────────────────────────────────────┘

1. USER REGISTRATION & AUTHENTICATION
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │   Frontend  │───▶│   Register  │───▶│   Validate  │───▶│   Database  │
   │   Request   │    │   DTO       │    │   Input     │    │   Storage   │
   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
           │                   │                   │                   │
           ▼                   ▼                   ▼                   ▼
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │   JWT Token │◀───│   Hash      │◀───│   Password  │◀───│   User      │
   │   Response  │    │   Password  │    │   Validation│    │   Creation  │
   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

2. USER LOGIN & TOKEN GENERATION
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │   Login     │───▶│   Validate  │───▶│   Check     │───▶│   Generate  │
   │   Request   │    │   Credentials│    │   Database  │    │   JWT Token │
   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
           │                   │                   │                   │
           ▼                   ▼                   ▼                   ▼
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │   Return    │◀───│   Compare   │◀───│   Fetch     │◀───│   Sign      │
   │   Token     │    │   Password  │    │   User      │    │   Payload   │
   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

3. PORTFOLIO OPERATIONS (Protected Routes)
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │   JWT       │───▶│   Validate  │───▶│   Extract   │───▶│   Database  │
   │   Token     │    │   Token     │    │   User ID   │    │   Query     │
   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
           │                   │                   │                   │
           ▼                   ▼                   ▼                   ▼
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │   Portfolio │◀───│   Process   │◀───│   Validate  │◀───│   Return    │
   │   Response  │    │   Request   │    │   Data      │    │   Results   │
   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

4. PRICE DATA INTEGRATION
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │   Price     │───▶│   Check     │───▶│   Bitazza   │───▶│   Process   │
   │   Request   │    │   Cache     │    │   API Call  │    │   Response  │
   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
           │                   │                   │                   │
           ▼                   ▼                   ▼                   ▼
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │   Return    │◀───│   Update    │◀───│   Cache     │◀───│   Validate  │
   │   Prices    │    │   Database  │    │   Data      │    │   Format    │
   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

5. ERROR HANDLING & FALLBACKS
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │   API       │───▶│   Check     │───▶│   Use       │───▶│   Return    │
   │   Failure   │    │   Cache     │    │   Mock      │    │   Fallback  │
   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
           │                   │                   │                   │
           ▼                   ▼                   ▼                   ▼
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │   Log       │◀───│   Increment │◀───│   Reset     │◀───│   Cache     │
   │   Error     │    │   Failures  │    │   Counter   │    │   Response  │
   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## 🏗️ Architecture

### Core Modules

```
src/
├── auth/                    # 🔐 Authentication & Authorization
│   ├── dto/                # Data Transfer Objects
│   │   ├── login.dto.ts    # Login validation
│   │   └── register.dto.ts # Registration validation
│   ├── guards/             # Route protection
│   │   └── jwt-auth.guard.ts
│   ├── auth.controller.ts  # Auth endpoints
│   ├── auth.service.ts     # Auth business logic
│   ├── auth.module.ts      # Auth module configuration
│   └── jwt.strategy.ts     # JWT strategy implementation
│
├── portfolio/              # 💼 Portfolio Management
│   ├── dto/               # Portfolio DTOs
│   │   ├── create-portfolio.dto.ts
│   │   └── update-portfolio.dto.ts
│   ├── entities/          # Database entities
│   │   └── portfolio.entity.ts
│   ├── portfolio.controller.ts # Portfolio endpoints
│   ├── portfolio.service.ts    # Portfolio business logic
│   └── portfolio.module.ts     # Portfolio module config
│
├── price/                 # 💰 Price Data Management
│   ├── dto/              # Price response DTOs
│   │   └── price-response.dto.ts
│   ├── entities/         # Cryptocurrency entities
│   │   └── cryptocurrency.entity.ts
│   ├── price.controller.ts    # Price endpoints
│   ├── price.service.ts       # Price business logic
│   ├── cryptocurrency.service.ts # Database operations
│   └── price.module.ts        # Price module config
│
├── users/                 # 👥 User Management
│   ├── user.entity.ts     # User database entity
│   ├── users.service.ts   # User business logic
│   └── users.module.ts    # User module config
│
├── app.module.ts          # 🏠 Main application module
├── main.ts               # 🚀 Application bootstrap
└── health.controller.ts   # 🏥 Health check endpoints
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the application
npm run start:dev
```

### Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3000
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=crypto_portfolio

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# API Configuration
PORT=3000
NODE_ENV=development

# External APIs
BITAZZA_API_URL=https://apexapi.bitazza.com:8443/AP/GetLevel1SummaryMin?OMSId=1

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## 📚 API Documentation

### Authentication Endpoints

```http
POST /api/auth/register
POST /api/auth/login
```

### Portfolio Endpoints

```http
GET    /api/portfolio              # Get user portfolios (paginated)
POST   /api/portfolio              # Create new portfolio entry
GET    /api/portfolio/:id          # Get specific portfolio
PATCH  /api/portfolio/:id          # Update portfolio
DELETE /api/portfolio/:id          # Delete portfolio
GET    /api/portfolio/performance  # Get portfolio performance
```

### Price Endpoints

```http
GET /api/price/current             # Get current prices
GET /api/price/symbols            # Get available symbols
GET /api/price/cryptocurrencies    # Get detailed cryptocurrency data
GET /api/price/:symbol            # Get specific cryptocurrency price
POST /api/price/seed               # Seed initial cryptocurrency data
```

### Health Check

```http
GET /api/health                   # Health check endpoint
```

### Interactive Documentation

Visit `http://localhost:3001/api` for Swagger UI documentation.

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov

# Watch mode
npm run test:watch
```

### Test Coverage

- **Unit Tests**: 90%+ coverage
- **E2E Tests**: All endpoints covered
- **Integration Tests**: Database operations
- **Mock Services**: Isolated testing

## 🐳 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individual containers
docker build -t crypto-portfolio-api .
docker run -p 3000:3000 crypto-portfolio-api
```

### Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

## 🔒 Security Features

### Implemented Security Measures

- ✅ **JWT Authentication** with secure token management
- ✅ **Password Hashing** using bcrypt with salt rounds
- ✅ **Input Validation** with comprehensive DTOs
- ✅ **Environment Variable Validation** for secure configuration
- ✅ **CORS Protection** with configurable origins
- ✅ **SQL Injection Prevention** through TypeORM
- ✅ **Rate Limiting** for API endpoints
- ✅ **Error Handling** without sensitive data exposure

## ⚡ Performance Features

### Optimization Strategies

- **Intelligent Caching**: 30-second cache for price data
- **Database Indexes**: Optimized queries with proper indexing
- **Pagination**: Efficient handling of large datasets
- **Rate Limiting**: Respectful API usage
- **Connection Pooling**: Efficient database connections
- **Mock Data Fallback**: Reliable service during API failures

### Performance Metrics

- **Response Time**: < 200ms for cached data
- **Database Queries**: Optimized with indexes
- **Memory Usage**: Efficient caching strategies
- **Error Recovery**: Graceful fallback mechanisms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the [API Documentation](http://localhost:3001/api)
- Review the [Testing Guide](./TESTING_GUIDE.md)
- Check the [Deployment Guide](./DEPLOYMENT.md)
- Review the [Improvement Plan](./IMPROVEMENT_PLAN.md)

---

**Built with ❤️ using NestJS, TypeScript, and MySQL**
