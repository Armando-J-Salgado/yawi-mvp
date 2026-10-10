import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderProduct } from './entities/order-product.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';
import { Business } from '../businesses/entities/business.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { PhoneNumber } from '../phone-numbers/entities/phone-number.entity';
import { PaymentPreference } from '../payment-preferences/entities/payment-preference.entity';
import { OrderStatus } from './interfaces/order-status.interface';

describe('OrdersService (Unit / SQLite in-memory)', () => {
  let service: OrdersService;
  let dataSource: DataSource;
  let sampleCustomer: Customer;
  let sampleVendor: Vendor;
  let sampleBusiness1: Business;
  let sampleBusiness2: Business;
  let sampleProduct1: Product;
  let sampleProduct2: Product;
  let sampleProduct3: Product;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [
            Order,
            OrderProduct,
            Customer,
            Product,
            Business,
            Vendor,
            PhoneNumber,
            PaymentPreference,
          ],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([
          Order,
          OrderProduct,
          Customer,
          Product,
          Business,
        ]),
      ],
      providers: [OrdersService],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Limpiar en orden de dependencias
    await dataSource.getRepository(OrderProduct).clear();
    await dataSource.getRepository(Order).clear();
    await dataSource.getRepository(Product).clear();
    await dataSource.getRepository(Business).clear();
    await dataSource.getRepository(Vendor).clear();
    await dataSource.getRepository(Customer).clear();

    // Crear datos de prueba
    const vendorRepo = dataSource.getRepository(Vendor);
    sampleVendor = await vendorRepo.save(
      vendorRepo.create({
        username: 'vendor_order_test',
        password: 'hashedpassword',
        name: 'Carlos',
        surname: 'Martínez',
        birthdate: new Date('1990-01-01'),
        country: 'El Salvador',
        personal_address: 'San Salvador #123',
        DUI: '12345678-9',
        NIT: '0614-010190-101-1',
      }),
    );

    const customerRepo = dataSource.getRepository(Customer);
    sampleCustomer = await customerRepo.save(
      customerRepo.create({
        email: 'test.order@example.com',
        password: 'hashedpassword',
        name: 'Ana',
        lastname: 'Pérez',
        country: 'El Salvador',
        personal_address: 'Colonia Escalón, San Salvador',
      }),
    );

    const businessRepo = dataSource.getRepository(Business);
    sampleBusiness1 = await businessRepo.save(
      businessRepo.create({
        name: 'Café Don Carlos',
        description: 'Cafetería artesanal',
        address: 'Calle La Reforma #78',
        balance: 800.5,
        owner_id: sampleVendor.id,
      }),
    );

    sampleBusiness2 = await businessRepo.save(
      businessRepo.create({
        name: 'Florería María',
        description: 'Arreglos florales',
        address: 'Metrocentro, Local B-12',
        balance: 1200.0,
        owner_id: sampleVendor.id,
      }),
    );

    const productRepo = dataSource.getRepository(Product);
    sampleProduct1 = await productRepo.save(
      productRepo.create({
        name: 'Café Pacamara 500g',
        price: 12.0,
        tags: ['café'],
        properties: {},
        business_id: sampleBusiness1.id,
      }),
    );

    sampleProduct2 = await productRepo.save(
      productRepo.create({
        name: 'Café Bourbon 500g',
        price: 14.5,
        tags: ['café'],
        properties: {},
        business_id: sampleBusiness1.id,
      }),
    );

    sampleProduct3 = await productRepo.save(
      productRepo.create({
        name: 'Ramo de Rosas x12',
        price: 25.0,
        tags: ['flores'],
        properties: {},
        business_id: sampleBusiness2.id,
      }),
    );
  });

  describe('create()', () => {
    it('1. Debe crear una Order válida con un solo Product', async () => {
      const order = await service.create({
        customer_id: sampleCustomer.id,
        delivery_address: 'Colonia Escalón, San Salvador',
        items: [{ product_id: sampleProduct1.id, quantity: 2 }],
      });

      expect(order).toBeDefined();
      expect(order.id).toBeDefined();
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(Number(order.subtotal)).toBe(24.0);
      expect(Number(order.shipping_fee)).toBe(10.0);
      expect(Number(order.total)).toBe(34.0);
      expect(order.items).toHaveLength(1);
      expect(order.items[0].product_name).toBe('Café Pacamara 500g');
      expect(Number(order.items[0].unit_price)).toBe(12.0);
      expect(order.items[0].quantity).toBe(2);
    });

    it('2. Debe crear una Order con Products de varios Businesses', async () => {
      const order = await service.create({
        customer_id: sampleCustomer.id,
        delivery_address: 'Colonia Escalón, San Salvador',
        items: [
          { product_id: sampleProduct1.id, quantity: 1 },
          { product_id: sampleProduct3.id, quantity: 2 },
        ],
      });

      expect(order.items).toHaveLength(2);
      const businessIds = order.items.map((i) => i.business_id);
      expect(businessIds).toContain(sampleBusiness1.id);
      expect(businessIds).toContain(sampleBusiness2.id);
    });

    it('3. Debe calcular correctamente quantity, unit_price, subtotal, shipping_fee y total', async () => {
      const order = await service.create({
        customer_id: sampleCustomer.id,
        delivery_address: 'Colonia Escalón, San Salvador',
        items: [
          { product_id: sampleProduct1.id, quantity: 2 }, // 12 * 2 = 24
          { product_id: sampleProduct2.id, quantity: 3 }, // 14.5 * 3 = 43.5
        ],
      });

      expect(Number(order.subtotal)).toBe(67.5);
      expect(Number(order.shipping_fee)).toBe(10.0);
      expect(Number(order.total)).toBe(77.5);

      const item1 = order.items.find(
        (i) => i.product_id === sampleProduct1.id,
      )!;
      expect(Number(item1.unit_price)).toBe(12.0);
      expect(item1.quantity).toBe(2);
      expect(Number(item1.subtotal)).toBe(24.0);

      const item2 = order.items.find(
        (i) => i.product_id === sampleProduct2.id,
      )!;
      expect(Number(item2.unit_price)).toBe(14.5);
      expect(item2.quantity).toBe(3);
      expect(Number(item2.subtotal)).toBe(43.5);
    });

    it('4. Debe guardar product_name y unit_price como snapshot', async () => {
      const order = await service.create({
        customer_id: sampleCustomer.id,
        delivery_address: 'Colonia Escalón, San Salvador',
        items: [{ product_id: sampleProduct1.id, quantity: 1 }],
      });

      expect(order.items[0].product_name).toBe('Café Pacamara 500g');
      expect(Number(order.items[0].unit_price)).toBe(12.0);
    });

    it('5. Debe rechazar Customer inexistente', async () => {
      await expect(
        service.create({
          customer_id: '00000000-0000-4000-8000-000000000000',
          delivery_address: 'Dirección',
          items: [{ product_id: sampleProduct1.id, quantity: 1 }],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('6. Debe rechazar Product inexistente', async () => {
      await expect(
        service.create({
          customer_id: sampleCustomer.id,
          delivery_address: 'Dirección',
          items: [
            {
              product_id: '00000000-0000-4000-8000-000000000000',
              quantity: 1,
            },
          ],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('7. Debe rechazar Product eliminado (soft delete)', async () => {
      const productRepo = dataSource.getRepository(Product);
      await productRepo.softDelete(sampleProduct1.id);

      await expect(
        service.create({
          customer_id: sampleCustomer.id,
          delivery_address: 'Dirección',
          items: [{ product_id: sampleProduct1.id, quantity: 1 }],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('8. Debe copiar el business_id correcto a cada OrderProduct', async () => {
      const order = await service.create({
        customer_id: sampleCustomer.id,
        delivery_address: 'Dirección',
        items: [
          { product_id: sampleProduct1.id, quantity: 1 },
          { product_id: sampleProduct3.id, quantity: 1 },
        ],
      });

      const item1 = order.items.find(
        (i) => i.product_id === sampleProduct1.id,
      )!;
      expect(item1.business_id).toBe(sampleBusiness1.id);

      const item3 = order.items.find(
        (i) => i.product_id === sampleProduct3.id,
      )!;
      expect(item3.business_id).toBe(sampleBusiness2.id);
    });

    it('9. Debe rechazar Product duplicado en la misma Order', async () => {
      await expect(
        service.create({
          customer_id: sampleCustomer.id,
          delivery_address: 'Dirección',
          items: [
            { product_id: sampleProduct1.id, quantity: 1 },
            { product_id: sampleProduct1.id, quantity: 2 },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll()', () => {
    it('1. Debe listar Orders por Customer', async () => {
      await service.create({
        customer_id: sampleCustomer.id,
        delivery_address: 'Dirección 1',
        items: [{ product_id: sampleProduct1.id, quantity: 1 }],
      });

      const orders = await service.findAll({
        customer_id: sampleCustomer.id,
      });
      expect(orders).toHaveLength(1);
      expect(orders[0].customer_id).toBe(sampleCustomer.id);
    });

    it('2. Debe filtrar por status', async () => {
      const order = await service.create({
        customer_id: sampleCustomer.id,
        delivery_address: 'Dirección',
        items: [{ product_id: sampleProduct1.id, quantity: 1 }],
      });

      await service.updateStatus(order.id, {
        status: OrderStatus.CONFIRMED,
      });

      const pending = await service.findAll({
        status: OrderStatus.PENDING,
      });
      expect(pending).toHaveLength(0);

      const confirmed = await service.findAll({
        status: OrderStatus.CONFIRMED,
      });
      expect(confirmed).toHaveLength(1);
    });
  });

  describe('findOne()', () => {
    it('1. Debe retornar la Order con sus líneas', async () => {
      const created = await service.create({
        customer_id: sampleCustomer.id,
        delivery_address: 'Dirección',
        items: [
          { product_id: sampleProduct1.id, quantity: 1 },
          { product_id: sampleProduct2.id, quantity: 2 },
        ],
      });

      const found = await service.findOne(created.id);
      expect(found.id).toBe(created.id);
      expect(found.items).toHaveLength(2);
    });

    it('2. Debe lanzar NotFoundException si la Order no existe', async () => {
      await expect(
        service.findOne('00000000-0000-4000-8000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByBusiness()', () => {
    it('1. Debe consultar las líneas filtradas por Business sin exponer líneas ajenas', async () => {
      await service.create({
        customer_id: sampleCustomer.id,
        delivery_address: 'Dirección',
        items: [
          { product_id: sampleProduct1.id, quantity: 1 },
          { product_id: sampleProduct3.id, quantity: 2 },
        ],
      });

      const business1Orders = await service.findByBusiness(sampleBusiness1.id);
      expect(business1Orders).toHaveLength(1);
      expect(business1Orders[0].items).toHaveLength(1);
      expect(business1Orders[0].items[0].business_id).toBe(sampleBusiness1.id);

      const business2Orders = await service.findByBusiness(sampleBusiness2.id);
      expect(business2Orders).toHaveLength(1);
      expect(business2Orders[0].items).toHaveLength(1);
      expect(business2Orders[0].items[0].business_id).toBe(sampleBusiness2.id);
    });
  });

  describe('updateStatus()', () => {
    it('1. Debe actualizar estado válido pending -> confirmed', async () => {
      const order = await service.create({
        customer_id: sampleCustomer.id,
        delivery_address: 'Dirección',
        items: [{ product_id: sampleProduct1.id, quantity: 1 }],
      });

      const updated = await service.updateStatus(order.id, {
        status: OrderStatus.CONFIRMED,
      });
      expect(updated.status).toBe(OrderStatus.CONFIRMED);
    });

    it('2. Debe rechazar transición inválida pending -> delivered', async () => {
      const order = await service.create({
        customer_id: sampleCustomer.id,
        delivery_address: 'Dirección',
        items: [{ product_id: sampleProduct1.id, quantity: 1 }],
      });

      await expect(
        service.updateStatus(order.id, {
          status: OrderStatus.DELIVERED,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('3. No debe cambiar estados finales (delivered)', async () => {
      const order = await service.create({
        customer_id: sampleCustomer.id,
        delivery_address: 'Dirección',
        items: [{ product_id: sampleProduct1.id, quantity: 1 }],
      });

      await service.updateStatus(order.id, {
        status: OrderStatus.CONFIRMED,
      });
      await service.updateStatus(order.id, {
        status: OrderStatus.PREPARING,
      });
      await service.updateStatus(order.id, {
        status: OrderStatus.DELIVERED,
      });

      await expect(
        service.updateStatus(order.id, {
          status: OrderStatus.PENDING,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('4. No debe cambiar estados finales (cancelled)', async () => {
      const order = await service.create({
        customer_id: sampleCustomer.id,
        delivery_address: 'Dirección',
        items: [{ product_id: sampleProduct1.id, quantity: 1 }],
      });

      await service.updateStatus(order.id, {
        status: OrderStatus.CANCELLED,
      });

      await expect(
        service.updateStatus(order.id, {
          status: OrderStatus.PENDING,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove() & recover()', () => {
    it('1. Debe aplicar soft delete y restaurar una Order', async () => {
      const created = await service.create({
        customer_id: sampleCustomer.id,
        delivery_address: 'Dirección',
        items: [{ product_id: sampleProduct1.id, quantity: 1 }],
      });

      await service.remove(created.id);

      await expect(service.findOne(created.id)).rejects.toThrow(
        NotFoundException,
      );

      const recovered = await service.recover(created.id);
      expect(recovered.deletedAt).toBeNull();

      const foundAgain = await service.findOne(created.id);
      expect(foundAgain.id).toBe(created.id);
    });
  });
});
