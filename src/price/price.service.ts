/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { CryptocurrencyService } from './cryptocurrency.service';

interface BitazzaApiResponse {
  d?: Array<{
    s: string;
    c: number;
    pc: number;
    pcp: number;
    h: number;
    l: number;
    v: number;
  }>;
}

type BitazzaArrayResponse = Array<
  [number, string, number, number, number, number]
>;

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);
  private readonly apiUrl: string;
  private lastCallTime = 0;
  private readonly rateLimitMs = 1000;
  private cachedPrices: any = null;
  private cacheExpiry = 0;
  private consecutiveFailures = 0;
  private readonly maxFailures = 5;

  constructor(
    private configService: ConfigService,
    private cryptocurrencyService: CryptocurrencyService,
  ) {
    this.apiUrl =
      this.configService.get('BITAZZA_API_URL') ||
      'https://apexapi.bitazza.com:8443/AP/GetLevel1SummaryMin?OMSId=1';
  }

  async getCurrentPrices(): Promise<Record<string, any>> {
    const now = Date.now();

    if (this.cachedPrices && now < this.cacheExpiry) {
      this.logger.log(
        `Returning cached prices for ${Object.keys(this.cachedPrices).length} symbols`,
      );
      return this.cachedPrices;
    }

    if (this.cachedPrices && this.consecutiveFailures >= this.maxFailures) {
      this.logger.warn(
        'Returning expired cached data due to consecutive failures',
      );
      return this.cachedPrices;
    }

    if (now - this.lastCallTime < this.rateLimitMs) {
      const waitTime = this.rateLimitMs - (now - this.lastCallTime);
      if (this.cachedPrices) {
        this.logger.warn('Rate limit hit, returning cached data');
        return this.cachedPrices;
      }
      throw new HttpException(
        `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    try {
      const dbPrices = await this.cryptocurrencyService.getPrices();
      if (Object.keys(dbPrices).length > 0) {
        this.logger.log(
          `Returning ${Object.keys(dbPrices).length} prices from database`,
        );
        return dbPrices;
      }
    } catch {
      this.logger.warn('Failed to get prices from database, trying API');
    }

    if (this.shouldUseMockData()) {
      return this.getMockPrices();
    }

    try {
      this.lastCallTime = now;
      this.logger.log('Fetching prices from Bitazza API...');

      const response = await axios.get<
        BitazzaApiResponse | BitazzaArrayResponse
      >(this.apiUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Portfolio-API/1.0',
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      let prices: Record<string, any> = {};

      if (Array.isArray(response.data)) {
        this.logger.log(
          `Processing array format response with ${response.data.length} items...`,
        );
        prices = this.processArrayResponse(response.data);
      } else if (
        response.data &&
        response.data.d &&
        Array.isArray(response.data.d)
      ) {
        this.logger.log(
          `Processing object format response with ${response.data.d.length} items...`,
        );
        prices = this.processObjectResponse(response.data);
      } else {
        this.logger.warn('Unexpected API response structure:', response.data);
        throw new Error('Invalid API response structure');
      }

      if (Object.keys(prices).length === 0) {
        throw new Error('No valid price data received from API');
      }

      await this.cryptocurrencyService.updateFromApiData(prices);

      this.cachedPrices = prices;
      this.cacheExpiry = now + 15000;
      this.consecutiveFailures = 0;

      this.logger.log(
        `Successfully fetched and updated prices for ${Object.keys(prices).length} symbols`,
      );
      return prices;
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error('Failed to fetch price data:', err.message);
      this.consecutiveFailures++;

      if (this.cachedPrices) {
        this.logger.warn('Returning cached data due to API error');
        return this.cachedPrices;
      }

      if (this.consecutiveFailures >= this.maxFailures) {
        this.logger.warn('Too many consecutive failures, using mock data');
        return this.getMockPrices();
      }

      if (error instanceof AxiosError) {
        if (error.code === 'ECONNABORTED') {
          throw new HttpException(
            'Request timeout - Bitazza API is not responding',
            HttpStatus.REQUEST_TIMEOUT,
          );
        }
        if (error.response && error.response.status === 429) {
          throw new HttpException(
            'API rate limit exceeded',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        if (error.response && error.response.status >= 500) {
          throw new HttpException(
            'Bitazza API server error',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
      }

      try {
        const dbPrices = await this.cryptocurrencyService.getPrices();
        if (Object.keys(dbPrices).length === 0) {
          this.logger.log('Database is empty, seeding initial data...');
          await this.cryptocurrencyService.seedInitialData();
          const seededPrices = await this.cryptocurrencyService.getPrices();
          if (Object.keys(seededPrices).length > 0) {
            this.cachedPrices = seededPrices;
            this.cacheExpiry = now + 30000;
            return seededPrices;
          }
        }
      } catch (seedError) {
        this.logger.error('Failed to seed initial data:', seedError);
      }

      this.logger.warn('Using mock data as final fallback');
      return this.getMockPrices();
    }
  }

  async getSpecificPrice(symbol: string): Promise<number> {
    try {
      const prices = (await this.getCurrentPrices()) as Record<
        string,
        { price: number }
      >;
      const price = prices[symbol]?.price;
      if (typeof price !== 'number') {
        this.logger.warn(`Price not found for symbol: ${symbol}`);
        return 0;
      }
      return price;
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Failed to get price for ${symbol}:`, err.message);
      return 0;
    }
  }

  async getAvailableSymbols(): Promise<string[]> {
    try {
      const dbSymbols = await this.cryptocurrencyService.getSymbols();
      if (dbSymbols.length > 0) {
        return dbSymbols;
      }

      const prices = (await this.getCurrentPrices()) as Record<string, unknown>;
      return Object.keys(prices);
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error('Failed to get available symbols:', err.message);

      return this.getMockSymbols();
    }
  }

  private shouldUseMockData(): boolean {
    return (
      process.env.NODE_ENV === 'development' ||
      this.consecutiveFailures >= this.maxFailures
    );
  }

  private getMockPrices(): any {
    const mockPrices = {
      BTC_THB: {
        price: 2500000,
        change: 15000,
        changePercent: 0.6,
        high: 2520000,
        low: 2480000,
        volume: 1500,
      },
      ETH_THB: {
        price: 85000,
        change: -500,
        changePercent: -0.6,
        high: 86000,
        low: 84000,
        volume: 5000,
      },
      ADA_THB: {
        price: 15.5,
        change: 0.2,
        changePercent: 1.3,
        high: 15.8,
        low: 15.2,
        volume: 100000,
      },
      DOGE_THB: {
        price: 3.2,
        change: 0.1,
        changePercent: 3.2,
        high: 3.3,
        low: 3.1,
        volume: 500000,
      },
      XRP_THB: {
        price: 18.5,
        change: -0.3,
        changePercent: -1.6,
        high: 18.8,
        low: 18.2,
        volume: 250000,
      },
      SOL_THB: {
        price: 4500,
        change: 120,
        changePercent: 2.7,
        high: 4550,
        low: 4400,
        volume: 800,
      },
      BNB_THB: {
        price: 18000,
        change: 200,
        changePercent: 1.1,
        high: 18100,
        low: 17800,
        volume: 300,
      },
      DOT_THB: {
        price: 280,
        change: -5,
        changePercent: -1.8,
        high: 285,
        low: 275,
        volume: 2000,
      },
      LINK_THB: {
        price: 1200,
        change: 25,
        changePercent: 2.1,
        high: 1210,
        low: 1180,
        volume: 1500,
      },
      LTC_THB: {
        price: 8500,
        change: -100,
        changePercent: -1.2,
        high: 8600,
        low: 8400,
        volume: 400,
      },
      MATIC_THB: {
        price: 45,
        change: 1.5,
        changePercent: 3.4,
        high: 46,
        low: 44,
        volume: 50000,
      },
      UNI_THB: {
        price: 320,
        change: 8,
        changePercent: 2.6,
        high: 325,
        low: 315,
        volume: 3000,
      },
    };

    this.cachedPrices = mockPrices;
    this.cacheExpiry = Date.now() + 60000;
    this.consecutiveFailures = 0;

    this.logger.log('Using mock price data for development');
    return mockPrices;
  }

  private getMockSymbols(): string[] {
    return [
      'BTC_THB',
      'ETH_THB',
      'ADA_THB',
      'DOGE_THB',
      'XRP_THB',
      'SOL_THB',
      'BNB_THB',
      'DOT_THB',
      'LINK_THB',
      'LTC_THB',
      'MATIC_THB',
      'UNI_THB',
    ];
  }

  private processArrayResponse(
    data: BitazzaArrayResponse,
  ): Record<string, any> {
    const prices: Record<string, any> = {};

    data.forEach((item) => {
      const [, symbol, currentPrice, priceChange, priceChangePercent, volume] =
        item;

      if (symbol && typeof currentPrice === 'number') {
        prices[symbol] = {
          price: currentPrice,
          change: priceChange || 0,
          changePercent: priceChangePercent || 0,
          high: currentPrice,
          low: currentPrice,
          volume: volume || 0,
        };
      }
    });

    return prices;
  }

  private processObjectResponse(data: BitazzaApiResponse): Record<string, any> {
    if (!data.d) return {};

    return data.d.reduce(
      (acc, item) => {
        if (item && item.s && typeof item.c === 'number') {
          acc[item.s] = {
            price: item.c,
            change: item.pc || 0,
            changePercent: item.pcp || 0,
            high: item.h || 0,
            low: item.l || 0,
            volume: item.v || 0,
          };
        }
        return acc;
      },
      {} as Record<string, any>,
    );
  }
}
