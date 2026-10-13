import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { AuthenticatedUser } from '../interfaces/jwt-payload.interface';

export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtStrategy: JwtStrategy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Token de autorización ausente');
    }

    const parts = authHeader.trim().split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException(
        'Formato de token inválido. Esquema requerido: Bearer',
      );
    }

    const token = parts[1];
    if (!token) {
      throw new UnauthorizedException('Token de acceso ausente');
    }

    const user = await this.jwtStrategy.validateToken(token);
    request.user = user;

    return true;
  }
}
