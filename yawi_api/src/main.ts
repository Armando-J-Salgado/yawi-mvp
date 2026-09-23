import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DatabaseService } from './database/database.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuración de OpenAPI / Swagger
  const config = new DocumentBuilder()
    .setTitle('YAWI API')
    .setDescription(
      'Documentación interactiva de la API de YAWI — Módulos Vendors y Phone Numbers.',
    )
    .setVersion('1.0')
    .addTag('Vendors', 'Operaciones para la gestión de vendedores')
    .addTag(
      'Phone Numbers',
      'Operaciones para la gestión de números telefónicos',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Auto-seeding si la base de datos se encuentra vacía
  try {
    const databaseService = app.get(DatabaseService);
    const isEmpty = await databaseService.isDatabaseEmpty();
    if (isEmpty) {
      logger.log(
        '🌱 Database is empty on start. Executing automatic seeding...',
      );
      await databaseService.seed();
    }
  } catch (err) {
    logger.warn('Could not execute auto-seeding check during bootstrap:', err);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 YAWI API is running on http://localhost:${port}`);
  logger.log(
    `📑 Swagger documentation available on http://localhost:${port}/api/docs`,
  );
}

void bootstrap();
