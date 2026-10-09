import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBooleanString } from 'class-validator';

export class FilterCustomerDto {
  @ApiPropertyOptional({
    description: 'Filtrar por correo electrónico exacto',
    example: 'cliente@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nombre exacto',
    example: 'Ana',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por país exacto',
    example: 'El Salvador',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Incluir registros eliminados lógicamente (Soft Delete)',
    example: 'true',
    enum: ['true', 'false'],
  })
  @IsOptional()
  @IsBooleanString()
  withDeleted?: string;
}
