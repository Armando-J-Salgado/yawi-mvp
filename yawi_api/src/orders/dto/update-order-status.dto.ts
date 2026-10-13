import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../interfaces/order-status.interface';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la Order',
    example: 'confirmed',
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus, {
    message: `El estado debe ser uno de: ${Object.values(OrderStatus).join(', ')}`,
  })
  status: OrderStatus;
}
