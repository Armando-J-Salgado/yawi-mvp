import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { VendorsModule } from './vendors/vendors.module';
import { PhoneNumbersModule } from './phone-numbers/phone-numbers.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    VendorsModule,
    PhoneNumbersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
