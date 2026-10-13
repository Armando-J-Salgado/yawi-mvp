import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { RequestWithUser } from './guards/jwt-auth.guard';
import type { AuthenticatedUser } from './interfaces/jwt-payload.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión como Customer',
    description:
      'Autentica a un cliente utilizando su correo electrónico y contraseña. Retorna un JWT de acceso.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Autenticación exitosa. Retorna el token JWT y datos públicos del usuario.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cuerpo de la petición inválido o campos faltantes.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciales inválidas (correo o contraseña incorrectos).',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener datos del usuario autenticado',
    description:
      'Retorna la identidad pública del usuario asociado al token JWT enviado en el header Authorization.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Datos del usuario autenticado obtenidos correctamente.',
    type: AuthUserDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token no provisto, inválido, expirado o usuario inactivo.',
  })
  getMe(@Req() req: RequestWithUser): AuthenticatedUser {
    return req.user;
  }
}
