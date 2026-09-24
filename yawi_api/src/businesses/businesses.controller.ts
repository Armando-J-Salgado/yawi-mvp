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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
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
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Crear un nuevo negocio asociado a un Vendor',
    description:
      'Registra un nuevo negocio en la base de datos vinculado al Vendor especificado por owner_id. Opcionalmente acepta una imagen (multipart/form-data).',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    description:
      'Datos del negocio con imagen opcional. Enviar como multipart/form-data si se incluye imagen.',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Tienda El Buen Precio',
          description: 'Nombre del negocio',
        },
        description: {
          type: 'string',
          example: 'Tienda de artículos para el hogar con envío a domicilio.',
          description: 'Descripción del negocio',
        },
        address: {
          type: 'string',
          example: 'Av. Independencia #456, Centro Histórico, San Salvador',
          description: 'Dirección física del negocio',
        },
        balance: {
          type: 'number',
          example: 0.0,
          description: 'Balance inicial en USD (mínimo 0)',
        },
        owner_id: {
          type: 'string',
          format: 'uuid',
          example: 'd3b07384-d113-4089-a292-1262d088a2a8',
          description: 'UUID del Vendor propietario',
        },
        image: {
          type: 'string',
          format: 'binary',
          description:
            'Imagen del negocio (opcional). Formatos: JPEG, PNG, WebP, GIF. Máximo 10MB.',
        },
      },
      required: ['name', 'description', 'address', 'owner_id'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Negocio creado exitosamente.',
    type: Business,
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos de entrada inválidos, archivo no es una imagen válida, o excede el tamaño máximo (10MB).',
  })
  @ApiResponse({
    status: 404,
    description: 'El Vendor especificado en owner_id no existe.',
  })
  async create(
    @Body() createBusinessDto: CreateBusinessDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ): Promise<Business> {
    return await this.businessesService.create(createBusinessDto, file);
  }

  @Post(':id/images')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Agregar una imagen a un negocio existente',
    description:
      'Sube una imagen y la agrega al listado de imágenes del negocio. Máximo 4 imágenes por negocio. Se envía una imagen por request.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del negocio',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiBody({
    description:
      'Imagen a agregar al negocio. Formatos permitidos: JPEG, PNG, WebP, GIF. Tamaño máximo: 10MB.',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen a subir',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'Imagen agregada exitosamente. Retorna el Business con la lista actualizada de imágenes.',
    type: Business,
  })
  @ApiResponse({
    status: 400,
    description:
      'UUID inválido, archivo no proporcionado, archivo no es una imagen válida, excede 10MB, o el negocio ya tiene 4 imágenes.',
  })
  @ApiResponse({
    status: 404,
    description: 'Negocio no encontrado.',
  })
  async addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ): Promise<Business> {
    return await this.businessesService.addImage(id, file);
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
