import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthModule } from '../src/auth/auth.module';
import { Customer } from '../src/customers/entities/customer.entity';

describe('Auth Module (e2e)', () => {
  let app: INestApplication;
  let customerRepository: Repository<Customer>;
  let jwtService: JwtService;
  let testCustomer: Customer;
  let validToken: string;
  const rawPassword = 'CustomerPass123!';

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_e2e_super_secret_jwt_key_123456';
    process.env.JWT_EXPIRES_IN = '1d';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              JWT_SECRET: 'test_e2e_super_secret_jwt_key_123456',
              JWT_EXPIRES_IN: '1d',
            }),
          ],
        }),
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Customer],
          synchronize: true,
        }),
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    customerRepository = moduleFixture.get<Repository<Customer>>(
      getRepositoryToken(Customer),
    );
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Crear un Customer inicial en la base de datos de pruebas
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    testCustomer = customerRepository.create({
      email: 'ana.perez@example.com',
      password: hashedPassword,
      name: 'Ana',
      lastname: 'Pérez',
      country: 'El Salvador',
      personal_address: 'Colonia Escalón #123, San Salvador',
    });
    testCustomer = await customerRepository.save(testCustomer);
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. POST /auth/login — Login exitoso con credenciales válidas y email normalizado (200)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: '  ANA.PEREZ@EXAMPLE.COM  ',
        password: rawPassword,
      })
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.access_token).toBeDefined();
    expect(response.body.token_type).toBe('Bearer');
    expect(response.body.expires_in).toBe('1d');
    expect(response.body.user).toBeDefined();
    expect(response.body.user.id).toBe(testCustomer.id);
    expect(response.body.user.email).toBe('ana.perez@example.com');
    expect(response.body.user.userType).toBe('customer');
    expect(response.body.user.name).toBe('Ana');
    expect(response.body.user.lastname).toBe('Pérez');

    // Seguridad: jamás exponer contraseñas
    expect(response.body.password).toBeUndefined();
    expect(response.body.user.password).toBeUndefined();

    validToken = response.body.access_token;
  });

  it('2. GET /auth/me — Obtiene datos del usuario autenticado usando Bearer Token (200)', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body).toEqual({
      id: testCustomer.id,
      userType: 'customer',
      email: 'ana.perez@example.com',
      name: 'Ana',
      lastname: 'Pérez',
    });
    expect(response.body.password).toBeUndefined();
  });

  it('3. POST /auth/login — Falla con contraseña incorrecta (401)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'ana.perez@example.com',
        password: 'IncorrectPassword999!',
      })
      .expect(401);

    expect(response.body.message).toBe('Credenciales inválidas');
  });

  it('4. POST /auth/login — Falla con correo inexistente con el mismo mensaje genérico (401)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'no.existe@example.com',
        password: rawPassword,
      })
      .expect(401);

    expect(response.body.message).toBe('Credenciales inválidas');
  });

  it('5. POST /auth/login — Falla con DTO inválido o incompleto (400)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'correo-invalido',
      })
      .expect(400);
  });

  it('6. GET /auth/me — Falla si no se provee header Authorization (401)', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('7. GET /auth/me — Falla con esquema no Bearer (401)', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Basic ${validToken}`)
      .expect(401);
  });

  it('8. GET /auth/me — Falla con token alterado o inválido (401)', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer token_invalido_alterado')
      .expect(401);
  });

  it('9. GET /auth/me — Falla con token firmado con otro secreto (401)', async () => {
    const fakeToken = jwtService.sign(
      { sub: testCustomer.id, userType: 'customer', email: testCustomer.email },
      { secret: 'otro_secreto_no_autorizado' },
    );

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${fakeToken}`)
      .expect(401);
  });

  it('10. GET /auth/me — Falla con token expirado (401)', async () => {
    const expiredToken = jwtService.sign(
      { sub: testCustomer.id, userType: 'customer', email: testCustomer.email },
      { expiresIn: '-1s' },
    );

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('11. Soft delete del Customer y verificación de que su token deja de ser válido (401)', async () => {
    // Aplicar soft delete
    await customerRepository.softDelete(testCustomer.id);

    // Intentar login tras soft delete debe dar 401
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'ana.perez@example.com',
        password: rawPassword,
      })
      .expect(401);

    // Intentar /auth/me con el token previo debe dar 401
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(401);
  });
});
