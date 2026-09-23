import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PhoneNumber } from '../../phone-numbers/entities/phone-number.entity';

@Entity('vendors')
export class Vendor {
  @ApiProperty({
    description: 'Identificador único (UUID v4)',
    example: 'd3b07384-d113-4089-a292-1262d088a2a8',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nombre de usuario único para acceso',
    example: 'jperez',
  })
  @Column({ unique: true })
  username: string;

  @ApiProperty({
    description: 'Contraseña hasheada (bcrypt)',
    example: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
  })
  @Column()
  password: string;

  @ApiProperty({
    description: 'Primer nombre del vendedor',
    example: 'Juan',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Primer apellido del vendedor',
    example: 'Pérez',
  })
  @Column()
  surname: string;

  @ApiProperty({
    description: 'Segundo nombre (opcional)',
    example: 'Carlos',
    required: false,
    nullable: true,
  })
  @Column({ nullable: true })
  lastname?: string;

  @ApiProperty({
    description: 'Segundo apellido (opcional)',
    example: 'López',
    required: false,
    nullable: true,
  })
  @Column({ nullable: true })
  second_lastname?: string;

  @ApiProperty({
    description: 'Fecha de nacimiento (formato ISO/YYYY-MM-DD)',
    example: '1990-05-15',
  })
  @Column({ type: 'date' })
  birthdate: Date;

  @ApiProperty({
    description: 'País de residencia',
    example: 'El Salvador',
  })
  @Column()
  country: string;

  @ApiProperty({
    description: 'Dirección de residencia personal',
    example: 'Colonia Escalón, Calle El Mirador #123, San Salvador',
  })
  @Column()
  personal_address: string;

  @ApiProperty({
    description: 'Documento Único de Identidad (DUI) salvadoreño único',
    example: '01234567-8',
  })
  @Column({ unique: true })
  DUI: string;

  @ApiProperty({
    description: 'Número de Identificación Tributaria (NIT) único',
    example: '0614-150590-101-0',
  })
  @Column({ unique: true })
  NIT: string;

  @ApiProperty({
    description: 'Lista de números telefónicos asociados',
    type: () => [PhoneNumber],
  })
  @OneToMany(() => PhoneNumber, (phone) => phone.owner)
  phone_numbers: PhoneNumber[];

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
