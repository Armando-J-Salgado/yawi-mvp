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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { FilterCustomerDto } from './dto/filter-customer.dto';
import { Customer } from './entities/customer.entity';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo cliente',
    description:
      'Registra un nuevo cliente con correo electrónico único y contraseña protegida por bcrypt.',
  })
  @ApiResponse({
    status: 201,
    description: 'Cliente creado exitosamente.',
    type: Customer,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o faltantes.',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un cliente con el mismo correo electrónico.',
  })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<Customer> {
    return await this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar clientes con filtros opcionales',
    description:
      'Retorna la lista de clientes ordenados por fecha de creación descendente. Permite filtrar por email, name, country y opcionalmente incluir registros eliminados (soft delete).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes obtenida exitosamente.',
    type: [Customer],
  })
  async findAll(@Query() filters: FilterCustomerDto): Promise<Customer[]> {
    return await this.customersService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener el detalle de un cliente por ID',
    description: 'Retorna un cliente específico mediante su UUID.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del cliente',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado con éxito.',
    type: Customer,
  })
  @ApiResponse({
    status: 400,
    description: 'El ID proporcionado no es un UUID válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Customer> {
    return await this.customersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar parcialmente un cliente',
    description: 'Actualiza uno o varios campos del cliente.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del cliente',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente actualizado exitosamente.',
    type: Customer,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o UUID no válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un cliente con el mismo correo electrónico.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    return await this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un cliente lógicamente (Soft Delete)',
    description:
      'Marca el registro como eliminado estableciendo la marca de tiempo deletedAt sin borrar físicamente los datos.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del cliente a eliminar',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: 204,
    description: 'Cliente eliminado lógicamente de forma exitosa.',
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.customersService.remove(id);
  }

  @Patch(':id/recover')
  @ApiOperation({
    summary: 'Restaurar un cliente eliminado lógicamente',
    description:
      'Restaura un cliente que se encontraba en estado soft-deleted removiendo el deletedAt.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del cliente a restaurar',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente restaurado exitosamente.',
    type: Customer,
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado.',
  })
  async recover(@Param('id', ParseUUIDPipe) id: string): Promise<Customer> {
    return await this.customersService.recover(id);
  }
}
