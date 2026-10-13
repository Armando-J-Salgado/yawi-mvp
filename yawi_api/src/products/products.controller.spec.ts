import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

describe('ProductsController (Unit)', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProduct = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    business_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'Café molido artesanal',
    tags: ['café', 'artesanal'],
    images_urls: null,
    properties: { weight: '500g' },
    price: 8.5,
    business: {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      name: 'Tienda El Buen Precio',
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

  const mockProductWithImage = {
    ...mockProduct,
    images_urls: ['https://example.com/products/test-image.jpg'],
  };

  const mockProductsService = {
    create: jest.fn().mockResolvedValue(mockProduct),
    findAll: jest.fn().mockResolvedValue([mockProduct]),
    findOne: jest.fn().mockImplementation((id: string) => {
      if (id === mockProduct.id) return Promise.resolve(mockProduct);
      throw new NotFoundException('Product not found');
    }),
    update: jest
      .fn()
      .mockImplementation((id: string, dto: UpdateProductDto) => {
        if (id === mockProduct.id)
          return Promise.resolve({ ...mockProduct, ...dto });
        throw new NotFoundException('Product not found');
      }),
    remove: jest.fn().mockImplementation((id: string) => {
      if (id === mockProduct.id) return Promise.resolve();
      throw new NotFoundException('Product not found');
    }),
    recover: jest.fn().mockImplementation((id: string) => {
      if (id === mockProduct.id) return Promise.resolve(mockProduct);
      throw new NotFoundException('Product not found');
    }),
    addImage: jest.fn().mockImplementation((id: string) => {
      if (id === mockProduct.id) return Promise.resolve(mockProductWithImage);
      throw new NotFoundException('Product not found');
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);

    jest.clearAllMocks();
  });

  it('debe estar definido el controlador', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('debe llamar a service.create con DTO y archivo opcional', async () => {
      const dto: CreateProductDto = {
        business_id: mockProduct.business_id,
        name: mockProduct.name,
        price: 8.5,
      };

      const result = await controller.create(dto, mockFile);

      expect(service.create).toHaveBeenCalledWith(dto, mockFile);
      expect(result).toEqual(mockProduct);
    });

    it('debe permitir crear producto sin archivo', async () => {
      const dto: CreateProductDto = {
        business_id: mockProduct.business_id,
        name: mockProduct.name,
        price: 8.5,
      };

      const result = await controller.create(dto, undefined);

      expect(service.create).toHaveBeenCalledWith(dto, undefined);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('addImage()', () => {
    it('debe llamar a service.addImage con el ID y el archivo', async () => {
      const result = await controller.addImage(mockProduct.id, mockFile);

      expect(service.addImage).toHaveBeenCalledWith(mockProduct.id, mockFile);
      expect(result).toEqual(mockProductWithImage);
    });
  });

  describe('findAll()', () => {
    it('debe llamar a service.findAll con los filtros', async () => {
      const filters: FilterProductDto = {
        business_id: mockProduct.business_id,
        name: 'Café',
      };

      const result = await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findOne()', () => {
    it('debe llamar a service.findOne con el ID', async () => {
      const result = await controller.findOne(mockProduct.id);

      expect(service.findOne).toHaveBeenCalledWith(mockProduct.id);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update()', () => {
    it('debe llamar a service.update con el ID y el DTO', async () => {
      const dto: UpdateProductDto = { name: 'Nuevo Nombre' };

      const result = await controller.update(mockProduct.id, dto);

      expect(service.update).toHaveBeenCalledWith(mockProduct.id, dto);
      expect(result).toEqual({ ...mockProduct, ...dto });
    });
  });

  describe('remove()', () => {
    it('debe llamar a service.remove con el ID', async () => {
      await controller.remove(mockProduct.id);

      expect(service.remove).toHaveBeenCalledWith(mockProduct.id);
    });
  });

  describe('recover()', () => {
    it('debe llamar a service.recover con el ID', async () => {
      const result = await controller.recover(mockProduct.id);

      expect(service.recover).toHaveBeenCalledWith(mockProduct.id);
      expect(result).toEqual(mockProduct);
    });
  });
});
