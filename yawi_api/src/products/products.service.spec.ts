import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { Business } from '../businesses/entities/business.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { PhoneNumber } from '../phone-numbers/entities/phone-number.entity';
import { PaymentPreference } from '../payment-preferences/entities/payment-preference.entity';
import { UploadFileService } from '../uploader/upload-file.service';

describe('ProductsService (Unit / SQLite in-memory)', () => {
  let service: ProductsService;
  let dataSource: DataSource;
  let sampleVendor: Vendor;
  let sampleBusiness: Business;
  let mockUploadFileService: any;

  const mockUploadResult = {
    url: '/uploads/products/uuid-test-image.jpg',
    path: 'uploads/products/uuid-test-image.jpg',
    size: 1024,
    mimetype: 'image/jpeg',
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

  beforeAll(async () => {
    mockUploadFileService = {
      execute: jest.fn().mockResolvedValue(mockUploadResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Product, Business, Vendor, PhoneNumber, PaymentPreference],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Product, Business]),
      ],
      providers: [
        ProductsService,
        {
          provide: UploadFileService,
          useValue: mockUploadFileService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    await dataSource.getRepository(Product).clear();
    await dataSource.getRepository(Business).clear();
    await dataSource.getRepository(Vendor).clear();

    const vendorRepo = dataSource.getRepository(Vendor);
    sampleVendor = await vendorRepo.save(
      vendorRepo.create({
        username: 'vendor_product_test',
        password: 'hashedpassword',
        name: 'Carlos',
        surname: 'Martínez',
        birthdate: new Date('1990-01-01'),
        country: 'El Salvador',
        personal_address: 'San Salvador #123',
        DUI: '12345678-9',
        NIT: '0614-010190-101-1',
      }),
    );

    const businessRepo = dataSource.getRepository(Business);
    sampleBusiness = await businessRepo.save(
      businessRepo.create({
        name: 'Tienda de Café El Volcán',
        description: 'Venta de café y artículos afines',
        address: 'Calle El Mirador #10',
        balance: 1000.0,
        owner_id: sampleVendor.id,
      }),
    );

    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('1. Debe crear un Product asociado a un Business existente sin imagen', async () => {
      const product = await service.create({
        business_id: sampleBusiness.id,
        name: 'Café Pacamara 500g',
        tags: ['café', 'artesanal'],
        properties: { origin: 'Apaneca' },
        price: 12.5,
      });

      expect(product).toBeDefined();
      expect(product.id).toBeDefined();
      expect(product.name).toBe('Café Pacamara 500g');
      expect(product.business_id).toBe(sampleBusiness.id);
      expect(product.business).toBeDefined();
      expect(product.business.id).toBe(sampleBusiness.id);
      expect(product.images_urls).toBeNull();
      expect(Number(product.price)).toBe(12.5);
    });

    it('2. Debe lanzar NotFoundException si el business_id no existe', async () => {
      await expect(
        service.create({
          business_id: '00000000-0000-4000-8000-000000000000',
          name: 'Producto Huérfano',
          price: 10.0,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Debe subir la imagen a la carpeta "products" y persistir la URL', async () => {
      mockUploadFileService.execute.mockResolvedValueOnce({
        url: '/uploads/products/cafe-pacamara.jpg',
      });

      const product = await service.create(
        {
          business_id: sampleBusiness.id,
          name: 'Café Pacamara con Foto',
          price: 15.0,
        },
        mockFile,
      );

      expect(mockUploadFileService.execute).toHaveBeenCalledWith(
        mockFile,
        'products',
      );
      const urls =
        typeof product.images_urls === 'string'
          ? JSON.parse(product.images_urls)
          : product.images_urls;
      expect(urls).toEqual(['/uploads/products/cafe-pacamara.jpg']);
    });

    it('4. Debe aplicar valores por defecto para tags ([]) y properties ({}) si no se proporcionan', async () => {
      const product = await service.create({
        business_id: sampleBusiness.id,
        name: 'Café Simple',
        price: 5.0,
      });

      const tags =
        typeof product.tags === 'string'
          ? JSON.parse(product.tags)
          : product.tags;
      const properties =
        typeof product.properties === 'string'
          ? JSON.parse(product.properties)
          : product.properties;

      expect(tags).toEqual([]);
      expect(properties).toEqual({});
    });

    it('5. Debe propagar el error si el uploader falla durante la creación', async () => {
      mockUploadFileService.execute.mockRejectedValueOnce(
        new BadRequestException('Error en storage'),
      );

      await expect(
        service.create(
          {
            business_id: sampleBusiness.id,
            name: 'Café Fallido',
            price: 10.0,
          },
          mockFile,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('addImage()', () => {
    it('1. Debe agregar una imagen al producto y conservar las existentes', async () => {
      const product = await service.create({
        business_id: sampleBusiness.id,
        name: 'Café Para Fotos',
        price: 10.0,
      });

      mockUploadFileService.execute.mockResolvedValueOnce({
        url: '/uploads/products/img-1.jpg',
      });

      const after1 = await service.addImage(product.id, mockFile);
      const urls1 =
        typeof after1.images_urls === 'string'
          ? JSON.parse(after1.images_urls)
          : after1.images_urls;
      expect(urls1).toEqual(['/uploads/products/img-1.jpg']);

      mockUploadFileService.execute.mockResolvedValueOnce({
        url: '/uploads/products/img-2.jpg',
      });

      const after2 = await service.addImage(product.id, mockFile);
      const urls2 =
        typeof after2.images_urls === 'string'
          ? JSON.parse(after2.images_urls)
          : after2.images_urls;
      expect(urls2).toEqual([
        '/uploads/products/img-1.jpg',
        '/uploads/products/img-2.jpg',
      ]);
    });

    it('2. Debe rechazar agregar una 5ta imagen cuando ya tiene 4 imágenes', async () => {
      const productRepo = dataSource.getRepository(Product);
      const product = await productRepo.save(
        productRepo.create({
          business_id: sampleBusiness.id,
          name: 'Producto con 4 fotos',
          price: 20.0,
          images_urls: ['/url1.jpg', '/url2.jpg', '/url3.jpg', '/url4.jpg'],
        }),
      );

      await expect(service.addImage(product.id, mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll()', () => {
    it('1. Debe listar productos y soportar filtros por business_id y name', async () => {
      await service.create({
        business_id: sampleBusiness.id,
        name: 'Café Pacamara',
        price: 10.0,
      });
      await service.create({
        business_id: sampleBusiness.id,
        name: 'Café Geisha',
        price: 25.0,
      });

      const all = await service.findAll();
      expect(all.length).toBe(2);

      const byBusiness = await service.findAll({
        business_id: sampleBusiness.id,
      });
      expect(byBusiness.length).toBe(2);

      const byName = await service.findAll({ name: 'Café Geisha' });
      expect(byName.length).toBe(1);
      expect(byName[0].name).toBe('Café Geisha');
    });

    it('2. Debe excluir soft-deleted por defecto y mostrarlos con withDeleted=true', async () => {
      const product = await service.create({
        business_id: sampleBusiness.id,
        name: 'Café a Eliminar',
        price: 8.0,
      });

      await service.remove(product.id);

      const activeList = await service.findAll();
      expect(activeList.find((p) => p.id === product.id)).toBeUndefined();

      const withDeletedList = await service.findAll({ withDeleted: 'true' });
      expect(withDeletedList.find((p) => p.id === product.id)).toBeDefined();
    });
  });

  describe('findOne()', () => {
    it('1. Debe retornar el producto con su relación business', async () => {
      const created = await service.create({
        business_id: sampleBusiness.id,
        name: 'Café Detalle',
        price: 9.0,
      });

      const found = await service.findOne(created.id);
      expect(found.id).toBe(created.id);
      expect(found.business).toBeDefined();
      expect(found.business.id).toBe(sampleBusiness.id);
    });

    it('2. Debe lanzar NotFoundException si el producto no existe', async () => {
      await expect(
        service.findOne('00000000-0000-4000-8000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('1. Debe actualizar campos permitidos (name, price, tags, properties)', async () => {
      const created = await service.create({
        business_id: sampleBusiness.id,
        name: 'Café Original',
        price: 10.0,
      });

      const updated = await service.update(created.id, {
        name: 'Café Modificado',
        price: 15.5,
      });

      expect(updated.name).toBe('Café Modificado');
      expect(Number(updated.price)).toBe(15.5);
    });

    it('2. Debe lanzar NotFoundException si se intenta asociar a un business_id inexistente', async () => {
      const created = await service.create({
        business_id: sampleBusiness.id,
        name: 'Café Original',
        price: 10.0,
      });

      await expect(
        service.update(created.id, {
          business_id: '00000000-0000-4000-8000-000000000000',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove() & recover()', () => {
    it('1. Debe aplicar soft delete y restaurar un producto', async () => {
      const created = await service.create({
        business_id: sampleBusiness.id,
        name: 'Café Temporal',
        price: 10.0,
      });

      await service.remove(created.id);

      await expect(service.findOne(created.id)).rejects.toThrow(
        NotFoundException,
      );

      const recovered = await service.recover(created.id);
      expect(recovered.deletedAt).toBeNull();

      const foundAgain = await service.findOne(created.id);
      expect(foundAgain.id).toBe(created.id);
    });
  });
});
