import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

describe('PortfolioController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: number;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    const registerDto = {
      email: 'portfolio@example.com',
      password: 'SecurePass123!',
      firstName: 'Portfolio',
      lastName: 'User',
    };

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: registerDto.email,
        password: registerDto.password,
      })
      .expect(200);

    authToken = loginResponse.body.access_token;
    userId = loginResponse.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/portfolio (POST)', () => {
    it('should create a new portfolio entry', () => {
      const createPortfolioDto = {
        cryptocurrencyType: 'BTC_THB',
        amount: 0.5,
        purchaseDate: '2024-01-15T10:30:00.000Z',
        purchasePrice: 2500000,
      };

      return request(app.getHttpServer())
        .post('/portfolio')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPortfolioDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.cryptocurrencyType).toBe(
            createPortfolioDto.cryptocurrencyType,
          );
          expect(res.body.amount).toBe(createPortfolioDto.amount);
          expect(res.body.purchasePrice).toBe(createPortfolioDto.purchasePrice);
          expect(res.body.userId).toBe(userId);
        });
    });

    it('should fail with invalid cryptocurrency type', () => {
      const createPortfolioDto = {
        cryptocurrencyType: 'INVALID_CRYPTO',
        amount: 0.5,
        purchaseDate: '2024-01-15T10:30:00.000Z',
        purchasePrice: 2500000,
      };

      return request(app.getHttpServer())
        .post('/portfolio')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPortfolioDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid cryptocurrency symbol');
        });
    });

    it('should fail with future purchase date', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // Tomorrow
      const createPortfolioDto = {
        cryptocurrencyType: 'BTC_THB',
        amount: 0.5,
        purchaseDate: futureDate,
        purchasePrice: 2500000,
      };

      return request(app.getHttpServer())
        .post('/portfolio')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPortfolioDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'Purchase date cannot be in the future',
          );
        });
    });

    it('should fail without authentication', () => {
      const createPortfolioDto = {
        cryptocurrencyType: 'BTC_THB',
        amount: 0.5,
        purchaseDate: '2024-01-15T10:30:00.000Z',
        purchasePrice: 2500000,
      };

      return request(app.getHttpServer())
        .post('/portfolio')
        .send(createPortfolioDto)
        .expect(401);
    });
  });

  describe('/portfolio (GET)', () => {
    beforeEach(async () => {
      const portfolios = [
        {
          cryptocurrencyType: 'BTC_THB',
          amount: 0.5,
          purchaseDate: '2024-01-15T10:30:00.000Z',
          purchasePrice: 2500000,
        },
        {
          cryptocurrencyType: 'ETH_THB',
          amount: 2.0,
          purchaseDate: '2024-01-20T14:20:00.000Z',
          purchasePrice: 85000,
        },
      ];

      for (const portfolio of portfolios) {
        await request(app.getHttpServer())
          .post('/portfolio')
          .set('Authorization', `Bearer ${authToken}`)
          .send(portfolio)
          .expect(201);
      }
    });

    it('should return user portfolios with pagination', () => {
      return request(app.getHttpServer())
        .get('/portfolio')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('portfolios');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(res.body).toHaveProperty('totalPages');
          expect(Array.isArray(res.body.portfolios)).toBe(true);
          expect(res.body.portfolios.length).toBeGreaterThan(0);
        });
    });

    it('should return portfolios with custom pagination', () => {
      return request(app.getHttpServer())
        .get('/portfolio?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(5);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer()).get('/portfolio').expect(401);
    });
  });

  describe('/portfolio/:id (GET)', () => {
    let portfolioId: number;

    beforeEach(async () => {
      const createPortfolioDto = {
        cryptocurrencyType: 'BTC_THB',
        amount: 0.5,
        purchaseDate: '2024-01-15T10:30:00.000Z',
        purchasePrice: 2500000,
      };

      const response = await request(app.getHttpServer())
        .post('/portfolio')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPortfolioDto)
        .expect(201);

      portfolioId = response.body.id;
    });

    it('should return specific portfolio', () => {
      return request(app.getHttpServer())
        .get(`/portfolio/${portfolioId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(portfolioId);
          expect(res.body.cryptocurrencyType).toBe('BTC_THB');
          expect(res.body.userId).toBe(userId);
        });
    });

    it('should fail when portfolio not found', () => {
      return request(app.getHttpServer())
        .get('/portfolio/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/portfolio/${portfolioId}`)
        .expect(401);
    });
  });

  describe('/portfolio/:id (PATCH)', () => {
    let portfolioId: number;

    beforeEach(async () => {
      const createPortfolioDto = {
        cryptocurrencyType: 'BTC_THB',
        amount: 0.5,
        purchaseDate: '2024-01-15T10:30:00.000Z',
        purchasePrice: 2500000,
      };

      const response = await request(app.getHttpServer())
        .post('/portfolio')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPortfolioDto)
        .expect(201);

      portfolioId = response.body.id;
    });

    it('should update portfolio successfully', () => {
      const updatePortfolioDto = {
        amount: 1.0,
        purchasePrice: 2600000,
      };

      return request(app.getHttpServer())
        .patch(`/portfolio/${portfolioId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatePortfolioDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.amount).toBe(updatePortfolioDto.amount);
          expect(res.body.purchasePrice).toBe(updatePortfolioDto.purchasePrice);
        });
    });

    it('should fail with future purchase date', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const updatePortfolioDto = {
        purchaseDate: futureDate,
      };

      return request(app.getHttpServer())
        .patch(`/portfolio/${portfolioId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatePortfolioDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'Purchase date cannot be in the future',
          );
        });
    });

    it('should fail when portfolio not found', () => {
      const updatePortfolioDto = {
        amount: 1.0,
      };

      return request(app.getHttpServer())
        .patch('/portfolio/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatePortfolioDto)
        .expect(404);
    });
  });

  describe('/portfolio/:id (DELETE)', () => {
    let portfolioId: number;

    beforeEach(async () => {
      const createPortfolioDto = {
        cryptocurrencyType: 'BTC_THB',
        amount: 0.5,
        purchaseDate: '2024-01-15T10:30:00.000Z',
        purchasePrice: 2500000,
      };

      const response = await request(app.getHttpServer())
        .post('/portfolio')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPortfolioDto)
        .expect(201);

      portfolioId = response.body.id;
    });

    it('should delete portfolio successfully', () => {
      return request(app.getHttpServer())
        .delete(`/portfolio/${portfolioId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should fail when portfolio not found', () => {
      return request(app.getHttpServer())
        .delete('/portfolio/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/portfolio/performance (GET)', () => {
    beforeEach(async () => {
      const portfolios = [
        {
          cryptocurrencyType: 'BTC_THB',
          amount: 0.5,
          purchaseDate: '2024-01-15T10:30:00.000Z',
          purchasePrice: 2500000,
        },
        {
          cryptocurrencyType: 'ETH_THB',
          amount: 2.0,
          purchaseDate: '2024-01-20T14:20:00.000Z',
          purchasePrice: 85000,
        },
      ];

      for (const portfolio of portfolios) {
        await request(app.getHttpServer())
          .post('/portfolio')
          .set('Authorization', `Bearer ${authToken}`)
          .send(portfolio)
          .expect(201);
      }
    });

    it('should return portfolio performance', () => {
      return request(app.getHttpServer())
        .get('/portfolio/performance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('portfolios');
          expect(res.body).toHaveProperty('totalInvestment');
          expect(res.body).toHaveProperty('count');
          expect(Array.isArray(res.body.portfolios)).toBe(true);
          expect(typeof res.body.totalInvestment).toBe('number');
          expect(res.body.count).toBeGreaterThan(0);
        });
    });

    it('should return portfolio performance with date filters', () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      return request(app.getHttpServer())
        .get(`/portfolio/performance?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('portfolios');
          expect(res.body).toHaveProperty('totalInvestment');
          expect(res.body).toHaveProperty('count');
        });
    });
  });
});
