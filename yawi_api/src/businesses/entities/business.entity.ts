import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Vendor } from '../../vendors/entities/vendor.entity';

@Entity('businesses')
export class Business {
  @ApiProperty({
    description: 'Identificador único (UUID v4)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nombre del negocio',
    example: 'Tienda El Buen Precio',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Descripción del negocio',
    example: 'Tienda de artículos para el hogar con envío a domicilio.',
  })
  @Column()
  description: string;

  @ApiProperty({
    description: 'Dirección física del negocio',
    example: 'Av. Independencia #456, Centro Histórico, San Salvador',
  })
  @Column()
  address: string;

  @ApiProperty({
    description: 'Balance actual del negocio en USD (precisión decimal 10,2)',
    example: 1500.5,
    default: 0.0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  balance: number;

  @ApiProperty({
    description: 'ID del Vendor propietario (Foreign Key UUID)',
    example: 'd3b07384-d113-4089-a292-1262d088a2a8',
  })
  @Column()
  owner_id: string;

  @ApiProperty({
    description: 'Entidad Vendor propietaria',
    type: () => Vendor,
  })
  @ManyToOne(() => Vendor, (vendor) => vendor.businesses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_id' })
  owner: Vendor;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2026-09-23T15:30:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2026-09-23T15:30:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Fecha de eliminación lógica (Soft Delete)',
    example: null,
    nullable: true,
  })
  @DeleteDateColumn()
  deletedAt: Date;
}
