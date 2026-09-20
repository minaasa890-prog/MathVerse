import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // فعال کردن فایل‌های آپلود شده
    app.useStaticAssets(join(process.cwd(), 'uploads'));
    await app.listen(4000);
    console.log('🚀 Server running on http://localhost:4000');
}
bootstrap();
