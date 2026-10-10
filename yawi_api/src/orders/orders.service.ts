import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, DataSource, In } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderProduct } from './entities/order-product.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import {
  OrderStatus,
  VALID_TRANSITIONS,
  SHIPPING_FEE,
} from './interfaces/order-status.interface';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderProduct)
    private readonly orderProductRepository: Repository<OrderProduct>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crea una Order con sus líneas de forma transaccional.
   * Calcula precios, subtotales, shipping_fee y total en backend.
   * Guarda snapshots de product_name, unit_price y business_id.
   */
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const { customer_id, delivery_address, items } = createOrderDto;

    // 1. Verificar Customer activo
    const customer = await this.customerRepository.findOne({
      where: { id: customer_id },
    });
    if (!customer) {
      throw new NotFoundException(
        `Customer con ID '${customer_id}' no encontrado.`,
      );
    }

    // 2. Rechazar Product IDs duplicados
    const productIds = items.map((item) => item.product_id);
    const uniqueIds = new Set(productIds);
    if (uniqueIds.size !== productIds.length) {
      throw new BadRequestException(
        'No se permiten Product IDs duplicados en la misma Order.',
      );
    }

    // 3. Cargar Products activos en una sola operación
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: { business: true },
    });

    // 4. Confirmar que se encontraron todos los Products solicitados
    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missingIds = productIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(
        `Products no encontrados o eliminados: ${missingIds.join(', ')}`,
      );
    }

    // Mapear products por ID para acceso rápido
    const productMap = new Map(products.map((p) => [p.id, p]));

    // 5. Ejecutar la creación dentro de una transacción
    return await this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const orderProductRepo = manager.getRepository(OrderProduct);

      // Calcular líneas y subtotal global
      let orderSubtotal = 0;
      const orderProductsData: Partial<OrderProduct>[] = [];

      for (const item of items) {
        const product = productMap.get(item.product_id)!;
        const unitPrice = Number(product.price);
        const lineSubtotal = Math.round(unitPrice * item.quantity * 100) / 100;

        orderProductsData.push({
          product_id: product.id,
          business_id: product.business_id,
          product_name: product.name,
          unit_price: unitPrice,
          quantity: item.quantity,
          subtotal: lineSubtotal,
        });

        orderSubtotal = Math.round((orderSubtotal + lineSubtotal) * 100) / 100;
      }

      const shippingFee = SHIPPING_FEE;
      const total = Math.round((orderSubtotal + shippingFee) * 100) / 100;

      // Crear la Order
      const order = orderRepo.create({
        customer_id,
        delivery_address,
        status: OrderStatus.PENDING,
        subtotal: orderSubtotal,
        shipping_fee: shippingFee,
        total,
      });
      const savedOrder = await orderRepo.save(order);

      // Crear las líneas de OrderProduct
      for (const opData of orderProductsData) {
        const orderProduct = orderProductRepo.create({
          ...opData,
          order_id: savedOrder.id,
        });
        await orderProductRepo.save(orderProduct);
      }

      // Recargar la Order con sus relaciones
      return (await orderRepo.findOne({
        where: { id: savedOrder.id },
        relations: { items: true, customer: true },
      }))!;
    });
  }

  /**
   * Lista Orders con filtros opcionales. Ordena por createdAt DESC.
   */
  async findAll(filters?: FilterOrderDto): Promise<Order[]> {
    const where: FindOptionsWhere<Order> = {};

    if (filters?.customer_id) where.customer_id = filters.customer_id;
    if (filters?.status) where.status = filters.status;

    const withDeleted = filters?.withDeleted === 'true';

    return await this.orderRepository.find({
      where,
      withDeleted,
      relations: { items: true, customer: true },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Retorna una Order activa por UUID con sus líneas.
   */
  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { items: true, customer: true },
    });

    if (!order) {
      throw new NotFoundException(`Order con ID '${id}' no encontrada.`);
    }

    return order;
  }

  /**
   * Consulta las líneas de Orders filtradas por Business.
   * Devuelve únicamente las líneas cuyo OrderProduct.business_id coincida
   * con businessId, agrupadas dentro de sus Orders.
   */
  async findByBusiness(businessId: string): Promise<Order[]> {
    // Buscar order_products del business dado
    const orderProducts = await this.orderProductRepository.find({
      where: { business_id: businessId },
    });

    if (orderProducts.length === 0) {
      return [];
    }

    // Obtener IDs de Orders únicas
    const orderIds = [...new Set(orderProducts.map((op) => op.order_id))];

    // Cargar las Orders con TODAS las líneas primero
    const orders = await this.orderRepository.find({
      where: orderIds.map((id) => ({ id })),
      relations: { items: true, customer: true },
      order: { createdAt: 'DESC' },
    });

    // Filtrar las líneas para mostrar solo las del Business solicitado
    return orders.map((order) => ({
      ...order,
      items: order.items.filter((item) => item.business_id === businessId),
    }));
  }

  /**
   * Cambia el estado de una Order validando la transición.
   */
  async updateStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.findOne(id);
    const currentStatus = order.status;
    const newStatus = updateOrderStatusDto.status;

    const allowedTransitions = VALID_TRANSITIONS[currentStatus];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Transición de estado no permitida: '${currentStatus}' -> '${newStatus}'. ` +
          `Transiciones válidas desde '${currentStatus}': ${allowedTransitions?.join(', ') || 'ninguna'}.`,
      );
    }

    order.status = newStatus;
    await this.orderRepository.save(order);

    return await this.findOne(id);
  }

  /**
   * Eliminación lógica (Soft Delete) de una Order.
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.orderRepository.softDelete(id);
  }

  /**
   * Recupera una Order previamente eliminada de forma lógica.
   */
  async recover(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: { items: true, customer: true },
    });

    if (!order) {
      throw new NotFoundException(`Order con ID '${id}' no encontrada.`);
    }

    if (!order.deletedAt) {
      return order;
    }

    await this.orderRepository.restore(id);

    return await this.findOne(id);
  }
}
