import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CustomersService } from './customers.service';
import { Customer } from './entities/customer.entity';

describe('CustomersService (Unit / SQLite in-memory)', () => {
  let service: CustomersService;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Customer],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Customer]),
      ],
      providers: [CustomersService],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    await dataSource.getRepository(Customer).clear();
  });

  describe('create()', () => {
    it('1. Happy Path: debe crear un Customer válido con email normalizado y sin retornar password', async () => {
      const created = await service.create({
        email: '  ANA.PEREZ@EXAMPLE.COM  ',
        password: 'CustomerPass123!',
        name: 'Ana',
        lastname: 'Pérez',
        country: 'El Salvador',
        personal_address: 'Colonia Escalón #123',
      });

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.email).toBe('ana.perez@example.com');
      expect(created.name).toBe('Ana');
      expect(created.lastname).toBe('Pérez');
      expect(created.country).toBe('El Salvador');
      expect(created.personal_address).toBe('Colonia Escalón #123');
      expect(created.password).toBeUndefined();

      // Verificar en base de datos que la contraseña esté hasheada con bcrypt
      const rawCustomer = await dataSource
        .getRepository(Customer)
        .createQueryBuilder('c')
        .addSelect('c.password')
        .where('c.id = :id', { id: created.id })
        .getOne();

      expect(rawCustomer?.password).toBeDefined();
      expect(rawCustomer?.password).not.toBe('CustomerPass123!');
      const isMatch = await bcrypt.compare(
        'CustomerPass123!',
        rawCustomer!.password,
      );
      expect(isMatch).toBe(true);
    });

    it('2. Excepción: debe rechazar la creación si el email ya existe (ConflictException)', async () => {
      await service.create({
        email: 'cliente@example.com',
        password: 'Password123!',
        name: 'Cliente',
        lastname: 'Uno',
        country: 'El Salvador',
        personal_address: 'Dirección 1',
      });

      await expect(
        service.create({
          email: 'CLIENTE@EXAMPLE.COM',
          password: 'AnotherPassword123!',
          name: 'Cliente',
          lastname: 'Dos',
          country: 'Guatemala',
          personal_address: 'Dirección 2',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('3. Excepción: debe rechazar email duplicado incluso si el existente fue soft-deleted', async () => {
      const first = await service.create({
        email: 'eliminado@example.com',
        password: 'Password123!',
        name: 'Cliente',
        lastname: 'Eliminado',
        country: 'El Salvador',
        personal_address: 'Dirección',
      });

      await service.remove(first.id);

      await expect(
        service.create({
          email: 'eliminado@example.com',
          password: 'Password123!',
          name: 'Cliente',
          lastname: 'Nuevo',
          country: 'El Salvador',
          personal_address: 'Dirección',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll()', () => {
    it('1. Happy Path: lista Customers activos ordenados descendentemente', async () => {
      const c1 = await service.create({
        email: 'c1@example.com',
        password: 'Password123!',
        name: 'Ana',
        lastname: 'Pérez',
        country: 'El Salvador',
        personal_address: 'Dir 1',
      });

      // Asegurar fecha anterior para c1 para verificar orden DESC de forma determinista
      await dataSource
        .getRepository(Customer)
        .update(c1.id, { createdAt: new Date(Date.now() - 5000) });

      await service.create({
        email: 'c2@example.com',
        password: 'Password123!',
        name: 'Carlos',
        lastname: 'López',
        country: 'Guatemala',
        personal_address: 'Dir 2',
      });

      const list = await service.findAll();
      expect(list.length).toBe(2);
      expect(list[0].email).toBe('c2@example.com');
      expect(list[1].email).toBe('c1@example.com');
      expect(list[0].password).toBeUndefined();
    });

    it('2. Filtros: filtra por email, name y country', async () => {
      await service.create({
        email: 'ana@example.com',
        password: 'Password123!',
        name: 'Ana',
        lastname: 'Pérez',
        country: 'El Salvador',
        personal_address: 'Dir 1',
      });

      await service.create({
        email: 'carlos@example.com',
        password: 'Password123!',
        name: 'Carlos',
        lastname: 'Gómez',
        country: 'Guatemala',
        personal_address: 'Dir 2',
      });

      const byEmail = await service.findAll({ email: 'ANA@EXAMPLE.COM' });
      expect(byEmail.length).toBe(1);
      expect(byEmail[0].name).toBe('Ana');

      const byName = await service.findAll({ name: 'Carlos' });
      expect(byName.length).toBe(1);
      expect(byName[0].country).toBe('Guatemala');

      const byCountry = await service.findAll({ country: 'El Salvador' });
      expect(byCountry.length).toBe(1);
      expect(byCountry[0].name).toBe('Ana');
    });

    it('3. withDeleted: no incluye eliminados a menos que withDeleted="true"', async () => {
      const c = await service.create({
        email: 'temp@example.com',
        password: 'Password123!',
        name: 'Temporal',
        lastname: 'Pérez',
        country: 'El Salvador',
        personal_address: 'Dir',
      });

      await service.remove(c.id);

      const normalList = await service.findAll();
      expect(normalList.length).toBe(0);

      const withDelList = await service.findAll({ withDeleted: 'true' });
      expect(withDelList.length).toBe(1);
      expect(withDelList[0].deletedAt).not.toBeNull();
    });
  });

  describe('findOne()', () => {
    it('1. Happy Path: retorna Customer por UUID sin password', async () => {
      const created = await service.create({
        email: 'find@example.com',
        password: 'Password123!',
        name: 'Buscar',
        lastname: 'Test',
        country: 'El Salvador',
        personal_address: 'Dir',
      });

      const found = await service.findOne(created.id);
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.email).toBe('find@example.com');
      expect(found.password).toBeUndefined();
    });

    it('2. Excepción: lanza NotFoundException si no existe', async () => {
      await expect(
        service.findOne('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('1. Happy Path: actualiza name, lastname, personal_address', async () => {
      const created = await service.create({
        email: 'update@example.com',
        password: 'Password123!',
        name: 'Nombre Anterior',
        lastname: 'Apellido Anterior',
        country: 'El Salvador',
        personal_address: 'Dir Anterior',
      });

      const updated = await service.update(created.id, {
        name: 'Nombre Nuevo',
        personal_address: 'Dir Nueva',
      });

      expect(updated.name).toBe('Nombre Nuevo');
      expect(updated.lastname).toBe('Apellido Anterior');
      expect(updated.personal_address).toBe('Dir Nueva');
    });

    it('2. Happy Path: actualiza password y la vuelve a hashear', async () => {
      const created = await service.create({
        email: 'pass@example.com',
        password: 'OldPassword123!',
        name: 'Ana',
        lastname: 'Pérez',
        country: 'El Salvador',
        personal_address: 'Dir',
      });

      await service.update(created.id, {
        password: 'NewPassword123!',
      });

      const raw = await dataSource
        .getRepository(Customer)
        .createQueryBuilder('c')
        .addSelect('c.password')
        .where('c.id = :id', { id: created.id })
        .getOne();

      expect(raw?.password).not.toBe('NewPassword123!');
      const isNewMatch = await bcrypt.compare(
        'NewPassword123!',
        raw!.password,
      );
      expect(isNewMatch).toBe(true);
    });

    it('3. Excepción: rechaza actualizar a un email ya existente en otro customer', async () => {
      const c1 = await service.create({
        email: 'cliente1@example.com',
        password: 'Password123!',
        name: 'Cliente1',
        lastname: 'Uno',
        country: 'El Salvador',
        personal_address: 'Dir 1',
      });

      await service.create({
        email: 'cliente2@example.com',
        password: 'Password123!',
        name: 'Cliente2',
        lastname: 'Dos',
        country: 'El Salvador',
        personal_address: 'Dir 2',
      });

      await expect(
        service.update(c1.id, {
          email: 'cliente2@example.com',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove() y recover()', () => {
    it('1. Happy Path: softDelete elimina lógicamente y recover restaura', async () => {
      const created = await service.create({
        email: 'recover@example.com',
        password: 'Password123!',
        name: 'Recover',
        lastname: 'Test',
        country: 'El Salvador',
        personal_address: 'Dir',
      });

      await service.remove(created.id);

      await expect(service.findOne(created.id)).rejects.toThrow(
        NotFoundException,
      );

      const recovered = await service.recover(created.id);
      expect(recovered.deletedAt).toBeNull();

      const foundAfter = await service.findOne(created.id);
      expect(foundAfter).toBeDefined();
      expect(foundAfter.id).toBe(created.id);
    });

    it('2. Caso Límite: recover en cliente activo lo devuelve sin cambios', async () => {
      const created = await service.create({
        email: 'active@example.com',
        password: 'Password123!',
        name: 'Activo',
        lastname: 'Test',
        country: 'El Salvador',
        personal_address: 'Dir',
      });

      const recovered = await service.recover(created.id);
      expect(recovered.deletedAt).toBeNull();
      expect(recovered.id).toBe(created.id);
    });

    it('3. Excepción: remove y recover lanzan NotFoundException para ID inexistente', async () => {
      await expect(
        service.remove('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);

      await expect(
        service.recover('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
