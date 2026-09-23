import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploaderModule } from '../src/uploader/uploader.module';
import { UploadFileService } from '../src/uploader/upload-file.service';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');

describe('UploadFile Flow - Local Storage (E2E Integration)', () => {
  let app: INestApplication;
  let uploadFileService: UploadFileService;
  const mockedFs = fs as jest.Mocked<typeof fs>;

  beforeAll(async () => {
    process.env.STORAGE_METHOD = 'local';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ STORAGE_METHOD: 'local' })],
        }),
        UploaderModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    uploadFileService = app.get<UploadFileService>(UploadFileService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  const createMockMulterFile = (
    originalname = 'catalog.pdf',
    mimetype = 'application/pdf',
    content = 'mock-file-binary-content',
  ): Express.Multer.File => ({
    fieldname: 'file',
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

  it('IT-LOC-01: should complete full upload flow to local storage successfully', async () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.writeFileSync.mockReturnValue(undefined);

    const file = createMockMulterFile('profile.jpg', 'image/jpeg');
    const result = await uploadFileService.execute(file, 'profiles');

    expect(result).toBeDefined();
    expect(result.url).toMatch(/^\/uploads\/profiles\/[a-f0-9-]+\.jpg$/);
    expect(result.path).toMatch(/^uploads\/profiles\/[a-f0-9-]+\.jpg$/);
    expect(result.size).toBe(file.size);
    expect(result.mimetype).toBe('image/jpeg');

    expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.join('uploads', 'profiles')),
      file.buffer,
    );
  });

  it('IT-LOC-02: should create directory when it does not exist during full flow', async () => {
    mockedFs.existsSync.mockReturnValue(false);
    mockedFs.mkdirSync.mockReturnValue(undefined);
    mockedFs.writeFileSync.mockReturnValue(undefined);

    const file = createMockMulterFile('document.pdf', 'application/pdf');
    const result = await uploadFileService.execute(file, 'documents');

    expect(result).toBeDefined();
    expect(result.url).toMatch(/^\/uploads\/documents\/[a-f0-9-]+\.pdf$/);
    expect(mockedFs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining(path.join('uploads', 'documents')),
      { recursive: true },
    );
    expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
  });

  it('IT-LOC-03: should reject file upload when buffer is empty', async () => {
    const emptyFile = createMockMulterFile('empty.txt', 'text/plain', '');

    await expect(uploadFileService.execute(emptyFile, 'test')).rejects.toThrow(
      'File buffer is empty',
    );
    expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
  });
});
