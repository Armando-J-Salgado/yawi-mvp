import { Module } from '@nestjs/common';
import { LocalStorageService } from './services/local-storage.service';
import { SupabaseStorageService } from './services/supabase-storage.service';
import { LocalStorageAdapter } from './adapters/local-storage.adapter';
import { SupabaseStorageAdapter } from './adapters/supabase-storage.adapter';
import { SupabaseModule } from '../clients/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [
    LocalStorageService,
    SupabaseStorageService,
    LocalStorageAdapter,
    SupabaseStorageAdapter,
  ],
  exports: [LocalStorageAdapter, SupabaseStorageAdapter],
})
export class StorageModule {}
