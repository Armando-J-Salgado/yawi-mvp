import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';

@Entity('customers')
export class Customer {
  @ApiProperty({
    description: 'Identificador único (UUID v4)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Correo electrónico único del cliente',
    example: 'cliente@example.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiHideProperty()
  @Column({ select: false })
  password: string;

  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Ana',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Apellido del cliente',
    example: 'Pérez',
  })
  @Column()
  lastname: string;

  @ApiProperty({
    description: 'País de residencia',
    example: 'El Salvador',
  })
  @Column()
  country: string;

  @ApiProperty({
    description: 'Dirección personal o de entrega',
    example: 'Colonia Escalón, Calle El Mirador #123, San Salvador',
  })
  @Column()
  personal_address: string;

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
