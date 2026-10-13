import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { VendorsModule } from '../src/vendors/vendors.module';
import { PhoneNumbersModule } from '../src/phone-numbers/phone-numbers.module';
import { BusinessesModule } from '../src/businesses/businesses.module';
import { PaymentPreferencesModule } from '../src/payment-preferences/payment-preferences.module';
import { ProductsModule } from '../src/products/products.module';
import { Vendor } from '../src/vendors/entities/vendor.entity';
import { PhoneNumber } from '../src/phone-numbers/entities/phone-number.entity';
import { Business } from '../src/businesses/entities/business.entity';
import { PaymentPreference } from '../src/payment-preferences/entities/payment-preference.entity';
import { Product } from '../src/products/entities/product.entity';

describe('Products Management (e2e)', () => {
  let app: INestApplication;
  let createdVendorId: string;
  let createdBusinessId: string;
  let firstProductId: string;
  let secondProductId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Vendor, PhoneNumber, Business, PaymentPreference, Product],
          synchronize: true,
        }),
        VendorsModule,
        PhoneNumbersModule,
        BusinessesModule,
        PaymentPreferencesModule,
        ProductsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Setup previo: Crear Vendor y Business para las pruebas', async () => {
    const vendorRes = await request(app.getHttpServer())
      .post('/vendors')
      .send({
        username: 'product_e2e_vendor',
        password: 'Password123!',
        name: 'Roberto',
        surname: 'Gómez',
        birthdate: '1988-03-15',
        country: 'El Salvador',
        personal_address: 'Colonia San Benito #45',
        DUI: '01122334-9',
        NIT: '0614-150388-101-9',
        phone_number: '+503 7000-2222',
      })
      .expect(201);

    createdVendorId = vendorRes.body.id;

    const businessRes = await request(app.getHttpServer())
      .post('/businesses')
      .send({
        name: 'Cafetería El Grano de Oro',
        description: 'Café de altura salvadoreño.',
        address: 'Calle El Volcán #10, San Salvador',
        balance: 1000.0,
        owner_id: createdVendorId,
      })
      .expect(201);

    createdBusinessId = businessRes.body.id;
  });

  it('2. POST /products — Crear Product con JSON válido (201)', async () => {
    const response = await request(app.getHttpServer())
      .post('/products')
      .send({
        business_id: createdBusinessId,
        name: 'Café Pacamara Especial',
        tags: ['café', 'artesanal', 'especialidad'],
        properties: { origin: 'Apaneca', roast: 'medium' },
        price: 12.5,
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Café Pacamara Especial');
    expect(response.body.business_id).toBe(createdBusinessId);
    expect(response.body.business).toBeDefined();
    expect(response.body.business.id).toBe(createdBusinessId);
    expect(Number(response.body.price)).toBe(12.5);

    firstProductId = response.body.id;
  });

  const VALID_PNG_BUFFER = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64',
  );
  const VALID_JPEG_BUFFER = Buffer.from(
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
    'base64',
  );

  it('3. POST /products — Crear Product con multipart e imagen (201)', async () => {
    const response = await request(app.getHttpServer())
      .post('/products')
      .field('business_id', createdBusinessId)
      .field('name', 'Café Geisha Exclusivo')
      .field('price', '22.00')
      .attach('image', VALID_PNG_BUFFER, {
        filename: 'geisha.png',
        contentType: 'image/png',
      });

    if (response.status !== 201) {
      console.log('DEBUG TEST 3 ERROR:', JSON.stringify(response.body));
    }
    expect(response.status).toBe(201);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Café Geisha Exclusivo');

    const urls =
      typeof response.body.images_urls === 'string'
        ? JSON.parse(response.body.images_urls)
        : response.body.images_urls;
    expect(urls).toHaveLength(1);

    secondProductId = response.body.id;
  });

  it('4. GET /products — Consultar listado general (200)', async () => {
    const response = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });

  it('5. GET /products?business_id=<id> — Filtrar por business_id (200)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/products?business_id=${createdBusinessId}`)
      .expect(200);

    expect(response.body.length).toBe(2);
    expect(
      response.body.every((p: any) => p.business_id === createdBusinessId),
    ).toBe(true);
  });

  it('6. GET /products/:id — Consultar por UUID (200)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/products/${firstProductId}`)
      .expect(200);

    expect(response.body.id).toBe(firstProductId);
    expect(response.body.name).toBe('Café Pacamara Especial');
    expect(response.body.business).toBeDefined();
    expect(response.body.business.id).toBe(createdBusinessId);
  });

  it('7. PATCH /products/:id — Actualizar Product (200)', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/products/${firstProductId}`)
      .send({
        name: 'Café Pacamara Especial Tueste Medio',
        price: 13.75,
      })
      .expect(200);

    expect(response.body.name).toBe('Café Pacamara Especial Tueste Medio');
    expect(Number(response.body.price)).toBe(13.75);
  });

  it('8. POST /products/:id/images — Agregar imágenes hasta cuatro (201)', async () => {
    for (let i = 1; i <= 4; i++) {
      const res = await request(app.getHttpServer())
        .post(`/products/${firstProductId}/images`)
        .attach('image', VALID_JPEG_BUFFER, {
          filename: `photo-${i}.jpg`,
          contentType: 'image/jpeg',
        })
        .expect(201);

      const urls =
        typeof res.body.images_urls === 'string'
          ? JSON.parse(res.body.images_urls)
          : res.body.images_urls;
      expect(urls).toHaveLength(i);
    }
  });

  it('9. POST /products/:id/images — Rechazar la quinta imagen (400)', async () => {
    await request(app.getHttpServer())
      .post(`/products/${firstProductId}/images`)
      .attach('image', VALID_JPEG_BUFFER, {
        filename: 'photo-5.jpg',
        contentType: 'image/jpeg',
      })
      .expect(400);
  });

  it('10. DELETE /products/:id — Soft delete del Product (204)', async () => {
    await request(app.getHttpServer())
      .delete(`/products/${firstProductId}`)
      .expect(204);

    const normalList = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    expect(
      normalList.body.find((p: any) => p.id === firstProductId),
    ).toBeUndefined();
  });

  it('11. PATCH /products/:id/recover — Recuperar Product eliminado (200)', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/products/${firstProductId}/recover`)
      .expect(200);

    expect(response.body.deletedAt).toBeNull();

    const normalList = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    expect(
      normalList.body.find((p: any) => p.id === firstProductId),
    ).toBeDefined();
  });

  it('12. POST /products — Rechazar Business inexistente (404)', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .send({
        business_id: '00000000-0000-4000-8000-000000000000',
        name: 'Producto Sin Negocio',
        price: 10.0,
      })
      .expect(404);
  });

  it('13. POST /products — Rechazar payload inválido e imagen inválida (400)', async () => {
    // Body vacío
    await request(app.getHttpServer()).post('/products').send({}).expect(400);

    // Archivo no imagen (ej. txt)
    const textFile = Buffer.from('archivo de texto');
    await request(app.getHttpServer())
      .post('/products')
      .field('business_id', createdBusinessId)
      .field('name', 'Producto Invalido')
      .field('price', '10.0')
      .attach('image', textFile, {
        filename: 'document.txt',
        contentType: 'text/plain',
      })
      .expect(400);
  });
});
