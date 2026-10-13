import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsNumber,
  Min,
  IsArray,
  IsObject,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    description: 'UUID v4 del Business al que pertenece el producto',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID('4', { message: 'El business_id debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El business_id es requerido' })
  business_id: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Café molido artesanal',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del producto es requerido' })
  name: string;

  @ApiProperty({
    description: 'Arreglo de etiquetas o categorías del producto',
    example: ['café', 'artesanal', 'orgánico'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return parsed;
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsArray({ message: 'Los tags deben ser un arreglo' })
  @IsString({ each: true, message: 'Cada tag debe ser una cadena de texto' })
  tags?: string[];

  @ApiProperty({
    description: 'Objeto de propiedades clave-valor adicionales del producto',
    example: { weight: '500g', origin: 'El Salvador', roast: 'medium' },
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return parsed;
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsObject({ message: 'Las propiedades deben ser un objeto JSON válido' })
  properties?: Record<string, any>;

  @ApiProperty({
    description: 'Precio decimal no negativo del producto en USD',
    example: 8.5,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'El precio debe ser un número válido' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price: number;
}
