import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBooleanString, IsUUID } from 'class-validator';

export class FilterBusinessDto {
  @ApiPropertyOptional({
    description: 'Filtrar por nombre exacto del negocio',
    example: 'Tienda El Buen Precio',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por dirección exacta',
    example: 'Av. Independencia #456',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por UUID del propietario (Vendor)',
    example: 'd3b07384-d113-4089-a292-1262d088a2a8',
  })
  @IsOptional()
  @IsUUID('4')
  owner_id?: string;

  @ApiPropertyOptional({
    description: 'Incluir registros eliminados lógicamente (Soft Delete)',
    example: 'true',
    enum: ['true', 'false'],
  })
  @IsOptional()
  @IsBooleanString()
  withDeleted?: string;
}
