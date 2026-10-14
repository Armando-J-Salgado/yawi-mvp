import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard, RequestWithUser } from './jwt-auth.guard';

@Injectable()
export class VendorAuthGuard implements CanActivate {
  constructor(private readonly jwtAuthGuard: JwtAuthGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.jwtAuthGuard.canActivate(context);
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (request.user.userType !== 'vendor') {
      throw new UnauthorizedException('Tipo de usuario inválido');
    }
    return true;
  }
}
