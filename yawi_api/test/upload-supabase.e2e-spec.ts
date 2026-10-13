import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, InternalServerErrorException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploaderModule } from '../src/uploader/uploader.module';
import { UploadFileService } from '../src/uploader/upload-file.service';
import { SUPABASE_CLIENT } from '../src/clients/supabase/supabase.client';

describe('UploadFile Flow - Supabase Storage (E2E Integration)', () => {
  let app: INestApplication;
  let uploadFileService: UploadFileService;
  let mockSupabase: any;

  const createMockMulterFile = (
    originalname = 'product.png',
    mimetype = 'image/png',
    content = 'fake-supabase-binary-data',
  ): Express.Multer.File => ({
    fieldname: 'image',
    originalname,
    encoding: '7bit',
    mimetype,
    size: Buffer.byteLength(content),
    buffer: Buffer.from(content),
    destination: '',
    filename: '',
    path: '',
    stream: null as any,
  });

  const setupAppWithSupabase = async (supabaseMockInstance: any) => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              STORAGE_METHOD: 'supabase',
              SUPABASE_STORAGE_BUCKET: 'yawi-test-bucket',
            }),
          ],
        }),
        UploaderModule,
      ],
    })
      .overrideProvider(SUPABASE_CLIENT)
      .useValue(supabaseMockInstance)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    uploadFileService = app.get<UploadFileService>(UploadFileService);
  };

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('IT-SUP-01: should complete full upload flow to Supabase successfully', async () => {
    mockSupabase = {
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({
            data: { path: 'products/mocked-uuid-1234.png' },
            error: null,
          }),
          getPublicUrl: jest.fn().mockReturnValue({
            data: {
              publicUrl:
                'https://example.supabase.co/storage/v1/object/public/yawi-test-bucket/products/mocked-uuid-1234.png',
            },
          }),
        }),
      },
    };

    await setupAppWithSupabase(mockSupabase);

    const file = createMockMulterFile('product.png', 'image/png');
    const result = await uploadFileService.execute(file, 'products');

    expect(result).toBeDefined();
    expect(result.url).toBe(
      'https://example.supabase.co/storage/v1/object/public/yawi-test-bucket/products/mocked-uuid-1234.png',
    );
    expect(result.path).toBe('products/mocked-uuid-1234.png');
    expect(result.size).toBe(file.size);
    expect(result.mimetype).toBe('image/png');
    expect(mockSupabase.storage.from).toHaveBeenCalledWith('yawi-test-bucket');
  });

  it('IT-SUP-02: should propagate Supabase error when upload fails in full flow', async () => {
    mockSupabase = {
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({
            data: null,
            error: {
              message: 'The resource already exists',
              statusCode: '409',
            },
          }),
          getPublicUrl: jest.fn(),
        }),
      },
    };

    await setupAppWithSupabase(mockSupabase);

    const file = createMockMulterFile('duplicate.png', 'image/png');

    await expect(uploadFileService.execute(file, 'products')).rejects.toThrow(
      InternalServerErrorException,
    );
    await expect(uploadFileService.execute(file, 'products')).rejects.toThrow(
      'Failed to upload file to Supabase: The resource already exists',
    );
  });

  it('IT-SUP-03: should handle missing Supabase client gracefully in full flow', async () => {
    await setupAppWithSupabase(null);

    const file = createMockMulterFile('test.png', 'image/png');

    await expect(uploadFileService.execute(file, 'test')).rejects.toThrow(
      InternalServerErrorException,
    );
    await expect(uploadFileService.execute(file, 'test')).rejects.toThrow(
      'Supabase client is not configured',
    );
  });
});
