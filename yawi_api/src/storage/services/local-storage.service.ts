import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { UploadFileDTO } from '../adapters/interfaces/upload-file.dto';
import { UploadFileResult } from '../adapters/interfaces/upload-file-result';

@Injectable()
export class LocalStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly basePath = path.resolve(process.cwd(), 'uploads');

  async upload(file: UploadFileDTO): Promise<UploadFileResult> {
    try {
      const targetDir = path.join(this.basePath, file.folder);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const fileExtension = path.extname(file.originalname);
      const uniqueFileName = `${randomUUID()}${fileExtension}`;
      const filePath = path.join(targetDir, uniqueFileName);

      fs.writeFileSync(filePath, file.buffer);

      const relativePath = `uploads/${file.folder}/${uniqueFileName}`;
      const url = `/${relativePath}`;

      this.logger.log(`File saved locally: ${filePath}`);

      return {
        url,
        path: relativePath,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      this.logger.error(
        `Error saving file locally: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Error saving file to local storage',
      );
    }
  }
}
