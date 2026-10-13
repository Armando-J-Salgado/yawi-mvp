import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateBusinessDto {
  @ApiProperty({
    description: 'Nombre del negocio',
    example: 'Tienda El Buen Precio',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del negocio es requerido' })
  name: string;

  @ApiProperty({
    description: 'Descripción del negocio',
    example: 'Tienda de artículos para el hogar con envío a domicilio.',
  })
  @IsString()
  @IsNotEmpty({ message: 'La descripción del negocio es requerida' })
  description: string;

  @ApiProperty({
    description: 'Dirección física del negocio',
    example: 'Av. Independencia #456, Centro Histórico, San Salvador',
  })
  @IsString()
  @IsNotEmpty({ message: 'La dirección del negocio es requerida' })
  address: string;

  @ApiProperty({
    description: 'Balance inicial del negocio en USD (mínimo 0)',
    example: 0.0,
    default: 0.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El balance debe ser un número' })
  @Min(0, { message: 'El balance no puede ser negativo' })
  balance?: number;

  @ApiProperty({
    description: 'UUID del Vendor propietario',
    example: 'd3b07384-d113-4089-a292-1262d088a2a8',
  })
  @IsUUID('4', { message: 'El owner_id debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El owner_id es requerido' })
  owner_id: string;
}
