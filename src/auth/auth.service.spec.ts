import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedPassword';
      const mockUser = {
        id: 1,
        email,
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toEqual({
        id: 1,
        email,
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('should return null when user not found', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const hashedPassword = 'hashedPassword';
      const mockUser = {
        id: 1,
        email,
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user data when credentials are valid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      const mockToken = 'jwt-token';

      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(service.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
      });
      expect(result).toEqual({
        access_token: mockToken,
        user: mockUser,
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(service.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const registerDto: RegisterDto = {
        email: 'new@example.com',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const hashedPassword = 'hashedPassword';
      const mockUser = {
        id: 2,
        ...registerDto,
        password: hashedPassword,
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockUsersService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: hashedPassword,
      });
      expect(result).toEqual({
        id: 2,
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      });
    });

    it('should throw ConflictException when user already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Smith',
      };
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUsersService.create.mockImplementation(() => {
        throw new Error('User with this email already exists');
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });
  });
});
