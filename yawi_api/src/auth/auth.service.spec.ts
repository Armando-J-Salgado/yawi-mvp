import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { Customer } from '../customers/entities/customer.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { VendorLoginDto } from './dto/vendor-login.dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let customerRepository: any;
  let vendorRepository: any;

  const mockCustomer: Partial<Customer> = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    email: 'ana.perez@example.com',
    password: '$2b$10$hashedPasswordValueExample',
    name: 'Ana',
    lastname: 'Pérez',
    country: 'El Salvador',
    personal_address: 'Colonia Escalón #123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockVendor: Partial<Vendor> = {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    username: 'jperez',
    password: '$2b$10$hashedVendorPasswordValue',
    name: 'Juan',
    surname: 'Pérez',
    lastname: 'Carlos',
    second_lastname: 'López',
    DUI: '01234567-8',
    deletedAt: null,
  };

  const createQueryBuilderMock = (result: any) => ({
    where: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(result),
  });

  beforeEach(async () => {
    customerRepository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
    };
    vendorRepository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Customer),
          useValue: customerRepository,
        },
        {
          provide: getRepositoryToken(Vendor),
          useValue: vendorRepository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked.jwt.token'),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              if (key === 'JWT_SECRET') return 'test_jwt_secret_key';
              if (key === 'JWT_EXPIRES_IN') return defaultValue ?? '1d';
              return null;
            }),
            getOrThrow: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'test_jwt_secret_key';
              throw new Error(`Missing ${key}`);
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('constructor', () => {
    it('debe lanzar error si JWT_SECRET no está definido', () => {
      const emptyConfig = {
        get: jest.fn().mockReturnValue(null),
      } as unknown as ConfigService;

      expect(() => {
        new AuthService(
          customerRepository,
          vendorRepository,
          jwtService,
          emptyConfig,
        );
      }).toThrow('JWT_SECRET must be configured in environment variables');
    });
  });

  describe('login', () => {
    it('debe autenticar exitosamente a un Customer con email normalizado y devolver tokens y datos públicos', async () => {
      customerRepository.createQueryBuilder.mockReturnValue(
        createQueryBuilderMock(mockCustomer),
      );
      jest.mocked(bcrypt.compare).mockResolvedValue(true);

      const result = await service.login({
        email: '  ANA.PEREZ@EXAMPLE.COM  ',
        password: 'Password123!',
      });

      expect(result).toBeDefined();
      expect(result.access_token).toBe('mocked.jwt.token');
      expect(result.token_type).toBe('Bearer');
      expect(result.expires_in).toBe('1d');
      expect(result.user).toEqual({
        id: mockCustomer.id,
        userType: 'customer',
        email: mockCustomer.email,
        name: mockCustomer.name,
        lastname: mockCustomer.lastname,
      });
      expect((result as any).password).toBeUndefined();
      expect((result.user as any).password).toBeUndefined();
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockCustomer.id,
        userType: 'customer',
        email: mockCustomer.email,
      });
    });

    it('debe rechazar con UnauthorizedException si el Customer no existe', async () => {
      customerRepository.createQueryBuilder.mockReturnValue(
        createQueryBuilderMock(null),
      );

      await expect(
        service.login({
          email: 'inexistente@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe rechazar con UnauthorizedException si la contraseña es incorrecta', async () => {
      customerRepository.createQueryBuilder.mockReturnValue(
        createQueryBuilderMock(mockCustomer),
      );
      jest.mocked(bcrypt.compare).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'ana.perez@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe rechazar con UnauthorizedException si el Customer está eliminado (soft delete)', async () => {
      const deletedCustomer = {
        ...mockCustomer,
        deletedAt: new Date(),
      };
      customerRepository.createQueryBuilder.mockReturnValue(
        createQueryBuilderMock(deletedCustomer),
      );

      await expect(
        service.login({
          email: 'ana.perez@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateTokenPayload', () => {
    it('debe retornar la identidad del usuario para un payload válido', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);

      const user = await service.validateTokenPayload({
        sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        userType: 'customer',
        email: 'ana.perez@example.com',
      });

      expect(user).toEqual({
        id: mockCustomer.id,
        userType: 'customer',
        email: mockCustomer.email,
        name: mockCustomer.name,
        lastname: mockCustomer.lastname,
      });

    });

    it('debe rechazar payload con sub que no es UUID', async () => {
      await expect(
        service.validateTokenPayload({
          sub: 'not-a-valid-uuid',
          userType: 'customer',
          email: 'ana.perez@example.com',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe rechazar payload con userType diferente a customer', async () => {
      await expect(
        service.validateTokenPayload({
          sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          userType: 'vendor' as any,
          email: 'ana.perez@example.com',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe rechazar payload con email inválido o ausente', async () => {
      await expect(
        service.validateTokenPayload({
          sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          userType: 'customer',
          email: '' as any,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe rechazar si el usuario no existe en la base de datos', async () => {
      customerRepository.findOne.mockResolvedValue(null);

      await expect(
        service.validateTokenPayload({
          sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          userType: 'customer',
          email: 'ana.perez@example.com',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe rechazar si el usuario tiene deletedAt (soft deleted)', async () => {
      customerRepository.findOne.mockResolvedValue({
        ...mockCustomer,
        deletedAt: new Date(),
      });

      await expect(
        service.validateTokenPayload({
          sub: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          userType: 'customer',
          email: 'ana.perez@example.com',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    describe('vendorLogin', () => {
      it('debe autenticar un Vendor por username y devolver solo datos públicos', async () => {
        vendorRepository.createQueryBuilder.mockReturnValue(
          createQueryBuilderMock(mockVendor),
        );
        jest.mocked(bcrypt.compare).mockResolvedValue(true);

        const result = await service.vendorLogin({
          identifier: '  jperez  ',
          password: 'Password123!',
        });

        expect(result.user).toEqual({
          id: mockVendor.id,
          userType: 'vendor',
          username: mockVendor.username,
          name: mockVendor.name,
          surname: mockVendor.surname,
          lastname: mockVendor.lastname,
          second_lastname: mockVendor.second_lastname,
        });
        expect(jwtService.sign).toHaveBeenCalledWith({
          sub: mockVendor.id,
          userType: 'vendor',
          username: mockVendor.username,
        });
        expect((result.user as any).password).toBeUndefined();
      });

      it('debe autenticar un Vendor por DUI', async () => {
        vendorRepository.createQueryBuilder.mockReturnValue(
          createQueryBuilderMock(mockVendor),
        );
        jest.mocked(bcrypt.compare).mockResolvedValue(true);

        await service.vendorLogin({
          identifier: '01234567-8',
          password: 'Password123!',
        });

        expect(vendorRepository.createQueryBuilder).toHaveBeenCalledWith(
          'vendor',
        );
      });

      it('debe rechazar credenciales inválidas o Vendors eliminados', async () => {
        vendorRepository.createQueryBuilder.mockReturnValue(
          createQueryBuilderMock(null),
        );

        await expect(
          service.vendorLogin({
            identifier: 'jperez',
            password: 'Password123!',
          } as VendorLoginDto),
        ).rejects.toThrow(UnauthorizedException);

        vendorRepository.createQueryBuilder.mockReturnValue(
          createQueryBuilderMock({ ...mockVendor, deletedAt: new Date() }),
        );
        await expect(
          service.vendorLogin({
            identifier: 'jperez',
            password: 'Password123!',
          }),
        ).rejects.toThrow(UnauthorizedException);
      });
    });

    describe('vendor token validation', () => {
      it('debe validar el payload y retornar la identidad del Vendor', async () => {
        vendorRepository.findOne.mockResolvedValue(mockVendor);

        await expect(
          service.validateTokenPayload({
            sub: mockVendor.id!,
            userType: 'vendor',
            username: mockVendor.username!,
          }),
        ).resolves.toEqual({
          id: mockVendor.id,
          userType: 'vendor',
          username: mockVendor.username,
          name: mockVendor.name,
          surname: mockVendor.surname,
          lastname: mockVendor.lastname,
          second_lastname: mockVendor.second_lastname,
        });
      });
    });
  });
});
