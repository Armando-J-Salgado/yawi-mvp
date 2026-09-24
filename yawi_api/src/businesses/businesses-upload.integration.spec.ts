import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { BusinessesService } from './businesses.service';
import { Business } from './entities/business.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { PhoneNumber } from '../phone-numbers/entities/phone-number.entity';
import { PaymentPreference } from '../payment-preferences/entities/payment-preference.entity';
import { UploadFileService } from '../uploader/upload-file.service';
import { LocalStorageAdapter } from '../storage/adapters/local-storage.adapter';
import { SupabaseStorageAdapter } from '../storage/adapters/supabase-storage.adapter';

describe('BusinessesService + UploadFileService (Integration)', () => {
  let businessesService: BusinessesService;
  let dataSource: DataSource;
  let sampleVendor: Vendor;
  let mockLocalStorageAdapter: any;

  const mockUploadResult = {
    url: '/uploads/businesses/integration-test-uuid.jpg',
    path: 'uploads/businesses/integration-test-uuid.jpg',
    size: 2048,
    mimetype: 'image/jpeg',
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'image',
    originalname: 'integration-photo.jpg',
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
          entities: [Business, Vendor, PhoneNumber, PaymentPreference],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Business, Vendor]),
      ],
      providers: [
        BusinessesService,
        UploadFileService,
        { provide: LocalStorageAdapter, useValue: mockLocalStorageAdapter },
        {
          provide: SupabaseStorageAdapter,
          useValue: { upload: jest.fn(), delete: jest.fn() },
        },
      ],
    }).compile();

    businessesService = module.get<BusinessesService>(BusinessesService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    await dataSource.getRepository(Business).clear();
    await dataSource.getRepository(Vendor).clear();

    const vendorRepo = dataSource.getRepository(Vendor);
    sampleVendor = await vendorRepo.save(
      vendorRepo.create({
        username: 'vendor_integration_upload',
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

    jest.clearAllMocks();
  });

  it('INT-BUS-UPL-01: Flujo completo de creación con imagen sube el archivo y persiste la URL', async () => {
    const business = await businessesService.create(
      {
        name: 'Negocio Integración',
        description: 'Test de integración con imagen',
        address: 'Calle Integración #1',
        owner_id: sampleVendor.id,
      },
      mockFile,
    );

    // Verifica que el adapter fue invocado
    expect(mockLocalStorageAdapter.upload).toHaveBeenCalledTimes(1);

    // Verifica que la URL fue persistida en la base de datos
    const persisted = await businessesService.findOne(business.id);
    const urls =
      typeof persisted.imagesUrls === 'string'
        ? JSON.parse(persisted.imagesUrls)
        : persisted.imagesUrls;
    expect(urls).toHaveLength(1);
    expect(urls[0]).toBe(mockUploadResult.url);

    // Verifica que las demás propiedades no se vieron afectadas
    expect(persisted.name).toBe('Negocio Integración');
    expect(persisted.owner).toBeDefined();
    expect(persisted.owner.id).toBe(sampleVendor.id);
  });

  it('INT-BUS-UPL-02: addImage agrega imágenes incrementalmente y persiste correctamente', async () => {
    // Crear business sin imagen
    const business = await businessesService.create({
      name: 'Negocio Agregar Imágenes',
      description: 'Empezamos sin imagen',
      address: 'Calle Sin Imagen #10',
      owner_id: sampleVendor.id,
    });

    expect(business.imagesUrls).toBeNull();

    // Agregar primera imagen
    let counter = 0;
    mockLocalStorageAdapter.upload.mockImplementation(() => {
      counter++;
      return Promise.resolve({
        ...mockUploadResult,
        url: `/uploads/businesses/int-img-${counter}.jpg`,
      });
    });

    const after1 = await businessesService.addImage(business.id, mockFile);
    const urls1 =
      typeof after1.imagesUrls === 'string'
        ? JSON.parse(after1.imagesUrls)
        : after1.imagesUrls;
    expect(urls1).toHaveLength(1);

    // Agregar segunda imagen
    const after2 = await businessesService.addImage(business.id, mockFile);
    const urls2 =
      typeof after2.imagesUrls === 'string'
        ? JSON.parse(after2.imagesUrls)
        : after2.imagesUrls;
    expect(urls2).toHaveLength(2);

    // Verificar persistencia real en base de datos
    const dbBusiness = await businessesService.findOne(business.id);
    const dbUrls =
      typeof dbBusiness.imagesUrls === 'string'
        ? JSON.parse(dbBusiness.imagesUrls)
        : dbBusiness.imagesUrls;
    expect(dbUrls).toHaveLength(2);
    expect(dbUrls).toContain('/uploads/businesses/int-img-1.jpg');
    expect(dbUrls).toContain('/uploads/businesses/int-img-2.jpg');
  });

  it('INT-BUS-UPL-03: La creación sin imagen no invoca el adapter y persiste imagesUrls como null', async () => {
    const business = await businessesService.create({
      name: 'Negocio Sin Imagen Integración',
      description: 'No tiene imagen',
      address: 'Calle Vacía #5',
      owner_id: sampleVendor.id,
    });

    expect(mockLocalStorageAdapter.upload).not.toHaveBeenCalled();
    expect(business.imagesUrls).toBeNull();

    // Verificar en base de datos
    const persisted = await businessesService.findOne(business.id);
    expect(persisted.imagesUrls).toBeNull();
  });
});
