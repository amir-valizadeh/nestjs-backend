# Testing Guide

## Overview

This guide covers comprehensive testing strategies for the Portfolio Management API, including unit tests, integration tests, and end-to-end (E2E) tests.

## Test Structure

```
test/
├── app.e2e-spec.ts          # Basic app E2E tests
├── auth.e2e-spec.ts         # Authentication E2E tests
└── portfolio.e2e-spec.ts    # Portfolio E2E tests

src/
├── auth/
│   ├── auth.service.spec.ts # Auth service unit tests
│   └── ...
├── portfolio/
│   ├── portfolio.service.spec.ts # Portfolio service unit tests
│   └── ...
├── price/
│   ├── price.service.spec.ts # Price service unit tests
│   └── ...
└── users/
    ├── users.service.spec.ts # Users service unit tests
    └── ...
```

## Running Tests

### Prerequisites

1. **Database Setup**: Ensure test database is configured
2. **Environment Variables**: Set up test environment variables
3. **Dependencies**: Install all required packages

```bash
# Install dependencies
npm install

# Set up test environment
cp .env.example .env.test
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- auth.service.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create user"
```

## Unit Tests

### Auth Service Tests

**File**: `src/auth/auth.service.spec.ts`

**Coverage**:

- User validation
- Login functionality
- Registration with password hashing
- Error handling

**Key Test Cases**:

```typescript
describe('validateUser', () => {
  it('should return user without password when credentials are valid');
  it('should return null when user not found');
  it('should return null when password is invalid');
});

describe('login', () => {
  it('should return access token and user data when credentials are valid');
  it('should throw UnauthorizedException when credentials are invalid');
});

describe('register', () => {
  it('should create a new user with hashed password');
  it('should throw ConflictException when user already exists');
});
```

### Portfolio Service Tests

**File**: `src/portfolio/portfolio.service.spec.ts`

**Coverage**:

- CRUD operations
- Pagination
- Date validation
- Performance calculations

**Key Test Cases**:

```typescript
describe('create', () => {
  it('should create a new portfolio entry');
  it('should throw BadRequestException when purchase date is in the future');
});

describe('findAllByUser', () => {
  it('should return paginated portfolios without filters');
  it('should return paginated portfolios with date filters');
});

describe('getPortfolioPerformance', () => {
  it('should return portfolio performance without date filters');
  it('should return portfolio performance with date filters');
  it('should throw BadRequestException when start date is after end date');
});
```

### Price Service Tests

**File**: `src/price/price.service.spec.ts`

**Coverage**:

- API data fetching
- Caching mechanisms
- Error handling
- Rate limiting

**Key Test Cases**:

```typescript
describe('getCurrentPrices', () => {
  it('should return cached prices if available and not expired');
  it('should fetch prices from database first');
  it('should fetch prices from API when database is empty');
  it('should handle rate limiting by returning cached data');
  it('should handle API timeout errors');
  it('should return mock data after consecutive failures');
});
```

### Users Service Tests

**File**: `src/users/users.service.spec.ts`

**Coverage**:

- User creation
- User lookup
- Duplicate email handling

**Key Test Cases**:

```typescript
describe('create', () => {
  it('should create a new user successfully');
  it('should throw ConflictException when user already exists');
});

describe('findByEmail', () => {
  it('should return user when found');
  it('should return undefined when user not found');
});
```

## E2E Tests

### Authentication E2E Tests

**File**: `test/auth.e2e-spec.ts`

**Coverage**:

- User registration
- User login
- Input validation
- Error responses

**Key Test Scenarios**:

```typescript
describe('/auth/register (POST)', () => {
  it('should register a new user successfully');
  it('should fail with weak password');
  it('should fail with invalid email');
  it('should fail when user already exists');
});

describe('/auth/login (POST)', () => {
  it('should login successfully with valid credentials');
  it('should fail with invalid email');
  it('should fail with invalid password');
});
```

### Portfolio E2E Tests

**File**: `test/portfolio.e2e-spec.ts`

**Coverage**:

- Portfolio CRUD operations
- Authentication requirements
- Data validation
- Pagination

**Key Test Scenarios**:

```typescript
describe('/portfolio (POST)', () => {
  it('should create a new portfolio entry');
  it('should fail with invalid cryptocurrency type');
  it('should fail with future purchase date');
  it('should fail without authentication');
});

describe('/portfolio (GET)', () => {
  it('should return user portfolios with pagination');
  it('should return portfolios with custom pagination');
  it('should fail without authentication');
});
```

## Test Configuration

### Jest Configuration

**File**: `package.json`

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

### E2E Test Configuration

**File**: `test/jest-e2e.json`

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

## Mocking Strategies

### Database Mocking

```typescript
const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  remove: jest.fn(),
};

// In test setup
{
  provide: getRepositoryToken(Entity),
  useValue: mockRepository,
}
```

### External API Mocking

```typescript
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock successful response
mockedAxios.get.mockResolvedValue({ data: mockApiResponse });

// Mock error response
mockedAxios.get.mockRejectedValue(mockError);
```

### Service Mocking

```typescript
const mockService = {
  method: jest.fn(),
};

// In test setup
{
  provide: ServiceClass,
  useValue: mockService,
}
```

## Test Data Management

### Test Fixtures

Create reusable test data:

```typescript
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  password: 'hashedPassword',
  firstName: 'John',
  lastName: 'Doe',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockPortfolio = {
  id: 1,
  cryptocurrencyType: 'BTC_THB',
  amount: 0.5,
  purchaseDate: new Date('2024-01-15T10:30:00.000Z'),
  purchasePrice: 2500000,
  userId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

### Test Database Setup

```typescript
// Before each test
beforeEach(async () => {
  // Clear database
  await clearDatabase();

  // Seed test data
  await seedTestData();
});

// After each test
afterEach(async () => {
  // Clean up
  await clearDatabase();
});
```

## Coverage Requirements

### Minimum Coverage Targets

- **Statements**: 90%
- **Branches**: 85%
- **Functions**: 90%
- **Lines**: 90%

### Coverage Report

Run coverage and view report:

```bash
npm run test:cov
```

The coverage report will be generated in the `coverage/` directory.

## Best Practices

### Test Organization

1. **Arrange-Act-Assert**: Structure tests with clear sections
2. **Descriptive Names**: Use clear, descriptive test names
3. **Single Responsibility**: Each test should test one thing
4. **Independent Tests**: Tests should not depend on each other

### Test Data

1. **Realistic Data**: Use realistic test data
2. **Edge Cases**: Test boundary conditions
3. **Error Scenarios**: Test error handling
4. **Clean State**: Reset state between tests

### Performance

1. **Fast Execution**: Keep tests fast
2. **Efficient Mocking**: Use efficient mocking strategies
3. **Parallel Execution**: Enable parallel test execution
4. **Resource Cleanup**: Clean up resources after tests

## Debugging Tests

### Debug Mode

```bash
# Debug unit tests
npm run test:debug

# Debug E2E tests
npm run test:e2e -- --detectOpenHandles
```

### Common Issues

1. **Database Connections**: Ensure proper cleanup
2. **Async Operations**: Handle async operations correctly
3. **Mock Reset**: Reset mocks between tests
4. **Environment Variables**: Set correct test environment

## Continuous Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:cov
      - run: npm run test:e2e
```

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test",
      "pre-push": "npm run test:cov"
    }
  }
}
```

## Testing Tools

### Recommended Tools

1. **Jest**: Test framework
2. **Supertest**: HTTP testing
3. **@nestjs/testing**: NestJS testing utilities
4. **ts-jest**: TypeScript support

### IDE Integration

1. **VS Code**: Jest extension
2. **WebStorm**: Built-in Jest support
3. **Debugging**: Configure debug configurations

## Troubleshooting

### Common Problems

1. **Test Timeouts**: Increase timeout for slow tests
2. **Memory Leaks**: Ensure proper cleanup
3. **Database Issues**: Use test database
4. **Mock Issues**: Reset mocks properly

### Debug Commands

```bash
# Run specific test with verbose output
npm test -- --verbose

# Run tests with coverage and watch
npm run test:cov -- --watch

# Debug specific test file
npm test -- --testNamePattern="specific test name"
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)
