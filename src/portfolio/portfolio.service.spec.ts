import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PortfolioService, PortfolioQueryOptions } from './portfolio.service';
import { Portfolio } from './entities/portfolio.entity';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let repository: Repository<Portfolio>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        {
          provide: getRepositoryToken(Portfolio),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
    repository = module.get<Repository<Portfolio>>(
      getRepositoryToken(Portfolio),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new portfolio entry', async () => {
      const createDto: CreatePortfolioDto = {
        cryptocurrencyType: 'BTC_THB',
        amount: 1.5,
        purchaseDate: '2024-01-15T10:30:00.000Z',
        purchasePrice: 50000,
      };
      const userId = 1;
      const mockPortfolio = {
        id: 1,
        ...createDto,
        userId,
        purchaseDate: new Date(createDto.purchaseDate),
      };

      mockRepository.create.mockReturnValue(mockPortfolio);
      mockRepository.save.mockResolvedValue(mockPortfolio);

      const result = await service.create(userId, createDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        userId,
        purchaseDate: new Date(createDto.purchaseDate),
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockPortfolio);
      expect(result).toEqual(mockPortfolio);
    });

    it('should throw BadRequestException when purchase date is in the future', async () => {
      const createDto: CreatePortfolioDto = {
        cryptocurrencyType: 'BTC_THB',
        amount: 1.5,
        purchaseDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        purchasePrice: 50000,
      };
      const userId = 1;

      await expect(service.create(userId, createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAllByUser', () => {
    it('should return paginated portfolios without filters', async () => {
      const userId = 1;
      const mockPortfolios = [
        { id: 1, cryptocurrencyType: 'BTC_THB', amount: 1.5, userId },
        { id: 2, cryptocurrencyType: 'ETH_THB', amount: 2.0, userId },
      ];
      const total = 2;

      mockRepository.findAndCount.mockResolvedValue([mockPortfolios, total]);

      const result = await service.findAllByUser(userId);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({
        portfolios: mockPortfolios,
        total,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should return paginated portfolios with date filters', async () => {
      const userId = 1;
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const options: PortfolioQueryOptions = {
        page: 2,
        limit: 5,
        startDate,
        endDate,
      };
      const mockPortfolios = [
        { id: 1, cryptocurrencyType: 'BTC_THB', amount: 1.5, userId },
      ];
      const total = 1;

      mockRepository.findAndCount.mockResolvedValue([mockPortfolios, total]);

      const result = await service.findAllByUser(userId, options);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId, purchaseDate: Between(startDate, endDate) },
        order: { createdAt: 'DESC' },
        skip: 5,
        take: 5,
      });
      expect(result).toEqual({
        portfolios: mockPortfolios,
        total,
        page: 2,
        limit: 5,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should return portfolio when found', async () => {
      const id = 1;
      const userId = 1;
      const mockPortfolio = {
        id,
        cryptocurrencyType: 'BTC_THB',
        amount: 1.5,
        userId,
      };

      mockRepository.findOne.mockResolvedValue(mockPortfolio);

      const result = await service.findOne(id, userId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id, userId },
      });
      expect(result).toEqual(mockPortfolio);
    });

    it('should throw NotFoundException when portfolio not found', async () => {
      const id = 999;
      const userId = 1;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id, userId },
      });
    });
  });

  describe('update', () => {
    it('should update portfolio successfully', async () => {
      const id = 1;
      const userId = 1;
      const updateDto: UpdatePortfolioDto = {
        amount: 2.0,
        purchasePrice: 55000,
      };
      const existingPortfolio = {
        id,
        cryptocurrencyType: 'BTC_THB',
        amount: 1.5,
        purchasePrice: 50000,
        userId,
      };
      const updatedPortfolio = { ...existingPortfolio, ...updateDto };

      mockRepository.findOne.mockResolvedValue(existingPortfolio);
      mockRepository.save.mockResolvedValue(updatedPortfolio);

      const result = await service.update(id, userId, updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id, userId },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedPortfolio);
      expect(result).toEqual(updatedPortfolio);
    });

    it('should throw BadRequestException when purchase date is in the future', async () => {
      const id = 1;
      const userId = 1;
      const updateDto: UpdatePortfolioDto = {
        purchaseDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      };
      const existingPortfolio = {
        id,
        cryptocurrencyType: 'BTC_THB',
        amount: 1.5,
        userId,
      };

      mockRepository.findOne.mockResolvedValue(existingPortfolio);

      await expect(service.update(id, userId, updateDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove portfolio successfully', async () => {
      const id = 1;
      const userId = 1;
      const mockPortfolio = {
        id,
        cryptocurrencyType: 'BTC_THB',
        amount: 1.5,
        userId,
      };

      mockRepository.findOne.mockResolvedValue(mockPortfolio);
      mockRepository.remove.mockResolvedValue(mockPortfolio);

      await service.remove(id, userId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id, userId },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockPortfolio);
    });
  });

  describe('getPortfolioPerformance', () => {
    it('should return portfolio performance without date filters', async () => {
      const userId = 1;
      const mockPortfolios = [
        { id: 1, amount: 1.5, purchasePrice: 50000, userId },
        { id: 2, amount: 2.0, purchasePrice: 25000, userId },
      ];

      mockRepository.find.mockResolvedValue(mockPortfolios);

      const result = await service.getPortfolioPerformance(userId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { purchaseDate: 'ASC' },
      });
      expect(result).toEqual({
        portfolios: mockPortfolios,
        totalInvestment: 125000, // (1.5 * 50000) + (2.0 * 25000)
        count: 2,
      });
    });

    it('should return portfolio performance with date filters', async () => {
      const userId = 1;
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockPortfolios = [
        { id: 1, amount: 1.5, purchasePrice: 50000, userId },
      ];

      mockRepository.find.mockResolvedValue(mockPortfolios);

      const result = await service.getPortfolioPerformance(
        userId,
        startDate,
        endDate,
      );

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId, purchaseDate: Between(startDate, endDate) },
        order: { purchaseDate: 'ASC' },
      });
      expect(result).toEqual({
        portfolios: mockPortfolios,
        totalInvestment: 75000, // 1.5 * 50000
        count: 1,
      });
    });

    it('should throw BadRequestException when start date is after end date', async () => {
      const userId = 1;
      const startDate = new Date('2024-01-31');
      const endDate = new Date('2024-01-01');

      await expect(
        service.getPortfolioPerformance(userId, startDate, endDate),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
