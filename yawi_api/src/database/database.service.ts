import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Vendor } from '../vendors/entities/vendor.entity';
import { PhoneNumber } from '../phone-numbers/entities/phone-number.entity';
import { Business } from '../businesses/entities/business.entity';
import { Product } from '../products/entities/product.entity';
import { PaymentPreference } from '../payment-preferences/entities/payment-preference.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderProduct } from '../orders/entities/order-product.entity';
import { OrderStatus } from '../orders/interfaces/order-status.interface';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Verifica si la base de datos no contiene registros de vendors ni customers.
   */
  async isDatabaseEmpty(): Promise<boolean> {
    const vendorRepo = this.dataSource.getRepository(Vendor);
    const customerRepo = this.dataSource.getRepository(Customer);
    const [vendorCount, customerCount] = await Promise.all([
      vendorRepo.count({ withDeleted: true }),
      customerRepo.count({ withDeleted: true }),
    ]);
    return vendorCount === 0 && customerCount === 0;
  }

  /**
   * Inserta un conjunto de datos iniciales (seed) de prueba si la base de datos está vacía.
   */
  async seed(): Promise<void> {
    const vendorRepo = this.dataSource.getRepository(Vendor);
    const customerRepo = this.dataSource.getRepository(Customer);
    const [vendorsEmpty, customersEmpty] = await Promise.all([
      vendorRepo.count({ withDeleted: true }).then((count) => count === 0),
      customerRepo.count({ withDeleted: true }).then((count) => count === 0),
    ]);

    if (!vendorsEmpty && !customersEmpty) {
      this.logger.log('Database is not empty. Seeding skipped.');
      return;
    }

    this.logger.log('Seeding initial data into database...');

    const defaultPassword = await bcrypt.hash('SecureVendorPass123!', 10);
    const defaultCustomerPassword = await bcrypt.hash(
      'CustomerSeedPass123!',
      10,
    );

    const initialVendorsData = [
      {
        username: 'carlos_salvador',
        password: defaultPassword,
        name: 'Carlos',
        surname: 'Martínez',
        lastname: 'Eduardo',
        second_lastname: 'Gómez',
        birthdate: new Date('1988-04-12'),
        country: 'El Salvador',
        personal_address: 'Colonia San Benito, Pasaje 3 #45, San Salvador',
        DUI: '02345678-9',
        NIT: '0614-120488-101-5',
        phones: ['+503 7123-4567', '+503 2234-5678'],
      },
      {
        username: 'maria_flores',
        password: defaultPassword,
        name: 'María',
        surname: 'Flores',
        lastname: 'Elena',
        second_lastname: 'Rivas',
        birthdate: new Date('1992-08-25'),
        country: 'El Salvador',
        personal_address:
          'Residencial Santa Teresa, Senda Los Pinos #12, Santa Tecla',
        DUI: '03456789-1',
        NIT: '0511-250892-102-1',
        phones: ['+503 7890-1234'],
      },
      {
        username: 'roberto_hernandez',
        password: defaultPassword,
        name: 'Roberto',
        surname: 'Hernández',
        lastname: 'Antonio',
        second_lastname: 'Cruz',
        birthdate: new Date('1985-11-03'),
        country: 'Guatemala',
        personal_address: 'Zona 10, Avenida Reforma #8-45, Ciudad de Guatemala',
        DUI: '04567890-2',
        NIT: '0101-031185-103-8',
        phones: ['+502 5555-1234', '+502 2333-8899'],
      },
    ];

    await this.dataSource.transaction(async (manager) => {
      const vendorRepo = manager.getRepository(Vendor);
      const phoneRepo = manager.getRepository(PhoneNumber);
      const businessRepo = manager.getRepository(Business);
      const prefRepo = manager.getRepository(PaymentPreference);
      const customerRepo = manager.getRepository(Customer);

      if (vendorsEmpty) {
        for (const item of initialVendorsData) {
          const { phones, ...vendorData } = item;
          const vendor = vendorRepo.create(vendorData);
          const savedVendor = await vendorRepo.save(vendor);

          for (const num of phones) {
            const phone = phoneRepo.create({
              number: num,
              owner_id: savedVendor.id,
            });
            await phoneRepo.save(phone);
          }
        }

        // Obtener los vendors recién creados para asociarles datos
        const allVendors = await vendorRepo.find();

        // Seed de Businesses (2 por los primeros 2 vendors)
        const businessesData = [
          {
            name: 'Tienda El Buen Precio',
            description:
              'Tienda de artículos para el hogar con envío a domicilio.',
            address: 'Av. Independencia #456, Centro Histórico, San Salvador',
            balance: 2500.0,
            owner_id: allVendors[0].id,
          },
          {
            name: 'Café Don Carlos',
            description:
              'Cafetería artesanal con granos de origen salvadoreño.',
            address: 'Colonia San Benito, Calle La Reforma #78, San Salvador',
            balance: 800.5,
            owner_id: allVendors[0].id,
          },
          {
            name: 'Florería María',
            description: 'Arreglos florales y decoración para eventos.',
            address: 'Centro Comercial Metrocentro, Local B-12, Santa Tecla',
            balance: 1200.0,
            owner_id: allVendors[1].id,
          },
        ];

        for (const bData of businessesData) {
          const business = businessRepo.create(bData);
          await businessRepo.save(business);
        }

        const createdBusinesses = await businessRepo.find();

        // Seed de Products (existentes + 12 adicionales cubriendo las 6 categorías)
        const productsData = [
          {
            name: 'Juego de Sábanas King Size',
            price: 45.0,
            tags: ['textiles-tejidos', 'hogar', 'dormitorio'],
            images_urls: ['/images/textiles.webp'],
            properties: {
              material: '100% algodón',
              thread_count: 300,
              color: 'azul marino',
            },
            business_id: createdBusinesses[0].id,
          },
          {
            name: 'Lámpara de Mesa LED',
            price: 22.5,
            tags: ['maderas', 'hogar', 'iluminación'],
            images_urls: ['/images/maderas.webp'],
            properties: {
              power: '12W',
              color_temp: '3000K',
              dimmable: true,
            },
            business_id: createdBusinesses[0].id,
          },
          {
            name: 'Café Pacamara Especial 500g',
            price: 12.0,
            tags: ['café', 'artesanal', 'especialidad'],
            images_urls: ['/images/accesorios.webp'],
            properties: {
              origin: 'Apaneca, El Salvador',
              roast: 'medio',
              process: 'lavado',
            },
            business_id: createdBusinesses[1].id,
          },
          {
            name: 'Café Bourbon Miel 500g',
            price: 14.5,
            tags: ['café', 'artesanal', 'gourmet'],
            images_urls: ['/images/accesorios.webp'],
            properties: {
              origin: 'Santa Ana, El Salvador',
              roast: 'claro',
              process: 'honey',
            },
            business_id: createdBusinesses[1].id,
          },
          {
            name: 'Ramo de Rosas Rojas x12',
            price: 25.0,
            tags: ['flores', 'rosas', 'regalos'],
            images_urls: ['/images/pinturas.webp'],
            properties: {
              quantity: 12,
              flower_type: 'rosa ecuatoriana',
              includes_card: true,
            },
            business_id: createdBusinesses[2].id,
          },
          {
            name: 'Arreglo Floral Primaveral',
            price: 35.0,
            tags: ['flores', 'arreglos', 'eventos'],
            images_urls: ['/images/pinturas.webp'],
            properties: {
              size: 'mediano',
              vase_included: true,
            },
            business_id: createdBusinesses[2].id,
          },
          // Barro & Cerámica
          {
            name: 'Jarrón de barro artesanal',
            price: 28.0,
            tags: ['barro-ceramica', 'decoración'],
            images_urls: ['/images/alfareria.webp'],
            properties: { material: 'barro', origin: 'El Salvador' },
            business_id: createdBusinesses[0].id,
          },
          {
            name: 'Plato decorativo de cerámica pintada',
            price: 18.5,
            tags: ['barro-ceramica', 'decoración'],
            images_urls: ['/images/alfareria.webp'],
            properties: { material: 'cerámica', technique: 'pintado a mano' },
            business_id: createdBusinesses[0].id,
          },
          // Maderas
          {
            name: 'Máscara ceremonial tallada en madera',
            price: 55.0,
            tags: ['maderas', 'decoración', 'cultural'],
            images_urls: ['/images/maderas.webp'],
            properties: { wood: 'cedro', origin: 'Guatemala' },
            business_id: createdBusinesses[0].id,
          },
          {
            name: 'Cucharas artesanales de madera (set de 4)',
            price: 15.0,
            tags: ['maderas', 'cocina'],
            images_urls: ['/images/maderas.webp'],
            properties: { wood: 'palo blanco', pieces: 4 },
            business_id: createdBusinesses[1].id,
          },
          // Textiles & Tejidos
          {
            name: 'Hamaca de algodón tejida a mano',
            price: 75.0,
            tags: ['textiles-tejidos', 'hogar'],
            images_urls: ['/images/textiles.webp'],
            properties: { material: 'algodón', size: 'familiar' },
            business_id: createdBusinesses[1].id,
          },
          {
            name: 'Huipil bordado tradicional',
            price: 120.0,
            tags: ['textiles-tejidos', 'ropa', 'cultural'],
            images_urls: ['/images/textiles.webp'],
            properties: { origin: 'Guatemala', technique: 'telar de cintura' },
            business_id: createdBusinesses[2].id,
          },
          // Joyería
          {
            name: 'Collar de jade guatemalteco',
            price: 85.0,
            tags: ['joyeria', 'piedras'],
            images_urls: ['/images/joyeria.webp'],
            properties: { stone: 'jade', origin: 'Guatemala' },
            business_id: createdBusinesses[2].id,
          },
          {
            name: 'Aretes de semillas naturales',
            price: 12.0,
            tags: ['joyeria', 'semillas'],
            images_urls: ['/images/joyeria.webp'],
            properties: { material: 'semillas de tagua', origin: 'Ecuador' },
            business_id: createdBusinesses[2].id,
          },
          // Pinturas y Arte
          {
            name: 'Cuadro naif de pueblo salvadoreño',
            price: 95.0,
            tags: ['pinturas-arte', 'cuadros'],
            images_urls: ['/images/pinturas.webp'],
            properties: { technique: 'acrílico sobre lienzo', size: '40x60cm' },
            business_id: createdBusinesses[0].id,
          },
          {
            name: 'Miniatura pintada en madera',
            price: 22.0,
            tags: ['pinturas-arte', 'decoración'],
            images_urls: ['/images/pinturas.webp'],
            properties: { technique: 'óleo', size: '10x15cm' },
            business_id: createdBusinesses[1].id,
          },
          // Accesorios
          {
            name: 'Bolso de henequén tejido',
            price: 35.0,
            tags: ['accesorios', 'bolsos'],
            images_urls: ['/images/accesorios.webp'],
            properties: { material: 'henequén', origin: 'El Salvador' },
            business_id: createdBusinesses[2].id,
          },
          {
            name: 'Sombrero de palma artesanal',
            price: 20.0,
            tags: ['accesorios', 'sombreros'],
            images_urls: ['/images/accesorios.webp'],
            properties: { material: 'palma', origin: 'El Salvador' },
            business_id: createdBusinesses[0].id,
          },
        ];

        const productRepo = manager.getRepository(Product);
        for (const pData of productsData) {
          const product = productRepo.create(pData);
          await productRepo.save(product);
        }

        // Seed de Payment Preferences (1 por cada vendor)
        const preferencesData = [
          {
            name: 'Transferencia Banco Agrícola',
            account_information: {
              bank: 'Banco Agrícola',
              account_number: '1234567890',
              type: 'Ahorro',
            },
            owner_id: allVendors[0].id,
          },
          {
            name: 'Pago Móvil Tigo Money',
            account_information: {
              provider: 'Tigo Money',
              phone: '+503 7890-1234',
            },
            owner_id: allVendors[1].id,
          },
          {
            name: 'Depósito en efectivo',
            account_information: null,
            owner_id: allVendors[2].id,
          },
        ];

        for (const pData of preferencesData) {
          const pref = prefRepo.create(pData);
          await prefRepo.save(pref);
        }
      }

      if (customersEmpty) {
        const customersData = [
          {
            email: 'ana.perez@example.com',
            name: 'Ana',
            lastname: 'Pérez',
            country: 'El Salvador',
            personal_address: 'Colonia Escalón, San Salvador',
          },
          {
            email: 'carlos.martinez@example.com',
            name: 'Carlos',
            lastname: 'Martínez',
            country: 'El Salvador',
            personal_address: 'Residencial Santa Teresa, Santa Tecla',
          },
          {
            email: 'maria.lopez@example.com',
            name: 'María',
            lastname: 'López',
            country: 'Guatemala',
            personal_address: 'Zona 10, Ciudad de Guatemala',
          },
          {
            email: 'jose.garcia@example.com',
            name: 'José',
            lastname: 'García',
            country: 'Honduras',
            personal_address: 'Colonia Palmira, Tegucigalpa',
          },
          {
            email: 'sofia.rodriguez@example.com',
            name: 'Sofía',
            lastname: 'Rodríguez',
            country: 'México',
            personal_address: 'Colonia Roma Norte, Ciudad de México',
          },
          {
            email: 'diego.hernandez@example.com',
            name: 'Diego',
            lastname: 'Hernández',
            country: 'Nicaragua',
            personal_address: 'Reparto San Juan, Managua',
          },
          {
            email: 'valentina.cruz@example.com',
            name: 'Valentina',
            lastname: 'Cruz',
            country: 'Costa Rica',
            personal_address: 'Barrio Escalante, San José',
          },
          {
            email: 'andrea.flores@example.com',
            name: 'Andrea',
            lastname: 'Flores',
            country: 'Panamá',
            personal_address: 'Bella Vista, Ciudad de Panamá',
          },
          {
            email: 'miguel.castillo@example.com',
            name: 'Miguel',
            lastname: 'Castillo',
            country: 'Colombia',
            personal_address: 'Laureles, Medellín',
          },
          {
            email: 'lucia.vargas@example.com',
            name: 'Lucía',
            lastname: 'Vargas',
            country: 'El Salvador',
            personal_address: 'Colonia Miramonte, San Salvador',
          },
        ];

        for (const customerData of customersData) {
          const customer = customerRepo.create({
            ...customerData,
            password: defaultCustomerPassword,
          });
          await customerRepo.save(customer);
        }
      }

      // --- Seed de Orders y OrderProducts ---
      const allCustomers = await manager.getRepository(Customer).find();
      const allProducts = await manager.getRepository(Product).find();
      const allBusinesses = await manager.getRepository(Business).find();
      const orderRepo = manager.getRepository(Order);
      const orderProductRepo = manager.getRepository(OrderProduct);

      if (
        allCustomers.length >= 2 &&
        allProducts.length >= 4 &&
        allBusinesses.length >= 2
      ) {
        const existingOrders = await orderRepo.count({ withDeleted: true });
        if (existingOrders === 0) {
          // Order 1: Customer 0 compra Products de Business 0 y Business 1 (multi-business)
          const order1Products = [
            { product: allProducts[0], quantity: 2 },
            { product: allProducts[2], quantity: 3 },
          ];
          let subtotal1 = 0;
          const items1: Partial<OrderProduct>[] = [];
          for (const op of order1Products) {
            const unitPrice = Number(op.product.price);
            const lineSubtotal =
              Math.round(unitPrice * op.quantity * 100) / 100;
            items1.push({
              product_id: op.product.id,
              business_id: op.product.business_id,
              product_name: op.product.name,
              unit_price: unitPrice,
              quantity: op.quantity,
              subtotal: lineSubtotal,
            });
            subtotal1 = Math.round((subtotal1 + lineSubtotal) * 100) / 100;
          }
          const shippingFee = 10.0;
          const total1 = Math.round((subtotal1 + shippingFee) * 100) / 100;

          const savedOrder1 = await orderRepo.save(
            orderRepo.create({
              customer_id: allCustomers[0].id,
              delivery_address: allCustomers[0].personal_address,
              status: OrderStatus.PENDING,
              subtotal: subtotal1,
              shipping_fee: shippingFee,
              total: total1,
            }),
          );
          for (const item of items1) {
            await orderProductRepo.save(
              orderProductRepo.create({ ...item, order_id: savedOrder1.id }),
            );
          }

          // Order 2: Customer 1 compra Products de Business 2
          const order2Products = [
            { product: allProducts[4], quantity: 1 },
            { product: allProducts[5], quantity: 2 },
          ];
          let subtotal2 = 0;
          const items2: Partial<OrderProduct>[] = [];
          for (const op of order2Products) {
            const unitPrice = Number(op.product.price);
            const lineSubtotal =
              Math.round(unitPrice * op.quantity * 100) / 100;
            items2.push({
              product_id: op.product.id,
              business_id: op.product.business_id,
              product_name: op.product.name,
              unit_price: unitPrice,
              quantity: op.quantity,
              subtotal: lineSubtotal,
            });
            subtotal2 = Math.round((subtotal2 + lineSubtotal) * 100) / 100;
          }
          const total2 = Math.round((subtotal2 + shippingFee) * 100) / 100;

          const savedOrder2 = await orderRepo.save(
            orderRepo.create({
              customer_id: allCustomers[1].id,
              delivery_address: allCustomers[1].personal_address,
              status: OrderStatus.CONFIRMED,
              subtotal: subtotal2,
              shipping_fee: shippingFee,
              total: total2,
            }),
          );
          for (const item of items2) {
            await orderProductRepo.save(
              orderProductRepo.create({ ...item, order_id: savedOrder2.id }),
            );
          }

          this.logger.log('✅ Orders seeded: 2 orders with varied products.');
        }
      }
    });

    this.logger.log(
      '✅ Database seeded successfully with vendors, customers, phone numbers, businesses, products, payment preferences, and orders.',
    );
  }

  /**
   * Elimina completamente todos los registros de la base de datos respetando la integridad referencial.
   */
  async clear(): Promise<void> {
    this.logger.warn('Clearing all database tables...');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const dbType = this.dataSource.options.type;
      if (dbType === 'postgres') {
        await queryRunner.query(
          'TRUNCATE TABLE "order_products", "orders", "products", "payment_preferences", "businesses", "phone_numbers", "vendors", "customers" RESTART IDENTITY CASCADE;',
        );
      } else {
        // SQLite o fallback genérico — respetar dependencias
        const orderProductRepo = this.dataSource.getRepository(OrderProduct);
        const orderRepo = this.dataSource.getRepository(Order);
        const productRepo = this.dataSource.getRepository(Product);
        const prefRepo = this.dataSource.getRepository(PaymentPreference);
        const businessRepo = this.dataSource.getRepository(Business);
        const phoneRepo = this.dataSource.getRepository(PhoneNumber);
        const vendorRepo = this.dataSource.getRepository(Vendor);
        const customerRepo = this.dataSource.getRepository(Customer);
        await orderProductRepo.createQueryBuilder().delete().execute();
        await orderRepo.createQueryBuilder().delete().execute();
        await productRepo.createQueryBuilder().delete().execute();
        await prefRepo.createQueryBuilder().delete().execute();
        await businessRepo.createQueryBuilder().delete().execute();
        await phoneRepo.createQueryBuilder().delete().execute();
        await vendorRepo.createQueryBuilder().delete().execute();
        await customerRepo.createQueryBuilder().delete().execute();
      }
      this.logger.log('✅ Database cleared successfully.');
    } catch (error) {
      this.logger.error('Error clearing database', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Asegura que los productos de las 6 categorías canónicas estén disponibles,
   * incluso si la base de datos ya contenía datos previos.
   */
  async ensureArtisanalProducts(): Promise<void> {
    const productRepo = this.dataSource.getRepository(Product);
    const businessRepo = this.dataSource.getRepository(Business);

    const existingProducts = await productRepo.find();
    const canonicalCategories = [
      'barro-ceramica',
      'maderas',
      'textiles-tejidos',
      'joyeria',
      'pinturas-arte',
      'accesorios',
    ];

    const hasCategoryProducts = existingProducts.some(
      (p) => p.tags && p.tags.some((t) => canonicalCategories.includes(t)),
    );

    if (hasCategoryProducts && existingProducts.length >= 10) {
      return;
    }

    const businesses = await businessRepo.find();
    if (businesses.length === 0) {
      return;
    }

    this.logger.log(
      '🌱 Populating missing artisanal products into database...',
    );

    const productsToSeed = [
      // Barro & Cerámica
      {
        name: 'Jarrón de barro artesanal',
        price: 28.0,
        tags: ['barro-ceramica', 'decoración', 'barro'],
        images_urls: ['/images/alfareria.webp'],
        properties: { material: 'barro', origin: 'El Salvador' },
        business_id: businesses[0].id,
      },
      {
        name: 'Plato decorativo de cerámica pintada',
        price: 18.5,
        tags: ['barro-ceramica', 'decoración', 'cerámica'],
        images_urls: ['/images/alfareria.webp'],
        properties: { material: 'cerámica', technique: 'pintado a mano' },
        business_id: businesses[0].id,
      },
      // Maderas
      {
        name: 'Máscara ceremonial tallada en madera',
        price: 55.0,
        tags: ['maderas', 'decoración', 'cultural'],
        images_urls: ['/images/maderas.webp'],
        properties: { wood: 'cedro', origin: 'Guatemala' },
        business_id: businesses[0].id,
      },
      {
        name: 'Cucharas artesanales de madera (set de 4)',
        price: 15.0,
        tags: ['maderas', 'cocina'],
        images_urls: ['/images/maderas.webp'],
        properties: { wood: 'palo blanco', pieces: 4 },
        business_id: businesses[1 % businesses.length].id,
      },
      // Textiles & Tejidos
      {
        name: 'Hamaca de algodón tejida a mano',
        price: 75.0,
        tags: ['textiles-tejidos', 'hogar', 'hamacas'],
        images_urls: ['/images/textiles.webp'],
        properties: { material: 'algodón', size: 'familiar' },
        business_id: businesses[1 % businesses.length].id,
      },
      {
        name: 'Huipil bordado tradicional',
        price: 120.0,
        tags: ['textiles-tejidos', 'ropa', 'cultural'],
        images_urls: ['/images/textiles.webp'],
        properties: { origin: 'Guatemala', technique: 'telar de cintura' },
        business_id: businesses[2 % businesses.length].id,
      },
      // Joyería
      {
        name: 'Collar de jade guatemalteco',
        price: 85.0,
        tags: ['joyeria', 'piedras', 'collares'],
        images_urls: ['/images/joyeria.webp'],
        properties: { stone: 'jade', origin: 'Guatemala' },
        business_id: businesses[2 % businesses.length].id,
      },
      {
        name: 'Aretes de semillas naturales',
        price: 12.0,
        tags: ['joyeria', 'semillas', 'aretes'],
        images_urls: ['/images/joyeria.webp'],
        properties: { material: 'semillas de tagua', origin: 'Ecuador' },
        business_id: businesses[2 % businesses.length].id,
      },
      // Pinturas y Arte
      {
        name: 'Cuadro naif de pueblo salvadoreño',
        price: 95.0,
        tags: ['pinturas-arte', 'cuadros', 'decoración'],
        images_urls: ['/images/pinturas.webp'],
        properties: { technique: 'acrílico sobre lienzo', size: '40x60cm' },
        business_id: businesses[0].id,
      },
      {
        name: 'Miniatura pintada en madera',
        price: 22.0,
        tags: ['pinturas-arte', 'decoración', 'miniaturas'],
        images_urls: ['/images/pinturas.webp'],
        properties: { technique: 'óleo', size: '10x15cm' },
        business_id: businesses[1 % businesses.length].id,
      },
      // Accesorios
      {
        name: 'Bolso de henequén tejido',
        price: 35.0,
        tags: ['accesorios', 'bolsos', 'henequén'],
        images_urls: ['/images/accesorios.webp'],
        properties: { material: 'henequén', origin: 'El Salvador' },
        business_id: businesses[2 % businesses.length].id,
      },
      {
        name: 'Sombrero de palma artesanal',
        price: 20.0,
        tags: ['accesorios', 'sombreros', 'palma'],
        images_urls: ['/images/accesorios.webp'],
        properties: { material: 'palma', origin: 'El Salvador' },
        business_id: businesses[0].id,
      },
    ];

    for (const pData of productsToSeed) {
      const alreadyExists = existingProducts.some((p) => p.name === pData.name);
      if (!alreadyExists) {
        const product = productRepo.create(pData);
        await productRepo.save(product);
      }
    }
  }
}
