import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Correo electrónico único del cliente',
    example: 'cliente@example.com',
  })
  @IsEmail(
    {},
    { message: 'El correo electrónico debe tener un formato válido' },
  )
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @IsString({ message: 'El correo electrónico debe ser una cadena de texto' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del cliente (mínimo 8 caracteres)',
    example: 'CustomerPass123!',
    minLength: 8,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Ana',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @ApiProperty({
    description: 'Apellido del cliente',
    example: 'Pérez',
  })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  lastname: string;

  @ApiProperty({
    description: 'País de residencia',
    example: 'El Salvador',
  })
  @IsString({ message: 'El país debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El país es requerido' })
  country: string;

  @ApiProperty({
    description: 'Dirección personal o de entrega del cliente',
    example: 'Colonia Escalón, Calle El Mirador #123, San Salvador',
  })
  @IsString({ message: 'La dirección personal debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección personal es requerida' })
  personal_address: string;
}
