import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'UUID v4 del Product a comprar',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID('4', { message: 'El product_id debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El product_id es requerido' })
  product_id: string;

  @ApiProperty({
    description: 'Cantidad del producto (entero positivo)',
    example: 2,
  })
  @Type(() => Number)
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  quantity: number;
}
