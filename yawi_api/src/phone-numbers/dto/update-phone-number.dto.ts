import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePhoneNumberDto } from './create-phone-number.dto';

/**
 * DTO para actualización de PhoneNumber.
 * Omite `owner_id` para evitar reasignaciones directas de propietario no controladas.
 */
export class UpdatePhoneNumberDto extends PartialType(
  OmitType(CreatePhoneNumberDto, ['owner_id'] as const),
) {}
