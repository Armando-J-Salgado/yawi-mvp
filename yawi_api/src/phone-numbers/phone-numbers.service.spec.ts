import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PhoneNumbersService } from './phone-numbers.service';
import { PhoneNumber } from './entities/phone-number.entity';
import { Vendor } from '../vendors/entities/vendor.entity';

describe('PhoneNumbersService (Unit / SQLite in-memory)', () => {
  let service: PhoneNumbersService;
  let dataSource: DataSource;
  let sampleVendor: Vendor;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Vendor, PhoneNumber],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([PhoneNumber, Vendor]),
      ],
      providers: [PhoneNumbersService],
    }).compile();

    service = module.get<PhoneNumbersService>(PhoneNumbersService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    await dataSource.getRepository(PhoneNumber).clear();
    await dataSource.getRepository(Vendor).clear();

    const vendorRepo = dataSource.getRepository(Vendor);
    sampleVendor = await vendorRepo.save(
      vendorRepo.create({
        username: 'vendor_phone_test',
        password: 'hashedpassword',
        name: 'Ana',
        surname: 'Gómez',
        birthdate: new Date('1995-03-20'),
        country: 'El Salvador',
        personal_address: 'Santa Tecla #45',
        DUI: '09876543-2',
        NIT: '0614-200395-102-3',
      }),
    );
  });

  describe('create()', () => {
    it('1. Happy Path: debe crear y asociar un nuevo PhoneNumber a un Vendor existente', async () => {
      const phone = await service.create({
        number: '+503 7234-5678',
        owner_id: sampleVendor.id,
      });

      expect(phone).toBeDefined();
      expect(phone.id).toBeDefined();
      expect(phone.number).toBe('+503 7234-5678');
      expect(phone.owner_id).toBe(sampleVendor.id);
      expect(phone.owner).toBeDefined();
      expect(phone.owner.id).toBe(sampleVendor.id);
    });

    it('2. Excepción: debe lanzar NotFoundException si el owner_id no corresponde a un Vendor existente', async () => {
      await expect(
        service.create({
          number: '+503 7000-0000',
          owner_id: '00000000-0000-0000-0000-000000000000',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Caso Límite: permite asociar múltiples números telefónicos al mismo Vendor', async () => {
      const phone1 = await service.create({
        number: '+503 7111-1111',
        owner_id: sampleVendor.id,
      });
      const phone2 = await service.create({
        number: '+503 2222-2222',
        owner_id: sampleVendor.id,
      });

      expect(phone1.id).not.toBe(phone2.id);

      const all = await service.findAll({ owner_id: sampleVendor.id });
      expect(all.length).toBe(2);
    });
  });

  describe('findAll()', () => {
    it('1. Happy Path: debe listar los números telefónicos existentes', async () => {
      await service.create({
        number: '+503 7111-1111',
        owner_id: sampleVendor.id,
      });
      const phones = await service.findAll();

      expect(phones.length).toBe(1);
      expect(phones[0].number).toBe('+503 7111-1111');
    });

    it('2. Caso Límite: debe retornar arreglo vacío si no hay registros', async () => {
      const phones = await service.findAll();
      expect(phones).toEqual([]);
    });

    it('3. Filtros: debe filtrar por owner_id y por número', async () => {
      await service.create({
        number: '+503 7111-1111',
        owner_id: sampleVendor.id,
      });
      await service.create({
        number: '+503 7999-9999',
        owner_id: sampleVendor.id,
      });

      const filtered = await service.findAll({ number: '+503 7111-1111' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].number).toBe('+503 7111-1111');
    });
  });

  describe('findOne()', () => {
    it('1. Happy Path: debe retornar el PhoneNumber por UUID', async () => {
      const created = await service.create({
        number: '+503 7111-1111',
        owner_id: sampleVendor.id,
      });

      const found = await service.findOne(created.id);
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
    });

    it('2. Excepción: debe lanzar NotFoundException para un UUID inexistente', async () => {
      await expect(
        service.findOne('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Caso Límite: incluye los datos del Vendor propietario (owner)', async () => {
      const created = await service.create({
        number: '+503 7111-1111',
        owner_id: sampleVendor.id,
      });

      const found = await service.findOne(created.id);
      expect(found.owner).toBeDefined();
      expect(found.owner.username).toBe(sampleVendor.username);
    });
  });

  describe('update()', () => {
    it('1. Happy Path: debe actualizar el número telefónico', async () => {
      const created = await service.create({
        number: '+503 7111-1111',
        owner_id: sampleVendor.id,
      });

      const updated = await service.update(created.id, {
        number: '+503 7222-2222',
      });

      expect(updated.number).toBe('+503 7222-2222');
    });

    it('2. Excepción: debe lanzar NotFoundException si el ID no existe', async () => {
      await expect(
        service.update('00000000-0000-0000-0000-000000000000', {
          number: '+503 7000-0000',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Caso Límite: DTO vacío no altera el registro', async () => {
      const created = await service.create({
        number: '+503 7111-1111',
        owner_id: sampleVendor.id,
      });

      const updated = await service.update(created.id, {});
      expect(updated.number).toBe('+503 7111-1111');
    });
  });

  describe('remove() & recover() (Soft Delete)', () => {
    it('1. Happy Path: remove debe aplicar soft delete', async () => {
      const created = await service.create({
        number: '+503 7111-1111',
        owner_id: sampleVendor.id,
      });

      await service.remove(created.id);

      await expect(service.findOne(created.id)).rejects.toThrow(
        NotFoundException,
      );

      const listWithDeleted = await service.findAll({ withDeleted: 'true' });
      expect(listWithDeleted.length).toBe(1);
      expect(listWithDeleted[0].deletedAt).not.toBeNull();
    });

    it('2. Excepción: remove debe lanzar NotFoundException si el ID no existe', async () => {
      await expect(
        service.remove('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Happy Path: recover debe restaurar el registro eliminado', async () => {
      const created = await service.create({
        number: '+503 7111-1111',
        owner_id: sampleVendor.id,
      });

      await service.remove(created.id);
      const recovered = await service.recover(created.id);

      expect(recovered.deletedAt).toBeNull();

      const normalList = await service.findAll();
      expect(normalList.length).toBe(1);
    });

    it('4. Excepción: recover debe lanzar NotFoundException si el ID no existe', async () => {
      await expect(
        service.recover('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
