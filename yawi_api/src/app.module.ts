import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { VendorsModule } from './vendors/vendors.module';
import { PhoneNumbersModule } from './phone-numbers/phone-numbers.module';
import { BusinessesModule } from './businesses/businesses.module';
import { PaymentPreferencesModule } from './payment-preferences/payment-preferences.module';
import { UploaderModule } from './uploader/uploader.module';
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
    BusinessesModule,
    PaymentPreferencesModule,
    UploaderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
