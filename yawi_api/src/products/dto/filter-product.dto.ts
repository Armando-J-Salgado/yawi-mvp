import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsBooleanString,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FilterProductDto {
  @ApiProperty({
    description: 'Filtrar por UUID del Business',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El business_id debe ser un UUID v4 válido' })
  business_id?: string;

  @ApiProperty({
    description: 'Filtrar por nombre del producto',
    example: 'Café molido artesanal',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string;

  @ApiProperty({
    description: 'Filtrar por precio exacto',
    example: 8.5,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El precio debe ser un número válido' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price?: number;

  @ApiProperty({
    description: 'Incluir registros eliminados lógicamente (soft delete)',
    example: 'true',
    required: false,
  })
  @IsOptional()
  @IsBooleanString({
    message: 'withDeleted debe ser un valor booleano en string (true o false)',
  })
  withDeleted?: string;
}
