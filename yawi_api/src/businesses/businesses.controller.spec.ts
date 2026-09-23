import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { FilterBusinessDto } from './dto/filter-business.dto';

describe('BusinessesController (Unit)', () => {
  let controller: BusinessesController;
  let service: BusinessesService;

  const mockBusiness = {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'Tienda El Buen Precio',
    description: 'Tienda de artículos para el hogar con envío a domicilio.',
    address: 'Av. Independencia #456, Centro Histórico, San Salvador',
    balance: 1500.5,
    owner_id: 'd3b07384-d113-4089-a292-1262d088a2a8',
    owner: {
      id: 'd3b07384-d113-4089-a292-1262d088a2a8',
      username: 'carlos_salvador',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockBusinessesService = {
    create: jest.fn().mockResolvedValue(mockBusiness),
    findAll: jest.fn().mockResolvedValue([mockBusiness]),
    findOne: jest.fn().mockImplementation((id: string) => {
      if (id === mockBusiness.id) return Promise.resolve(mockBusiness);
      throw new NotFoundException('Business not found');
    }),
    update: jest
      .fn()
      .mockImplementation((id: string, dto: UpdateBusinessDto) => {
        if (id === mockBusiness.id)
          return Promise.resolve({ ...mockBusiness, ...dto });
        throw new NotFoundException('Business not found');
      }),
    remove: jest.fn().mockImplementation((id: string) => {
      if (id === mockBusiness.id) return Promise.resolve();
      throw new NotFoundException('Business not found');
    }),
    recover: jest.fn().mockImplementation((id: string) => {
      if (id === mockBusiness.id) return Promise.resolve(mockBusiness);
      throw new NotFoundException('Business not found');
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessesController],
      providers: [
        {
          provide: BusinessesService,
          useValue: mockBusinessesService,
        },
      ],
    }).compile();

    controller = module.get<BusinessesController>(BusinessesController);
    service = module.get<BusinessesService>(BusinessesService);
  });

  it('debe estar definido el controlador', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('debe invocar service.create con el DTO', async () => {
      const dto: CreateBusinessDto = {
        name: 'Tienda El Buen Precio',
        description: 'Tienda de artículos para el hogar con envío a domicilio.',
        address: 'Av. Independencia #456, Centro Histórico, San Salvador',
        balance: 1500.5,
        owner_id: 'd3b07384-d113-4089-a292-1262d088a2a8',
      };

      const result = await controller.create(dto);
      expect(result).toEqual(mockBusiness);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll()', () => {
    it('debe invocar service.findAll con los filtros', async () => {
      const filters: FilterBusinessDto = { name: 'Tienda El Buen Precio' };
      const result = await controller.findAll(filters);
      expect(result).toEqual([mockBusiness]);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('findOne()', () => {
    it('debe retornar el business si el ID existe', async () => {
      const result = await controller.findOne(mockBusiness.id);
      expect(result).toEqual(mockBusiness);
      expect(service.findOne).toHaveBeenCalledWith(mockBusiness.id);
    });

    it('debe propagar NotFoundException si el ID no existe', async () => {
      await expect(controller.findOne('non-existent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update()', () => {
    it('debe invocar service.update con el id y el dto', async () => {
      const dto: UpdateBusinessDto = { name: 'Nuevo Nombre' };
      const result = await controller.update(mockBusiness.id, dto);
      expect(result.name).toBe('Nuevo Nombre');
      expect(service.update).toHaveBeenCalledWith(mockBusiness.id, dto);
    });
  });

  describe('remove()', () => {
    it('debe invocar service.remove con el id', async () => {
      await controller.remove(mockBusiness.id);
      expect(service.remove).toHaveBeenCalledWith(mockBusiness.id);
    });
  });

  describe('recover()', () => {
    it('debe invocar service.recover con el id', async () => {
      const result = await controller.recover(mockBusiness.id);
      expect(result).toEqual(mockBusiness);
      expect(service.recover).toHaveBeenCalledWith(mockBusiness.id);
    });
  });
});
