import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { PaymentPreference } from './entities/payment-preference.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { CreatePaymentPreferenceDto } from './dto/create-payment-preference.dto';
import { UpdatePaymentPreferenceDto } from './dto/update-payment-preference.dto';
import { FilterPaymentPreferenceDto } from './dto/filter-payment-preference.dto';

@Injectable()
export class PaymentPreferencesService {
  constructor(
    @InjectRepository(PaymentPreference)
    private readonly paymentPreferenceRepository: Repository<PaymentPreference>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {}

  /**
   * Crea una nueva PaymentPreference verificando previamente la existencia del Vendor propietario.
   */
  async create(
    createPaymentPreferenceDto: CreatePaymentPreferenceDto,
  ): Promise<PaymentPreference> {
    const { owner_id } = createPaymentPreferenceDto;

    const vendor = await this.vendorRepository.findOne({
      where: { id: owner_id },
    });

    if (!vendor) {
      throw new NotFoundException(
        `No se puede crear la preferencia de pago: Vendor con ID '${owner_id}' no encontrado.`,
      );
    }

    const preference = this.paymentPreferenceRepository.create(
      createPaymentPreferenceDto,
    );
    const saved = await this.paymentPreferenceRepository.save(preference);

    return (await this.paymentPreferenceRepository.findOne({
      where: { id: saved.id },
      relations: { owner: true },
    }))!;
  }

  /**
   * Lista preferencias de pago con filtros opcionales y soporte para soft delete.
   */
  async findAll(
    filters?: FilterPaymentPreferenceDto,
  ): Promise<PaymentPreference[]> {
    const where: FindOptionsWhere<PaymentPreference> = {};

    if (filters?.name) where.name = filters.name;
    if (filters?.owner_id) where.owner_id = filters.owner_id;

    const withDeleted = filters?.withDeleted === 'true';

    return await this.paymentPreferenceRepository.find({
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
   * Retorna una PaymentPreference por ID con su Vendor propietario.
   */
  async findOne(id: string): Promise<PaymentPreference> {
    const preference = await this.paymentPreferenceRepository.findOne({
      where: { id },
      relations: {
        owner: true,
      },
    });

    if (!preference) {
      throw new NotFoundException(
        `PaymentPreference con ID '${id}' no encontrada.`,
      );
    }

    return preference;
  }

  /**
   * Actualiza los datos de una PaymentPreference parcialmente.
   */
  async update(
    id: string,
    updatePaymentPreferenceDto: UpdatePaymentPreferenceDto,
  ): Promise<PaymentPreference> {
    const preference = await this.findOne(id);

    await this.paymentPreferenceRepository.save({
      ...preference,
      ...updatePaymentPreferenceDto,
    });

    return await this.findOne(id);
  }

  /**
   * Eliminación lógica (Soft Delete) de una PaymentPreference.
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.paymentPreferenceRepository.softDelete(id);
  }

  /**
   * Recupera una PaymentPreference previamente eliminada de forma lógica.
   */
  async recover(id: string): Promise<PaymentPreference> {
    const preference = await this.paymentPreferenceRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: {
        owner: true,
      },
    });

    if (!preference) {
      throw new NotFoundException(
        `PaymentPreference con ID '${id}' no encontrada.`,
      );
    }

    if (!preference.deletedAt) {
      return preference;
    }

    await this.paymentPreferenceRepository.restore(id);

    return await this.findOne(id);
  }
}
