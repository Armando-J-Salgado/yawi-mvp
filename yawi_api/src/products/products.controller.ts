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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { Product } from './entities/product.entity';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Crear un nuevo producto asociado a un Business',
    description:
      'Registra un nuevo producto vinculado al Business especificado por business_id. Opcionalmente acepta una imagen en multipart/form-data.',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    description:
      'Datos del producto con imagen opcional. Enviar como multipart/form-data si se incluye imagen.',
    schema: {
      type: 'object',
      properties: {
        business_id: {
          type: 'string',
          format: 'uuid',
          example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          description: 'UUID del Business al que pertenece el producto',
        },
        name: {
          type: 'string',
          example: 'Café molido artesanal',
          description: 'Nombre del producto',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: ['café', 'artesanal', 'orgánico'],
          description: 'Etiquetas o categorías del producto',
        },
        properties: {
          type: 'object',
          example: { weight: '500g', origin: 'El Salvador', roast: 'medium' },
          description: 'Propiedades clave-valor libres del producto',
        },
        price: {
          type: 'number',
          example: 8.5,
          description: 'Precio en USD (mayor o igual a 0)',
        },
        image: {
          type: 'string',
          format: 'binary',
          description:
            'Imagen del producto (opcional). Formatos: JPEG, PNG, WebP, GIF. Máximo 10MB.',
        },
      },
      required: ['business_id', 'name', 'price'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Producto creado exitosamente.',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos de entrada inválidos, archivo no es una imagen válida o excede el tamaño máximo (10MB).',
  })
  @ApiResponse({
    status: 404,
    description: 'El Business especificado en business_id no existe.',
  })
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /^(image\/jpeg|image\/png|image\/webp|image\/gif)$/,
            skipMagicNumbersValidation: true,
          }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ): Promise<Product> {
    return await this.productsService.create(createProductDto, file);
  }

  @Post(':id/images')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Agregar una imagen a un producto existente',
    description:
      'Sube una imagen y la agrega a la lista de imágenes del producto. Máximo 4 imágenes por producto.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del producto',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiBody({
    description:
      'Imagen a agregar al producto. Formatos permitidos: JPEG, PNG, WebP, GIF. Tamaño máximo: 10MB.',
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
      'Imagen agregada exitosamente. Retorna el Product con la lista actualizada de imágenes.',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description:
      'UUID inválido, archivo no proporcionado, archivo no es una imagen válida, excede 10MB, o el producto ya tiene 4 imágenes.',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado.',
  })
  async addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /^(image\/jpeg|image\/png|image\/webp|image\/gif)$/,
            skipMagicNumbersValidation: true,
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ): Promise<Product> {
    return await this.productsService.addImage(id, file);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar productos con filtros opcionales',
    description:
      'Retorna la lista de productos ordenados por fecha de creación descendente. Permite filtrar por business_id, name, price y withDeleted.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos obtenida exitosamente.',
    type: [Product],
  })
  async findAll(@Query() filters: FilterProductDto): Promise<Product[]> {
    return await this.productsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener el detalle de un producto por ID',
    description:
      'Retorna un producto específico junto con su Business asociado.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del producto',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto encontrado con éxito.',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'El ID proporcionado no es un UUID válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return await this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar parcialmente un producto',
    description:
      'Actualiza uno o varios campos del producto (name, tags, properties, price, business_id). No modifica imágenes.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del producto',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado exitosamente.',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o UUID no válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto o Business no encontrado.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return await this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un producto lógicamente (Soft Delete)',
    description:
      'Marca el producto como eliminado estableciendo la marca de tiempo deletedAt sin borrar físicamente los datos.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del producto a eliminar',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: 204,
    description: 'Producto eliminado lógicamente de forma exitosa.',
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.productsService.remove(id);
  }

  @Patch(':id/recover')
  @ApiOperation({
    summary: 'Restaurar un producto eliminado lógicamente',
    description:
      'Restaura un producto que se encontraba en estado soft-deleted removiendo el deletedAt.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identificador único UUID del producto a restaurar',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto restaurado exitosamente.',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado.',
  })
  async recover(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return await this.productsService.recover(id);
  }
}
