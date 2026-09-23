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

@Entity('phone_numbers')
export class PhoneNumber {
  @ApiProperty({
    description: 'Identificador único (UUID v4)',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Número telefónico en formato estándar o internacional',
    example: '+503 7777-8888',
  })
  @Column()
  number: string;

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
  @ManyToOne(() => Vendor, (vendor) => vendor.phone_numbers, {
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
