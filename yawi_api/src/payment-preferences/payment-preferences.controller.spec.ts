import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PaymentPreferencesController } from './payment-preferences.controller';
import { PaymentPreferencesService } from './payment-preferences.service';
import { CreatePaymentPreferenceDto } from './dto/create-payment-preference.dto';
import { UpdatePaymentPreferenceDto } from './dto/update-payment-preference.dto';
import { FilterPaymentPreferenceDto } from './dto/filter-payment-preference.dto';

describe('PaymentPreferencesController (Unit)', () => {
  let controller: PaymentPreferencesController;
  let service: PaymentPreferencesService;

  const mockPref = {
    id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    name: 'Transferencia Banco Agrícola',
    account_information: {
      bank: 'Banco Agrícola',
      account_number: '1234567890',
      type: 'Ahorro',
    },
    owner_id: 'd3b07384-d113-4089-a292-1262d088a2a8',
    owner: {
      id: 'd3b07384-d113-4089-a292-1262d088a2a8',
      username: 'maria_flores',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPaymentPreferencesService = {
    create: jest.fn().mockResolvedValue(mockPref),
    findAll: jest.fn().mockResolvedValue([mockPref]),
    findOne: jest.fn().mockImplementation((id: string) => {
      if (id === mockPref.id) return Promise.resolve(mockPref);
      throw new NotFoundException('PaymentPreference not found');
    }),
    update: jest
      .fn()
      .mockImplementation((id: string, dto: UpdatePaymentPreferenceDto) => {
        if (id === mockPref.id) return Promise.resolve({ ...mockPref, ...dto });
        throw new NotFoundException('PaymentPreference not found');
      }),
    remove: jest.fn().mockImplementation((id: string) => {
      if (id === mockPref.id) return Promise.resolve();
      throw new NotFoundException('PaymentPreference not found');
    }),
    recover: jest.fn().mockImplementation((id: string) => {
      if (id === mockPref.id) return Promise.resolve(mockPref);
      throw new NotFoundException('PaymentPreference not found');
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentPreferencesController],
      providers: [
        {
          provide: PaymentPreferencesService,
          useValue: mockPaymentPreferencesService,
        },
      ],
    }).compile();

    controller = module.get<PaymentPreferencesController>(
      PaymentPreferencesController,
    );
    service = module.get<PaymentPreferencesService>(PaymentPreferencesService);
  });

  it('debe estar definido el controlador', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('debe invocar service.create con el DTO', async () => {
      const dto: CreatePaymentPreferenceDto = {
        name: 'Transferencia Banco Agrícola',
        account_information: {
          bank: 'Banco Agrícola',
          account_number: '1234567890',
          type: 'Ahorro',
        },
        owner_id: 'd3b07384-d113-4089-a292-1262d088a2a8',
      };

      const result = await controller.create(dto);
      expect(result).toEqual(mockPref);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll()', () => {
    it('debe invocar service.findAll con los filtros', async () => {
      const filters: FilterPaymentPreferenceDto = {
        name: 'Transferencia Banco Agrícola',
      };
      const result = await controller.findAll(filters);
      expect(result).toEqual([mockPref]);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('findOne()', () => {
    it('debe retornar la preferencia si el ID existe', async () => {
      const result = await controller.findOne(mockPref.id);
      expect(result).toEqual(mockPref);
      expect(service.findOne).toHaveBeenCalledWith(mockPref.id);
    });

    it('debe propagar NotFoundException si el ID no existe', async () => {
      await expect(controller.findOne('non-existent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update()', () => {
    it('debe invocar service.update con el id y el dto', async () => {
      const dto: UpdatePaymentPreferenceDto = { name: 'Nuevo Nombre' };
      const result = await controller.update(mockPref.id, dto);
      expect(result.name).toBe('Nuevo Nombre');
      expect(service.update).toHaveBeenCalledWith(mockPref.id, dto);
    });
  });

  describe('remove()', () => {
    it('debe invocar service.remove con el id', async () => {
      await controller.remove(mockPref.id);
      expect(service.remove).toHaveBeenCalledWith(mockPref.id);
    });
  });

  describe('recover()', () => {
    it('debe invocar service.recover con el id', async () => {
      const result = await controller.recover(mockPref.id);
      expect(result).toEqual(mockPref);
      expect(service.recover).toHaveBeenCalledWith(mockPref.id);
    });
  });
});
