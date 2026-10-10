import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { Business } from '../businesses/entities/business.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { PhoneNumber } from '../phone-numbers/entities/phone-number.entity';
import { PaymentPreference } from '../payment-preferences/entities/payment-preference.entity';
import { UploadFileService } from '../uploader/upload-file.service';
import { LocalStorageAdapter } from '../storage/adapters/local-storage.adapter';
import { SupabaseStorageAdapter } from '../storage/adapters/supabase-storage.adapter';

describe('ProductsService + UploadFileService (Integration)', () => {
  let productsService: ProductsService;
  let dataSource: DataSource;
  let sampleVendor: Vendor;
  let sampleBusiness: Business;
  let mockLocalStorageAdapter: any;

  const mockUploadResult = {
    url: '/uploads/products/integration-test-uuid.jpg',
    path: 'uploads/products/integration-test-uuid.jpg',
    size: 2048,
    mimetype: 'image/jpeg',
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'image',
    originalname: 'integration-product-photo.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 2048,
    buffer: Buffer.from('integration-test-image-data'),
    destination: '',
    filename: '',
    path: '',
    stream: null as any,
  };

  beforeAll(async () => {
    mockLocalStorageAdapter = {
      upload: jest.fn().mockResolvedValue(mockUploadResult),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              STORAGE_METHOD: 'local',
            }),
          ],
        }),
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
        UploadFileService,
        { provide: LocalStorageAdapter, useValue: mockLocalStorageAdapter },
        {
          provide: SupabaseStorageAdapter,
          useValue: { upload: jest.fn(), delete: jest.fn() },
        },
      ],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
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
        username: 'vendor_prod_integration',
        password: 'hashedpassword',
        name: 'Integration',
        surname: 'Test',
        birthdate: new Date('1995-06-15'),
        country: 'El Salvador',
        personal_address: 'Test Address #1',
        DUI: '87654321-0',
        NIT: '0614-150695-102-2',
      }),
    );

    const businessRepo = dataSource.getRepository(Business);
    sampleBusiness = await businessRepo.save(
      businessRepo.create({
        name: 'Cafetería Integración',
        description: 'Venta de café de prueba',
        address: 'Calle Integración #1',
        balance: 500,
        owner_id: sampleVendor.id,
      }),
    );

    jest.clearAllMocks();
  });

  it('INT-PROD-UPL-01: Flujo completo de creación con imagen sube el archivo a "products" y persiste la URL', async () => {
    const product = await productsService.create(
      {
        business_id: sampleBusiness.id,
        name: 'Café Pacamara Integración',
        tags: ['café', 'artesanal'],
        properties: { origen: 'Apaneca' },
        price: 12.0,
      },
      mockFile,
    );

    // Verifica que el adapter fue invocado con la carpeta 'products'
    expect(mockLocalStorageAdapter.upload).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageAdapter.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        folder: 'products',
      }),
    );

    // Verifica que la URL fue persistida en la base de datos
    const persisted = await productsService.findOne(product.id);
    const urls =
      typeof persisted.images_urls === 'string'
        ? JSON.parse(persisted.images_urls)
        : persisted.images_urls;
    expect(urls).toHaveLength(1);
    expect(urls[0]).toBe(mockUploadResult.url);

    // Verifica que las demás propiedades no se vieron afectadas
    expect(persisted.name).toBe('Café Pacamara Integración');
    expect(persisted.business).toBeDefined();
    expect(persisted.business.id).toBe(sampleBusiness.id);
  });

  it('INT-PROD-UPL-02: addImage agrega imágenes incrementalmente y conserva las anteriores', async () => {
    const product = await productsService.create({
      business_id: sampleBusiness.id,
      name: 'Café Múltiples Fotos',
      price: 10.0,
    });

    expect(product.images_urls).toBeNull();

    let counter = 0;
    mockLocalStorageAdapter.upload.mockImplementation(() => {
      counter++;
      return Promise.resolve({
        ...mockUploadResult,
        url: `/uploads/products/int-prod-${counter}.jpg`,
      });
    });

    const after1 = await productsService.addImage(product.id, mockFile);
    const urls1 =
      typeof after1.images_urls === 'string'
        ? JSON.parse(after1.images_urls)
        : after1.images_urls;
    expect(urls1).toHaveLength(1);

    const after2 = await productsService.addImage(product.id, mockFile);
    const urls2 =
      typeof after2.images_urls === 'string'
        ? JSON.parse(after2.images_urls)
        : after2.images_urls;
    expect(urls2).toHaveLength(2);

    const dbProduct = await productsService.findOne(product.id);
    const dbUrls =
      typeof dbProduct.images_urls === 'string'
        ? JSON.parse(dbProduct.images_urls)
        : dbProduct.images_urls;
    expect(dbUrls).toHaveLength(2);
    expect(dbUrls).toContain('/uploads/products/int-prod-1.jpg');
    expect(dbUrls).toContain('/uploads/products/int-prod-2.jpg');
  });

  it('INT-PROD-UPL-03: La creación sin imagen no invoca el adapter y persiste images_urls como null', async () => {
    const product = await productsService.create({
      business_id: sampleBusiness.id,
      name: 'Café Sin Imagen Integración',
      price: 9.0,
    });

    expect(mockLocalStorageAdapter.upload).not.toHaveBeenCalled();
    expect(product.images_urls).toBeNull();

    const persisted = await productsService.findOne(product.id);
    expect(persisted.images_urls).toBeNull();
  });

  it('INT-PROD-UPL-04: Intentar subir una quinta imagen falla y no invoca el adapter', async () => {
    const product = await productsService.create({
      business_id: sampleBusiness.id,
      name: 'Café Límite 4 Fotos',
      price: 15.0,
    });

    // Subir 4 imágenes
    for (let i = 1; i <= 4; i++) {
      mockLocalStorageAdapter.upload.mockResolvedValueOnce({
        url: `/uploads/products/prod-${i}.jpg`,
      });
      await productsService.addImage(product.id, mockFile);
    }

    expect(mockLocalStorageAdapter.upload).toHaveBeenCalledTimes(4);

    // Intentar subir la 5ta imagen
    await expect(
      productsService.addImage(product.id, mockFile),
    ).rejects.toThrow(BadRequestException);

    // No se debe haber invocado el adapter una quinta vez
    expect(mockLocalStorageAdapter.upload).toHaveBeenCalledTimes(4);
  });
});
