# Portfolio Management API Documentation

## Overview

The Portfolio Management API is a comprehensive REST API for managing cryptocurrency portfolios with real-time price data, user authentication, and portfolio performance tracking. Built with NestJS, TypeScript, and MySQL.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://your-domain.com`

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Codes

| Code | Description                             |
| ---- | --------------------------------------- |
| 200  | Success                                 |
| 201  | Created                                 |
| 400  | Bad Request - Validation error          |
| 401  | Unauthorized - Invalid or missing token |
| 403  | Forbidden - Insufficient permissions    |
| 404  | Not Found - Resource not found          |
| 409  | Conflict - Resource already exists      |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error                   |

## API Endpoints

### Authentication

#### Register User

```http
POST /auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Password Requirements:**

- Minimum 8 characters
- Maximum 50 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one number
- Must contain at least one special character (@$!%\*?&)

**Response (201):**

```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

- `400` - Validation error (invalid email, weak password, missing fields)
- `409` - User already exists

#### Login User

```http
POST /auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Error Responses:**

- `400` - Validation error (invalid email format, missing password)
- `401` - Invalid credentials

### Portfolio Management

#### Create Portfolio Entry

```http
POST /portfolio
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "cryptocurrencyType": "BTC_THB",
  "amount": 0.5,
  "purchaseDate": "2024-01-15T10:30:00.000Z",
  "purchasePrice": 2500000
}
```

**Supported Cryptocurrencies:**

- BTC_THB (Bitcoin)
- ETH_THB (Ethereum)
- ADA_THB (Cardano)
- DOGE_THB (Dogecoin)
- XRP_THB (Ripple)
- SOL_THB (Solana)
- BNB_THB (Binance Coin)
- DOT_THB (Polkadot)
- LINK_THB (Chainlink)
- LTC_THB (Litecoin)

**Validation Rules:**

- `amount`: Minimum 0.00000001, Maximum 999999999
- `purchasePrice`: Minimum 0.01, Maximum 999999999
- `purchaseDate`: Cannot be in the future
- `cryptocurrencyType`: Must be from supported list

**Response (201):**

```json
{
  "id": 1,
  "cryptocurrencyType": "BTC_THB",
  "amount": 0.5,
  "purchaseDate": "2024-01-15T10:30:00.000Z",
  "purchasePrice": 2500000,
  "userId": 1,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

- `400` - Validation error (invalid cryptocurrency, future date, invalid amounts)
- `401` - Unauthorized

#### Get User Portfolios

```http
GET /portfolio?page=1&limit=10&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `startDate` (optional): Filter start date (ISO format)
- `endDate` (optional): Filter end date (ISO format)

**Response (200):**

```json
{
  "portfolios": [
    {
      "id": 1,
      "cryptocurrencyType": "BTC_THB",
      "amount": 0.5,
      "purchaseDate": "2024-01-15T10:30:00.000Z",
      "purchasePrice": 2500000,
      "userId": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

#### Get Specific Portfolio

```http
GET /portfolio/{id}
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "id": 1,
  "cryptocurrencyType": "BTC_THB",
  "amount": 0.5,
  "purchaseDate": "2024-01-15T10:30:00.000Z",
  "purchasePrice": 2500000,
  "userId": 1,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

- `404` - Portfolio not found
- `401` - Unauthorized

#### Update Portfolio

```http
PATCH /portfolio/{id}
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "amount": 1.0,
  "purchasePrice": 2600000,
  "purchaseDate": "2024-01-15T10:30:00.000Z"
}
```

**Response (200):**

```json
{
  "id": 1,
  "cryptocurrencyType": "BTC_THB",
  "amount": 1.0,
  "purchaseDate": "2024-01-15T10:30:00.000Z",
  "purchasePrice": 2600000,
  "userId": 1,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### Delete Portfolio

```http
DELETE /portfolio/{id}
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "message": "Portfolio deleted successfully"
}
```

#### Get Portfolio Performance

```http
GET /portfolio/performance?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Query Parameters:**

- `startDate` (optional): Start date for performance calculation
- `endDate` (optional): End date for performance calculation

**Response (200):**

```json
{
  "portfolios": [
    {
      "id": 1,
      "cryptocurrencyType": "BTC_THB",
      "amount": 0.5,
      "purchaseDate": "2024-01-15T10:30:00.000Z",
      "purchasePrice": 2500000,
      "userId": 1
    }
  ],
  "totalInvestment": 1250000,
  "count": 1
}
```

### Cryptocurrency Prices

#### Get Current Prices

```http
GET /price
```

**Response (200):**

```json
{
  "BTC_THB": {
    "price": 2500000,
    "change": 15000,
    "changePercent": 0.6,
    "high": 2520000,
    "low": 2480000,
    "volume": 1500
  },
  "ETH_THB": {
    "price": 85000,
    "change": -500,
    "changePercent": -0.6,
    "high": 86000,
    "low": 84000,
    "volume": 5000
  }
}
```

#### Get Specific Price

```http
GET /price/{symbol}
```

**Response (200):**

```json
{
  "price": 2500000
}
```

**Error Responses:**

- `404` - Symbol not found

#### Get Available Symbols

```http
GET /price/symbols
```

**Response (200):**

```json
["BTC_THB", "ETH_THB", "ADA_THB", "DOGE_THB", "XRP_THB", "SOL_THB"]
```

### Health Check

#### Get API Status

```http
GET /health
```

**Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Price endpoints**: 1 request per 2 seconds
- **Other endpoints**: 100 requests per minute per user

When rate limited, the API returns:

```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded. Please wait X seconds.",
  "error": "Too Many Requests"
}
```

## Caching

The API implements intelligent caching:

- **Price data**: 30-second cache with fallback to database
- **User data**: No caching (always fresh)
- **Portfolio data**: No caching (always fresh)

## Testing

### Running Tests

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

### Test Coverage

The API includes comprehensive test coverage:

- **Unit Tests**: All services, controllers, and utilities
- **E2E Tests**: Complete API endpoint testing
- **Integration Tests**: Database and external API integration

### Test Examples

#### Authentication Tests

```typescript
// Register user
POST /auth/register
{
  "email": "test@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}

// Login user
POST /auth/login
{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

#### Portfolio Tests

```typescript
// Create portfolio
POST /portfolio
Authorization: Bearer <token>
{
  "cryptocurrencyType": "BTC_THB",
  "amount": 0.5,
  "purchaseDate": "2024-01-15T10:30:00.000Z",
  "purchasePrice": 2500000
}

// Get portfolios
GET /portfolio
Authorization: Bearer <token>
```

## Environment Variables

Required environment variables:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=portfolio_db

# JWT
JWT_SECRET=your_jwt_secret_key

# API
PORT=3001
NODE_ENV=development

# External APIs
BITAZZA_API_URL=https://apexapi.bitazza.com:8443/AP/GetLevel1SummaryMin?OMSId=1

# Frontend (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive DTO validation
- **CORS Protection**: Configurable cross-origin requests
- **Rate Limiting**: Protection against API abuse
- **SQL Injection Protection**: TypeORM with parameterized queries
- **XSS Protection**: Input sanitization and validation

## Performance Features

- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Efficient data retrieval for large datasets
- **Caching**: Intelligent caching for price data
- **Connection Pooling**: Database connection optimization
- **Compression**: Response compression for better performance

## Monitoring

The API includes comprehensive logging and monitoring:

- **Request Logging**: All API requests and responses
- **Error Logging**: Detailed error tracking
- **Performance Metrics**: Response time monitoring
- **Health Checks**: Application status monitoring

## Support

For API support and questions:

- **Documentation**: Available at `/api` endpoint when running
- **Issues**: Report via GitHub issues
- **Email**: support@your-domain.com

## Versioning

Current API version: `v1.0`

API versioning strategy:

- URL-based versioning (planned for v2)
- Backward compatibility maintained
- Deprecation notices provided in advance
