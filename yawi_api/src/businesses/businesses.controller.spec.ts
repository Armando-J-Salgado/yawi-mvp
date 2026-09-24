import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
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
    imagesUrls: null,
    owner: {
      id: 'd3b07384-d113-4089-a292-1262d088a2a8',
      username: 'carlos_salvador',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'image',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('fake-image-data'),
    destination: '',
    filename: '',
    path: '',
    stream: null as any,
  };

  const mockBusinessWithImage = {
    ...mockBusiness,
    imagesUrls: ['https://example.com/businesses/uuid-test-image.jpg'],
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
    addImage: jest.fn().mockImplementation((id: string) => {
      if (id === mockBusiness.id) return Promise.resolve(mockBusinessWithImage);
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

    jest.clearAllMocks();
  });

  it('debe estar definido el controlador', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('debe invocar service.create con el DTO y sin archivo', async () => {
      const dto: CreateBusinessDto = {
        name: 'Tienda El Buen Precio',
        description: 'Tienda de artículos para el hogar con envío a domicilio.',
        address: 'Av. Independencia #456, Centro Histórico, San Salvador',
        balance: 1500.5,
        owner_id: 'd3b07384-d113-4089-a292-1262d088a2a8',
      };

      const result = await controller.create(dto, undefined);
      expect(result).toEqual(mockBusiness);
      expect(service.create).toHaveBeenCalledWith(dto, undefined);
    });

    it('debe invocar service.create con el DTO y un archivo de imagen', async () => {
      mockBusinessesService.create.mockResolvedValueOnce(mockBusinessWithImage);
      const dto: CreateBusinessDto = {
        name: 'Tienda El Buen Precio',
        description: 'Tienda de artículos para el hogar con envío a domicilio.',
        address: 'Av. Independencia #456, Centro Histórico, San Salvador',
        owner_id: 'd3b07384-d113-4089-a292-1262d088a2a8',
      };

      const result = await controller.create(dto, mockFile);
      expect(result).toEqual(mockBusinessWithImage);
      expect(service.create).toHaveBeenCalledWith(dto, mockFile);
    });
  });

  describe('addImage()', () => {
    it('1. Happy Path: debe invocar service.addImage y retornar el business con la imagen agregada', async () => {
      const result = await controller.addImage(mockBusiness.id, mockFile);

      expect(result).toEqual(mockBusinessWithImage);
      expect(result.imagesUrls).toContain(
        'https://example.com/businesses/uuid-test-image.jpg',
      );
      expect(service.addImage).toHaveBeenCalledWith(mockBusiness.id, mockFile);
    });

    it('2. Excepción: debe propagar NotFoundException si el business no existe', async () => {
      mockBusinessesService.addImage.mockRejectedValueOnce(
        new NotFoundException('Business not found'),
      );

      await expect(
        controller.addImage('00000000-0000-0000-0000-000000000000', mockFile),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Excepción: debe propagar BadRequestException si se excede el máximo de imágenes', async () => {
      mockBusinessesService.addImage.mockRejectedValueOnce(
        new BadRequestException(
          'El negocio ya tiene el máximo de 4 imágenes permitidas.',
        ),
      );

      await expect(
        controller.addImage(mockBusiness.id, mockFile),
      ).rejects.toThrow(BadRequestException);
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
