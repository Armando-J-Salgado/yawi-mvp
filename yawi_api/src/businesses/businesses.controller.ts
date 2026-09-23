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
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { FilterBusinessDto } from './dto/filter-business.dto';
import { Business } from './entities/business.entity';

@ApiTags('Businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo negocio asociado a un Vendor',
    description:
      'Registra un nuevo negocio en la base de datos vinculado al Vendor especificado por owner_id.',
  })
  @ApiResponse({
    status: 201,
    description: 'Negocio creado exitosamente.',
    type: Business,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o faltantes en el DTO.',
  })
  @ApiResponse({
    status: 404,
    description: 'El Vendor especificado en owner_id no existe.',
  })
  async create(
    @Body() createBusinessDto: CreateBusinessDto,
  ): Promise<Business> {
    return await this.businessesService.create(createBusinessDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar negocios con filtros opcionales',
    description:
      'Retorna la lista de negocios ordenados por fecha de creación. Permite filtrar por campos y opcionalmente incluir registros eliminados (soft delete).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de negocios obtenida exitosamente.',
    type: [Business],
  })
  async findAll(@Query() filters: FilterBusinessDto): Promise<Business[]> {
    return await this.businessesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener el detalle de un negocio por ID',
    description:
      'Retorna un negocio específico junto con su propietario (Vendor).',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del negocio',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Negocio encontrado con éxito.',
    type: Business,
  })
  @ApiResponse({
    status: 400,
    description: 'El ID proporcionado no es un UUID válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Negocio no encontrado.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Business> {
    return await this.businessesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar parcialmente un negocio',
    description: 'Actualiza uno o varios campos del negocio.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del negocio',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Negocio actualizado exitosamente.',
    type: Business,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o UUID no válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Negocio no encontrado.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
  ): Promise<Business> {
    return await this.businessesService.update(id, updateBusinessDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un negocio lógicamente (Soft Delete)',
    description:
      'Marca el registro como eliminado estableciendo la marca de tiempo deletedAt sin borrar físicamente los datos.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del negocio a eliminar',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 204,
    description: 'Negocio eliminado lógicamente de forma exitosa.',
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Negocio no encontrado.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.businessesService.remove(id);
  }

  @Patch(':id/recover')
  @ApiOperation({
    summary: 'Restaurar un negocio eliminado lógicamente',
    description:
      'Restaura un negocio que se encontraba en estado soft-deleted removiendo el deletedAt.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del negocio a restaurar',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Negocio restaurado exitosamente.',
    type: Business,
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Negocio no encontrado.',
  })
  async recover(@Param('id', ParseUUIDPipe) id: string): Promise<Business> {
    return await this.businessesService.recover(id);
  }
}
