import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateVendorDto } from './create-vendor.dto';

/**
 * DTO para actualización parcial de Vendor.
 * Omite `phone_number` ya que los números telefónicos se gestionan mediante su propio módulo.
 */
export class UpdateVendorDto extends PartialType(
  OmitType(CreateVendorDto, ['phone_number'] as const),
) {}
