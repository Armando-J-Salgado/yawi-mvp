import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

describe('VendorsController (Unit)', () => {
  let controller: VendorsController;
  let service: VendorsService;

  const mockVendor = {
    id: 'd3b07384-d113-4089-a292-1262d088a2a8',
    username: 'jperez',
    password: 'hashed_password',
    name: 'Juan',
    surname: 'Pérez',
    birthdate: new Date('1990-05-15'),
    country: 'El Salvador',
    personal_address: 'Col. Escalón #123',
    DUI: '01234567-8',
    NIT: '0614-150590-101-0',
    phone_numbers: [
      {
        id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        number: '+503 7777-8888',
        owner_id: 'd3b07384-d113-4089-a292-1262d088a2a8',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockVendorsService = {
    create: jest.fn().mockResolvedValue(mockVendor),
    findAll: jest.fn().mockResolvedValue([mockVendor]),
    findOne: jest.fn().mockImplementation((id: string) => {
      if (id === mockVendor.id) return Promise.resolve(mockVendor);
      throw new NotFoundException('Vendor not found');
    }),
    update: jest.fn().mockImplementation((id: string, dto: UpdateVendorDto) => {
      if (id === mockVendor.id)
        return Promise.resolve({ ...mockVendor, ...dto });
      throw new NotFoundException('Vendor not found');
    }),
    remove: jest.fn().mockImplementation((id: string) => {
      if (id === mockVendor.id) return Promise.resolve();
      throw new NotFoundException('Vendor not found');
    }),
    recover: jest.fn().mockImplementation((id: string) => {
      if (id === mockVendor.id) return Promise.resolve(mockVendor);
      throw new NotFoundException('Vendor not found');
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorsController],
      providers: [
        {
          provide: VendorsService,
          useValue: mockVendorsService,
        },
      ],
    }).compile();

    controller = module.get<VendorsController>(VendorsController);
    service = module.get<VendorsService>(VendorsService);
  });

  it('debe estar definido el controlador', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('debe invocar service.create y retornar el vendor', async () => {
      const dto: CreateVendorDto = {
        username: 'jperez',
        password: 'Password123!',
        name: 'Juan',
        surname: 'Pérez',
        birthdate: '1990-05-15',
        country: 'El Salvador',
        personal_address: 'Col. Escalón #123',
        DUI: '01234567-8',
        NIT: '0614-150590-101-0',
        phone_number: '+503 7777-8888',
      };

      const result = await controller.create(dto);
      expect(result).toEqual(mockVendor);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll()', () => {
    it('debe invocar service.findAll con los filtros', async () => {
      const filters = { country: 'El Salvador' };
      const result = await controller.findAll(filters);
      expect(result).toEqual([mockVendor]);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('findOne()', () => {
    it('debe retornar el vendor si el UUID existe', async () => {
      const result = await controller.findOne(mockVendor.id);
      expect(result).toEqual(mockVendor);
      expect(service.findOne).toHaveBeenCalledWith(mockVendor.id);
    });

    it('debe propagar NotFoundException si el vendor no existe', async () => {
      await expect(controller.findOne('non-existent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update()', () => {
    it('debe invocar service.update con el id y el dto', async () => {
      const dto: UpdateVendorDto = { name: 'Juan Carlos' };
      const result = await controller.update(mockVendor.id, dto);
      expect(result.name).toBe('Juan Carlos');
      expect(service.update).toHaveBeenCalledWith(mockVendor.id, dto);
    });
  });

  describe('remove()', () => {
    it('debe invocar service.remove', async () => {
      await controller.remove(mockVendor.id);
      expect(service.remove).toHaveBeenCalledWith(mockVendor.id);
    });
  });

  describe('recover()', () => {
    it('debe invocar service.recover', async () => {
      const result = await controller.recover(mockVendor.id);
      expect(result).toEqual(mockVendor);
      expect(service.recover).toHaveBeenCalledWith(mockVendor.id);
    });
  });
});
