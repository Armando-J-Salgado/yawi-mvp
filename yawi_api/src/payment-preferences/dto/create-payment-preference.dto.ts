import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsObject,
} from 'class-validator';

export class CreatePaymentPreferenceDto {
  @ApiProperty({
    description: 'Nombre descriptivo de la preferencia de pago',
    example: 'Transferencia Banco Agrícola',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la preferencia de pago es requerido' })
  name: string;

  @ApiProperty({
    description:
      'Información de la cuenta en formato JSON (opcional, puede ser null)',
    example: {
      bank: 'Banco Agrícola',
      account_number: '1234567890',
      type: 'Ahorro',
    },
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsObject({ message: 'account_information debe ser un objeto JSON válido' })
  account_information?: Record<string, any> | null;

  @ApiProperty({
    description: 'UUID del Vendor propietario',
    example: 'd3b07384-d113-4089-a292-1262d088a2a8',
  })
  @IsUUID('4', { message: 'El owner_id debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El owner_id es requerido' })
  owner_id: string;
}
