/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PriceService } from './price.service';
import { CryptocurrencyService } from './cryptocurrency.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PriceService', () => {
  let service: PriceService;
  let configService: ConfigService;
  let cryptocurrencyService: CryptocurrencyService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockCryptocurrencyService = {
    getPrices: jest.fn(),
    updateFromApiData: jest.fn(),
    getSymbols: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CryptocurrencyService,
          useValue: mockCryptocurrencyService,
        },
      ],
    }).compile();

    service = module.get<PriceService>(PriceService);
    configService = module.get<ConfigService>(ConfigService);
    cryptocurrencyService = module.get<CryptocurrencyService>(
      CryptocurrencyService,
    );

    // Reset mocks
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentPrices', () => {
    it('should return cached prices if available and not expired', async () => {
      const cachedPrices = {
        BTC_THB: { price: 2500000, change: 15000 },
        ETH_THB: { price: 85000, change: -500 },
      };

      // Set up cached data
      (service as any).cachedPrices = cachedPrices;
      (service as any).cacheExpiry = Date.now() + 30000;

      const result = await service.getCurrentPrices();

      expect(result).toEqual(cachedPrices);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should return cached prices if API fails and cache is available', async () => {
      const cachedPrices = {
        BTC_THB: { price: 2500000, change: 15000 },
      };

      (service as any).cachedPrices = cachedPrices;
      (service as any).cacheExpiry = Date.now() - 1000; // Expired
      (service as any).consecutiveFailures = 3;

      const result = await service.getCurrentPrices();

      expect(result).toEqual(cachedPrices);
    });

    it('should fetch prices from database first', async () => {
      const dbPrices = {
        BTC_THB: { price: 2500000, change: 15000 },
        ETH_THB: { price: 85000, change: -500 },
      };

      mockCryptocurrencyService.getPrices.mockResolvedValue(dbPrices);

      const result = await service.getCurrentPrices();

      expect(mockCryptocurrencyService.getPrices).toHaveBeenCalled();
      expect(result).toEqual(dbPrices);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should fetch prices from API when database is empty', async () => {
      const apiResponse = [
        [1, 'BTC_THB', 2500000, 15000, 0.6, 1500],
        [2, 'ETH_THB', 85000, -500, -0.6, 5000],
      ];
      const expectedPrices = {
        BTC_THB: {
          price: 2500000,
          change: 15000,
          changePercent: 0.6,
          volume: 1500,
        },
        ETH_THB: {
          price: 85000,
          change: -500,
          changePercent: -0.6,
          volume: 5000,
        },
      };

      mockCryptocurrencyService.getPrices.mockResolvedValue({});
      mockedAxios.get.mockResolvedValue({ data: apiResponse });

      const result = await service.getCurrentPrices();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.get).toHaveBeenCalled();
      expect(mockCryptocurrencyService.updateFromApiData).toHaveBeenCalledWith(
        expect.objectContaining({
          BTC_THB: expect.objectContaining({
            price: 2500000,
            change: 15000,
            changePercent: 0.6,
            volume: 1500,
          }),
          ETH_THB: expect.objectContaining({
            price: 85000,
            change: -500,
            changePercent: -0.6,
            volume: 5000,
          }),
        }),
      );
      expect(result).toMatchObject(expectedPrices);
    });

    it('should handle rate limiting by returning cached data', async () => {
      const cachedPrices = {
        BTC_THB: { price: 2500000, change: 15000 },
      };

      (service as any).cachedPrices = cachedPrices;
      (service as any).lastCallTime = Date.now() - 1000; // Recent call

      const result = await service.getCurrentPrices();

      expect(result).toEqual(cachedPrices);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should throw error when rate limited and no cache available', async () => {
      (service as any).lastCallTime = Date.now() - 1000; // Recent call

      await expect(service.getCurrentPrices()).rejects.toThrow(HttpException);
    });

    it('should handle API timeout errors', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'Request timeout',
      };

      mockCryptocurrencyService.getPrices.mockResolvedValue({});
      mockedAxios.get.mockRejectedValue(timeoutError);

      // Set consecutive failures to trigger mock data
      (service as any).consecutiveFailures = 3;

      const result = await service.getCurrentPrices();

      expect(result).toHaveProperty('BTC_THB');
      expect(result).toHaveProperty('ETH_THB');
    });

    it('should handle API rate limit errors', async () => {
      const rateLimitError = {
        response: { status: 429 },
        message: 'Rate limit exceeded',
      };

      mockCryptocurrencyService.getPrices.mockResolvedValue({});
      mockedAxios.get.mockRejectedValue(rateLimitError);

      // Set consecutive failures to trigger mock data
      (service as any).consecutiveFailures = 3;

      const result = await service.getCurrentPrices();

      expect(result).toHaveProperty('BTC_THB');
      expect(result).toHaveProperty('ETH_THB');
    });

    it('should handle API server errors', async () => {
      const serverError = {
        response: { status: 500 },
        message: 'Server error',
      };

      mockCryptocurrencyService.getPrices.mockResolvedValue({});
      mockedAxios.get.mockRejectedValue(serverError);

      // Set consecutive failures to trigger mock data
      (service as any).consecutiveFailures = 3;

      const result = await service.getCurrentPrices();

      expect(result).toHaveProperty('BTC_THB');
      expect(result).toHaveProperty('ETH_THB');
    });

    it('should return mock data after consecutive failures', async () => {
      const apiError = new Error('API Error');

      mockCryptocurrencyService.getPrices.mockResolvedValue({});
      mockedAxios.get.mockRejectedValue(apiError);

      // Set consecutive failures
      (service as any).consecutiveFailures = 2;

      const result = await service.getCurrentPrices();

      expect(result).toHaveProperty('BTC_THB');
      expect(result).toHaveProperty('ETH_THB');
    });
  });

  describe('getSpecificPrice', () => {
    it('should return specific price for valid symbol', async () => {
      const prices = {
        BTC_THB: { price: 2500000 },
        ETH_THB: { price: 85000 },
      };

      jest.spyOn(service, 'getCurrentPrices').mockResolvedValue(prices);

      const result = await service.getSpecificPrice('BTC_THB');

      expect(result).toBe(2500000);
    });

    it('should return 0 for invalid symbol', async () => {
      const prices = {
        BTC_THB: { price: 2500000 },
      };

      jest.spyOn(service, 'getCurrentPrices').mockResolvedValue(prices);

      const result = await service.getSpecificPrice('INVALID_SYMBOL');

      expect(result).toBe(0);
    });
  });

  describe('getAvailableSymbols', () => {
    it('should return available symbols', async () => {
      const symbols = ['BTC_THB', 'ETH_THB', 'ADA_THB'];

      mockCryptocurrencyService.getSymbols.mockResolvedValue(symbols);

      const result = await service.getAvailableSymbols();

      expect(result).toEqual(symbols);
    });
  });

  describe('private methods', () => {
    describe('processArrayResponse', () => {
      it('should process array format response correctly', () => {
        const arrayData = [
          [1, 'BTC_THB', 2500000, 15000, 0.6, 1500],
          [2, 'ETH_THB', 85000, -500, -0.6, 5000],
        ];

        const result = (service as any).processArrayResponse(arrayData);

        expect(result).toEqual(
          expect.objectContaining({
            BTC_THB: expect.objectContaining({
              price: 2500000,
              change: 15000,
              changePercent: 0.6,
              volume: 1500,
            }),
            ETH_THB: expect.objectContaining({
              price: 85000,
              change: -500,
              changePercent: -0.6,
              volume: 5000,
            }),
          }),
        );
      });
    });

    describe('processObjectResponse', () => {
      it('should process object format response correctly', () => {
        const objectData = {
          d: [
            {
              s: 'BTC_THB',
              c: 2500000,
              pc: 15000,
              pcp: 0.6,
              h: 2520000,
              l: 2480000,
              v: 1500,
            },
          ],
        };

        const result = (service as any).processObjectResponse(objectData);

        expect(result).toEqual({
          BTC_THB: {
            price: 2500000,
            change: 15000,
            changePercent: 0.6,
            high: 2520000,
            low: 2480000,
            volume: 1500,
          },
        });
      });
    });

    describe('getMockPrices', () => {
      it('should return mock price data', () => {
        const result = (service as any).getMockPrices();

        expect(result).toHaveProperty('BTC_THB');
        expect(result).toHaveProperty('ETH_THB');
        expect(result.BTC_THB).toHaveProperty('price');
        expect(result.BTC_THB).toHaveProperty('change');
      });
    });
  });
});
