import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import { LocalStorageAdapter } from '../storage/adapters/local-storage.adapter';
import { SupabaseStorageAdapter } from '../storage/adapters/supabase-storage.adapter';
import { UploadFileResult } from '../storage/adapters/interfaces/upload-file-result';

describe('UploadFileService', () => {
  let service: UploadFileService;
  let mockConfigService: any;
  let mockLocalStorageAdapter: any;
  let mockSupabaseStorageAdapter: any;

  const mockFile: Express.Multer.File = {
    fieldname: 'document',
    originalname: 'invoice.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 4096,
    buffer: Buffer.from('fake-pdf-content'),
    destination: '',
    filename: '',
    path: '',
    stream: null as any,
  };

  const mockResult: UploadFileResult = {
    url: '/uploads/invoices/uuid.pdf',
    path: 'uploads/invoices/uuid.pdf',
    size: 4096,
    mimetype: 'application/pdf',
  };

  const setupTestModule = async (storageMethod = 'local') => {
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'STORAGE_METHOD') return storageMethod;
        return undefined;
      }),
    };

    mockLocalStorageAdapter = {
      upload: jest.fn().mockResolvedValue(mockResult),
      delete: jest.fn(),
    };

    mockSupabaseStorageAdapter = {
      upload: jest.fn().mockResolvedValue({
        ...mockResult,
        url: 'https://supabase.co/storage/v1/object/public/bucket/invoices/uuid.pdf',
      }),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadFileService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: LocalStorageAdapter, useValue: mockLocalStorageAdapter },
        {
          provide: SupabaseStorageAdapter,
          useValue: mockSupabaseStorageAdapter,
        },
      ],
    }).compile();

    return module.get<UploadFileService>(UploadFileService);
  };

  describe('execute', () => {
    it('UT-UFS-01: should upload file using LocalStorageAdapter when STORAGE_METHOD is local', async () => {
      service = await setupTestModule('local');

      const result = await service.execute(mockFile, 'invoices');

      expect(result).toBeDefined();
      expect(mockLocalStorageAdapter.upload).toHaveBeenCalledTimes(1);
      expect(mockLocalStorageAdapter.upload).toHaveBeenCalledWith({
        fieldname: 'document',
        originalname: 'invoice.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 4096,
        buffer: mockFile.buffer,
        folder: 'invoices',
      });
      expect(mockSupabaseStorageAdapter.upload).not.toHaveBeenCalled();
    });

    it('UT-UFS-02: should upload file using SupabaseStorageAdapter when STORAGE_METHOD is supabase', async () => {
      service = await setupTestModule('supabase');

      const result = await service.execute(mockFile, 'invoices');

      expect(result).toBeDefined();
      expect(mockSupabaseStorageAdapter.upload).toHaveBeenCalledTimes(1);
      expect(mockLocalStorageAdapter.upload).not.toHaveBeenCalled();
    });

    it('UT-UFS-03: should default to LocalStorageAdapter when STORAGE_METHOD is undefined', async () => {
      mockConfigService = { get: jest.fn().mockReturnValue(undefined) };
      mockLocalStorageAdapter = {
        upload: jest.fn().mockResolvedValue(mockResult),
        delete: jest.fn(),
      };
      mockSupabaseStorageAdapter = { upload: jest.fn(), delete: jest.fn() };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UploadFileService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: LocalStorageAdapter, useValue: mockLocalStorageAdapter },
          {
            provide: SupabaseStorageAdapter,
            useValue: mockSupabaseStorageAdapter,
          },
        ],
      }).compile();

      service = module.get<UploadFileService>(UploadFileService);

      const result = await service.execute(mockFile, 'general');

      expect(result).toBeDefined();
      expect(mockLocalStorageAdapter.upload).toHaveBeenCalledTimes(1);
      expect(mockSupabaseStorageAdapter.upload).not.toHaveBeenCalled();
    });

    it('UT-UFS-04: should throw BadRequestException when file is null or undefined', async () => {
      service = await setupTestModule('local');

      await expect(service.execute(null as any, 'folder')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.execute(null as any, 'folder')).rejects.toThrow(
        'No file provided',
      );
    });

    it('UT-UFS-05: should throw BadRequestException when file buffer is empty', async () => {
      service = await setupTestModule('local');

      const emptyFile = { ...mockFile, buffer: Buffer.from('') };

      await expect(service.execute(emptyFile, 'folder')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.execute(emptyFile, 'folder')).rejects.toThrow(
        'File buffer is empty',
      );
    });

    it('UT-UFS-06: should use "general" as default folder when empty folder string provided', async () => {
      service = await setupTestModule('local');

      await service.execute(mockFile, '');

      expect(mockLocalStorageAdapter.upload).toHaveBeenCalledWith(
        expect.objectContaining({ folder: 'general' }),
      );
    });
  });
});
