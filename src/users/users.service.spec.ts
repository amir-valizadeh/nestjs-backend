import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
      };
      const mockUser = {
        id: 1,
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException when user already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
      };
      const existingUser = {
        id: 1,
        email: 'existing@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      mockRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const email = 'test@example.com';
      const mockUser = {
        id: 1,
        email,
        firstName: 'John',
        lastName: 'Doe',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return undefined when user not found', async () => {
      const email = 'nonexistent@example.com';

      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const id = 1;
      const mockUser = {
        id,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return undefined when user not found', async () => {
      const id = 999;

      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findById(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toBeUndefined();
    });
  });
});
