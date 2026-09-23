import { Provider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

const logger = new Logger('SupabaseClientFactory');

export const SupabaseClientProvider: Provider = {
  provide: SUPABASE_CLIENT,
  useFactory: (configService: ConfigService): SupabaseClient | null => {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseServiceKey) {
      logger.warn(
        'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined. Supabase client will be null. This is acceptable if using local storage.',
      );
      return null;
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  },
  inject: [ConfigService],
};
