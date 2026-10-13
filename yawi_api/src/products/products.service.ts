import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Product } from './entities/product.entity';
import { Business } from '../businesses/entities/business.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { UploadFileService } from '../uploader/upload-file.service';

@Injectable()
export class ProductsService {
  /** Número máximo de imágenes permitidas por Product */
  static readonly MAX_IMAGES = 4;

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly uploadFileService: UploadFileService,
  ) {}

  /**
   * Crea un nuevo Product verificando previamente la existencia del Business asociado.
   * Si se proporciona un archivo de imagen, lo sube y almacena la URL en images_urls.
   */
  async create(
    createProductDto: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    const { business_id, tags, properties, ...rest } = createProductDto;

    const business = await this.businessRepository.findOne({
      where: { id: business_id },
    });

    if (!business) {
      throw new NotFoundException(
        `No se puede crear el producto: Business con ID '${business_id}' no encontrado.`,
      );
    }

    let images_urls: string[] | null = null;

    if (file) {
      const uploadResult = await this.uploadFileService.execute(
        file,
        'products',
      );
      images_urls = [uploadResult.url];
    }

    const product = this.productRepository.create({
      ...rest,
      business_id,
      tags: tags ?? [],
      properties: properties ?? {},
      images_urls,
    });

    const savedProduct = await this.productRepository.save(product);

    return (await this.productRepository.findOne({
      where: { id: savedProduct.id },
      relations: { business: true },
    }))!;
  }

  /**
   * Agrega una imagen al listado de un Product existente.
   * Valida que no se supere el máximo de 4 imágenes.
   */
  async addImage(id: string, file: Express.Multer.File): Promise<Product> {
    const product = await this.findOne(id);

    const currentImages = product.images_urls || [];

    if (currentImages.length >= ProductsService.MAX_IMAGES) {
      throw new BadRequestException(
        `El producto ya tiene el máximo de ${ProductsService.MAX_IMAGES} imágenes permitidas.`,
      );
    }

    const uploadResult = await this.uploadFileService.execute(file, 'products');

    product.images_urls = [...currentImages, uploadResult.url];

    await this.productRepository.save(product);

    return await this.findOne(id);
  }

  /**
   * Lista productos con filtros opcionales y soporte para soft delete.
   */
  async findAll(filters?: FilterProductDto): Promise<Product[]> {
    const where: FindOptionsWhere<Product> = {};

    if (filters?.business_id) where.business_id = filters.business_id;
    if (filters?.name) where.name = filters.name;
    if (filters?.price !== undefined) where.price = filters.price;

    const withDeleted = filters?.withDeleted === 'true';

    return await this.productRepository.find({
      where,
      withDeleted,
      relations: {
        business: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Retorna un Product por ID con su Business asociado.
   */
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        business: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product con ID '${id}' no encontrado.`);
    }

    return product;
  }

  /**
   * Actualiza los datos de un Product parcialmente.
   */
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (
      updateProductDto.business_id &&
      updateProductDto.business_id !== product.business_id
    ) {
      const business = await this.businessRepository.findOne({
        where: { id: updateProductDto.business_id },
      });

      if (!business) {
        throw new NotFoundException(
          `No se puede actualizar el producto: Business con ID '${updateProductDto.business_id}' no encontrado.`,
        );
      }
    }

    await this.productRepository.save({
      ...product,
      ...updateProductDto,
    });

    return await this.findOne(id);
  }

  /**
   * Eliminación lógica (Soft Delete) de un Product.
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.productRepository.softDelete(id);
  }

  /**
   * Recupera un Product previamente eliminado de forma lógica.
   */
  async recover(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: {
        business: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product con ID '${id}' no encontrado.`);
    }

    if (!product.deletedAt) {
      return product;
    }

    await this.productRepository.restore(id);

    return await this.findOne(id);
  }
}
