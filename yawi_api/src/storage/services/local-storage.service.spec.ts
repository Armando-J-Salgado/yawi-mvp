import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { LocalStorageService } from './local-storage.service';
import { UploadFileDTO } from '../adapters/interfaces/upload-file.dto';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  const mockedFs = fs as jest.Mocked<typeof fs>;

  const mockFileDTO: UploadFileDTO = {
    fieldname: 'file',
    originalname: 'test-image.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 1024,
    buffer: Buffer.from('fake-image-content'),
    folder: 'vendors',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalStorageService],
    }).compile();

    service = module.get<LocalStorageService>(LocalStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload', () => {
    it('UT-LS-01: should upload file successfully when folder exists', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.writeFileSync.mockReturnValue(undefined);

      const result = await service.upload(mockFileDTO);

      expect(result).toBeDefined();
      expect(result.url).toMatch(/^\/uploads\/vendors\/[a-f0-9-]+\.png$/);
      expect(result.path).toMatch(/^uploads\/vendors\/[a-f0-9-]+\.png$/);
      expect(result.size).toBe(1024);
      expect(result.mimetype).toBe('image/png');
      expect(mockedFs.existsSync).toHaveBeenCalledTimes(1);
      expect(mockedFs.mkdirSync).not.toHaveBeenCalled();
      expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
    });

    it('UT-LS-02: should create directory recursively if it does not exist', async () => {
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.mkdirSync.mockReturnValue(undefined);
      mockedFs.writeFileSync.mockReturnValue(undefined);

      const result = await service.upload(mockFileDTO);

      expect(result).toBeDefined();
      expect(result.url).toMatch(/^\/uploads\/vendors\/[a-f0-9-]+\.png$/);
      expect(mockedFs.existsSync).toHaveBeenCalledTimes(1);
      expect(mockedFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining(path.join('uploads', 'vendors')),
        { recursive: true },
      );
      expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
    });

    it('UT-LS-03: should throw InternalServerErrorException when writeFileSync fails', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.writeFileSync.mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });

      await expect(service.upload(mockFileDTO)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.upload(mockFileDTO)).rejects.toThrow(
        'Error saving file to local storage',
      );
    });

    it('UT-LS-04: should throw InternalServerErrorException when mkdirSync fails', async () => {
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.mkdirSync.mockImplementation(() => {
        throw new Error('ENOSPC: no space left on device');
      });

      await expect(service.upload(mockFileDTO)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
