import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { FilterCustomerDto } from './dto/filter-customer.dto';

describe('CustomersController (Unit)', () => {
  let controller: CustomersController;
  let service: CustomersService;

  const mockCustomer = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    email: 'ana.perez@example.com',
    name: 'Ana',
    lastname: 'Pérez',
    country: 'El Salvador',
    personal_address: 'Colonia Escalón #123, San Salvador',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockCustomersService = {
    create: jest.fn().mockResolvedValue(mockCustomer),
    findAll: jest.fn().mockResolvedValue([mockCustomer]),
    findOne: jest.fn().mockImplementation((id: string) => {
      if (id === mockCustomer.id) return Promise.resolve(mockCustomer);
      throw new NotFoundException('Customer not found');
    }),
    update: jest
      .fn()
      .mockImplementation((id: string, dto: UpdateCustomerDto) => {
        if (id === mockCustomer.id)
          return Promise.resolve({ ...mockCustomer, ...dto });
        throw new NotFoundException('Customer not found');
      }),
    remove: jest.fn().mockImplementation((id: string) => {
      if (id === mockCustomer.id) return Promise.resolve();
      throw new NotFoundException('Customer not found');
    }),
    recover: jest.fn().mockImplementation((id: string) => {
      if (id === mockCustomer.id) return Promise.resolve(mockCustomer);
      throw new NotFoundException('Customer not found');
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    service = module.get<CustomersService>(CustomersService);

    jest.clearAllMocks();
  });

  it('debe estar definido el controlador', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('debe invocar service.create con el DTO y retornar el customer creado', async () => {
      const dto: CreateCustomerDto = {
        email: 'ana.perez@example.com',
        password: 'CustomerPass123!',
        name: 'Ana',
        lastname: 'Pérez',
        country: 'El Salvador',
        personal_address: 'Colonia Escalón #123, San Salvador',
      };

      const result = await controller.create(dto);
      expect(result).toEqual(mockCustomer);
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('debe propagar ConflictException si el email ya existe', async () => {
      mockCustomersService.create.mockRejectedValueOnce(
        new ConflictException('Email already in use'),
      );

      const dto: CreateCustomerDto = {
        email: 'ana.perez@example.com',
        password: 'CustomerPass123!',
        name: 'Ana',
        lastname: 'Pérez',
        country: 'El Salvador',
        personal_address: 'Colonia Escalón #123, San Salvador',
      };

      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll()', () => {
    it('debe invocar service.findAll con los filtros', async () => {
      const filters: FilterCustomerDto = {
        email: 'ana.perez@example.com',
        country: 'El Salvador',
      };
      const result = await controller.findAll(filters);
      expect(result).toEqual([mockCustomer]);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('findOne()', () => {
    it('debe retornar el customer si el ID existe', async () => {
      const result = await controller.findOne(mockCustomer.id);
      expect(result).toEqual(mockCustomer);
      expect(service.findOne).toHaveBeenCalledWith(mockCustomer.id);
    });

    it('debe propagar NotFoundException si el ID no existe', async () => {
      await expect(
        controller.findOne('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('debe invocar service.update con el id y el dto', async () => {
      const dto: UpdateCustomerDto = { name: 'Ana María' };
      const result = await controller.update(mockCustomer.id, dto);
      expect(result.name).toBe('Ana María');
      expect(service.update).toHaveBeenCalledWith(mockCustomer.id, dto);
    });

    it('debe propagar ConflictException si se intenta duplicar email', async () => {
      mockCustomersService.update.mockRejectedValueOnce(
        new ConflictException('Email conflict'),
      );

      await expect(
        controller.update(mockCustomer.id, {
          email: 'otro.cliente@example.com',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove()', () => {
    it('debe invocar service.remove con el id', async () => {
      await controller.remove(mockCustomer.id);
      expect(service.remove).toHaveBeenCalledWith(mockCustomer.id);
    });

    it('debe propagar NotFoundException si el id no existe', async () => {
      mockCustomersService.remove.mockRejectedValueOnce(
        new NotFoundException('Customer not found'),
      );

      await expect(
        controller.remove('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('recover()', () => {
    it('debe invocar service.recover con el id', async () => {
      const result = await controller.recover(mockCustomer.id);
      expect(result).toEqual(mockCustomer);
      expect(service.recover).toHaveBeenCalledWith(mockCustomer.id);
    });

    it('debe propagar NotFoundException si el id no existe', async () => {
      await expect(
        controller.recover('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
