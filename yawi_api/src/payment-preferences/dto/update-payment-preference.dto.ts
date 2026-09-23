import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePaymentPreferenceDto } from './create-payment-preference.dto';

/**
 * DTO para actualización parcial de PaymentPreference.
 * Omite `owner_id` ya que el propietario no es modificable después de la creación.
 */
export class UpdatePaymentPreferenceDto extends PartialType(
  OmitType(CreatePaymentPreferenceDto, ['owner_id'] as const),
) {}
