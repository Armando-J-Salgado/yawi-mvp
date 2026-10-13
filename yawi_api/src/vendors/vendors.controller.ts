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
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { FilterVendorDto } from './dto/filter-vendor.dto';
import { Vendor } from './entities/vendor.entity';

@ApiTags('Vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo Vendor y su PhoneNumber inicial',
    description:
      'Registra un nuevo vendedor en la base de datos junto con su primer número de teléfono en una transacción atómica.',
  })
  @ApiResponse({
    status: 201,
    description: 'Vendor y número de teléfono creados satisfactoriamente.',
    type: Vendor,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o faltantes en el DTO.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: username, DUI o NIT ya se encuentran registrados.',
  })
  async create(@Body() createVendorDto: CreateVendorDto): Promise<Vendor> {
    return await this.vendorsService.create(createVendorDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar vendedores con filtros opcionales',
    description:
      'Retorna la lista de vendedores ordenados por fecha de creación. Permite filtrar por campos y opcionalmente incluir registros eliminados (soft delete).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de vendedores obtenida exitosamente.',
    type: [Vendor],
  })
  async findAll(@Query() filters: FilterVendorDto): Promise<Vendor[]> {
    return await this.vendorsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener el detalle de un vendedor por ID',
    description:
      'Retorna un vendedor específico junto con sus números telefónicos.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del vendor',
    example: 'd3b07384-d113-4089-a292-1262d088a2a8',
  })
  @ApiResponse({
    status: 200,
    description: 'Vendor encontrado con éxito.',
    type: Vendor,
  })
  @ApiResponse({
    status: 400,
    description: 'El ID proporcionado no es un UUID válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Vendor no encontrado.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Vendor> {
    return await this.vendorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar parcialmente un vendedor',
    description:
      'Actualiza uno o varios campos del vendedor. Si se envía una nueva contraseña, será hasheada automáticamente.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del vendor',
    example: 'd3b07384-d113-4089-a292-1262d088a2a8',
  })
  @ApiResponse({
    status: 200,
    description: 'Vendor actualizado exitosamente.',
    type: Vendor,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o UUID no válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Vendor no encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto con un valor único (username, DUI o NIT).',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ): Promise<Vendor> {
    return await this.vendorsService.update(id, updateVendorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un vendedor lógicamente (Soft Delete)',
    description:
      'Marca el registro como eliminado estableciendo la marca de tiempo deletedAt sin borrar físicamente los datos.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del vendor a eliminar',
    example: 'd3b07384-d113-4089-a292-1262d088a2a8',
  })
  @ApiResponse({
    status: 204,
    description: 'Vendor eliminado lógicamente de forma exitosa.',
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Vendor no encontrado.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.vendorsService.remove(id);
  }

  @Patch(':id/recover')
  @ApiOperation({
    summary: 'Restaurar un vendedor eliminado lógicamente',
    description:
      'Restaura un vendedor que se encontraba en estado soft-deleted removiendo el deletedAt.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del vendor a restaurar',
    example: 'd3b07384-d113-4089-a292-1262d088a2a8',
  })
  @ApiResponse({
    status: 200,
    description: 'Vendor restaurado exitosamente.',
    type: Vendor,
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Vendor no encontrado.',
  })
  async recover(@Param('id', ParseUUIDPipe) id: string): Promise<Vendor> {
    return await this.vendorsService.recover(id);
  }
}
