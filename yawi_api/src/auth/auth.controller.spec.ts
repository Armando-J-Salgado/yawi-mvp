import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard, RequestWithUser } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthResponse: AuthResponseDto = {
    access_token: 'mock.access.token',
    token_type: 'Bearer',
    expires_in: '1d',
    user: {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      userType: 'customer',
      email: 'ana.perez@example.com',
      name: 'Ana',
      lastname: 'Pérez',
    },
  };

  const mockAuthenticatedUser: AuthenticatedUser = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    userType: 'customer',
    email: 'ana.perez@example.com',
    name: 'Ana',
    lastname: 'Pérez',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue(mockAuthResponse),
            validateTokenPayload: jest
              .fn()
              .mockResolvedValue(mockAuthenticatedUser),
          },
        },
        {
          provide: JwtStrategy,
          useValue: {
            validateToken: jest.fn().mockResolvedValue(mockAuthenticatedUser),
          },
        },
        {
          provide: JwtAuthGuard,
          useValue: {
            canActivate: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('POST /auth/login', () => {
    it('debe llamar a authService.login con el DTO y retornar la respuesta esperada', async () => {
      const loginDto: LoginDto = {
        email: 'ana.perez@example.com',
        password: 'Password123!',
      };

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('GET /auth/me', () => {
    it('debe retornar el usuario contenido en request.user', () => {
      const mockReq = {
        user: mockAuthenticatedUser,
      } as RequestWithUser;

      const result = controller.getMe(mockReq);

      expect(result).toEqual(mockAuthenticatedUser);
    });
  });
});
