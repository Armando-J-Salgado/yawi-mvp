import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { Business } from '../../businesses/entities/business.entity';

@Entity('order_products')
@Unique(['order_id', 'product_id'])
export class OrderProduct {
  @ApiProperty({
    description: 'Identificador único (UUID v4)',
    example: 'c1d2e3f4-a5b6-47c8-d9e0-f1a2b3c4d5e6',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID de la Order a la que pertenece esta línea',
    example: 'b1c2d3e4-f5a6-47b8-c9d0-e1f2a3b4c5d6',
  })
  @Column()
  @Index()
  order_id: string;

  @ApiProperty({
    description: 'ID del Product (referencia histórica)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @Column()
  product_id: string;

  @ApiProperty({
    description: 'ID del Business al que pertenece el Product (snapshot)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @Column()
  @Index()
  business_id: string;

  @ApiProperty({
    description: 'Nombre del producto al momento de la compra (snapshot)',
    example: 'Café Pacamara Especial',
  })
  @Column()
  product_name: string;

  @ApiProperty({
    description: 'Precio unitario al momento de la compra (snapshot)',
    example: 12.0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: number;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 2,
  })
  @Column({ type: 'integer' })
  quantity: number;

  @ApiProperty({
    description: 'Subtotal de la línea (unit_price * quantity)',
    example: 24.0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Business, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'business_id' })
  business: Business;

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
}
