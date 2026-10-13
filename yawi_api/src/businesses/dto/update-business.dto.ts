import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBusinessDto } from './create-business.dto';

/**
 * DTO para actualización parcial de Business.
 * Omite `owner_id` ya que el propietario no es modificable después de la creación.
 */
export class UpdateBusinessDto extends PartialType(
  OmitType(CreateBusinessDto, ['owner_id'] as const),
) {}
