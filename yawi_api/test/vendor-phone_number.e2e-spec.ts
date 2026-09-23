import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { VendorsModule } from '../src/vendors/vendors.module';
import { PhoneNumbersModule } from '../src/phone-numbers/phone-numbers.module';
import { Vendor } from '../src/vendors/entities/vendor.entity';
import { PhoneNumber } from '../src/phone-numbers/entities/phone-number.entity';

describe('Vendor - PhoneNumber Integration (e2e)', () => {
  let app: INestApplication;
  let createdVendorId: string;
  let initialPhoneId: string;
  let secondPhoneId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Vendor, PhoneNumber],
          synchronize: true,
        }),
        VendorsModule,
        PhoneNumbersModule,
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

  it('1. POST /vendors — Crea un Vendor con su PhoneNumber inicial en transacción (201)', async () => {
    const response = await request(app.getHttpServer())
      .post('/vendors')
      .send({
        username: 'integration_vendor',
        password: 'Password123!',
        name: 'Carlos',
        surname: 'Martínez',
        lastname: 'Eduardo',
        second_lastname: 'Gómez',
        birthdate: '1990-05-15',
        country: 'El Salvador',
        personal_address: 'Colonia Escalón #123',
        DUI: '01234567-8',
        NIT: '0614-150590-101-0',
        phone_number: '+503 7777-8888',
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBeDefined();
    expect(response.body.username).toBe('integration_vendor');
    expect(response.body.phone_numbers).toHaveLength(1);
    expect(response.body.phone_numbers[0].number).toBe('+503 7777-8888');

    createdVendorId = response.body.id;
    initialPhoneId = response.body.phone_numbers[0].id;
  });

  it('2. GET /vendors — Lista los vendors incluyendo los phone_numbers (200)', async () => {
    const response = await request(app.getHttpServer())
      .get('/vendors')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);

    const vendor = response.body.find((v: any) => v.id === createdVendorId);
    expect(vendor).toBeDefined();
    expect(vendor.phone_numbers).toBeDefined();
    expect(vendor.phone_numbers[0].number).toBe('+503 7777-8888');
  });

  it('3. GET /vendors/:id — Retorna el vendor con sus phone_numbers asociados (200)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/vendors/${createdVendorId}`)
      .expect(200);

    expect(response.body.id).toBe(createdVendorId);
    expect(response.body.phone_numbers).toHaveLength(1);
  });

  it('4. POST /phone-numbers — Agrega un segundo PhoneNumber al vendor (201)', async () => {
    const response = await request(app.getHttpServer())
      .post('/phone-numbers')
      .send({
        number: '+503 2222-3333',
        owner_id: createdVendorId,
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.number).toBe('+503 2222-3333');
    expect(response.body.owner_id).toBe(createdVendorId);

    secondPhoneId = response.body.id;

    // Verificar que el vendor ahora tiene 2 teléfonos
    const vendorResponse = await request(app.getHttpServer())
      .get(`/vendors/${createdVendorId}`)
      .expect(200);

    expect(vendorResponse.body.phone_numbers).toHaveLength(2);
  });

  it('5. DELETE /vendors/:id — Soft delete del Vendor (204)', async () => {
    await request(app.getHttpServer())
      .delete(`/vendors/${createdVendorId}`)
      .expect(204);

    // No debe aparecer en listado normal
    const normalList = await request(app.getHttpServer())
      .get('/vendors')
      .expect(200);
    const found = normalList.body.find((v: any) => v.id === createdVendorId);
    expect(found).toBeUndefined();

    // Sí debe aparecer con withDeleted=true
    const deletedList = await request(app.getHttpServer())
      .get('/vendors?withDeleted=true')
      .expect(200);
    const foundDeleted = deletedList.body.find(
      (v: any) => v.id === createdVendorId,
    );
    expect(foundDeleted).toBeDefined();
    expect(foundDeleted.deletedAt).not.toBeNull();
  });

  it('6. PATCH /vendors/:id/recover — Restaura el Vendor eliminado (200)', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/vendors/${createdVendorId}/recover`)
      .expect(200);

    expect(response.body.deletedAt).toBeNull();

    // Vuelve a aparecer en listado normal
    const normalList = await request(app.getHttpServer())
      .get('/vendors')
      .expect(200);
    const found = normalList.body.find((v: any) => v.id === createdVendorId);
    expect(found).toBeDefined();
  });

  it('7. DELETE /phone-numbers/:id — Soft delete de un PhoneNumber (204)', async () => {
    await request(app.getHttpServer())
      .delete(`/phone-numbers/${secondPhoneId}`)
      .expect(204);

    // No debe aparecer en listado regular
    const normalPhones = await request(app.getHttpServer())
      .get('/phone-numbers')
      .expect(200);
    const found = normalPhones.body.find((p: any) => p.id === secondPhoneId);
    expect(found).toBeUndefined();
  });

  it('8. PATCH /phone-numbers/:id/recover — Restaura el PhoneNumber eliminado (200)', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/phone-numbers/${secondPhoneId}/recover`)
      .expect(200);

    expect(response.body.deletedAt).toBeNull();
  });

  it('9. Transaccionalidad / Rollback: Si falla la creación por duplicado, revierte todo (409)', async () => {
    // Intentar crear con el mismo username / DUI ya registrado
    await request(app.getHttpServer())
      .post('/vendors')
      .send({
        username: 'integration_vendor',
        password: 'Password123!',
        name: 'Duplicate',
        surname: 'User',
        birthdate: '1990-05-15',
        country: 'El Salvador',
        personal_address: 'Calle Falsa 123',
        DUI: '01234567-8',
        NIT: '0614-150590-101-0',
        phone_number: '+503 9999-9999',
      })
      .expect(409);

    // Verificar que el teléfono '+503 9999-9999' no fue guardado
    const phones = await request(app.getHttpServer())
      .get('/phone-numbers?number=%2B503%209999-9999')
      .expect(200);

    expect(phones.body).toHaveLength(0);
  });
});
