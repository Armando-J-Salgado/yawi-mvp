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
import { Business } from '../../businesses/entities/business.entity';

@Entity('products')
export class Product {
  @ApiProperty({
    description: 'Identificador único (UUID v4)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID del Business al que pertenece el producto',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @Column()
  business_id: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Café molido artesanal',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Etiquetas o categorías del producto',
    example: ['café', 'artesanal', 'orgánico'],
    type: [String],
    default: [],
  })
  @Column({ type: 'simple-json', default: '[]' })
  tags: string[];

  @ApiProperty({
    description: 'URLs de imágenes del producto (máximo 4)',
    example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    nullable: true,
    required: false,
    type: [String],
  })
  @Column({ type: 'simple-json', nullable: true })
  images_urls: string[] | null;

  @ApiProperty({
    description:
      'Propiedades o atributos variables del producto en formato JSON libre',
    example: { weight: '500g', origin: 'El Salvador', roast: 'medium' },
    required: false,
    default: {},
  })
  @Column({ type: 'simple-json', default: '{}' })
  properties: Record<string, any>;

  @ApiProperty({
    description: 'Precio decimal no negativo del producto en USD',
    example: 8.5,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({
    description: 'Business al que pertenece el producto',
    type: () => Business,
  })
  @ManyToOne(() => Business, {
    onDelete: 'CASCADE',
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

  @ApiProperty({
    description: 'Fecha de eliminación lógica (Soft Delete)',
    example: null,
    nullable: true,
  })
  @DeleteDateColumn()
  deletedAt: Date;
}
