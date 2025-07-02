import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

export interface PortfolioQueryOptions {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginatedPortfolioResponse {
  portfolios: Portfolio[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
  ) {}

  async create(
    userId: number,
    createPortfolioDto: CreatePortfolioDto,
  ): Promise<Portfolio> {
    const purchaseDate = new Date(createPortfolioDto.purchaseDate);
    if (purchaseDate > new Date()) {
      throw new BadRequestException('Purchase date cannot be in the future');
    }

    const portfolio = this.portfolioRepository.create({
      ...createPortfolioDto,
      userId,
      purchaseDate,
    });
    return this.portfolioRepository.save(portfolio);
  }

  async findAllByUser(
    userId: number,
    options: PortfolioQueryOptions = {},
  ): Promise<PaginatedPortfolioResponse> {
    const { page = 1, limit = 10, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    const whereClause: any = { userId };
    if (startDate && endDate) {
      whereClause.purchaseDate = Between(startDate, endDate);
    }

    const [portfolios, total] = await this.portfolioRepository.findAndCount({
      where: whereClause,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      portfolios,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, userId: number): Promise<Portfolio> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id, userId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio entry not found');
    }

    return portfolio;
  }

  async update(
    id: number,
    userId: number,
    updatePortfolioDto: UpdatePortfolioDto,
  ): Promise<Portfolio> {
    const portfolio = await this.findOne(id, userId);

    if (updatePortfolioDto.purchaseDate) {
      const purchaseDate = new Date(updatePortfolioDto.purchaseDate);
      if (purchaseDate > new Date()) {
        throw new BadRequestException('Purchase date cannot be in the future');
      }
    }

    Object.assign(portfolio, updatePortfolioDto);
    return this.portfolioRepository.save(portfolio);
  }

  async remove(id: number, userId: number): Promise<void> {
    const portfolio = await this.findOne(id, userId);
    await this.portfolioRepository.remove(portfolio);
  }

  async getPortfolioPerformance(
    userId: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const whereClause: { userId: number; purchaseDate?: any } = { userId };

    if (startDate && endDate) {
      if (startDate > endDate) {
        throw new BadRequestException('Start date cannot be after end date');
      }
      whereClause.purchaseDate = Between(startDate, endDate);
    }

    const portfolios = await this.portfolioRepository.find({
      where: whereClause,
      order: { purchaseDate: 'ASC' },
    });

    const totalInvestment = portfolios.reduce(
      (sum, p) => sum + Number(p.amount) * Number(p.purchasePrice),
      0,
    );

    return {
      portfolios,
      totalInvestment,
      count: portfolios.length,
    };
  }

  async seedSampleData(userId: number): Promise<void> {
    try {
      const count = await this.portfolioRepository.count({ where: { userId } });

      if (count === 0) {
        const sampleData = [
          {
            cryptocurrencyType: 'BTC_THB',
            amount: 0.5,
            purchasePrice: 2400000,
            purchaseDate: new Date('2024-01-15'),
            userId,
          },
          {
            cryptocurrencyType: 'ETH_THB',
            amount: 2.0,
            purchasePrice: 82000,
            purchaseDate: new Date('2024-02-20'),
            userId,
          },
          {
            cryptocurrencyType: 'ADA_THB',
            amount: 1000,
            purchasePrice: 14.5,
            purchaseDate: new Date('2024-03-10'),
            userId,
          },
          {
            cryptocurrencyType: 'SOL_THB',
            amount: 5.0,
            purchasePrice: 4200,
            purchaseDate: new Date('2024-04-05'),
            userId,
          },
          {
            cryptocurrencyType: 'XRP_THB',
            amount: 500,
            purchasePrice: 17.8,
            purchaseDate: new Date('2024-05-12'),
            userId,
          },
        ];

        await this.portfolioRepository.save(sampleData);
      }
    } catch {
      throw new BadRequestException('Failed to seed sample portfolio data');
    }
  }
}
