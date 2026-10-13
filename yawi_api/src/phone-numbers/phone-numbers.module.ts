import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhoneNumbersService } from './phone-numbers.service';
import { PhoneNumbersController } from './phone-numbers.controller';
import { PhoneNumber } from './entities/phone-number.entity';
import { Vendor } from '../vendors/entities/vendor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PhoneNumber, Vendor])],
  controllers: [PhoneNumbersController],
  providers: [PhoneNumbersService],
  exports: [PhoneNumbersService],
})
export class PhoneNumbersModule {}
