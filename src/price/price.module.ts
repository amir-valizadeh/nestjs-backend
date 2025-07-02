import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { CryptocurrencyService } from './cryptocurrency.service';
import { Cryptocurrency } from './entities/cryptocurrency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cryptocurrency])],
  controllers: [PriceController],
  providers: [PriceService, CryptocurrencyService],
  exports: [PriceService, CryptocurrencyService],
})
export class PriceModule {}
