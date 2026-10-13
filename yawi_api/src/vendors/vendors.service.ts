import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Vendor } from './entities/vendor.entity';
import { PhoneNumber } from '../phone-numbers/entities/phone-number.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { FilterVendorDto } from './dto/filter-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crea un Vendor y su PhoneNumber inicial de forma atómica en una transacción.
   */
  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    const { phone_number, password, birthdate, ...vendorData } =
      createVendorDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    return await this.dataSource.transaction(async (manager) => {
      const vendorRepo = manager.getRepository(Vendor);
      const phoneRepo = manager.getRepository(PhoneNumber);

      try {
        const vendor = vendorRepo.create({
          ...vendorData,
          birthdate: new Date(birthdate),
          password: hashedPassword,
        });
        const savedVendor = await vendorRepo.save(vendor);

        const phone = phoneRepo.create({
          number: phone_number,
          owner_id: savedVendor.id,
        });
        await phoneRepo.save(phone);

        // Retorna el vendor con sus relaciones cargadas
        const completeVendor = await vendorRepo.findOne({
          where: { id: savedVendor.id },
          relations: { phone_numbers: true },
        });

        return completeVendor!;
      } catch (error: any) {
        if (
          error.code === '23505' ||
          error.message?.includes('UNIQUE constraint failed')
        ) {
          throw new ConflictException(
            'Ya existe un vendedor con el mismo username, DUI o NIT.',
          );
        }
        if (
          error instanceof ConflictException ||
          error instanceof NotFoundException
        ) {
          throw error;
        }
        throw new InternalServerErrorException(
          error.message || 'Error al crear el vendedor y su número telefónico.',
        );
      }
    });
  }

  /**
   * Lista vendors aplicando filtros dinámicos (sin Queries directas) y soporte para soft delete.
   */
  async findAll(filters?: FilterVendorDto): Promise<Vendor[]> {
    const where: FindOptionsWhere<Vendor> = {};

    if (filters?.name) where.name = filters.name;
    if (filters?.surname) where.surname = filters.surname;
    if (filters?.country) where.country = filters.country;
    if (filters?.DUI) where.DUI = filters.DUI;
    if (filters?.NIT) where.NIT = filters.NIT;
    if (filters?.username) where.username = filters.username;

    const withDeleted = filters?.withDeleted === 'true';

    return await this.vendorRepository.find({
      where,
      withDeleted,
      relations: {
        phone_numbers: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Retorna un vendor por ID incluyendo sus números de teléfono asociados.
   */
  async findOne(id: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({
      where: { id },
      relations: {
        phone_numbers: true,
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor con ID '${id}' no encontrado.`);
    }

    return vendor;
  }

  /**
   * Actualiza los datos de un Vendor parcialmente.
   */
  async update(id: string, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.findOne(id);

    const { birthdate, password, ...restDto } = updateVendorDto;
    const updatePayload: Partial<Vendor> = { ...restDto };

    if (birthdate) {
      updatePayload.birthdate = new Date(birthdate);
    }

    if (password) {
      updatePayload.password = await bcrypt.hash(password, 10);
    }

    try {
      await this.vendorRepository.save({
        ...vendor,
        ...updatePayload,
      });

      return await this.findOne(id);
    } catch (error: any) {
      if (
        error.code === '23505' ||
        error.message?.includes('UNIQUE constraint failed')
      ) {
        throw new ConflictException(
          'Ya existe un vendedor con el mismo username, DUI o NIT.',
        );
      }
      throw error;
    }
  }

  /**
   * Eliminación lógica (Soft Delete) de un Vendor.
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.vendorRepository.softDelete(id);
  }

  /**
   * Recupera un Vendor previamente eliminado con Soft Delete.
   */
  async recover(id: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: {
        phone_numbers: true,
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor con ID '${id}' no encontrado.`);
    }

    if (!vendor.deletedAt) {
      return vendor;
    }

    await this.vendorRepository.restore(id);

    return await this.findOne(id);
  }
}
