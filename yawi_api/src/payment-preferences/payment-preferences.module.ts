import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentPreferencesService } from './payment-preferences.service';
import { PaymentPreferencesController } from './payment-preferences.controller';
import { PaymentPreference } from './entities/payment-preference.entity';
import { Vendor } from '../vendors/entities/vendor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentPreference, Vendor])],
  controllers: [PaymentPreferencesController],
  providers: [PaymentPreferencesService],
  exports: [PaymentPreferencesService],
})
export class PaymentPreferencesModule {}
