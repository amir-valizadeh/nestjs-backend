# Quick Start Guide

Get your Portfolio Management API up and running in 5 minutes! 🚀

## Prerequisites

- Node.js (v18+)
- MySQL (v8.0+)
- npm or yarn

## ⚡ Quick Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd backend
npm install
```

### 2. Database Setup

```bash
# Start MySQL (if not running)
brew services start mysql

# Create database
mysql -u root -p
CREATE DATABASE portfolio_db;
exit;
```

### 3. Environment Configuration

Create `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=edy
DB_PASSWORD=edy@123
DB_NAME=portfolio_db
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=http://localhost:3000
BITAZZA_API_URL=https://apexapi.bitazza.com:8443/AP/GetLevel1SummaryMin?OMSId=1
```

### 4. Start Development Server

```bash
npm run start:dev
```

🎉 **Your API is now running at http://localhost:3001**

## 📚 API Documentation

Visit **http://localhost:3001/api** for interactive Swagger documentation.

## 🧪 Quick Test

### 1. Register a User

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Create Portfolio Entry

```bash
# Replace <TOKEN> with the access_token from login response
curl -X POST http://localhost:3001/portfolio \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "cryptocurrencyType": "BTC_THB",
    "amount": 1.5,
    "purchaseDate": "2024-01-15T10:30:00.000Z",
    "purchasePrice": 50000
  }'
```

### 4. Get Current Prices

```bash
curl http://localhost:3001/price/current
```

## 🔧 Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debug mode

# Production
npm run build             # Build for production
npm run start:prod        # Start production server

# Testing
npm run test              # Run unit tests
npm run test:e2e          # Run e2e tests
npm run test:cov          # Run tests with coverage

# Code Quality
npm run lint              # Run ESLint
npm run format            # Format code with Prettier
```

## 📁 Project Structure

```
src/
├── auth/                 # 🔐 Authentication
│   ├── dto/             # Login/Register DTOs
│   ├── guards/          # JWT guards
│   └── ...
├── portfolio/           # 💼 Portfolio management
│   ├── dto/            # Portfolio DTOs
│   ├── entities/       # Database entities
│   └── ...
├── price/              # 💰 Price data
├── users/              # 👥 User management
└── main.ts             # 🚀 App entry point
```

## 🔐 Authentication Flow

1. **Register** → `POST /auth/register`
2. **Login** → `POST /auth/login` → Get JWT token
3. **Use token** → Add `Authorization: Bearer <token>` header

## 📊 API Endpoints

### Public Endpoints

- `GET /price/current` - Current cryptocurrency prices
- `GET /price/symbols` - Available symbols
- `GET /price/:symbol` - Specific symbol price

### Protected Endpoints (Require JWT)

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /portfolio` - Get user portfolios
- `POST /portfolio` - Create portfolio entry
- `GET /portfolio/:id` - Get specific portfolio
- `PATCH /portfolio/:id` - Update portfolio
- `DELETE /portfolio/:id` - Delete portfolio
- `GET /portfolio/performance` - Portfolio performance

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if MySQL is running
brew services list | grep mysql

# Test connection
mysql -u edy -p -e "USE portfolio_db; SHOW TABLES;"
```

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Next Steps

1. **Explore the API** using Swagger UI at `/api`
2. **Add more features** like portfolio analytics
3. **Set up testing** with your preferred frontend
4. **Deploy to production** using the deployment guide

## 📞 Need Help?

- Check the full [API Documentation](API_DOCUMENTATION.md)
- Review the [Deployment Guide](DEPLOYMENT.md)
- Create an issue in the repository

---

**Happy coding! 🎉**
