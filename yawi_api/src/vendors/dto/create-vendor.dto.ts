import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateVendorDto {
  @ApiProperty({
    description: 'Nombre de usuario único para inicio de sesión',
    example: 'jperez',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es requerido' })
  username: string;

  @ApiProperty({
    description: 'Contraseña en texto plano (mínimo 8 caracteres)',
    example: 'SecureVendorPass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiProperty({
    description: 'Primer nombre',
    example: 'Juan',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @ApiProperty({
    description: 'Primer apellido',
    example: 'Pérez',
  })
  @IsString()
  @IsNotEmpty({ message: 'El primer apellido es requerido' })
  surname: string;

  @ApiProperty({
    description: 'Segundo nombre (opcional)',
    example: 'Carlos',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastname?: string;

  @ApiProperty({
    description: 'Segundo apellido (opcional)',
    example: 'López',
    required: false,
  })
  @IsOptional()
  @IsString()
  second_lastname?: string;

  @ApiProperty({
    description: 'Fecha de nacimiento (formato ISO 8601 YYYY-MM-DD)',
    example: '1990-05-15',
  })
  @IsDateString(
    {},
    {
      message:
        'La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD)',
    },
  )
  birthdate: string;

  @ApiProperty({
    description: 'País de residencia',
    example: 'El Salvador',
  })
  @IsString()
  @IsNotEmpty({ message: 'El país es requerido' })
  country: string;

  @ApiProperty({
    description: 'Dirección residencial',
    example: 'Colonia Escalón, Calle El Mirador #123',
  })
  @IsString()
  @IsNotEmpty({ message: 'La dirección es requerida' })
  personal_address: string;

  @ApiProperty({
    description: 'Documento Único de Identidad (DUI)',
    example: '01234567-8',
  })
  @IsString()
  @IsNotEmpty({ message: 'El DUI es requerido' })
  DUI: string;

  @ApiProperty({
    description: 'Número de Identificación Tributaria (NIT)',
    example: '0614-150590-101-0',
  })
  @IsString()
  @IsNotEmpty({ message: 'El NIT es requerido' })
  NIT: string;

  @ApiProperty({
    description:
      'Número de teléfono principal para asociar inmediatamente al crear el vendor',
    example: '+503 7777-8888',
  })
  @IsString()
  @IsNotEmpty({ message: 'El número de teléfono es requerido' })
  phone_number: string;
}
