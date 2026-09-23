import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { Business } from './entities/business.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { PhoneNumber } from '../phone-numbers/entities/phone-number.entity';
import { PaymentPreference } from '../payment-preferences/entities/payment-preference.entity';

describe('BusinessesService (Unit / SQLite in-memory)', () => {
  let service: BusinessesService;
  let dataSource: DataSource;
  let sampleVendor: Vendor;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Business, Vendor, PhoneNumber, PaymentPreference],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Business, Vendor]),
      ],
      providers: [BusinessesService],
    }).compile();

    service = module.get<BusinessesService>(BusinessesService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    await dataSource.getRepository(Business).clear();
    await dataSource.getRepository(Vendor).clear();

    const vendorRepo = dataSource.getRepository(Vendor);
    sampleVendor = await vendorRepo.save(
      vendorRepo.create({
        username: 'vendor_business_test',
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
  });

  describe('create()', () => {
    it('1. Happy Path: debe crear y asociar un nuevo Business a un Vendor existente', async () => {
      const business = await service.create({
        name: 'Tienda El Buen Precio',
        description: 'Venta de artículos para el hogar',
        address: 'Av. Independencia #456',
        balance: 1500.5,
        owner_id: sampleVendor.id,
      });

      expect(business).toBeDefined();
      expect(business.id).toBeDefined();
      expect(business.name).toBe('Tienda El Buen Precio');
      expect(business.description).toBe('Venta de artículos para el hogar');
      expect(business.address).toBe('Av. Independencia #456');
      expect(Number(business.balance)).toBe(1500.5);
      expect(business.owner_id).toBe(sampleVendor.id);
      expect(business.owner).toBeDefined();
      expect(business.owner.id).toBe(sampleVendor.id);
    });

    it('2. Excepción: debe lanzar NotFoundException si el owner_id no corresponde a un Vendor existente', async () => {
      await expect(
        service.create({
          name: 'Tienda Fantasma',
          description: 'No existe',
          address: 'Dirección desconocida',
          owner_id: '00000000-0000-0000-0000-000000000000',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Caso Límite: crea con balance omitido y verifica que el default es 0', async () => {
      const business = await service.create({
        name: 'Negocio Sin Balance Inicial',
        description: 'Sin balance especificado',
        address: 'Calle Real #10',
        owner_id: sampleVendor.id,
      });

      expect(business).toBeDefined();
      expect(Number(business.balance)).toBe(0);
    });
  });

  describe('findAll()', () => {
    it('1. Happy Path: debe retornar la lista de businesses con relación owner', async () => {
      await service.create({
        name: 'Café Central',
        description: 'Cafetería',
        address: 'Zona Rosa',
        balance: 500,
        owner_id: sampleVendor.id,
      });

      const list = await service.findAll();
      expect(list.length).toBe(1);
      expect(list[0].name).toBe('Café Central');
      expect(list[0].owner).toBeDefined();
      expect(list[0].owner.id).toBe(sampleVendor.id);
    });

    it('2. Caso Límite: debe retornar arreglo vacío si no hay registros', async () => {
      const list = await service.findAll();
      expect(list).toEqual([]);
    });

    it('3. Filtros: filtra correctamente por owner_id, name y address', async () => {
      await service.create({
        name: 'Farmacia La Salud',
        description: 'Medicinas',
        address: 'Centro #1',
        owner_id: sampleVendor.id,
      });
      await service.create({
        name: 'Librería El Saber',
        description: 'Libros y útiles',
        address: 'Colonia Médica #2',
        owner_id: sampleVendor.id,
      });

      const byName = await service.findAll({ name: 'Farmacia La Salud' });
      expect(byName.length).toBe(1);
      expect(byName[0].name).toBe('Farmacia La Salud');

      const byAddress = await service.findAll({ address: 'Colonia Médica #2' });
      expect(byAddress.length).toBe(1);
      expect(byAddress[0].name).toBe('Librería El Saber');

      const byOwner = await service.findAll({ owner_id: sampleVendor.id });
      expect(byOwner.length).toBe(2);
    });
  });

  describe('findOne()', () => {
    it('1. Happy Path: debe retornar el business por UUID', async () => {
      const created = await service.create({
        name: 'Zapatería Moderna',
        description: 'Calzado',
        address: 'Metrocentro',
        owner_id: sampleVendor.id,
      });

      const found = await service.findOne(created.id);
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe('Zapatería Moderna');
    });

    it('2. Excepción: debe lanzar NotFoundException si el UUID no existe', async () => {
      await expect(
        service.findOne('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Caso Límite: incluye la relación owner correctamente', async () => {
      const created = await service.create({
        name: 'Ferretería El Tornillo',
        description: 'Herramientas',
        address: 'Calle Arce #20',
        owner_id: sampleVendor.id,
      });

      const found = await service.findOne(created.id);
      expect(found.owner).toBeDefined();
      expect(found.owner.username).toBe(sampleVendor.username);
    });
  });

  describe('update()', () => {
    it('1. Happy Path: actualiza name y description correctamente', async () => {
      const created = await service.create({
        name: 'Nombre Anterior',
        description: 'Desc Anterior',
        address: 'Dirección #1',
        owner_id: sampleVendor.id,
      });

      const updated = await service.update(created.id, {
        name: 'Nombre Nuevo',
        description: 'Desc Nueva',
      });

      expect(updated.name).toBe('Nombre Nuevo');
      expect(updated.description).toBe('Desc Nueva');
      expect(updated.address).toBe('Dirección #1');
    });

    it('2. Excepción: lanza NotFoundException al actualizar business inexistente', async () => {
      await expect(
        service.update('00000000-0000-0000-0000-000000000000', {
          name: 'Intento Invalido',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Caso Límite: actualiza balance y verifica la nueva cantidad', async () => {
      const created = await service.create({
        name: 'Supermercado',
        description: 'Comestibles',
        address: 'Plaza Mayor',
        balance: 100,
        owner_id: sampleVendor.id,
      });

      const updated = await service.update(created.id, {
        balance: 2750.75,
      });

      expect(Number(updated.balance)).toBe(2750.75);
    });
  });

  describe('remove()', () => {
    it('1. Happy Path: aplica soft delete; no aparece en findAll normal', async () => {
      const created = await service.create({
        name: 'Restaurante Temporal',
        description: 'Comida rápida',
        address: 'Boulevard #5',
        owner_id: sampleVendor.id,
      });

      await service.remove(created.id);

      await expect(service.findOne(created.id)).rejects.toThrow(
        NotFoundException,
      );

      const normalList = await service.findAll();
      expect(normalList.length).toBe(0);
    });

    it('2. Excepción: lanza NotFoundException si el business no existe', async () => {
      await expect(
        service.remove('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Caso Límite: aparece en findAll con withDeleted: "true" y deletedAt no es null', async () => {
      const created = await service.create({
        name: 'Taller Mecánico',
        description: 'Reparaciones',
        address: 'Calle al Volcán',
        owner_id: sampleVendor.id,
      });

      await service.remove(created.id);

      const deletedList = await service.findAll({ withDeleted: 'true' });
      expect(deletedList.length).toBe(1);
      expect(deletedList[0].deletedAt).not.toBeNull();
    });
  });

  describe('recover()', () => {
    it('1. Happy Path: restaura un business soft-deleted; reaparece en findAll', async () => {
      const created = await service.create({
        name: 'Boutique Elegancia',
        description: 'Ropa fina',
        address: 'Multiplaza',
        owner_id: sampleVendor.id,
      });

      await service.remove(created.id);
      const recovered = await service.recover(created.id);

      expect(recovered.deletedAt).toBeNull();

      const normalList = await service.findAll();
      expect(normalList.length).toBe(1);
      expect(normalList[0].name).toBe('Boutique Elegancia');
    });

    it('2. Excepción: lanza NotFoundException si el ID no existe', async () => {
      await expect(
        service.recover('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Caso Límite: si el business no está eliminado, lo retorna sin cambios', async () => {
      const created = await service.create({
        name: 'Panadería La Espiga',
        description: 'Pan fresco',
        address: 'Barrio El Centro',
        owner_id: sampleVendor.id,
      });

      const recovered = await service.recover(created.id);
      expect(recovered.deletedAt).toBeNull();
      expect(recovered.id).toBe(created.id);
    });
  });
});
