import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEnum, IsBooleanString } from 'class-validator';
import { OrderStatus } from '../interfaces/order-status.interface';

export class FilterOrderDto {
  @ApiProperty({
    description: 'Filtrar por UUID del Customer',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El customer_id debe ser un UUID v4 válido' })
  customer_id?: string;

  @ApiProperty({
    description: 'Filtrar por estado de la Order',
    example: 'pending',
    enum: OrderStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus, {
    message: `El estado debe ser uno de: ${Object.values(OrderStatus).join(', ')}`,
  })
  status?: OrderStatus;

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
