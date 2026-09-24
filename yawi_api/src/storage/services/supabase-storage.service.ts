import {
  Injectable,
  Inject,
  Optional,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { SUPABASE_CLIENT } from '../../clients/supabase/supabase.client';
import { UploadFileDTO } from '../adapters/interfaces/upload-file.dto';
import { UploadFileResult } from '../adapters/interfaces/upload-file-result';

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly bucketName: string;

  constructor(
    @Optional()
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient | null,
    private readonly configService: ConfigService,
  ) {
    this.bucketName =
      this.configService.get<string>('SUPABASE_STORAGE_BUCKET') || 'yawi-files';
  }

  async upload(file: UploadFileDTO): Promise<UploadFileResult> {
    if (!this.supabaseClient) {
      this.logger.error('Supabase client is not initialized');
      throw new InternalServerErrorException(
        'Supabase client is not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      );
    }

    try {
      const fileExtension = path.extname(file.originalname);
      const uniqueFileName = `${randomUUID()}${fileExtension}`;
      const filePath = `${file.folder}/${uniqueFileName}`;

      const { data, error } = await this.supabaseClient.storage
        .from(this.bucketName)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        this.logger.error(`Supabase storage upload error: ${error.message}`);
        throw new InternalServerErrorException(
          `Failed to upload file to Supabase: ${error.message}`,
        );
      }

      const { data: urlData } = this.supabaseClient.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);

      this.logger.log(`File uploaded to Supabase: ${data.path}`);

      return {
        url: urlData.publicUrl,
        path: data.path,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error(
        `Error uploading to Supabase: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Error uploading file to Supabase storage',
      );
    }
  }
}
