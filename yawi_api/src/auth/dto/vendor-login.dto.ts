import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class VendorLoginDto {
  @ApiProperty({
    description: 'Username o DUI del Vendor',
    example: 'jperez',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'El username o DUI debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El username o DUI es obligatorio' })
  identifier: string;

  @ApiProperty({
    description: 'Contraseña del Vendor',
    example: 'SecureVendorPass123!',
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}
