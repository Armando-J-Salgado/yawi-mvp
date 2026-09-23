import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DatabaseService } from './database.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const databaseService = app.get(DatabaseService);
    console.log('🔄 Executing fresh migration / database cleanup...');
    await databaseService.clear();
    console.log('✨ All tables have been cleared.');
  } catch (error) {
    console.error('❌ Failed to clear database:', error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

void run();
