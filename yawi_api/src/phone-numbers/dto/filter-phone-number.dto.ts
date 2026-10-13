import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsBooleanString } from 'class-validator';

export class FilterPhoneNumberDto {
  @ApiPropertyOptional({
    description: 'Filtrar por número de teléfono exacto',
    example: '+503 7777-8888',
  })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por UUID del Vendor propietario',
    example: 'd3b07384-d113-4089-a292-1262d088a2a8',
  })
  @IsOptional()
  @IsUUID('4')
  owner_id?: string;

  @ApiPropertyOptional({
    description: 'Incluir números eliminados lógicamente (Soft Delete)',
    example: 'true',
    enum: ['true', 'false'],
  })
  @IsOptional()
  @IsBooleanString()
  withDeleted?: string;
}
