import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @ApiProperty({
    description: 'UUID v4 del Customer que realiza la compra',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID('4', { message: 'El customer_id debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El customer_id es requerido' })
  customer_id: string;

  @ApiProperty({
    description: 'Dirección de entrega',
    example: 'Colonia Escalón, San Salvador',
  })
  @IsString({ message: 'La dirección de entrega debe ser texto' })
  @IsNotEmpty({ message: 'La dirección de entrega es requerida' })
  delivery_address: string;

  @ApiProperty({
    description: 'Lista de productos a comprar con su cantidad',
    type: [CreateOrderItemDto],
  })
  @IsArray({ message: 'Los items deben ser un arreglo' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un item' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
