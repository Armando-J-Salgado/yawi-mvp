import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { Vendor } from './entities/vendor.entity';
import { PhoneNumber } from '../phone-numbers/entities/phone-number.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor, PhoneNumber])],
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [VendorsService],
})
export class VendorsModule {}
