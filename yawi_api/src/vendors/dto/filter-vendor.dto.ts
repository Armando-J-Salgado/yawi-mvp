import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBooleanString } from 'class-validator';

export class FilterVendorDto {
  @ApiPropertyOptional({
    description: 'Filtrar por coincidencia exacta de nombre',
    example: 'Juan',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por coincidencia exacta de primer apellido',
    example: 'Pérez',
  })
  @IsOptional()
  @IsString()
  surname?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por país',
    example: 'El Salvador',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por DUI',
    example: '01234567-8',
  })
  @IsOptional()
  @IsString()
  DUI?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por NIT',
    example: '0614-150590-101-0',
  })
  @IsOptional()
  @IsString()
  NIT?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nombre de usuario',
    example: 'jperez',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Incluir registros eliminados lógicamente (Soft Delete)',
    example: 'true',
    enum: ['true', 'false'],
  })
  @IsOptional()
  @IsBooleanString()
  withDeleted?: string;
}
