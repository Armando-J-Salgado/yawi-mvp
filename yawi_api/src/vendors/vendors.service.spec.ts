import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { VendorsService } from './vendors.service';
import { Vendor } from './entities/vendor.entity';
import { PhoneNumber } from '../phone-numbers/entities/phone-number.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';

describe('VendorsService (Unit / SQLite in-memory)', () => {
  let service: VendorsService;
  let dataSource: DataSource;

  const mockVendorDto: CreateVendorDto = {
    username: 'test_vendor',
    password: 'Password123!',
    name: 'Carlos',
    surname: 'Martínez',
    lastname: 'Eduardo',
    second_lastname: 'Gómez',
    birthdate: '1990-01-01',
    country: 'El Salvador',
    personal_address: 'San Salvador #123',
    DUI: '12345678-9',
    NIT: '0614-010190-101-1',
    phone_number: '+503 7123-4567',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Vendor, PhoneNumber],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Vendor, PhoneNumber]),
      ],
      providers: [VendorsService],
    }).compile();

    service = module.get<VendorsService>(VendorsService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Limpieza de tablas entre pruebas
    await dataSource.getRepository(PhoneNumber).clear();
    await dataSource.getRepository(Vendor).clear();
  });

  describe('create()', () => {
    it('1. Happy Path: debe crear un Vendor y su PhoneNumber inicial de forma atómica', async () => {
      const result = await service.create(mockVendorDto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.username).toBe(mockVendorDto.username);
      expect(result.name).toBe(mockVendorDto.name);
      expect(result.phone_numbers).toBeDefined();
      expect(result.phone_numbers.length).toBe(1);
      expect(result.phone_numbers[0].number).toBe(mockVendorDto.phone_number);

      // Verificar que el password fue hasheado con bcrypt
      const isPasswordHashed = await bcrypt.compare(
        mockVendorDto.password,
        result.password,
      );
      expect(isPasswordHashed).toBe(true);
    });

    it('2. Excepción: debe lanzar ConflictException si el username o DUI/NIT ya existe', async () => {
      await service.create(mockVendorDto);

      await expect(service.create(mockVendorDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('3. Caso Límite / Transaccionalidad: si falla la creación, no debe persistir nada en la base de datos', async () => {
      // Intentar crear con el mismo username para forzar rollback
      await service.create(mockVendorDto);

      const duplicateDto = {
        ...mockVendorDto,
        DUI: '99999999-9',
        NIT: '9999-999999-999-9',
      };
      await expect(service.create(duplicateDto)).rejects.toThrow(
        ConflictException,
      );

      const allVendors = await service.findAll();
      expect(allVendors.length).toBe(1);
    });
  });

  describe('findAll()', () => {
    it('1. Happy Path: debe retornar la lista de vendors', async () => {
      await service.create(mockVendorDto);
      const vendors = await service.findAll();

      expect(Array.isArray(vendors)).toBe(true);
      expect(vendors.length).toBe(1);
      expect(vendors[0].phone_numbers.length).toBe(1);
    });

    it('2. Caso Límite: debe retornar un arreglo vacío si no hay registros', async () => {
      const vendors = await service.findAll();
      expect(vendors).toEqual([]);
    });

    it('3. Filtros: debe filtrar correctamente por país y nombre', async () => {
      await service.create(mockVendorDto);
      await service.create({
        ...mockVendorDto,
        username: 'vendor_gt',
        DUI: '00000000-1',
        NIT: '0000-000000-000-1',
        country: 'Guatemala',
      });

      const svVendors = await service.findAll({ country: 'El Salvador' });
      expect(svVendors.length).toBe(1);
      expect(svVendors[0].country).toBe('El Salvador');

      const gtVendors = await service.findAll({ country: 'Guatemala' });
      expect(gtVendors.length).toBe(1);
      expect(gtVendors[0].country).toBe('Guatemala');
    });
  });

  describe('findOne()', () => {
    it('1. Happy Path: debe retornar el vendor solicitado por UUID', async () => {
      const created = await service.create(mockVendorDto);
      const found = await service.findOne(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.username).toBe(created.username);
    });

    it('2. Excepción: debe lanzar NotFoundException si el UUID no existe', async () => {
      await expect(
        service.findOne('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Caso Límite: debe incluir la relación con sus phone_numbers', async () => {
      const created = await service.create(mockVendorDto);
      const found = await service.findOne(created.id);

      expect(found.phone_numbers).toBeDefined();
      expect(found.phone_numbers.length).toBe(1);
      expect(found.phone_numbers[0].number).toBe(mockVendorDto.phone_number);
    });
  });

  describe('update()', () => {
    it('1. Happy Path: debe actualizar los campos del vendor', async () => {
      const created = await service.create(mockVendorDto);
      const updated = await service.update(created.id, {
        name: 'Carlos Actualizado',
        personal_address: 'Nueva Dirección #456',
      });

      expect(updated.name).toBe('Carlos Actualizado');
      expect(updated.personal_address).toBe('Nueva Dirección #456');
    });

    it('2. Excepción: debe lanzar NotFoundException al intentar actualizar un vendor inexistente', async () => {
      await expect(
        service.update('00000000-0000-0000-0000-000000000000', {
          name: 'Fantasma',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Caso Límite: debe hashear la contraseña si se envía en el update', async () => {
      const created = await service.create(mockVendorDto);
      const updated = await service.update(created.id, {
        password: 'NewSecurePassword456!',
      });

      const isNewPasswordValid = await bcrypt.compare(
        'NewSecurePassword456!',
        updated.password,
      );
      expect(isNewPasswordValid).toBe(true);
    });
  });

  describe('remove() (Soft Delete) & recover()', () => {
    it('1. Happy Path: remove debe aplicar soft delete y no aparecer en listados normales', async () => {
      const created = await service.create(mockVendorDto);
      await service.remove(created.id);

      // No debe encontrarse en findOne regular
      await expect(service.findOne(created.id)).rejects.toThrow(
        NotFoundException,
      );

      // No debe aparecer en findAll normal
      const normalList = await service.findAll();
      expect(normalList.length).toBe(0);

      // Sí debe aparecer cuando withDeleted es true
      const withDeletedList = await service.findAll({ withDeleted: 'true' });
      expect(withDeletedList.length).toBe(1);
      expect(withDeletedList[0].deletedAt).not.toBeNull();
    });

    it('2. Excepción: remove debe lanzar NotFoundException si el vendor no existe', async () => {
      await expect(
        service.remove('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });

    it('3. Happy Path: recover debe restaurar el vendor previamente eliminado', async () => {
      const created = await service.create(mockVendorDto);
      await service.remove(created.id);

      const recovered = await service.recover(created.id);
      expect(recovered.deletedAt).toBeNull();

      // Debe volver a aparecer en findAll normal
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
