import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    );

  app.enableCors({
    origin: [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://192.168.43.167:5173',
  'http://192.168.43.167:5174',
],
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
    credentials: true,
  });

  // Serve uploaded files
  app.useStaticAssets(
    join(process.cwd(), 'uploads'),
    {
      prefix: '/uploads/',
    },
  );

  await app.listen(4000);

  console.log(
    '🚀 MathVerse API running on http://localhost:4000',
  );
}

bootstrap();