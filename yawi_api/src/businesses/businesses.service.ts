import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Business } from './entities/business.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { FilterBusinessDto } from './dto/filter-business.dto';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {}

  /**
   * Crea un nuevo Business verificando previamente la existencia del Vendor propietario.
   */
  async create(createBusinessDto: CreateBusinessDto): Promise<Business> {
    const { owner_id } = createBusinessDto;

    const vendor = await this.vendorRepository.findOne({
      where: { id: owner_id },
    });

    if (!vendor) {
      throw new NotFoundException(
        `No se puede crear el negocio: Vendor con ID '${owner_id}' no encontrado.`,
      );
    }

    const business = this.businessRepository.create(createBusinessDto);
    const savedBusiness = await this.businessRepository.save(business);

    return (await this.businessRepository.findOne({
      where: { id: savedBusiness.id },
      relations: { owner: true },
    }))!;
  }

  /**
   * Lista negocios con filtros opcionales y soporte para soft delete.
   */
  async findAll(filters?: FilterBusinessDto): Promise<Business[]> {
    const where: FindOptionsWhere<Business> = {};

    if (filters?.name) where.name = filters.name;
    if (filters?.address) where.address = filters.address;
    if (filters?.owner_id) where.owner_id = filters.owner_id;

    const withDeleted = filters?.withDeleted === 'true';

    return await this.businessRepository.find({
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
   * Retorna un Business por ID con su Vendor propietario.
   */
  async findOne(id: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: {
        owner: true,
      },
    });

    if (!business) {
      throw new NotFoundException(`Business con ID '${id}' no encontrado.`);
    }

    return business;
  }

  /**
   * Actualiza los datos de un Business parcialmente.
   */
  async update(
    id: string,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<Business> {
    const business = await this.findOne(id);

    await this.businessRepository.save({
      ...business,
      ...updateBusinessDto,
    });

    return await this.findOne(id);
  }

  /**
   * Eliminación lógica (Soft Delete) de un Business.
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.businessRepository.softDelete(id);
  }

  /**
   * Recupera un Business previamente eliminado de forma lógica.
   */
  async recover(id: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: {
        owner: true,
      },
    });

    if (!business) {
      throw new NotFoundException(`Business con ID '${id}' no encontrado.`);
    }

    if (!business.deletedAt) {
      return business;
    }

    await this.businessRepository.restore(id);

    return await this.findOne(id);
  }
}
