import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Customer } from '../../customers/entities/customer.entity';
import { OrderProduct } from './order-product.entity';
import { OrderStatus } from '../interfaces/order-status.interface';

@Entity('orders')
export class Order {
  @ApiProperty({
    description: 'Identificador único (UUID v4)',
    example: 'b1c2d3e4-f5a6-47b8-c9d0-e1f2a3b4c5d6',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID del Customer que realizó la compra',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @Column()
  @Index()
  customer_id: string;

  @ApiProperty({
    description: 'Dirección de entrega',
    example: 'Colonia Escalón, San Salvador',
  })
  @Column()
  delivery_address: string;

  @ApiProperty({
    description: 'Estado actual de la Order',
    example: 'pending',
    enum: OrderStatus,
  })
  @Column({ type: 'varchar', default: OrderStatus.PENDING })
  @Index()
  status: OrderStatus;

  @ApiProperty({
    description: 'Suma de subtotales de las líneas',
    example: 29.0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @ApiProperty({
    description: 'Cargo de envío (fijo $10.00 en MVP)',
    example: 10.0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  shipping_fee: number;

  @ApiProperty({
    description: 'Total de la Order (subtotal + shipping_fee)',
    example: 39.0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @ApiProperty({
    description: 'Customer que realizó la compra',
    type: () => Customer,
  })
  @ManyToOne(() => Customer, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ApiProperty({
    description: 'Líneas de productos de la Order',
    type: () => [OrderProduct],
  })
  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  items: OrderProduct[];

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2026-10-10T12:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del registro',
    example: '2026-10-10T12:00:00.000Z',
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
