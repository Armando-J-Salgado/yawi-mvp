import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderStatus } from './interfaces/order-status.interface';

describe('OrdersController', () => {
  let controller: OrdersController;
  let mockOrdersService: any;

  const mockOrder: Partial<Order> = {
    id: 'b1c2d3e4-f5a6-47b8-c9d0-e1f2a3b4c5d6',
    customer_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    delivery_address: 'Colonia Escalón, San Salvador',
    status: OrderStatus.PENDING,
    subtotal: 24.0,
    shipping_fee: 10.0,
    total: 34.0,
    items: [],
    createdAt: new Date('2026-10-10T12:00:00.000Z'),
    updatedAt: new Date('2026-10-10T12:00:00.000Z'),
    deletedAt: null as unknown as Date,
  };

  beforeEach(async () => {
    mockOrdersService = {
      create: jest.fn().mockResolvedValue(mockOrder),
      findAll: jest.fn().mockResolvedValue([mockOrder]),
      findOne: jest.fn().mockResolvedValue(mockOrder),
      findByBusiness: jest.fn().mockResolvedValue([mockOrder]),
      updateStatus: jest
        .fn()
        .mockResolvedValue({ ...mockOrder, status: OrderStatus.CONFIRMED }),
      remove: jest.fn().mockResolvedValue(undefined),
      recover: jest.fn().mockResolvedValue(mockOrder),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  describe('create()', () => {
    it('1. Debe delegar la creación al servicio', async () => {
      const dto = {
        customer_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        delivery_address: 'Colonia Escalón, San Salvador',
        items: [
          {
            product_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
            quantity: 2,
          },
        ],
      };

      const result = await controller.create(dto);
      expect(mockOrdersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('findAll()', () => {
    it('1. Debe delegar la consulta al servicio con filtros', async () => {
      const filters = {
        customer_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      };

      const result = await controller.findAll(filters);
      expect(mockOrdersService.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual([mockOrder]);
    });
  });

  describe('findByBusiness()', () => {
    it('1. Debe delegar la consulta filtrada por Business al servicio', async () => {
      const businessId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

      const result = await controller.findByBusiness(businessId);
      expect(mockOrdersService.findByBusiness).toHaveBeenCalledWith(businessId);
      expect(result).toEqual([mockOrder]);
    });
  });

  describe('findOne()', () => {
    it('1. Debe delegar la consulta individual al servicio', async () => {
      const id = 'b1c2d3e4-f5a6-47b8-c9d0-e1f2a3b4c5d6';

      const result = await controller.findOne(id);
      expect(mockOrdersService.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('updateStatus()', () => {
    it('1. Debe delegar el cambio de estado al servicio', async () => {
      const id = 'b1c2d3e4-f5a6-47b8-c9d0-e1f2a3b4c5d6';
      const dto = { status: OrderStatus.CONFIRMED };

      const result = await controller.updateStatus(id, dto);
      expect(mockOrdersService.updateStatus).toHaveBeenCalledWith(id, dto);
      expect(result.status).toBe(OrderStatus.CONFIRMED);
    });
  });

  describe('remove()', () => {
    it('1. Debe delegar la eliminación al servicio', async () => {
      const id = 'b1c2d3e4-f5a6-47b8-c9d0-e1f2a3b4c5d6';

      await controller.remove(id);
      expect(mockOrdersService.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('recover()', () => {
    it('1. Debe delegar la restauración al servicio', async () => {
      const id = 'b1c2d3e4-f5a6-47b8-c9d0-e1f2a3b4c5d6';

      const result = await controller.recover(id);
      expect(mockOrdersService.recover).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockOrder);
    });
  });
});
