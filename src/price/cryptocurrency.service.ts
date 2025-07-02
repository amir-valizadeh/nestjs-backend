import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cryptocurrency } from './entities/cryptocurrency.entity';

@Injectable()
export class CryptocurrencyService {
  private readonly logger = new Logger(CryptocurrencyService.name);

  constructor(
    @InjectRepository(Cryptocurrency)
    private cryptocurrencyRepository: Repository<Cryptocurrency>,
  ) {}

  async updateFromApiData(apiData: Record<string, any>): Promise<void> {
    try {
      this.logger.log('Updating cryptocurrencies from API data...');

      for (const [symbol, data] of Object.entries(apiData)) {
        await this.updateOrCreateCryptocurrency(symbol, data);
      }

      this.logger.log(
        `Updated ${Object.keys(apiData).length} cryptocurrencies`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to update cryptocurrencies from API data:',
        error,
      );
    }
  }

  private async updateOrCreateCryptocurrency(
    symbol: string,
    data: {
      price: number;
      change: number;
      changePercent: number;
      high: number;
      low: number;
      volume: number;
    },
  ): Promise<void> {
    try {
      const existing = await this.cryptocurrencyRepository.findOne({
        where: { symbol },
      });

      const cryptocurrencyData = {
        symbol,
        name: this.getCryptocurrencyName(symbol),
        currentPrice: data.price || 0,
        priceChange: data.change || 0,
        priceChangePercent: data.changePercent || 0,
        high24h: data.high || 0,
        low24h: data.low || 0,
        volume24h: data.volume || 0,
        isActive: true,
        isPopular: this.isPopularCryptocurrency(symbol),
      };

      if (existing) {
        await this.cryptocurrencyRepository.update(
          existing.id,
          cryptocurrencyData,
        );
      } else {
        await this.cryptocurrencyRepository.save(cryptocurrencyData);
      }
    } catch (error) {
      this.logger.error(
        `Failed to update/create cryptocurrency ${symbol}:`,
        error,
      );
    }
  }

  async getAllActive(): Promise<Cryptocurrency[]> {
    return this.cryptocurrencyRepository.find({
      where: { isActive: true },
      order: { isPopular: 'DESC', symbol: 'ASC' },
    });
  }

  async getPopular(): Promise<Cryptocurrency[]> {
    return this.cryptocurrencyRepository.find({
      where: { isActive: true, isPopular: true },
      order: { symbol: 'ASC' },
    });
  }

  async getBySymbol(symbol: string): Promise<Cryptocurrency | null> {
    return this.cryptocurrencyRepository.findOne({
      where: { symbol, isActive: true },
    });
  }

  async getSymbols(): Promise<string[]> {
    const cryptocurrencies = await this.cryptocurrencyRepository.find({
      where: { isActive: true },
      select: ['symbol'],
      order: { isPopular: 'DESC', symbol: 'ASC' },
    });

    return cryptocurrencies.map((crypto) => crypto.symbol);
  }

  async getPrices(): Promise<Record<string, any>> {
    const cryptocurrencies = await this.getAllActive();

    const prices: Record<string, any> = {};
    cryptocurrencies.forEach((crypto) => {
      prices[crypto.symbol] = {
        price: crypto.currentPrice,
        change: crypto.priceChange,
        changePercent: crypto.priceChangePercent,
        high: crypto.high24h,
        low: crypto.low24h,
        volume: crypto.volume24h,
      };
    });

    return prices;
  }

  private getCryptocurrencyName(symbol: string): string {
    const nameMap: Record<string, string> = {
      BTC_THB: 'Bitcoin',
      ETH_THB: 'Ethereum',
      ADA_THB: 'Cardano',
      DOGE_THB: 'Dogecoin',
      XRP_THB: 'Ripple',
      SOL_THB: 'Solana',
      BNB_THB: 'Binance Coin',
      DOT_THB: 'Polkadot',
      LINK_THB: 'Chainlink',
      LTC_THB: 'Litecoin',
      MATIC_THB: 'Polygon',
      UNI_THB: 'Uniswap',
    };

    return nameMap[symbol] || symbol.replace('_THB', '');
  }

  private isPopularCryptocurrency(symbol: string): boolean {
    const popularSymbols = [
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
    ];

    return popularSymbols.includes(symbol);
  }

  async seedInitialData(): Promise<void> {
    try {
      const count = await this.cryptocurrencyRepository.count();

      if (count === 0) {
        this.logger.log('Seeding initial cryptocurrency data...');

        const initialData = [
          {
            symbol: 'BTC_THB',
            name: 'Bitcoin',
            currentPrice: 2500000,
            priceChange: 15000,
            priceChangePercent: 0.6,
            high24h: 2520000,
            low24h: 2480000,
            volume24h: 1500,
            isActive: true,
            isPopular: true,
          },
          {
            symbol: 'ETH_THB',
            name: 'Ethereum',
            currentPrice: 85000,
            priceChange: -500,
            priceChangePercent: -0.6,
            high24h: 86000,
            low24h: 84000,
            volume24h: 5000,
            isActive: true,
            isPopular: true,
          },
          {
            symbol: 'ADA_THB',
            name: 'Cardano',
            currentPrice: 15.5,
            priceChange: 0.2,
            priceChangePercent: 1.3,
            high24h: 15.8,
            low24h: 15.2,
            volume24h: 100000,
            isActive: true,
            isPopular: true,
          },
          {
            symbol: 'DOGE_THB',
            name: 'Dogecoin',
            currentPrice: 3.2,
            priceChange: 0.1,
            priceChangePercent: 3.2,
            high24h: 3.3,
            low24h: 3.1,
            volume24h: 500000,
            isActive: true,
            isPopular: true,
          },
          {
            symbol: 'XRP_THB',
            name: 'Ripple',
            currentPrice: 18.5,
            priceChange: -0.3,
            priceChangePercent: -1.6,
            high24h: 18.8,
            low24h: 18.2,
            volume24h: 250000,
            isActive: true,
            isPopular: true,
          },
          {
            symbol: 'SOL_THB',
            name: 'Solana',
            currentPrice: 4500,
            priceChange: 120,
            priceChangePercent: 2.7,
            high24h: 4550,
            low24h: 4400,
            volume24h: 800,
            isActive: true,
            isPopular: true,
          },
          {
            symbol: 'BNB_THB',
            name: 'Binance Coin',
            currentPrice: 18000,
            priceChange: 200,
            priceChangePercent: 1.1,
            high24h: 18100,
            low24h: 17800,
            volume24h: 300,
            isActive: true,
            isPopular: true,
          },
          {
            symbol: 'DOT_THB',
            name: 'Polkadot',
            currentPrice: 280,
            priceChange: -5,
            priceChangePercent: -1.8,
            high24h: 285,
            low24h: 275,
            volume24h: 2000,
            isActive: true,
            isPopular: true,
          },
          {
            symbol: 'LINK_THB',
            name: 'Chainlink',
            currentPrice: 1200,
            priceChange: 25,
            priceChangePercent: 2.1,
            high24h: 1210,
            low24h: 1180,
            volume24h: 1500,
            isActive: true,
            isPopular: true,
          },
          {
            symbol: 'LTC_THB',
            name: 'Litecoin',
            currentPrice: 8500,
            priceChange: -100,
            priceChangePercent: -1.2,
            high24h: 8600,
            low24h: 8400,
            volume24h: 400,
            isActive: true,
            isPopular: true,
          },
          {
            symbol: 'MATIC_THB',
            name: 'Polygon',
            currentPrice: 45,
            priceChange: 1.5,
            priceChangePercent: 3.4,
            high24h: 46,
            low24h: 44,
            volume24h: 50000,
            isActive: true,
            isPopular: false,
          },
          {
            symbol: 'UNI_THB',
            name: 'Uniswap',
            currentPrice: 320,
            priceChange: 8,
            priceChangePercent: 2.6,
            high24h: 325,
            low24h: 315,
            volume24h: 3000,
            isActive: true,
            isPopular: false,
          },
        ];

        await this.cryptocurrencyRepository.save(initialData);
        this.logger.log('Initial cryptocurrency data seeded successfully');
      } else {
        await this.addMissingCryptocurrencies();
      }
    } catch (error) {
      this.logger.error('Failed to seed initial cryptocurrency data:', error);
    }
  }

  async addMissingCryptocurrencies(): Promise<void> {
    try {
      this.logger.log('Adding missing cryptocurrencies...');

      const existingSymbols = await this.getSymbols();
      const allSymbols = [
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

      const missingSymbols = allSymbols.filter(
        (symbol) => !existingSymbols.includes(symbol),
      );

      if (missingSymbols.length === 0) {
        this.logger.log('No missing cryptocurrencies to add');
        return;
      }

      const missingData = [
        {
          symbol: 'BNB_THB',
          name: 'Binance Coin',
          currentPrice: 18000,
          priceChange: 200,
          priceChangePercent: 1.1,
          high24h: 18100,
          low24h: 17800,
          volume24h: 300,
          isActive: true,
          isPopular: true,
        },
        {
          symbol: 'DOT_THB',
          name: 'Polkadot',
          currentPrice: 280,
          priceChange: -5,
          priceChangePercent: -1.8,
          high24h: 285,
          low24h: 275,
          volume24h: 2000,
          isActive: true,
          isPopular: true,
        },
        {
          symbol: 'LINK_THB',
          name: 'Chainlink',
          currentPrice: 1200,
          priceChange: 25,
          priceChangePercent: 2.1,
          high24h: 1210,
          low24h: 1180,
          volume24h: 1500,
          isActive: true,
          isPopular: true,
        },
        {
          symbol: 'LTC_THB',
          name: 'Litecoin',
          currentPrice: 8500,
          priceChange: -100,
          priceChangePercent: -1.2,
          high24h: 8600,
          low24h: 8400,
          volume24h: 400,
          isActive: true,
          isPopular: true,
        },
        {
          symbol: 'MATIC_THB',
          name: 'Polygon',
          currentPrice: 45,
          priceChange: 1.5,
          priceChangePercent: 3.4,
          high24h: 46,
          low24h: 44,
          volume24h: 50000,
          isActive: true,
          isPopular: false,
        },
        {
          symbol: 'UNI_THB',
          name: 'Uniswap',
          currentPrice: 320,
          priceChange: 8,
          priceChangePercent: 2.6,
          high24h: 325,
          low24h: 315,
          volume24h: 3000,
          isActive: true,
          isPopular: false,
        },
      ].filter((item) => missingSymbols.includes(item.symbol));

      if (missingData.length > 0) {
        await this.cryptocurrencyRepository.save(missingData);
        this.logger.log(
          `Added ${missingData.length} missing cryptocurrencies: ${missingData.map((d) => d.symbol).join(', ')}`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to add missing cryptocurrencies:', error);
    }
  }
}
