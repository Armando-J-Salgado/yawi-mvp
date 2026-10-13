import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PaymentPreferencesService } from './payment-preferences.service';
import { PaymentPreference } from './entities/payment-preference.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { PhoneNumber } from '../phone-numbers/entities/phone-number.entity';
import { Business } from '../businesses/entities/business.entity';

describe('PaymentPreferencesService (Unit / SQLite in-memory)', () => {
  let service: PaymentPreferencesService;
  let dataSource: DataSource;
  let sampleVendor: Vendor;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [PaymentPreference, Vendor, PhoneNumber, Business],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([PaymentPreference, Vendor]),
      ],
      providers: [PaymentPreferencesService],
    }).compile();

    service = module.get<PaymentPreferencesService>(PaymentPreferencesService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    await dataSource.getRepository(PaymentPreference).clear();
    await dataSource.getRepository(Vendor).clear();

    const vendorRepo = dataSource.getRepository(Vendor);
    sampleVendor = await vendorRepo.save(
      vendorRepo.create({
        username: 'vendor_pref_test',
        password: 'hashedpassword',
        name: 'María',
        surname: 'Flores',
        birthdate: new Date('1992-08-25'),
        country: 'El Salvador',
        personal_address: 'Santa Tecla #12',
        DUI: '03456789-1',
        NIT: '0511-250892-102-1',
      }),
    );
  });

  describe('create()', () => {
    it('1. Happy Path: debe crear una preferencia con account_information JSON válido', async () => {
      const pref = await service.create({
        name: 'Transferencia Banco Agrícola',
        account_information: {
          bank: 'Banco Agrícola',
          account_number: '1234567890',
          type: 'Ahorro',
        },
        owner_id: sampleVendor.id,
      });

      expect(pref).toBeDefined();
      expect(pref.id).toBeDefined();
      expect(pref.name).toBe('Transferencia Banco Agrícola');
      expect(pref.account_information).toEqual({
        bank: 'Banco Agrícola',
        account_number: '1234567890',
        type: 'Ahorro',
      });
      expect(pref.owner_id).toBe(sampleVendor.id);
      expect(pref.owner).toBeDefined();
      expect(pref.owner.id).toBe(sampleVendor.id);
    });

    it('2. Excepción: debe lanzar NotFoundException si el owner_id no corresponde a un Vendor existente', async () => {
      await expect(
        service.create({
          name: 'Preferencia Invalida',
          account_information: null,
          owner_id: '00000000-0000-0000-0000-000000000000',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Caso Límite: crea con account_information: null (campo nullable)', async () => {
      const pref = await service.create({
        name: 'Pago en Efectivo',
        account_information: null,
        owner_id: sampleVendor.id,
      });

      expect(pref).toBeDefined();
      expect(pref.name).toBe('Pago en Efectivo');
      expect(pref.account_information).toBeNull();
    });
  });

  describe('findAll()', () => {
    it('1. Happy Path: retorna lista de preferencias con relación owner', async () => {
      await service.create({
        name: 'Tigo Money',
        account_information: { phone: '+503 7890-1234' },
        owner_id: sampleVendor.id,
      });

      const list = await service.findAll();
      expect(list.length).toBe(1);
      expect(list[0].name).toBe('Tigo Money');
      expect(list[0].owner).toBeDefined();
      expect(list[0].owner.id).toBe(sampleVendor.id);
    });

    it('2. Caso Límite: retorna arreglo vacío si no hay registros', async () => {
      const list = await service.findAll();
      expect(list).toEqual([]);
    });

    it('3. Filtros: filtra correctamente por owner_id y por name', async () => {
      await service.create({
        name: 'Banco Cuscatlán',
        account_information: { account: '001-234' },
        owner_id: sampleVendor.id,
      });
      await service.create({
        name: 'Banco Davivienda',
        account_information: { account: '002-345' },
        owner_id: sampleVendor.id,
      });

      const byName = await service.findAll({ name: 'Banco Cuscatlán' });
      expect(byName.length).toBe(1);
      expect(byName[0].name).toBe('Banco Cuscatlán');

      const byOwner = await service.findAll({ owner_id: sampleVendor.id });
      expect(byOwner.length).toBe(2);
    });
  });

  describe('findOne()', () => {
    it('1. Happy Path: retorna la preferencia por UUID con su owner', async () => {
      const created = await service.create({
        name: 'BAC Credomatic',
        account_information: { account: '987654321' },
        owner_id: sampleVendor.id,
      });

      const found = await service.findOne(created.id);
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe('BAC Credomatic');
      expect(found.owner).toBeDefined();
      expect(found.owner.username).toBe(sampleVendor.username);
    });

    it('2. Excepción: lanza NotFoundException si UUID no existe', async () => {
      await expect(
        service.findOne('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Caso Límite: verifica que account_information se deserializa correctamente como objeto', async () => {
      const complexData = {
        bank: 'Banco Promerica',
        nested: { key: 'value', numbers: [1, 2, 3] },
      };

      const created = await service.create({
        name: 'Promerica',
        account_information: complexData,
        owner_id: sampleVendor.id,
      });

      const found = await service.findOne(created.id);
      expect(found.account_information).toEqual(complexData);
      expect(found.account_information?.nested?.numbers).toEqual([1, 2, 3]);
    });
  });

  describe('update()', () => {
    it('1. Happy Path: actualiza name correctamente', async () => {
      const created = await service.create({
        name: 'Nombre Original',
        account_information: { test: true },
        owner_id: sampleVendor.id,
      });

      const updated = await service.update(created.id, {
        name: 'Nombre Modificado',
      });

      expect(updated.name).toBe('Nombre Modificado');
      expect(updated.account_information).toEqual({ test: true });
    });

    it('2. Excepción: lanza NotFoundException al actualizar ID inexistente', async () => {
      await expect(
        service.update('00000000-0000-0000-0000-000000000000', {
          name: 'No existe',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Caso Límite: actualiza account_information de JSON a null', async () => {
      const created = await service.create({
        name: 'Preferencia Con Datos',
        account_information: { bank: 'Banco' },
        owner_id: sampleVendor.id,
      });

      const updated = await service.update(created.id, {
        account_information: null,
      });

      expect(updated.account_information).toBeNull();
    });
  });

  describe('remove()', () => {
    it('1. Happy Path: aplica soft delete; no aparece en findAll normal', async () => {
      const created = await service.create({
        name: 'Preferencia Borrable',
        account_information: null,
        owner_id: sampleVendor.id,
      });

      await service.remove(created.id);

      await expect(service.findOne(created.id)).rejects.toThrow(
        NotFoundException,
      );

      const normalList = await service.findAll();
      expect(normalList.length).toBe(0);
    });

    it('2. Excepción: lanza NotFoundException si no existe', async () => {
      await expect(
        service.remove('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Caso Límite: aparece con withDeleted: "true"', async () => {
      const created = await service.create({
        name: 'Preferencia Soft Delete',
        account_information: null,
        owner_id: sampleVendor.id,
      });

      await service.remove(created.id);

      const deletedList = await service.findAll({ withDeleted: 'true' });
      expect(deletedList.length).toBe(1);
      expect(deletedList[0].deletedAt).not.toBeNull();
    });
  });

  describe('recover()', () => {
    it('1. Happy Path: restaura una preferencia eliminada', async () => {
      const created = await service.create({
        name: 'Preferencia Restaurable',
        account_information: null,
        owner_id: sampleVendor.id,
      });

      await service.remove(created.id);
      const recovered = await service.recover(created.id);

      expect(recovered.deletedAt).toBeNull();

      const normalList = await service.findAll();
      expect(normalList.length).toBe(1);
      expect(normalList[0].name).toBe('Preferencia Restaurable');
    });

    it('2. Excepción: lanza NotFoundException si ID no existe', async () => {
      await expect(
        service.recover('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Caso Límite: si no está eliminada, la retorna sin cambios', async () => {
      const created = await service.create({
        name: 'Preferencia Activa',
        account_information: null,
        owner_id: sampleVendor.id,
      });

      const recovered = await service.recover(created.id);
      expect(recovered.deletedAt).toBeNull();
      expect(recovered.id).toBe(created.id);
    });
  });
});
