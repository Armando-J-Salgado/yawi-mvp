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
          // Barro & Cerámica (al menos 6 productos cubriendo sub-tags y rangos de precio)
          {
            name: 'Plato decorativo de cerámica pintada',
            price: 18.5,
            tags: ['barro-ceramica', 'decoración', 'cerámica'],
            images_urls: ['/images/alfareria.webp'],
            properties: {
              material: 'cerámica',
              technique: 'pintado a mano',
              origin: 'Ilobasco',
            },
            business_id: createdBusinesses[0].id,
          },
          {
            name: 'Taza artesanal de barro bruñido',
            price: 12.0,
            tags: ['barro-ceramica', 'vajilla', 'barro'],
            images_urls: ['/images/producto1.webp'],
            properties: {
              material: 'barro bruñido',
              capacity: '350ml',
              origin: 'Guatajiagua',
            },
            business_id: createdBusinesses[1].id,
          },
          {
            name: 'Jarrón de barro artesanal',
            price: 28.0,
            tags: ['barro-ceramica', 'decoración', 'barro'],
            images_urls: ['/images/alfareria.webp'],
            properties: {
              material: 'barro rojo',
              finish: 'natural',
              origin: 'El Salvador',
            },
            business_id: createdBusinesses[0].id,
          },
          {
            name: 'Juego de cuencos de cerámica y barro',
            price: 42.0,
            tags: ['barro-ceramica', 'vajilla', 'cerámica', 'barro'],
            images_urls: ['/images/producto3.webp'],
            properties: {
              pieces: 4,
              material: 'arcilla horneada',
              origin: 'San Antonio Palopó',
            },
            business_id: createdBusinesses[2].id,
          },
          {
            name: 'Ámfora lenca de barro negro',
            price: 68.0,
            tags: ['barro-ceramica', 'decoración', 'barro'],
            images_urls: ['/images/alfareria.webp'],
            properties: {
              technique: 'tinte nacascolo',
              style: 'lenca tradicional',
              height: '45cm',
            },
            business_id: createdBusinesses[1].id,
          },
          {
            name: 'Vajilla completa de cerámica esmaltada',
            price: 135.0,
            tags: ['barro-ceramica', 'vajilla', 'cerámica', 'decoración'],
            images_urls: ['/images/artesanias.webp'],
            properties: {
              pieces: 16,
              glaze: 'mineral libre de plomo',
              dishwasherSafe: true,
            },
            business_id: createdBusinesses[2].id,
          },
          // Maderas (al menos 6 productos cubriendo sub-tags y rangos de precio)
          {
            name: 'Cucharas artesanales de madera (set de 4)',
            price: 15.0,
            tags: ['maderas', 'cocina'],
            images_urls: ['/images/maderas.webp'],
            properties: {
              wood: 'palo blanco',
              pieces: 4,
              finish: 'aceite mineral',
            },
            business_id: createdBusinesses[1].id,
          },
          {
            name: 'Portavasos tallados en madera con motivos naíf',
            price: 19.5,
            tags: ['maderas', 'decoración', 'cocina'],
            images_urls: ['/images/productos2.webp'],
            properties: { wood: 'pino', pieces: 6, style: 'La Palma' },
            business_id: createdBusinesses[0].id,
          },
          {
            name: 'Tabla para picar y servir en madera de teca',
            price: 34.0,
            tags: ['maderas', 'cocina', 'decoración'],
            images_urls: ['/images/maderas.webp'],
            properties: { wood: 'teca sostenible', dimensions: '30x45cm' },
            business_id: createdBusinesses[1].id,
          },
          {
            name: 'Máscara ceremonial tallada en madera',
            price: 55.0,
            tags: ['maderas', 'decoración', 'cultural'],
            images_urls: ['/images/maderas.webp'],
            properties: {
              wood: 'cedro',
              origin: 'Guatemala',
              motif: 'danza tradicional',
            },
            business_id: createdBusinesses[0].id,
          },
          {
            name: 'Escultura de jaguar en relieve de cedro real',
            price: 85.0,
            tags: ['maderas', 'esculturas', 'cultural', 'decoración'],
            images_urls: ['/images/producto6.webp'],
            properties: {
              wood: 'cedro real',
              technique: 'tallado en relieve manual',
            },
            business_id: createdBusinesses[2].id,
          },
          {
            name: 'Cofre artesanal tallado con herrajes coloniales',
            price: 120.0,
            tags: ['maderas', 'decoración', 'cultural', 'esculturas'],
            images_urls: ['/images/maderas.webp'],
            properties: {
              wood: 'caoba',
              lock: 'hierro forjado',
              origin: 'Suchitoto',
            },
            business_id: createdBusinesses[2].id,
          },
          // Textiles & Tejidos (al menos 6 productos cubriendo sub-tags y rangos de precio)
          {
            name: 'Camino de mesa con tintes naturales de añil',
            price: 22.0,
            tags: ['textiles-tejidos', 'hogar', 'cultural'],
            images_urls: ['/images/textiles.webp'],
            properties: {
              dye: 'añil puro',
              length: '1.80m',
              technique: 'telar de pedal',
            },
            business_id: createdBusinesses[0].id,
          },
          {
            name: 'Funda para cojín con bordado tradicional',
            price: 32.0,
            tags: ['textiles-tejidos', 'dormitorio', 'hogar'],
            images_urls: ['/images/textiles.webp'],
            properties: {
              size: '45x45cm',
              material: 'manta de algodón',
              embroidery: 'hilo de seda',
            },
            business_id: createdBusinesses[1].id,
          },
          {
            name: 'Chalina de algodón teñida con añil salvadoreño',
            price: 45.0,
            tags: ['textiles-tejidos', 'ropa', 'cultural'],
            images_urls: ['/images/ropa.webp'],
            properties: {
              technique: 'shibori con añil',
              fabric: 'algodón 100%',
            },
            business_id: createdBusinesses[0].id,
          },
          {
            name: 'Hamaca de algodón tejida a mano',
            price: 75.0,
            tags: ['textiles-tejidos', 'hogar'],
            images_urls: ['/images/hamacas.webp'],
            properties: {
              material: 'algodón hilado',
              size: 'matrimonial',
              capacity: '200kg',
            },
            business_id: createdBusinesses[1].id,
          },
          {
            name: 'Colcha artesanal tejida en telar de San Sebastián',
            price: 95.0,
            tags: ['textiles-tejidos', 'dormitorio', 'hogar', 'cultural'],
            images_urls: ['/images/textiles.webp'],
            properties: {
              origin: 'San Sebastián',
              size: 'Queen',
              technique: 'doble urdimbre',
            },
            business_id: createdBusinesses[2].id,
          },
          {
            name: 'Huipil bordado tradicional ceremonial',
            price: 120.0,
            tags: ['textiles-tejidos', 'ropa', 'cultural'],
            images_urls: ['/images/ropa.webp'],
            properties: {
              origin: 'Santiago Atitlán',
              technique: 'telar de cintura maya',
            },
            business_id: createdBusinesses[2].id,
          },
          // Joyería (al menos 6 productos cubriendo sub-tags y rangos de precio)
          {
            name: 'Aretes de semillas naturales de tagua',
            price: 12.0,
            tags: ['joyeria', 'semillas', 'aretes'],
            images_urls: ['/images/joyeria.webp'],
            properties: {
              material: 'semillas de tagua',
              hooks: 'acero quirúrgico',
            },
            business_id: createdBusinesses[2].id,
          },
          {
            name: 'Pulsera elástica de semillas de café y madera',
            price: 16.5,
            tags: ['joyeria', 'semillas'],
            images_urls: ['/images/productos4.webp'],
            properties: {
              material: 'granos de café tostado barnizado',
              size: 'ajustable',
            },
            business_id: createdBusinesses[1].id,
          },
          {
            name: 'Aretes colgantes en filigrana de plata 925',
            price: 38.0,
            tags: ['joyeria', 'aretes', 'piedras'],
            images_urls: ['/images/joyeria.webp'],
            properties: {
              metal: 'plata esterlina 925',
              stones: 'circonia natural',
            },
            business_id: createdBusinesses[0].id,
          },
          {
            name: 'Gargantilla artesanal de piedras volcánicas',
            price: 46.0,
            tags: ['joyeria', 'collares', 'piedras'],
            images_urls: ['/images/productos5.webp'],
            properties: {
              stone: 'lava volcánica y turquesa',
              clasp: 'cobre antiguo',
            },
            business_id: createdBusinesses[1].id,
          },
          {
            name: 'Collar de jade guatemalteco pulido',
            price: 85.0,
            tags: ['joyeria', 'piedras', 'collares'],
            images_urls: ['/images/joyeria.webp'],
            properties: {
              stone: 'jade verde de Motagua',
              cord: 'cuero trenzado',
            },
            business_id: createdBusinesses[2].id,
          },
          {
            name: 'Collar pectoral ceremonial con jade imperial y plata',
            price: 145.0,
            tags: ['joyeria', 'piedras', 'collares'],
            images_urls: ['/images/joyeria.webp'],
            properties: {
              stone: 'jade imperial',
              metal: 'plata 925',
              certified: true,
            },
            business_id: createdBusinesses[2].id,
          },
          // Pinturas y Arte (al menos 6 productos cubriendo sub-tags y rangos de precio)
          {
            name: 'Semilla de copinol pintada a mano',
            price: 14.0,
            tags: ['pinturas-arte', 'miniaturas', 'eventos', 'decoración'],
            images_urls: ['/images/productos2.webp'],
            properties: {
              base: 'semilla de copinol',
              style: 'arte naíf',
              size: '5cm',
            },
            business_id: createdBusinesses[0].id,
          },
          {
            name: 'Miniatura pintada en madera de cedro',
            price: 22.0,
            tags: ['pinturas-arte', 'decoración', 'miniaturas'],
            images_urls: ['/images/pinturas.webp'],
            properties: { technique: 'óleo sobre madera', size: '10x15cm' },
            business_id: createdBusinesses[1].id,
          },
          {
            name: 'Retablo conmemorativo para eventos familiares',
            price: 40.0,
            tags: ['pinturas-arte', 'decoración', 'eventos'],
            images_urls: ['/images/pinturas.webp'],
            properties: {
              style: 'retablo tradicional',
              personalization: 'nombres y fecha',
            },
            business_id: createdBusinesses[2].id,
          },
          {
            name: 'Lienzo de atardecer en los volcanes salvadoreños',
            price: 78.0,
            tags: ['pinturas-arte', 'cuadros', 'decoración'],
            images_urls: ['/images/pinturas.webp'],
            properties: {
              technique: 'acrílico espatulado',
              dimensions: '40x50cm',
            },
            business_id: createdBusinesses[1].id,
          },
          {
            name: 'Cuadro naif de pueblo salvadoreño',
            price: 95.0,
            tags: ['pinturas-arte', 'cuadros', 'decoración'],
            images_urls: ['/images/pinturas.webp'],
            properties: {
              technique: 'acrílico sobre lienzo',
              size: '40x60cm',
              school: 'La Palma',
            },
            business_id: createdBusinesses[0].id,
          },
          {
            name: 'Mural tríptico de aves mesoamericanas',
            price: 160.0,
            tags: ['pinturas-arte', 'cuadros', 'decoración', 'eventos'],
            images_urls: ['/images/artesanias.webp'],
            properties: {
              pieces: 3,
              technique: 'óleo sobre lienzo en bastidor',
              total_size: '90x120cm',
            },
            business_id: createdBusinesses[2].id,
          },
          // Accesorios (al menos 6 productos cubriendo sub-tags y rangos de precio)
          {
            name: 'Monedero tejido en fibra de henequén',
            price: 11.5,
            tags: ['accesorios', 'bolsos', 'henequén'],
            images_urls: ['/images/producto6.webp'],
            properties: {
              material: 'henequén teñido',
              closure: 'cremallera metálica',
            },
            business_id: createdBusinesses[1].id,
          },
          {
            name: 'Sombrero de palma artesanal de campo',
            price: 20.0,
            tags: ['accesorios', 'sombreros', 'palma'],
            images_urls: ['/images/accesorios.webp'],
            properties: { material: 'palma criolla', brim: 'ala ancha' },
            business_id: createdBusinesses[0].id,
          },
          {
            name: 'Bolso de henequén tejido con asas de cuero',
            price: 35.0,
            tags: ['accesorios', 'bolsos', 'henequén'],
            images_urls: ['/images/accesorios.webp'],
            properties: {
              material: 'henequén natural',
              handles: 'cuero curtido',
            },
            business_id: createdBusinesses[2].id,
          },
          {
            name: 'Sombrero fino de palma jipi japa',
            price: 48.0,
            tags: ['accesorios', 'sombreros', 'palma'],
            images_urls: ['/images/accesorios.webp'],
            properties: {
              material: 'palma jipi japa tejida en cueva',
              grade: 'fino',
            },
            business_id: createdBusinesses[0].id,
          },
          {
            name: 'Bolso playero tipo tote en palma y cuero',
            price: 65.0,
            tags: ['accesorios', 'bolsos', 'palma'],
            images_urls: ['/images/accesorios.webp'],
            properties: {
              material: 'palma trenzada y forro de manta',
              interiorPocket: true,
            },
            business_id: createdBusinesses[1].id,
          },
          {
            name: 'Morral tradicional de telar con detalles en cuero y henequén',
            price: 110.0,
            tags: ['accesorios', 'bolsos', 'henequén'],
            images_urls: ['/images/accesorios.webp'],
            properties: {
              strap: 'cuero ajustable',
              technique: 'telar y henequén entrelazado',
            },
            business_id: createdBusinesses[2].id,
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

    const b0 = businesses[0].id;
    const b1 = businesses[1 % businesses.length].id;
    const b2 = businesses[2 % businesses.length].id;

    const productsToSeed = [
      // Barro & Cerámica (al menos 6 productos cubriendo sub-tags y rangos de precio)
      {
        name: 'Plato decorativo de cerámica pintada',
        price: 18.5,
        tags: ['barro-ceramica', 'decoración', 'cerámica'],
        images_urls: ['/images/alfareria.webp'],
        properties: {
          material: 'cerámica',
          technique: 'pintado a mano',
          origin: 'Ilobasco',
        },
        business_id: b0,
      },
      {
        name: 'Taza artesanal de barro bruñido',
        price: 12.0,
        tags: ['barro-ceramica', 'vajilla', 'barro'],
        images_urls: ['/images/producto1.webp'],
        properties: {
          material: 'barro bruñido',
          capacity: '350ml',
          origin: 'Guatajiagua',
        },
        business_id: b1,
      },
      {
        name: 'Jarrón de barro artesanal',
        price: 28.0,
        tags: ['barro-ceramica', 'decoración', 'barro'],
        images_urls: ['/images/alfareria.webp'],
        properties: {
          material: 'barro rojo',
          finish: 'natural',
          origin: 'El Salvador',
        },
        business_id: b0,
      },
      {
        name: 'Juego de cuencos de cerámica y barro',
        price: 42.0,
        tags: ['barro-ceramica', 'vajilla', 'cerámica', 'barro'],
        images_urls: ['/images/producto3.webp'],
        properties: {
          pieces: 4,
          material: 'arcilla horneada',
          origin: 'San Antonio Palopó',
        },
        business_id: b2,
      },
      {
        name: 'Ámfora lenca de barro negro',
        price: 68.0,
        tags: ['barro-ceramica', 'decoración', 'barro'],
        images_urls: ['/images/alfareria.webp'],
        properties: {
          technique: 'tinte nacascolo',
          style: 'lenca tradicional',
          height: '45cm',
        },
        business_id: b1,
      },
      {
        name: 'Vajilla completa de cerámica esmaltada',
        price: 135.0,
        tags: ['barro-ceramica', 'vajilla', 'cerámica', 'decoración'],
        images_urls: ['/images/artesanias.webp'],
        properties: {
          pieces: 16,
          glaze: 'mineral libre de plomo',
          dishwasherSafe: true,
        },
        business_id: b2,
      },
      // Maderas (al menos 6 productos cubriendo sub-tags y rangos de precio)
      {
        name: 'Cucharas artesanales de madera (set de 4)',
        price: 15.0,
        tags: ['maderas', 'cocina'],
        images_urls: ['/images/maderas.webp'],
        properties: {
          wood: 'palo blanco',
          pieces: 4,
          finish: 'aceite mineral',
        },
        business_id: b1,
      },
      {
        name: 'Portavasos tallados en madera con motivos naíf',
        price: 19.5,
        tags: ['maderas', 'decoración', 'cocina'],
        images_urls: ['/images/productos2.webp'],
        properties: { wood: 'pino', pieces: 6, style: 'La Palma' },
        business_id: b0,
      },
      {
        name: 'Tabla para picar y servir en madera de teca',
        price: 34.0,
        tags: ['maderas', 'cocina', 'decoración'],
        images_urls: ['/images/maderas.webp'],
        properties: { wood: 'teca sostenible', dimensions: '30x45cm' },
        business_id: b1,
      },
      {
        name: 'Máscara ceremonial tallada en madera',
        price: 55.0,
        tags: ['maderas', 'decoración', 'cultural'],
        images_urls: ['/images/maderas.webp'],
        properties: {
          wood: 'cedro',
          origin: 'Guatemala',
          motif: 'danza tradicional',
        },
        business_id: b0,
      },
      {
        name: 'Escultura de jaguar en relieve de cedro real',
        price: 85.0,
        tags: ['maderas', 'esculturas', 'cultural', 'decoración'],
        images_urls: ['/images/producto6.webp'],
        properties: {
          wood: 'cedro real',
          technique: 'tallado en relieve manual',
        },
        business_id: b2,
      },
      {
        name: 'Cofre artesanal tallado con herrajes coloniales',
        price: 120.0,
        tags: ['maderas', 'decoración', 'cultural', 'esculturas'],
        images_urls: ['/images/maderas.webp'],
        properties: {
          wood: 'caoba',
          lock: 'hierro forjado',
          origin: 'Suchitoto',
        },
        business_id: b2,
      },
      // Textiles & Tejidos (al menos 6 productos cubriendo sub-tags y rangos de precio)
      {
        name: 'Camino de mesa con tintes naturales de añil',
        price: 22.0,
        tags: ['textiles-tejidos', 'hogar', 'cultural'],
        images_urls: ['/images/textiles.webp'],
        properties: {
          dye: 'añil puro',
          length: '1.80m',
          technique: 'telar de pedal',
        },
        business_id: b0,
      },
      {
        name: 'Funda para cojín con bordado tradicional',
        price: 32.0,
        tags: ['textiles-tejidos', 'dormitorio', 'hogar'],
        images_urls: ['/images/textiles.webp'],
        properties: {
          size: '45x45cm',
          material: 'manta de algodón',
          embroidery: 'hilo de seda',
        },
        business_id: b1,
      },
      {
        name: 'Chalina de algodón teñida con añil salvadoreño',
        price: 45.0,
        tags: ['textiles-tejidos', 'ropa', 'cultural'],
        images_urls: ['/images/ropa.webp'],
        properties: { technique: 'shibori con añil', fabric: 'algodón 100%' },
        business_id: b0,
      },
      {
        name: 'Hamaca de algodón tejida a mano',
        price: 75.0,
        tags: ['textiles-tejidos', 'hogar'],
        images_urls: ['/images/hamacas.webp'],
        properties: {
          material: 'algodón hilado',
          size: 'matrimonial',
          capacity: '200kg',
        },
        business_id: b1,
      },
      {
        name: 'Colcha artesanal tejida en telar de San Sebastián',
        price: 95.0,
        tags: ['textiles-tejidos', 'dormitorio', 'hogar', 'cultural'],
        images_urls: ['/images/textiles.webp'],
        properties: {
          origin: 'San Sebastián',
          size: 'Queen',
          technique: 'doble urdimbre',
        },
        business_id: b2,
      },
      {
        name: 'Huipil bordado tradicional ceremonial',
        price: 120.0,
        tags: ['textiles-tejidos', 'ropa', 'cultural'],
        images_urls: ['/images/ropa.webp'],
        properties: {
          origin: 'Santiago Atitlán',
          technique: 'telar de cintura maya',
        },
        business_id: b2,
      },
      // Joyería (al menos 6 productos cubriendo sub-tags y rangos de precio)
      {
        name: 'Aretes de semillas naturales de tagua',
        price: 12.0,
        tags: ['joyeria', 'semillas', 'aretes'],
        images_urls: ['/images/joyeria.webp'],
        properties: {
          material: 'semillas de tagua',
          hooks: 'acero quirúrgico',
        },
        business_id: b2,
      },
      {
        name: 'Pulsera elástica de semillas de café y madera',
        price: 16.5,
        tags: ['joyeria', 'semillas'],
        images_urls: ['/images/productos4.webp'],
        properties: {
          material: 'granos de café tostado barnizado',
          size: 'ajustable',
        },
        business_id: b1,
      },
      {
        name: 'Aretes colgantes en filigrana de plata 925',
        price: 38.0,
        tags: ['joyeria', 'aretes', 'piedras'],
        images_urls: ['/images/joyeria.webp'],
        properties: {
          metal: 'plata esterlina 925',
          stones: 'circonia natural',
        },
        business_id: b0,
      },
      {
        name: 'Gargantilla artesanal de piedras volcánicas',
        price: 46.0,
        tags: ['joyeria', 'collares', 'piedras'],
        images_urls: ['/images/productos5.webp'],
        properties: {
          stone: 'lava volcánica y turquesa',
          clasp: 'cobre antiguo',
        },
        business_id: b1,
      },
      {
        name: 'Collar de jade guatemalteco pulido',
        price: 85.0,
        tags: ['joyeria', 'piedras', 'collares'],
        images_urls: ['/images/joyeria.webp'],
        properties: { stone: 'jade verde de Motagua', cord: 'cuero trenzado' },
        business_id: b2,
      },
      {
        name: 'Collar pectoral ceremonial con jade imperial y plata',
        price: 145.0,
        tags: ['joyeria', 'piedras', 'collares'],
        images_urls: ['/images/joyeria.webp'],
        properties: {
          stone: 'jade imperial',
          metal: 'plata 925',
          certified: true,
        },
        business_id: b2,
      },
      // Pinturas y Arte (al menos 6 productos cubriendo sub-tags y rangos de precio)
      {
        name: 'Semilla de copinol pintada a mano',
        price: 14.0,
        tags: ['pinturas-arte', 'miniaturas', 'eventos', 'decoración'],
        images_urls: ['/images/productos2.webp'],
        properties: {
          base: 'semilla de copinol',
          style: 'arte naíf',
          size: '5cm',
        },
        business_id: b0,
      },
      {
        name: 'Miniatura pintada en madera de cedro',
        price: 22.0,
        tags: ['pinturas-arte', 'decoración', 'miniaturas'],
        images_urls: ['/images/pinturas.webp'],
        properties: { technique: 'óleo sobre madera', size: '10x15cm' },
        business_id: b1,
      },
      {
        name: 'Retablo conmemorativo para eventos familiares',
        price: 40.0,
        tags: ['pinturas-arte', 'decoración', 'eventos'],
        images_urls: ['/images/pinturas.webp'],
        properties: {
          style: 'retablo tradicional',
          personalization: 'nombres y fecha',
        },
        business_id: b2,
      },
      {
        name: 'Lienzo de atardecer en los volcanes salvadoreños',
        price: 78.0,
        tags: ['pinturas-arte', 'cuadros', 'decoración'],
        images_urls: ['/images/pinturas.webp'],
        properties: { technique: 'acrílico espatulado', dimensions: '40x50cm' },
        business_id: b1,
      },
      {
        name: 'Cuadro naif de pueblo salvadoreño',
        price: 95.0,
        tags: ['pinturas-arte', 'cuadros', 'decoración'],
        images_urls: ['/images/pinturas.webp'],
        properties: {
          technique: 'acrílico sobre lienzo',
          size: '40x60cm',
          school: 'La Palma',
        },
        business_id: b0,
      },
      {
        name: 'Mural tríptico de aves mesoamericanas',
        price: 160.0,
        tags: ['pinturas-arte', 'cuadros', 'decoración', 'eventos'],
        images_urls: ['/images/artesanias.webp'],
        properties: {
          pieces: 3,
          technique: 'óleo sobre lienzo en bastidor',
          total_size: '90x120cm',
        },
        business_id: b2,
      },
      // Accesorios (al menos 6 productos cubriendo sub-tags y rangos de precio)
      {
        name: 'Monedero tejido en fibra de henequén',
        price: 11.5,
        tags: ['accesorios', 'bolsos', 'henequén'],
        images_urls: ['/images/producto6.webp'],
        properties: {
          material: 'henequén teñido',
          closure: 'cremallera metálica',
        },
        business_id: b1,
      },
      {
        name: 'Sombrero de palma artesanal de campo',
        price: 20.0,
        tags: ['accesorios', 'sombreros', 'palma'],
        images_urls: ['/images/accesorios.webp'],
        properties: { material: 'palma criolla', brim: 'ala ancha' },
        business_id: b0,
      },
      {
        name: 'Bolso de henequén tejido con asas de cuero',
        price: 35.0,
        tags: ['accesorios', 'bolsos', 'henequén'],
        images_urls: ['/images/accesorios.webp'],
        properties: { material: 'henequén natural', handles: 'cuero curtido' },
        business_id: b2,
      },
      {
        name: 'Sombrero fino de palma jipi japa',
        price: 48.0,
        tags: ['accesorios', 'sombreros', 'palma'],
        images_urls: ['/images/accesorios.webp'],
        properties: {
          material: 'palma jipi japa tejida en cueva',
          grade: 'fino',
        },
        business_id: b0,
      },
      {
        name: 'Bolso playero tipo tote en palma y cuero',
        price: 65.0,
        tags: ['accesorios', 'bolsos', 'palma'],
        images_urls: ['/images/accesorios.webp'],
        properties: {
          material: 'palma trenzada y forro de manta',
          interiorPocket: true,
        },
        business_id: b1,
      },
      {
        name: 'Morral tradicional de telar con detalles en cuero y henequén',
        price: 110.0,
        tags: ['accesorios', 'bolsos', 'henequén'],
        images_urls: ['/images/accesorios.webp'],
        properties: {
          strap: 'cuero ajustable',
          technique: 'telar y henequén entrelazado',
        },
        business_id: b2,
      },
    ];

    let insertedCount = 0;
    for (const pData of productsToSeed) {
      const alreadyExists = existingProducts.some((p) => p.name === pData.name);
      if (!alreadyExists) {
        const product = productRepo.create(pData);
        await productRepo.save(product);
        insertedCount++;
      }
    }

    if (insertedCount > 0) {
      this.logger.log(
        `🌱 Added ${insertedCount} missing artisanal products into database.`,
      );
    }
  }
}
