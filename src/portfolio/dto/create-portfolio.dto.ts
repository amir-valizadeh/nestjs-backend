import {
  IsString,
  IsNumber,
  IsDateString,
  IsPositive,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePortfolioDto {
  @ApiProperty({
    description: 'Cryptocurrency symbol (e.g., BTC_THB, ETH_THB)',
    example: 'BTC_THB',
  })
  @IsString()
  @IsIn(
    [
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
    ],
    {
      message:
        'Invalid cryptocurrency symbol. Please choose from the supported cryptocurrencies.',
    },
  )
  cryptocurrencyType: string;

  @ApiProperty({
    description: 'Amount of cryptocurrency purchased',
    example: 0.5,
    minimum: 0.00000001,
  })
  @IsNumber()
  @IsPositive()
  @Min(0.00000001, { message: 'Amount must be greater than 0.00000001' })
  @Max(999999999, { message: 'Amount is too large' })
  amount: number;

  @ApiProperty({
    description: 'Purchase date in ISO format',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsDateString()
  purchaseDate: string;

  @ApiProperty({
    description: 'Purchase price per unit in THB',
    example: 2500000,
    minimum: 0.01,
  })
  @IsNumber()
  @IsPositive()
  @Min(0.01, { message: 'Purchase price must be greater than 0.01' })
  @Max(999999999, { message: 'Purchase price is too large' })
  purchasePrice: number;
}
