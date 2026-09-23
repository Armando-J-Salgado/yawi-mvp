import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { SupabaseStorageService } from './supabase-storage.service';
import { SUPABASE_CLIENT } from '../../clients/supabase/supabase.client';
import { UploadFileDTO } from '../adapters/interfaces/upload-file.dto';

describe('SupabaseStorageService', () => {
  let service: SupabaseStorageService;
  let mockSupabaseClient: any;
  let mockConfigService: any;

  const mockFileDTO: UploadFileDTO = {
    fieldname: 'file',
    originalname: 'avatar.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 2048,
    buffer: Buffer.from('fake-avatar-content'),
    folder: 'avatars',
  };

  const createMockSupabase = (uploadResult: any, publicUrlResult: any) => ({
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue(uploadResult),
        getPublicUrl: jest.fn().mockReturnValue(publicUrlResult),
      }),
    },
  });

  const setupModule = async (
    supabaseClient: any,
    bucketName = 'test-bucket',
  ) => {
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'SUPABASE_STORAGE_BUCKET') return bucketName;
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseStorageService,
        {
          provide: SUPABASE_CLIENT,
          useValue: supabaseClient,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    return module.get<SupabaseStorageService>(SupabaseStorageService);
  };

  describe('upload', () => {
    it('UT-SS-01: should upload file successfully to Supabase', async () => {
      mockSupabaseClient = createMockSupabase(
        { data: { path: 'avatars/uuid-generated.jpg' }, error: null },
        {
          data: {
            publicUrl:
              'https://test.supabase.co/storage/v1/object/public/test-bucket/avatars/uuid-generated.jpg',
          },
        },
      );

      service = await setupModule(mockSupabaseClient);

      const result = await service.upload(mockFileDTO);

      expect(result).toBeDefined();
      expect(result.url).toBe(
        'https://test.supabase.co/storage/v1/object/public/test-bucket/avatars/uuid-generated.jpg',
      );
      expect(result.path).toBe('avatars/uuid-generated.jpg');
      expect(result.size).toBe(2048);
      expect(result.mimetype).toBe('image/jpeg');
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(
        'test-bucket',
      );
    });

    it('UT-SS-02: should throw InternalServerErrorException when Supabase client is null', async () => {
      service = await setupModule(null);

      await expect(service.upload(mockFileDTO)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.upload(mockFileDTO)).rejects.toThrow(
        'Supabase client is not configured',
      );
    });

    it('UT-SS-03: should throw InternalServerErrorException when Supabase upload returns error', async () => {
      mockSupabaseClient = createMockSupabase(
        {
          data: null,
          error: { message: 'Bucket not found', statusCode: '404' },
        },
        { data: { publicUrl: '' } },
      );

      service = await setupModule(mockSupabaseClient);

      await expect(service.upload(mockFileDTO)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.upload(mockFileDTO)).rejects.toThrow(
        'Failed to upload file to Supabase: Bucket not found',
      );
    });

    it('UT-SS-04: should throw InternalServerErrorException when unexpected exception occurs', async () => {
      mockSupabaseClient = {
        storage: {
          from: jest.fn().mockImplementation(() => {
            throw new Error('Network error: connection refused');
          }),
        },
      };

      service = await setupModule(mockSupabaseClient);

      await expect(service.upload(mockFileDTO)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.upload(mockFileDTO)).rejects.toThrow(
        'Error uploading file to Supabase storage',
      );
    });
  });
});
