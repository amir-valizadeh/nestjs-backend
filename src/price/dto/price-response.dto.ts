import { ApiProperty } from '@nestjs/swagger';

export class PriceDataDto {
  @ApiProperty({
    description: 'Current price of the cryptocurrency',
    example: 2500000,
  })
  price: number;

  @ApiProperty({
    description: 'Price change from previous period',
    example: 15000,
  })
  change: number;

  @ApiProperty({
    description: 'Price change percentage from previous period',
    example: 0.6,
  })
  changePercent: number;

  @ApiProperty({
    description: 'Highest price in the period',
    example: 2520000,
  })
  high: number;

  @ApiProperty({
    description: 'Lowest price in the period',
    example: 2480000,
  })
  low: number;

  @ApiProperty({
    description: 'Trading volume',
    example: 1500,
  })
  volume: number;
}

export class CurrentPricesResponseDto {
  @ApiProperty({
    description: 'Bitcoin price data',
    type: PriceDataDto,
    required: false,
  })
  BTC_THB?: PriceDataDto;

  @ApiProperty({
    description: 'Ethereum price data',
    type: PriceDataDto,
    required: false,
  })
  ETH_THB?: PriceDataDto;

  @ApiProperty({
    description: 'Cardano price data',
    type: PriceDataDto,
    required: false,
  })
  ADA_THB?: PriceDataDto;

  @ApiProperty({
    description: 'Dogecoin price data',
    type: PriceDataDto,
    required: false,
  })
  DOGE_THB?: PriceDataDto;

  @ApiProperty({
    description: 'Ripple price data',
    type: PriceDataDto,
    required: false,
  })
  XRP_THB?: PriceDataDto;

  @ApiProperty({
    description: 'Solana price data',
    type: PriceDataDto,
    required: false,
  })
  SOL_THB?: PriceDataDto;

  [key: string]: PriceDataDto | undefined;
}

export class SpecificPriceResponseDto {
  @ApiProperty({
    description: 'Cryptocurrency trading pair symbol',
    example: 'BTC_THB',
  })
  symbol: string;

  @ApiProperty({
    description: 'Current price of the cryptocurrency',
    example: 2500000,
  })
  price: number;
}

export class SymbolsResponseDto {
  @ApiProperty({
    description: 'Array of available cryptocurrency trading pair symbols',
    example: [
      'BTC_THB',
      'ETH_THB',
      'ADA_THB',
      'DOGE_THB',
      'XRP_THB',
      'SOL_THB',
    ],
    type: [String],
  })
  symbols: string[];
}
