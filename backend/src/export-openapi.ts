import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { AppModule } from './app.module';

async function exportOpenApi() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Waiting room API')
    .setDescription('Teleconsultation waiting room (fake data, in memory)')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  writeFileSync('./openapi.json', JSON.stringify(document, null, 2));

  console.log('openapi.json generated.');
  await app.close();
}

exportOpenApi();
