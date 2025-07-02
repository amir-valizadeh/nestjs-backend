import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PriceService } from './price.service';
import { CryptocurrencyService } from './cryptocurrency.service';
import {
  CurrentPricesResponseDto,
  SpecificPriceResponseDto,
  SymbolsResponseDto,
} from './dto/price-response.dto';

@ApiTags('price')
@Controller('price')
export class PriceController {
  constructor(
    private readonly priceService: PriceService,
    private readonly cryptocurrencyService: CryptocurrencyService,
  ) {}

  @Get('current')
  @ApiOperation({
    summary: 'Get current cryptocurrency prices',
    description:
      'Retrieves current prices for all available cryptocurrency pairs from the Bitazza API',
  })
  @ApiResponse({
    status: 200,
    description: 'Current prices retrieved successfully',
    type: CurrentPricesResponseDto,
  })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async getCurrentPrices(): Promise<Record<string, any>> {
    return this.priceService.getCurrentPrices();
  }

  @Get('symbols')
  @ApiOperation({
    summary: 'Get available cryptocurrency symbols',
    description:
      'Retrieves a list of all available cryptocurrency trading pairs',
  })
  @ApiResponse({
    status: 200,
    description: 'Available symbols retrieved successfully',
    type: SymbolsResponseDto,
  })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async getAvailableSymbols(): Promise<string[]> {
    return this.priceService.getAvailableSymbols();
  }

  @Get('cryptocurrencies')
  @ApiOperation({
    summary: 'Get all cryptocurrencies',
    description:
      'Retrieves all active cryptocurrencies with full details from database',
  })
  @ApiResponse({
    status: 200,
    description: 'Cryptocurrencies retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          symbol: { type: 'string', example: 'BTC_THB' },
          name: { type: 'string', example: 'Bitcoin' },
          currentPrice: { type: 'number', example: 2500000 },
          priceChange: { type: 'number', example: 15000 },
          priceChangePercent: { type: 'number', example: 0.6 },
          high24h: { type: 'number', example: 2520000 },
          low24h: { type: 'number', example: 2480000 },
          volume24h: { type: 'number', example: 1500 },
          isActive: { type: 'boolean', example: true },
          isPopular: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getCryptocurrencies() {
    return this.cryptocurrencyService.getAllActive();
  }

  @Get(':symbol')
  @ApiOperation({
    summary: 'Get specific cryptocurrency price',
    description:
      'Retrieves the current price for a specific cryptocurrency trading pair',
  })
  @ApiParam({
    name: 'symbol',
    description: 'Cryptocurrency trading pair symbol (e.g., BTC_THB, ETH_THB)',
    example: 'BTC_THB',
  })
  @ApiResponse({
    status: 200,
    description: 'Price retrieved successfully',
    type: SpecificPriceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid symbol format' })
  @ApiResponse({ status: 404, description: 'Symbol not found' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @ApiResponse({ status: 503, description: 'Service temporarily unavailable' })
  async getSpecificPrice(
    @Param('symbol') symbol: string,
  ): Promise<SpecificPriceResponseDto> {
    const price = await this.priceService.getSpecificPrice(symbol);
    return { symbol, price };
  }

  @Post('seed')
  @ApiOperation({
    summary: 'Seed initial cryptocurrency data',
    description:
      'Populates the database with initial cryptocurrency data if empty',
  })
  @ApiResponse({
    status: 201,
    description: 'Initial data seeded successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Initial cryptocurrency data seeded successfully',
        },
        count: { type: 'number', example: 6 },
      },
    },
  })
  async seedData() {
    await this.cryptocurrencyService.seedInitialData();
    const count = await this.cryptocurrencyService.getAllActive();
    return {
      message: 'Initial cryptocurrency data seeded successfully',
      count: count.length,
    };
  }

  @Post('add-missing')
  @ApiOperation({
    summary: 'Add missing cryptocurrencies',
    description:
      'Adds any missing cryptocurrencies to the database (BNB, DOT, LINK, LTC, MATIC, UNI)',
  })
  @ApiResponse({
    status: 201,
    description: 'Missing cryptocurrencies added successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Missing cryptocurrencies added successfully',
        },
        added: { type: 'array', items: { type: 'string' } },
        total: { type: 'number', example: 12 },
      },
    },
  })
  async addMissingCryptocurrencies() {
    await this.cryptocurrencyService.addMissingCryptocurrencies();
    const allCryptos = await this.cryptocurrencyService.getAllActive();
    const existingSymbols = await this.cryptocurrencyService.getSymbols();
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
    const added = allSymbols.filter(
      (symbol) => !existingSymbols.includes(symbol),
    );

    return {
      message: 'Missing cryptocurrencies added successfully',
      added,
      total: allCryptos.length,
    };
  }
}
