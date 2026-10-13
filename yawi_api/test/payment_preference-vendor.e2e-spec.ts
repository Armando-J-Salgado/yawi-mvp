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

describe('PaymentPreference - Vendor Integration (e2e)', () => {
  let app: INestApplication;
  let createdVendorId: string;
  let firstPrefId: string;
  let secondPrefId: string;

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
        username: 'pref_owner_vendor',
        password: 'Password123!',
        name: 'Elena',
        surname: 'Rivas',
        birthdate: '1993-07-20',
        country: 'El Salvador',
        personal_address: 'Santa Tecla #89',
        DUI: '02233445-6',
        NIT: '0614-200793-101-3',
        phone_number: '+503 7222-3333',
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBeDefined();
    createdVendorId = response.body.id;
  });

  it('2. POST /payment-preferences — Crea una preferencia con account_information JSON (201)', async () => {
    const response = await request(app.getHttpServer())
      .post('/payment-preferences')
      .send({
        name: 'Transferencia Banco Agrícola',
        account_information: {
          bank: 'Banco Agrícola',
          account_number: '1234567890',
          type: 'Ahorro',
        },
        owner_id: createdVendorId,
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Transferencia Banco Agrícola');
    expect(response.body.account_information).toEqual({
      bank: 'Banco Agrícola',
      account_number: '1234567890',
      type: 'Ahorro',
    });
    expect(response.body.owner_id).toBe(createdVendorId);
    expect(response.body.owner).toBeDefined();
    expect(response.body.owner.id).toBe(createdVendorId);

    firstPrefId = response.body.id;
  });

  it('3. POST /payment-preferences — Crea una preferencia con account_information null (201)', async () => {
    const response = await request(app.getHttpServer())
      .post('/payment-preferences')
      .send({
        name: 'Depósito en efectivo',
        account_information: null,
        owner_id: createdVendorId,
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Depósito en efectivo');
    expect(response.body.account_information).toBeNull();
    expect(response.body.owner_id).toBe(createdVendorId);

    secondPrefId = response.body.id;
  });

  it('4. GET /payment-preferences — Lista preferencias con relación owner (200)', async () => {
    const response = await request(app.getHttpServer())
      .get('/payment-preferences')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);

    const pref1 = response.body.find((p: any) => p.id === firstPrefId);
    expect(pref1).toBeDefined();
    expect(pref1.owner).toBeDefined();
    expect(pref1.owner.id).toBe(createdVendorId);
  });

  it('5. GET /payment-preferences?owner_id=<vendor_id> — Filtra por owner_id (200)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/payment-preferences?owner_id=${createdVendorId}`)
      .expect(200);

    expect(response.body.length).toBe(2);
    expect(
      response.body.every((p: any) => p.owner_id === createdVendorId),
    ).toBe(true);
  });

  it('6. GET /payment-preferences/:id — Obtiene detalle por ID (200)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/payment-preferences/${firstPrefId}`)
      .expect(200);

    expect(response.body.id).toBe(firstPrefId);
    expect(response.body.name).toBe('Transferencia Banco Agrícola');
    expect(response.body.account_information).toEqual({
      bank: 'Banco Agrícola',
      account_number: '1234567890',
      type: 'Ahorro',
    });
    expect(response.body.owner).toBeDefined();
    expect(response.body.owner.username).toBe('pref_owner_vendor');
  });

  it('7. PATCH /payment-preferences/:id — Actualiza name y account_information (200)', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/payment-preferences/${firstPrefId}`)
      .send({
        name: 'Transferencia Banco Agrícola - Corriente',
        account_information: {
          bank: 'Banco Agrícola',
          account_number: '9876543210',
          type: 'Corriente',
        },
      })
      .expect(200);

    expect(response.body.name).toBe('Transferencia Banco Agrícola - Corriente');
    expect(response.body.account_information).toEqual({
      bank: 'Banco Agrícola',
      account_number: '9876543210',
      type: 'Corriente',
    });
  });

  it('8. DELETE /payment-preferences/:id — Soft delete de la preferencia (204)', async () => {
    await request(app.getHttpServer())
      .delete(`/payment-preferences/${firstPrefId}`)
      .expect(204);
  });

  it('9. GET /payment-preferences — Verifica que la eliminada no aparece en listado normal (200)', async () => {
    const response = await request(app.getHttpServer())
      .get('/payment-preferences')
      .expect(200);

    const found = response.body.find((p: any) => p.id === firstPrefId);
    expect(found).toBeUndefined();
  });

  it('10. GET /payment-preferences?withDeleted=true — Verifica que sí aparece con withDeleted=true (200)', async () => {
    const response = await request(app.getHttpServer())
      .get('/payment-preferences?withDeleted=true')
      .expect(200);

    const found = response.body.find((p: any) => p.id === firstPrefId);
    expect(found).toBeDefined();
    expect(found.deletedAt).not.toBeNull();
  });

  it('11. PATCH /payment-preferences/:id/recover — Restaura la preferencia eliminada (200)', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/payment-preferences/${firstPrefId}/recover`)
      .expect(200);

    expect(response.body.deletedAt).toBeNull();

    const normalList = await request(app.getHttpServer())
      .get('/payment-preferences')
      .expect(200);

    const found = normalList.body.find((p: any) => p.id === firstPrefId);
    expect(found).toBeDefined();
  });

  it('12. POST /payment-preferences — Falla al intentar asociar a un owner_id inexistente (404)', async () => {
    await request(app.getHttpServer())
      .post('/payment-preferences')
      .send({
        name: 'Preferencia Fantasma',
        account_information: null,
        owner_id: '00000000-0000-4000-8000-000000000000',
      })
      .expect(404);
  });

  it('13. POST /payment-preferences — Falla con body vacío / inválido (400)', async () => {
    await request(app.getHttpServer())
      .post('/payment-preferences')
      .send({})
      .expect(400);
  });
});
