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
import { PhoneNumbersService } from './phone-numbers.service';
import { CreatePhoneNumberDto } from './dto/create-phone-number.dto';
import { UpdatePhoneNumberDto } from './dto/update-phone-number.dto';
import { FilterPhoneNumberDto } from './dto/filter-phone-number.dto';
import { PhoneNumber } from './entities/phone-number.entity';

@ApiTags('Phone Numbers')
@Controller('phone-numbers')
export class PhoneNumbersController {
  constructor(private readonly phoneNumbersService: PhoneNumbersService) {}

  @Post()
  @ApiOperation({
    summary: 'Asociar un nuevo número telefónico a un Vendor',
    description:
      'Crea un nuevo PhoneNumber asociado al Vendor indicado por su owner_id.',
  })
  @ApiResponse({
    status: 201,
    description: 'PhoneNumber creado y vinculado exitosamente.',
    type: PhoneNumber,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos en el DTO o formato de UUID incorrecto.',
  })
  @ApiResponse({
    status: 404,
    description: 'El Vendor especificado en owner_id no existe.',
  })
  async create(
    @Body() createPhoneNumberDto: CreatePhoneNumberDto,
  ): Promise<PhoneNumber> {
    return await this.phoneNumbersService.create(createPhoneNumberDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar números telefónicos con filtros opcionales',
    description:
      'Retorna la lista de números telefónicos. Permite filtrar por número, owner_id y con soft delete.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de números telefónicos obtenida exitosamente.',
    type: [PhoneNumber],
  })
  async findAll(
    @Query() filters: FilterPhoneNumberDto,
  ): Promise<PhoneNumber[]> {
    return await this.phoneNumbersService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener el detalle de un número telefónico por ID',
    description: 'Retorna los datos del número telefónico y su propietario.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del número telefónico',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @ApiResponse({
    status: 200,
    description: 'PhoneNumber encontrado con éxito.',
    type: PhoneNumber,
  })
  @ApiResponse({
    status: 400,
    description: 'El ID proporcionado no es un UUID válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'PhoneNumber no encontrado.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PhoneNumber> {
    return await this.phoneNumbersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar parcialmente un número telefónico',
    description: 'Actualiza el valor del número telefónico.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del número telefónico',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @ApiResponse({
    status: 200,
    description: 'PhoneNumber actualizado con éxito.',
    type: PhoneNumber,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o UUID no válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'PhoneNumber no encontrado.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePhoneNumberDto: UpdatePhoneNumberDto,
  ): Promise<PhoneNumber> {
    return await this.phoneNumbersService.update(id, updatePhoneNumberDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un número telefónico lógicamente (Soft Delete)',
    description:
      'Marca el registro como eliminado estableciendo la fecha en deletedAt.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del número a eliminar',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @ApiResponse({
    status: 204,
    description: 'PhoneNumber eliminado lógicamente de forma exitosa.',
  })
  @ApiResponse({
    status: 400,
    description: 'UUID no válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'PhoneNumber no encontrado.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.phoneNumbersService.remove(id);
  }

  @Patch(':id/recover')
  @ApiOperation({
    summary: 'Restaurar un número telefónico eliminado lógicamente',
    description:
      'Restaura un número telefónico que se encontraba en estado soft-deleted.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del número a restaurar',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @ApiResponse({
    status: 200,
    description: 'PhoneNumber restaurado exitosamente.',
    type: PhoneNumber,
  })
  @ApiResponse({
    status: 400,
    description: 'UUID no válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'PhoneNumber no encontrado.',
  })
  async recover(@Param('id', ParseUUIDPipe) id: string): Promise<PhoneNumber> {
    return await this.phoneNumbersService.recover(id);
  }
}
