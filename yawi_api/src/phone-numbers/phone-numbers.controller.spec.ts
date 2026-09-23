import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PhoneNumbersController } from './phone-numbers.controller';
import { PhoneNumbersService } from './phone-numbers.service';
import { CreatePhoneNumberDto } from './dto/create-phone-number.dto';
import { UpdatePhoneNumberDto } from './dto/update-phone-number.dto';

describe('PhoneNumbersController (Unit)', () => {
  let controller: PhoneNumbersController;
  let service: PhoneNumbersService;

  const mockPhone = {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    number: '+503 7777-8888',
    owner_id: 'd3b07384-d113-4089-a292-1262d088a2a8',
    owner: {
      id: 'd3b07384-d113-4089-a292-1262d088a2a8',
      username: 'jperez',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPhoneNumbersService = {
    create: jest.fn().mockResolvedValue(mockPhone),
    findAll: jest.fn().mockResolvedValue([mockPhone]),
    findOne: jest.fn().mockImplementation((id: string) => {
      if (id === mockPhone.id) return Promise.resolve(mockPhone);
      throw new NotFoundException('PhoneNumber not found');
    }),
    update: jest
      .fn()
      .mockImplementation((id: string, dto: UpdatePhoneNumberDto) => {
        if (id === mockPhone.id)
          return Promise.resolve({ ...mockPhone, ...dto });
        throw new NotFoundException('PhoneNumber not found');
      }),
    remove: jest.fn().mockImplementation((id: string) => {
      if (id === mockPhone.id) return Promise.resolve();
      throw new NotFoundException('PhoneNumber not found');
    }),
    recover: jest.fn().mockImplementation((id: string) => {
      if (id === mockPhone.id) return Promise.resolve(mockPhone);
      throw new NotFoundException('PhoneNumber not found');
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhoneNumbersController],
      providers: [
        {
          provide: PhoneNumbersService,
          useValue: mockPhoneNumbersService,
        },
      ],
    }).compile();

    controller = module.get<PhoneNumbersController>(PhoneNumbersController);
    service = module.get<PhoneNumbersService>(PhoneNumbersService);
  });

  it('debe estar definido el controlador', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('debe invocar service.create con el DTO', async () => {
      const dto: CreatePhoneNumberDto = {
        number: '+503 7777-8888',
        owner_id: 'd3b07384-d113-4089-a292-1262d088a2a8',
      };

      const result = await controller.create(dto);
      expect(result).toEqual(mockPhone);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll()', () => {
    it('debe invocar service.findAll con los filtros', async () => {
      const filters = { number: '+503 7777-8888' };
      const result = await controller.findAll(filters);
      expect(result).toEqual([mockPhone]);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('findOne()', () => {
    it('debe retornar el phone si el ID existe', async () => {
      const result = await controller.findOne(mockPhone.id);
      expect(result).toEqual(mockPhone);
      expect(service.findOne).toHaveBeenCalledWith(mockPhone.id);
    });

    it('debe propagar NotFoundException si el ID no existe', async () => {
      await expect(controller.findOne('non-existent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update()', () => {
    it('debe invocar service.update con el id y el dto', async () => {
      const dto: UpdatePhoneNumberDto = { number: '+503 7000-0000' };
      const result = await controller.update(mockPhone.id, dto);
      expect(result.number).toBe('+503 7000-0000');
      expect(service.update).toHaveBeenCalledWith(mockPhone.id, dto);
    });
  });

  describe('remove()', () => {
    it('debe invocar service.remove con el id', async () => {
      await controller.remove(mockPhone.id);
      expect(service.remove).toHaveBeenCalledWith(mockPhone.id);
    });
  });

  describe('recover()', () => {
    it('debe invocar service.recover con el id', async () => {
      const result = await controller.recover(mockPhone.id);
      expect(result).toEqual(mockPhone);
      expect(service.recover).toHaveBeenCalledWith(mockPhone.id);
    });
  });
});
