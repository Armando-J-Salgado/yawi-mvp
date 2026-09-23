import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Vendor } from '../vendors/entities/vendor.entity';
import { PhoneNumber } from '../phone-numbers/entities/phone-number.entity';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Verifica si la base de datos no contiene registros de vendors (activos o eliminados).
   */
  async isDatabaseEmpty(): Promise<boolean> {
    const vendorRepo = this.dataSource.getRepository(Vendor);
    const count = await vendorRepo.count({ withDeleted: true });
    return count === 0;
  }

  /**
   * Inserta un conjunto de datos iniciales (seed) de prueba si la base de datos está vacía.
   */
  async seed(): Promise<void> {
    const isEmpty = await this.isDatabaseEmpty();
    if (!isEmpty) {
      this.logger.log('Database is not empty. Seeding skipped.');
      return;
    }

    this.logger.log('Seeding initial data into database...');

    const defaultPassword = await bcrypt.hash('SecureVendorPass123!', 10);

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
    });

    this.logger.log(
      '✅ Database seeded successfully with 3 vendors and their phone numbers.',
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
          'TRUNCATE TABLE "phone_numbers", "vendors" RESTART IDENTITY CASCADE;',
        );
      } else {
        // SQLite o fallback genérico
        const phoneRepo = this.dataSource.getRepository(PhoneNumber);
        const vendorRepo = this.dataSource.getRepository(Vendor);
        await phoneRepo.createQueryBuilder().delete().execute();
        await vendorRepo.createQueryBuilder().delete().execute();
      }
      this.logger.log('✅ Database cleared successfully.');
    } catch (error) {
      this.logger.error('Error clearing database', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
