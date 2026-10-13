import { Module } from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [UploadFileService],
  exports: [UploadFileService],
})
export class UploaderModule {}
