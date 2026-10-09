import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CustomersModule } from '../src/customers/customers.module';
import { Customer } from '../src/customers/entities/customer.entity';

describe('Customer Module (e2e)', () => {
  let app: INestApplication;
  let createdCustomerId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Customer],
          synchronize: true,
        }),
        CustomersModule,
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. POST /customers — Crea un Customer válido (201)', async () => {
    const response = await request(app.getHttpServer())
      .post('/customers')
      .send({
        email: 'ana.perez@example.com',
        password: 'CustomerPass123!',
        name: 'Ana',
        lastname: 'Pérez',
        country: 'El Salvador',
        personal_address: 'Colonia Escalón #123, San Salvador',
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBeDefined();
    expect(response.body.email).toBe('ana.perez@example.com');
    expect(response.body.name).toBe('Ana');
    expect(response.body.lastname).toBe('Pérez');
    expect(response.body.country).toBe('El Salvador');
    expect(response.body.personal_address).toBe(
      'Colonia Escalón #123, San Salvador',
    );
    expect(response.body.password).toBeUndefined();

    createdCustomerId = response.body.id;
  });

  it('2. POST /customers — Falla al intentar registrar email duplicado (409)', async () => {
    await request(app.getHttpServer())
      .post('/customers')
      .send({
        email: 'ANA.PEREZ@EXAMPLE.COM',
        password: 'OtherPassword123!',
        name: 'Ana Duplicada',
        lastname: 'Pérez',
        country: 'El Salvador',
        personal_address: 'Otra Dirección',
      })
      .expect(409);
  });

  it('3. POST /customers — Falla con body incompleto o password corta (400)', async () => {
    await request(app.getHttpServer())
      .post('/customers')
      .send({
        email: 'invalido@example.com',
        password: '123', // menos de 8 caracteres
        name: 'Invalido',
      })
      .expect(400);
  });

  it('4. GET /customers/:id — Obtiene un Customer por ID sin exponer password (200)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/customers/${createdCustomerId}`)
      .expect(200);

    expect(response.body.id).toBe(createdCustomerId);
    expect(response.body.email).toBe('ana.perez@example.com');
    expect(response.body.password).toBeUndefined();
  });

  it('5. GET /customers — Lista los Customers registrados (200)', async () => {
    const response = await request(app.getHttpServer())
      .get('/customers')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    const found = response.body.find((c: any) => c.id === createdCustomerId);
    expect(found).toBeDefined();
    expect(found.password).toBeUndefined();
  });

  it('6. GET /customers?country=El%20Salvador — Filtra por país (200)', async () => {
    const response = await request(app.getHttpServer())
      .get('/customers?country=El%20Salvador')
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(
      response.body.every((c: any) => c.country === 'El Salvador'),
    ).toBe(true);
  });

  it('7. PATCH /customers/:id — Actualiza parcialmente el nombre (200)', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/customers/${createdCustomerId}`)
      .send({
        name: 'Ana María',
      })
      .expect(200);

    expect(response.body.name).toBe('Ana María');
    expect(response.body.lastname).toBe('Pérez');
    expect(response.body.password).toBeUndefined();
  });

  it('8. DELETE /customers/:id — Soft delete del Customer (204)', async () => {
    await request(app.getHttpServer())
      .delete(`/customers/${createdCustomerId}`)
      .expect(204);
  });

  it('9. GET /customers — No aparece en el listado normal tras ser eliminado (200)', async () => {
    const response = await request(app.getHttpServer())
      .get('/customers')
      .expect(200);

    const found = response.body.find((c: any) => c.id === createdCustomerId);
    expect(found).toBeUndefined();
  });

  it('10. GET /customers?withDeleted=true — Aparece en listado con withDeleted=true (200)', async () => {
    const response = await request(app.getHttpServer())
      .get('/customers?withDeleted=true')
      .expect(200);

    const found = response.body.find((c: any) => c.id === createdCustomerId);
    expect(found).toBeDefined();
    expect(found.deletedAt).not.toBeNull();
  });

  it('11. PATCH /customers/:id/recover — Restaura el Customer eliminado (200)', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/customers/${createdCustomerId}/recover`)
      .expect(200);

    expect(response.body.deletedAt).toBeNull();

    const normalList = await request(app.getHttpServer())
      .get('/customers')
      .expect(200);

    const found = normalList.body.find((c: any) => c.id === createdCustomerId);
    expect(found).toBeDefined();
  });
});
