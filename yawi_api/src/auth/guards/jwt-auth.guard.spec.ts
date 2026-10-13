import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { AuthenticatedUser } from '../interfaces/jwt-payload.interface';

describe('JwtAuthGuard and JwtStrategy', () => {
  let guard: JwtAuthGuard;
  let strategy: JwtStrategy;

  const mockUser: AuthenticatedUser = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    userType: 'customer',
    email: 'ana.perez@example.com',
    name: 'Ana',
    lastname: 'Pérez',
  };

  const createMockContext = (
    authHeader?: string,
  ): { context: ExecutionContext; req: any } => {
    const req: any = {
      headers: authHeader ? { authorization: authHeader } : {},
    };
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => ({}),
        getNext: () => ({}),
      }),
    } as any;
    return { context, req };
  };

  beforeEach(() => {
    strategy = {
      validateToken: jest.fn(),
    } as any;
    guard = new JwtAuthGuard(strategy);
  });

  it('debe permitir acceso y adjuntar request.user cuando el header Bearer es válido', async () => {
    (strategy.validateToken as jest.Mock).mockResolvedValue(mockUser);
    const { context, req } = createMockContext('Bearer valid.jwt.token');

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(strategy.validateToken).toHaveBeenCalledWith('valid.jwt.token');
    expect(req.user).toEqual(mockUser);
  });

  it('debe rechazar con UnauthorizedException si no se envía header Authorization', async () => {
    const { context } = createMockContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token de autorización ausente'),
    );
  });

  it('debe rechazar con UnauthorizedException si el esquema no es Bearer', async () => {
    const { context } = createMockContext('Basic dXNlcjpwYXNz');

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('debe rechazar con UnauthorizedException si el token está vacío tras el esquema', async () => {
    const { context } = createMockContext('Bearer ');

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('debe propagar UnauthorizedException si el token es inválido, expirado o el usuario fue eliminado', async () => {
    (strategy.validateToken as jest.Mock).mockRejectedValue(
      new UnauthorizedException('Token inválido o expirado'),
    );
    const { context } = createMockContext('Bearer invalid.jwt.token');

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token inválido o expirado'),
    );
  });
});
