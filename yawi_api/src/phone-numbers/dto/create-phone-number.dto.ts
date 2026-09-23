import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePhoneNumberDto {
  @ApiProperty({
    description: 'Número telefónico en formato estándar o internacional',
    example: '+503 7777-8888',
  })
  @IsString()
  @IsNotEmpty({ message: 'El número telefónico es requerido' })
  number: string;

  @ApiProperty({
    description: 'UUID del Vendor propietario del número',
    example: 'd3b07384-d113-4089-a292-1262d088a2a8',
  })
  @IsUUID('4', { message: 'El owner_id debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El ID del propietario es requerido' })
  owner_id: string;
}
