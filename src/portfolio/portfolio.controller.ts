import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@ApiTags('portfolio')
@ApiBearerAuth()
@Controller('portfolio')
@UseGuards(JwtAuthGuard)
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  @ApiOperation({
    summary: 'Create portfolio entry',
    description: "Adds a new cryptocurrency purchase to the user's portfolio",
  })
  @ApiResponse({
    status: 201,
    description: 'Portfolio entry created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        cryptocurrencyType: { type: 'string', example: 'BTC_THB' },
        amount: { type: 'number', example: 1.5 },
        purchasePrice: { type: 'number', example: 2500000 },
        purchaseDate: { type: 'string', format: 'date-time' },
        userId: { type: 'number', example: 1 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Request() req: RequestWithUser,
    @Body() createPortfolioDto: CreatePortfolioDto,
  ) {
    return this.portfolioService.create(req.user.userId, createPortfolioDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get user portfolio',
    description: 'Retrieves all portfolio entries for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Portfolio entries retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          cryptocurrencyType: { type: 'string', example: 'BTC_THB' },
          amount: { type: 'number', example: 1.5 },
          purchasePrice: { type: 'number', example: 2500000 },
          purchaseDate: { type: 'string', format: 'date-time' },
          userId: { type: 'number', example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req: RequestWithUser) {
    return this.portfolioService.findAllByUser(req.user.userId);
  }

  @Get('performance')
  @ApiOperation({
    summary: 'Get portfolio performance',
    description:
      'Calculates portfolio performance metrics for the authenticated user within a date range',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for performance calculation (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for performance calculation (ISO 8601 format)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Portfolio performance calculated successfully',
    schema: {
      type: 'object',
      properties: {
        totalValue: { type: 'number', example: 3750000 },
        totalCost: { type: 'number', example: 3500000 },
        totalProfit: { type: 'number', example: 250000 },
        profitPercentage: { type: 'number', example: 7.14 },
        entries: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid date format' })
  getPerformance(
    @Request() req: RequestWithUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.portfolioService.getPortfolioPerformance(
      req.user.userId,
      start,
      end,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get specific portfolio entry',
    description:
      'Retrieves a specific portfolio entry by ID for the authenticated user',
  })
  @ApiParam({
    name: 'id',
    description: 'Portfolio entry ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Portfolio entry retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        cryptocurrencyType: { type: 'string', example: 'BTC_THB' },
        amount: { type: 'number', example: 1.5 },
        purchasePrice: { type: 'number', example: 2500000 },
        purchaseDate: { type: 'string', format: 'date-time' },
        userId: { type: 'number', example: 1 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Portfolio entry not found' })
  findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.portfolioService.findOne(+id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update portfolio entry',
    description:
      'Updates a specific portfolio entry by ID for the authenticated user',
  })
  @ApiParam({
    name: 'id',
    description: 'Portfolio entry ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Portfolio entry updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        cryptocurrencyType: { type: 'string', example: 'BTC_THB' },
        amount: { type: 'number', example: 2.0 },
        purchasePrice: { type: 'number', example: 2500000 },
        purchaseDate: { type: 'string', format: 'date-time' },
        userId: { type: 'number', example: 1 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Portfolio entry not found' })
  update(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
  ) {
    return this.portfolioService.update(
      +id,
      req.user.userId,
      updatePortfolioDto,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete portfolio entry',
    description:
      'Deletes a specific portfolio entry by ID for the authenticated user',
  })
  @ApiParam({
    name: 'id',
    description: 'Portfolio entry ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Portfolio entry deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Portfolio entry not found' })
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.portfolioService.remove(+id, req.user.userId);
  }

  @Post('seed-sample')
  @ApiOperation({
    summary: 'Seed sample portfolio data',
    description:
      'Creates sample portfolio entries for testing if user has no portfolio data',
  })
  @ApiResponse({
    status: 201,
    description: 'Sample portfolio data seeded successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Sample portfolio data seeded successfully',
        },
        count: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Failed to seed sample data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async seedSampleData(@Request() req: RequestWithUser) {
    await this.portfolioService.seedSampleData(req.user.userId);
    const result = await this.portfolioService.findAllByUser(req.user.userId);
    return {
      message: 'Sample portfolio data seeded successfully',
      count: result.total,
    };
  }
}
