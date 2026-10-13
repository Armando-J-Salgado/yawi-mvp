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
import { CustomersModule } from '../src/customers/customers.module';
import { OrdersModule } from '../src/orders/orders.module';
import { Vendor } from '../src/vendors/entities/vendor.entity';
import { PhoneNumber } from '../src/phone-numbers/entities/phone-number.entity';
import { Business } from '../src/businesses/entities/business.entity';
import { PaymentPreference } from '../src/payment-preferences/entities/payment-preference.entity';
import { Product } from '../src/products/entities/product.entity';
import { Customer } from '../src/customers/entities/customer.entity';
import { Order } from '../src/orders/entities/order.entity';
import { OrderProduct } from '../src/orders/entities/order-product.entity';

describe('Orders Management (e2e)', () => {
  let app: INestApplication;
  let customerId: string;
  let vendorId: string;
  let business1Id: string;
  let business2Id: string;
  let product1Id: string;
  let product2Id: string;
  let product3Id: string;
  let createdOrderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [
            Vendor,
            PhoneNumber,
            Business,
            PaymentPreference,
            Product,
            Customer,
            Order,
            OrderProduct,
          ],
          synchronize: true,
        }),
        VendorsModule,
        PhoneNumbersModule,
        BusinessesModule,
        PaymentPreferencesModule,
        ProductsModule,
        CustomersModule,
        OrdersModule,
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

  // --- Setup ---
  it('1. Setup: Crear Customer, Vendor, Businesses y Products de prueba', async () => {
    // Crear Customer
    const customerRes = await request(app.getHttpServer())
      .post('/customers')
      .send({
        email: 'order-test@example.com',
        password: 'TestPassword123!',
        name: 'Ana',
        lastname: 'Pérez',
        country: 'El Salvador',
        personal_address: 'Colonia Escalón, San Salvador',
      })
      .expect(201);
    customerId = customerRes.body.id;

    // Crear Vendor
    const vendorRes = await request(app.getHttpServer())
      .post('/vendors')
      .send({
        username: 'vendor_e2e_orders',
        password: 'SecurePass123!',
        name: 'Carlos',
        surname: 'Martínez',
        birthdate: '1990-01-01',
        country: 'El Salvador',
        personal_address: 'San Salvador #123',
        DUI: '12345678-9',
        NIT: '0614-010190-101-1',
        phone_number: '+503 7777-8888',
      })
      .expect(201);
    vendorId = vendorRes.body.id;

    // Crear Business 1
    const biz1Res = await request(app.getHttpServer())
      .post('/businesses')
      .send({
        name: 'Café Don Carlos',
        description: 'Cafetería artesanal',
        address: 'Calle La Reforma #78',
        owner_id: vendorId,
      })
      .expect(201);
    business1Id = biz1Res.body.id;

    // Crear Business 2
    const biz2Res = await request(app.getHttpServer())
      .post('/businesses')
      .send({
        name: 'Florería María',
        description: 'Arreglos florales',
        address: 'Metrocentro, Local B-12',
        owner_id: vendorId,
      })
      .expect(201);
    business2Id = biz2Res.body.id;

    // Crear Products
    const p1Res = await request(app.getHttpServer())
      .post('/products')
      .send({
        business_id: business1Id,
        name: 'Café Pacamara 500g',
        price: 12.0,
      })
      .expect(201);
    product1Id = p1Res.body.id;

    const p2Res = await request(app.getHttpServer())
      .post('/products')
      .send({
        business_id: business1Id,
        name: 'Café Bourbon 500g',
        price: 14.5,
      })
      .expect(201);
    product2Id = p2Res.body.id;

    const p3Res = await request(app.getHttpServer())
      .post('/products')
      .send({
        business_id: business2Id,
        name: 'Ramo de Rosas x12',
        price: 25.0,
      })
      .expect(201);
    product3Id = p3Res.body.id;

    expect(customerId).toBeDefined();
    expect(product1Id).toBeDefined();
    expect(product2Id).toBeDefined();
    expect(product3Id).toBeDefined();
  });

  // --- Crear Order válida ---
  it('2. Debe crear una Order válida', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .send({
        customer_id: customerId,
        delivery_address: 'Colonia Escalón, San Salvador',
        items: [
          { product_id: product1Id, quantity: 2 },
          { product_id: product3Id, quantity: 1 },
        ],
      })
      .expect(201);

    createdOrderId = res.body.id;
    expect(res.body.status).toBe('pending');
    expect(Number(res.body.subtotal)).toBe(49.0); // 12*2 + 25*1
    expect(Number(res.body.shipping_fee)).toBe(10.0);
    expect(Number(res.body.total)).toBe(59.0);
    expect(res.body.items).toHaveLength(2);
  });

  // --- Consultar Order con sus líneas ---
  it('3. Debe consultar la Order con sus líneas', async () => {
    const res = await request(app.getHttpServer())
      .get(`/orders/${createdOrderId}`)
      .expect(200);

    expect(res.body.id).toBe(createdOrderId);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.items[0].product_name).toBeDefined();
    expect(res.body.items[0].unit_price).toBeDefined();
  });

  // --- Listar por Customer ---
  it('4. Debe listar Orders por Customer', async () => {
    const res = await request(app.getHttpServer())
      .get(`/orders?customer_id=${customerId}`)
      .expect(200);

    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].customer_id).toBe(customerId);
  });

  // --- Consultar por Business ---
  it('5. GET /orders/business/:businessId debe devolver solo líneas del Business', async () => {
    const res = await request(app.getHttpServer())
      .get(`/orders/business/${business1Id}`)
      .expect(200);

    expect(res.body.length).toBeGreaterThanOrEqual(1);
    for (const order of res.body) {
      for (const item of order.items) {
        expect(item.business_id).toBe(business1Id);
      }
    }
  });

  // --- Transiciones de estado ---
  it('6. Debe cambiar pending -> confirmed', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/orders/${createdOrderId}/status`)
      .send({ status: 'confirmed' })
      .expect(200);

    expect(res.body.status).toBe('confirmed');
  });

  it('7. Debe cambiar confirmed -> preparing', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/orders/${createdOrderId}/status`)
      .send({ status: 'preparing' })
      .expect(200);

    expect(res.body.status).toBe('preparing');
  });

  it('8. Debe cambiar preparing -> delivered', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/orders/${createdOrderId}/status`)
      .send({ status: 'delivered' })
      .expect(200);

    expect(res.body.status).toBe('delivered');
  });

  it('9. Debe rechazar transición inválida delivered -> pending', async () => {
    await request(app.getHttpServer())
      .patch(`/orders/${createdOrderId}/status`)
      .send({ status: 'pending' })
      .expect(400);
  });

  // --- Multi-business en una Order ---
  it('10. Debe confirmar que una Order puede incluir Products de varios Businesses', async () => {
    const res = await request(app.getHttpServer())
      .get(`/orders/${createdOrderId}`)
      .expect(200);

    const businessIds = res.body.items.map((i: any) => i.business_id);
    const uniqueBusinessIds = [...new Set(businessIds)];
    expect(uniqueBusinessIds.length).toBeGreaterThan(1);
  });

  // --- Rechazar cantidad cero o negativa ---
  it('11. Debe rechazar cantidad cero', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({
        customer_id: customerId,
        delivery_address: 'Dirección',
        items: [{ product_id: product1Id, quantity: 0 }],
      })
      .expect(400);
  });

  // --- Rechazar campos no permitidos ---
  it('12. Debe rechazar payload que intenta enviar business_id en items', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({
        customer_id: customerId,
        delivery_address: 'Dirección',
        items: [
          {
            product_id: product1Id,
            quantity: 1,
            business_id: business1Id,
          },
        ],
      })
      .expect(400);
  });

  // --- Soft Delete ---
  it('13. Debe hacer soft delete de una Order', async () => {
    // Crear una nueva order para soft delete
    const createRes = await request(app.getHttpServer())
      .post('/orders')
      .send({
        customer_id: customerId,
        delivery_address: 'Dirección para borrar',
        items: [{ product_id: product2Id, quantity: 1 }],
      })
      .expect(201);

    const deleteOrderId = createRes.body.id;

    await request(app.getHttpServer())
      .delete(`/orders/${deleteOrderId}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/orders/${deleteOrderId}`)
      .expect(404);
  });

  // --- Recover ---
  it('14. Debe recuperar una Order eliminada lógicamente', async () => {
    // Crear y eliminar
    const createRes = await request(app.getHttpServer())
      .post('/orders')
      .send({
        customer_id: customerId,
        delivery_address: 'Dirección para recuperar',
        items: [{ product_id: product2Id, quantity: 1 }],
      })
      .expect(201);

    const recoverOrderId = createRes.body.id;

    await request(app.getHttpServer())
      .delete(`/orders/${recoverOrderId}`)
      .expect(204);

    const recoverRes = await request(app.getHttpServer())
      .patch(`/orders/${recoverOrderId}/recover`)
      .expect(200);

    expect(recoverRes.body.id).toBe(recoverOrderId);
    expect(recoverRes.body.deletedAt).toBeNull();
  });

  // --- Snapshot inmutable ---
  it('15. Debe confirmar que el total no cambia si Product cambia de precio', async () => {
    // Crear order con precio original
    const orderRes = await request(app.getHttpServer())
      .post('/orders')
      .send({
        customer_id: customerId,
        delivery_address: 'Dirección snapshot test',
        items: [{ product_id: product1Id, quantity: 1 }],
      })
      .expect(201);

    const originalTotal = Number(orderRes.body.total);
    const originalUnitPrice = Number(orderRes.body.items[0].unit_price);

    // Cambiar el precio del producto
    await request(app.getHttpServer())
      .patch(`/products/${product1Id}`)
      .send({ price: 99.99 })
      .expect(200);

    // Verificar que la order conserva el precio original
    const checkRes = await request(app.getHttpServer())
      .get(`/orders/${orderRes.body.id}`)
      .expect(200);

    expect(Number(checkRes.body.total)).toBe(originalTotal);
    expect(Number(checkRes.body.items[0].unit_price)).toBe(originalUnitPrice);
  });
});
