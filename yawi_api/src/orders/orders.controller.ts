import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { Order } from './entities/order.entity';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear una nueva Order con sus líneas de productos',
    description:
      'Crea una Order transaccional. El backend calcula precios, subtotales, shipping_fee y total. ' +
      'El cliente envía customer_id, delivery_address e items (product_id + quantity). ' +
      'No se aceptan unit_price, subtotal, shipping_fee, total ni business_id desde el cliente.',
  })
  @ApiResponse({
    status: 201,
    description: 'Order creada exitosamente con sus líneas de productos.',
    type: Order,
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos inválidos: items vacíos, cantidad inválida, Product IDs duplicados o campos no permitidos.',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer o algún Product no encontrado.',
  })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return await this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar Orders con filtros opcionales',
    description:
      'Retorna la lista de Orders ordenadas por fecha de creación descendente. ' +
      'Permite filtrar por customer_id, status y withDeleted.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de Orders obtenida exitosamente.',
    type: [Order],
  })
  async findAll(@Query() filters: FilterOrderDto): Promise<Order[]> {
    return await this.ordersService.findAll(filters);
  }

  @Get('business/:businessId')
  @ApiOperation({
    summary: 'Consultar líneas de Orders filtradas por Business',
    description:
      'Devuelve únicamente las líneas cuyo OrderProduct.business_id coincida ' +
      'con businessId, agrupadas dentro de sus Orders. No expone las líneas ' +
      'pertenecientes a otros Businesses de la misma compra.',
  })
  @ApiParam({
    name: 'businessId',
    type: 'string',
    format: 'uuid',
    description: 'UUID del Business',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Líneas de Orders del Business obtenidas exitosamente.',
    type: [Order],
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido.',
  })
  async findByBusiness(
    @Param('businessId', ParseUUIDPipe) businessId: string,
  ): Promise<Order[]> {
    return await this.ordersService.findByBusiness(businessId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener el detalle de una Order por ID',
    description:
      'Retorna una Order específica junto con todas sus líneas de productos (snapshots).',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID de la Order',
    example: 'b1c2d3e4-f5a6-47b8-c9d0-e1f2a3b4c5d6',
  })
  @ApiResponse({
    status: 200,
    description: 'Order encontrada con éxito.',
    type: Order,
  })
  @ApiResponse({
    status: 400,
    description: 'El ID proporcionado no es un UUID válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Order no encontrada.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return await this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Cambiar el estado de una Order',
    description:
      'Actualiza el estado de una Order validando que la transición sea permitida. ' +
      'Transiciones válidas: pending→confirmed, pending→cancelled, confirmed→preparing, ' +
      'confirmed→cancelled, preparing→delivered, preparing→cancelled.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID de la Order',
    example: 'b1c2d3e4-f5a6-47b8-c9d0-e1f2a3b4c5d6',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la Order actualizado exitosamente.',
    type: Order,
  })
  @ApiResponse({
    status: 400,
    description: 'Transición de estado no permitida o datos inválidos.',
  })
  @ApiResponse({
    status: 404,
    description: 'Order no encontrada.',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return await this.ordersService.updateStatus(id, updateOrderStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar una Order lógicamente (Soft Delete)',
    description:
      'Marca la Order como eliminada estableciendo la marca de tiempo deletedAt ' +
      'sin borrar físicamente los datos.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID de la Order a eliminar',
    example: 'b1c2d3e4-f5a6-47b8-c9d0-e1f2a3b4c5d6',
  })
  @ApiResponse({
    status: 204,
    description: 'Order eliminada lógicamente de forma exitosa.',
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Order no encontrada.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.ordersService.remove(id);
  }

  @Patch(':id/recover')
  @ApiOperation({
    summary: 'Restaurar una Order eliminada lógicamente',
    description:
      'Restaura una Order que se encontraba en estado soft-deleted removiendo el deletedAt.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID de la Order a restaurar',
    example: 'b1c2d3e4-f5a6-47b8-c9d0-e1f2a3b4c5d6',
  })
  @ApiResponse({
    status: 200,
    description: 'Order restaurada exitosamente.',
    type: Order,
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Order no encontrada.',
  })
  async recover(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return await this.ordersService.recover(id);
  }
}
