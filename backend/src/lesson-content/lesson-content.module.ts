import { Module } from '@nestjs/common';
import { LessonContentController } from './lesson-content.controller';
import { LessonContentService } from './lesson-content.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LessonContentController],
  providers: [LessonContentService],
})
export class LessonContentModule {}