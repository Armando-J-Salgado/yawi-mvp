import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { FilterCustomerDto } from './dto/filter-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  /**
   * Crea un nuevo Customer con contraseña hasheada y email normalizado.
   */
  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const normalizedEmail = createCustomerDto.email.trim().toLowerCase();

    // Validar unicidad previa incluyendo registros soft-deleted
    const existing = await this.customerRepository.findOne({
      where: { email: normalizedEmail },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe un cliente con el mismo correo electrónico.',
      );
    }

    const hashedPassword = await bcrypt.hash(createCustomerDto.password, 10);

    const customer = this.customerRepository.create({
      ...createCustomerDto,
      email: normalizedEmail,
      password: hashedPassword,
    });

    try {
      const saved = await this.customerRepository.save(customer);
      return (await this.findOne(saved.id))!;
    } catch (error: any) {
      if (
        error.code === '23505' ||
        error.message?.includes('UNIQUE constraint failed')
      ) {
        throw new ConflictException(
          'Ya existe un cliente con el mismo correo electrónico.',
        );
      }
      throw error;
    }
  }

  /**
   * Lista Customers aplicando filtros opcionales y soporte para soft delete.
   */
  async findAll(filters?: FilterCustomerDto): Promise<Customer[]> {
    const where: FindOptionsWhere<Customer> = {};

    if (filters?.email) where.email = filters.email.trim().toLowerCase();
    if (filters?.name) where.name = filters.name;
    if (filters?.country) where.country = filters.country;

    const withDeleted = filters?.withDeleted === 'true';

    return await this.customerRepository.find({
      where,
      withDeleted,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Retorna un Customer activo por UUID.
   */
  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer con ID '${id}' no encontrado.`);
    }

    return customer;
  }

  /**
   * Actualiza parcialmente un Customer.
   */
  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.findOne(id);

    const { password, email, ...rest } = updateCustomerDto;
    const updatePayload: Partial<Customer> = { ...rest };

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== customer.email) {
        const existing = await this.customerRepository.findOne({
          where: { email: normalizedEmail },
          withDeleted: true,
        });

        if (existing && existing.id !== id) {
          throw new ConflictException(
            'Ya existe un cliente con el mismo correo electrónico.',
          );
        }
        updatePayload.email = normalizedEmail;
      }
    }

    if (password) {
      updatePayload.password = await bcrypt.hash(password, 10);
    }

    try {
      await this.customerRepository.save({
        ...customer,
        ...updatePayload,
      });

      return await this.findOne(id);
    } catch (error: any) {
      if (
        error.code === '23505' ||
        error.message?.includes('UNIQUE constraint failed')
      ) {
        throw new ConflictException(
          'Ya existe un cliente con el mismo correo electrónico.',
        );
      }
      throw error;
    }
  }

  /**
   * Eliminación lógica (Soft Delete) de un Customer.
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.customerRepository.softDelete(id);
  }

  /**
   * Recupera un Customer previamente eliminado de forma lógica.
   */
  async recover(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!customer) {
      throw new NotFoundException(`Customer con ID '${id}' no encontrado.`);
    }

    if (!customer.deletedAt) {
      return customer;
    }

    await this.customerRepository.restore(id);

    return await this.findOne(id);
  }
}
