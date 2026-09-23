import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { VendorsModule } from '../src/vendors/vendors.module';
import { PhoneNumbersModule } from '../src/phone-numbers/phone-numbers.module';
import { BusinessesModule } from '../src/businesses/businesses.module';
import { PaymentPreferencesModule } from '../src/payment-preferences/payment-preferences.module';
import { Vendor } from '../src/vendors/entities/vendor.entity';
import { PhoneNumber } from '../src/phone-numbers/entities/phone-number.entity';
import { Business } from '../src/businesses/entities/business.entity';
import { PaymentPreference } from '../src/payment-preferences/entities/payment-preference.entity';

describe('Business - Vendor Integration (e2e)', () => {
  let app: INestApplication;
  let createdVendorId: string;
  let firstBusinessId: string;
  let secondBusinessId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Vendor, PhoneNumber, Business, PaymentPreference],
          synchronize: true,
        }),
        VendorsModule,
        PhoneNumbersModule,
        BusinessesModule,
        PaymentPreferencesModule,
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

  it('1. POST /vendors — Crea un Vendor de prueba (201)', async () => {
    const response = await request(app.getHttpServer())
      .post('/vendors')
      .send({
        username: 'business_owner_vendor',
        password: 'Password123!',
        name: 'Roberto',
        surname: 'Gómez',
        birthdate: '1988-03-15',
        country: 'El Salvador',
        personal_address: 'Colonia San Benito #45',
        DUI: '01122334-5',
        NIT: '0614-150388-101-2',
        phone_number: '+503 7000-1111',
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBeDefined();
    createdVendorId = response.body.id;
  });

  it('2. POST /businesses — Crea un business asociado al vendor (201)', async () => {
    const response = await request(app.getHttpServer())
      .post('/businesses')
      .send({
        name: 'Tienda El Buen Precio',
        description: 'Artículos para el hogar con envío a domicilio.',
        address: 'Av. Independencia #456, San Salvador',
        balance: 1500.5,
        owner_id: createdVendorId,
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Tienda El Buen Precio');
    expect(response.body.owner_id).toBe(createdVendorId);
    expect(response.body.owner).toBeDefined();
    expect(response.body.owner.id).toBe(createdVendorId);
    expect(Number(response.body.balance)).toBe(1500.5);

    firstBusinessId = response.body.id;
  });

  it('3. POST /businesses — Crea un segundo business para el mismo vendor (201)', async () => {
    const response = await request(app.getHttpServer())
      .post('/businesses')
      .send({
        name: 'Café Don Carlos',
        description: 'Cafetería artesanal salvadoreña.',
        address: 'Calle La Reforma #78, San Salvador',
        balance: 800.0,
        owner_id: createdVendorId,
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Café Don Carlos');
    expect(response.body.owner_id).toBe(createdVendorId);

    secondBusinessId = response.body.id;
  });

  it('4. GET /businesses — Lista businesses con relación owner (200)', async () => {
    const response = await request(app.getHttpServer())
      .get('/businesses')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);

    const b1 = response.body.find((b: any) => b.id === firstBusinessId);
    expect(b1).toBeDefined();
    expect(b1.owner).toBeDefined();
    expect(b1.owner.id).toBe(createdVendorId);
  });

  it('5. GET /businesses?owner_id=<vendor_id> — Filtra por owner_id (200)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/businesses?owner_id=${createdVendorId}`)
      .expect(200);

    expect(response.body.length).toBe(2);
    expect(
      response.body.every((b: any) => b.owner_id === createdVendorId),
    ).toBe(true);
  });

  it('6. GET /businesses/:id — Obtiene business por ID (200)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/businesses/${firstBusinessId}`)
      .expect(200);

    expect(response.body.id).toBe(firstBusinessId);
    expect(response.body.name).toBe('Tienda El Buen Precio');
    expect(response.body.owner).toBeDefined();
    expect(response.body.owner.username).toBe('business_owner_vendor');
  });

  it('7. PATCH /businesses/:id — Actualiza name y balance (200)', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/businesses/${firstBusinessId}`)
      .send({
        name: 'Tienda El Buen Precio Renovada',
        balance: 2000.75,
      })
      .expect(200);

    expect(response.body.name).toBe('Tienda El Buen Precio Renovada');
    expect(Number(response.body.balance)).toBe(2000.75);
  });

  it('8. DELETE /businesses/:id — Soft delete del business (204)', async () => {
    await request(app.getHttpServer())
      .delete(`/businesses/${firstBusinessId}`)
      .expect(204);
  });

  it('9. GET /businesses — Verifica que el eliminado no aparece en listado normal (200)', async () => {
    const response = await request(app.getHttpServer())
      .get('/businesses')
      .expect(200);

    const found = response.body.find((b: any) => b.id === firstBusinessId);
    expect(found).toBeUndefined();
  });

  it('10. GET /businesses?withDeleted=true — Verifica que sí aparece con withDeleted=true (200)', async () => {
    const response = await request(app.getHttpServer())
      .get('/businesses?withDeleted=true')
      .expect(200);

    const found = response.body.find((b: any) => b.id === firstBusinessId);
    expect(found).toBeDefined();
    expect(found.deletedAt).not.toBeNull();
  });

  it('11. PATCH /businesses/:id/recover — Restaura el business eliminado (200)', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/businesses/${firstBusinessId}/recover`)
      .expect(200);

    expect(response.body.deletedAt).toBeNull();

    const normalList = await request(app.getHttpServer())
      .get('/businesses')
      .expect(200);

    const found = normalList.body.find((b: any) => b.id === firstBusinessId);
    expect(found).toBeDefined();
  });

  it('12. POST /businesses — Falla al intentar asociar a un owner_id inexistente (404)', async () => {
    await request(app.getHttpServer())
      .post('/businesses')
      .send({
        name: 'Negocio Inexistente',
        description: 'Sin vendor',
        address: 'Calle 0',
        owner_id: '00000000-0000-4000-8000-000000000000',
      })
      .expect(404);
  });

  it('13. POST /businesses — Falla con body vacío / inválido (400)', async () => {
    await request(app.getHttpServer()).post('/businesses').send({}).expect(400);
  });
});
