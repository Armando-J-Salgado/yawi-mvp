import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({
    description: 'Identificador único del usuario (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  id: string;

  @ApiProperty({
    description: 'Tipo de usuario',
    example: 'customer',
  })
  userType: 'customer';

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'cliente@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Ana',
  })
  name: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  lastname: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token de acceso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Tipo de token',
    example: 'Bearer',
  })
  token_type: string;

  @ApiProperty({
    description: 'Tiempo de expiración del token',
    example: '1d',
  })
  expires_in: string;

  @ApiProperty({
    description: 'Información pública del usuario autenticado',
    type: () => AuthUserDto,
  })
  user: AuthUserDto;
}
