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

@Entity('payment_preferences')
export class PaymentPreference {
  @ApiProperty({
    description: 'Identificador único (UUID v4)',
    example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nombre descriptivo de la preferencia de pago',
    example: 'Transferencia Banco Agrícola',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Información de la cuenta en formato JSON (puede ser null)',
    example: {
      bank: 'Banco Agrícola',
      account_number: '1234567890',
      type: 'Ahorro',
    },
    nullable: true,
    required: false,
  })
  @Column({ type: 'simple-json', nullable: true })
  account_information: Record<string, any> | null;

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
  @ManyToOne(() => Vendor, (vendor) => vendor.payment_preferences, {
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
