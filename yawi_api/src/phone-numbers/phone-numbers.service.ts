import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { PhoneNumber } from './entities/phone-number.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { CreatePhoneNumberDto } from './dto/create-phone-number.dto';
import { UpdatePhoneNumberDto } from './dto/update-phone-number.dto';
import { FilterPhoneNumberDto } from './dto/filter-phone-number.dto';

@Injectable()
export class PhoneNumbersService {
  constructor(
    @InjectRepository(PhoneNumber)
    private readonly phoneRepository: Repository<PhoneNumber>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {}

  /**
   * Crea un nuevo PhoneNumber verificando previamente la existencia del Vendor propietario.
   */
  async create(
    createPhoneNumberDto: CreatePhoneNumberDto,
  ): Promise<PhoneNumber> {
    const { owner_id, number } = createPhoneNumberDto;

    const vendor = await this.vendorRepository.findOne({
      where: { id: owner_id },
    });

    if (!vendor) {
      throw new NotFoundException(
        `No se puede asociar el número: Vendor con ID '${owner_id}' no encontrado.`,
      );
    }

    const phoneNumber = this.phoneRepository.create({
      number,
      owner_id,
    });

    const savedPhone = await this.phoneRepository.save(phoneNumber);

    return (await this.phoneRepository.findOne({
      where: { id: savedPhone.id },
      relations: { owner: true },
    }))!;
  }

  /**
   * Lista números telefónicos con filtros opcionales y soporte para soft delete.
   */
  async findAll(filters?: FilterPhoneNumberDto): Promise<PhoneNumber[]> {
    const where: FindOptionsWhere<PhoneNumber> = {};

    if (filters?.number) where.number = filters.number;
    if (filters?.owner_id) where.owner_id = filters.owner_id;

    const withDeleted = filters?.withDeleted === 'true';

    return await this.phoneRepository.find({
      where,
      withDeleted,
      relations: {
        owner: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Retorna un PhoneNumber por ID con su Vendor propietario asociado.
   */
  async findOne(id: string): Promise<PhoneNumber> {
    const phoneNumber = await this.phoneRepository.findOne({
      where: { id },
      relations: {
        owner: true,
      },
    });

    if (!phoneNumber) {
      throw new NotFoundException(`PhoneNumber con ID '${id}' no encontrado.`);
    }

    return phoneNumber;
  }

  /**
   * Actualiza los datos de un PhoneNumber parcialmente.
   */
  async update(
    id: string,
    updatePhoneNumberDto: UpdatePhoneNumberDto,
  ): Promise<PhoneNumber> {
    const phone = await this.findOne(id);

    await this.phoneRepository.save({
      ...phone,
      ...updatePhoneNumberDto,
    });

    return await this.findOne(id);
  }

  /**
   * Eliminación lógica (Soft Delete) de un PhoneNumber.
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.phoneRepository.softDelete(id);
  }

  /**
   * Recupera un PhoneNumber previamente eliminado de forma lógica.
   */
  async recover(id: string): Promise<PhoneNumber> {
    const phone = await this.phoneRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: {
        owner: true,
      },
    });

    if (!phone) {
      throw new NotFoundException(`PhoneNumber con ID '${id}' no encontrado.`);
    }

    if (!phone.deletedAt) {
      return phone;
    }

    await this.phoneRepository.restore(id);

    return await this.findOne(id);
  }
}
