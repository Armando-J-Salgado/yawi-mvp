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
import { PaymentPreferencesService } from './payment-preferences.service';
import { CreatePaymentPreferenceDto } from './dto/create-payment-preference.dto';
import { UpdatePaymentPreferenceDto } from './dto/update-payment-preference.dto';
import { FilterPaymentPreferenceDto } from './dto/filter-payment-preference.dto';
import { PaymentPreference } from './entities/payment-preference.entity';

@ApiTags('Payment Preferences')
@Controller('payment-preferences')
export class PaymentPreferencesController {
  constructor(
    private readonly paymentPreferencesService: PaymentPreferencesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Crear una nueva preferencia de pago asociada a un Vendor',
    description:
      'Registra una nueva preferencia de pago en la base de datos vinculada al Vendor especificado por owner_id.',
  })
  @ApiResponse({
    status: 201,
    description: 'Preferencia de pago creada exitosamente.',
    type: PaymentPreference,
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
    @Body() createPaymentPreferenceDto: CreatePaymentPreferenceDto,
  ): Promise<PaymentPreference> {
    return await this.paymentPreferencesService.create(
      createPaymentPreferenceDto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Listar preferencias de pago con filtros opcionales',
    description:
      'Retorna la lista de preferencias de pago ordenadas por fecha de creación. Permite filtrar por campos y opcionalmente incluir registros eliminados (soft delete).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de preferencias de pago obtenida exitosamente.',
    type: [PaymentPreference],
  })
  async findAll(
    @Query() filters: FilterPaymentPreferenceDto,
  ): Promise<PaymentPreference[]> {
    return await this.paymentPreferencesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener el detalle de una preferencia de pago por ID',
    description:
      'Retorna una preferencia de pago específica junto con su propietario (Vendor).',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID de la preferencia de pago',
    example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferencia de pago encontrada con éxito.',
    type: PaymentPreference,
  })
  @ApiResponse({
    status: 400,
    description: 'El ID proporcionado no es un UUID válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Preferencia de pago no encontrada.',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentPreference> {
    return await this.paymentPreferencesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar parcialmente una preferencia de pago',
    description: 'Actualiza uno o varios campos de la preferencia de pago.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID de la preferencia de pago',
    example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferencia de pago actualizada exitosamente.',
    type: PaymentPreference,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o UUID no válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Preferencia de pago no encontrada.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaymentPreferenceDto: UpdatePaymentPreferenceDto,
  ): Promise<PaymentPreference> {
    return await this.paymentPreferencesService.update(
      id,
      updatePaymentPreferenceDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar una preferencia de pago lógicamente (Soft Delete)',
    description:
      'Marca el registro como eliminado estableciendo la marca de tiempo deletedAt sin borrar físicamente los datos.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description:
      'Identificador único UUID de la preferencia de pago a eliminar',
    example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  })
  @ApiResponse({
    status: 204,
    description: 'Preferencia de pago eliminada lógicamente de forma exitosa.',
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Preferencia de pago no encontrada.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.paymentPreferencesService.remove(id);
  }

  @Patch(':id/recover')
  @ApiOperation({
    summary: 'Restaurar una preferencia de pago eliminada lógicamente',
    description:
      'Restaura una preferencia de pago que se encontraba en estado soft-deleted removiendo el deletedAt.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description:
      'Identificador único UUID de la preferencia de pago a restaurar',
    example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferencia de pago restaurada exitosamente.',
    type: PaymentPreference,
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Preferencia de pago no encontrada.',
  })
  async recover(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentPreference> {
    return await this.paymentPreferencesService.recover(id);
  }
}
