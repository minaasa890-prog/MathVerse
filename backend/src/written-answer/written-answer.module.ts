import { Module } from '@nestjs/common';

import { WrittenAnswerController } from './written-answer.controller';
import { WrittenAnswerService } from './written-answer.service';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AdaptiveLearningModule } from '../adaptive-learning/adaptive-learning.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AdaptiveLearningModule,
  ],

  controllers: [
    WrittenAnswerController,
  ],

  providers: [
    WrittenAnswerService,
  ],

  exports: [
    WrittenAnswerService,
  ],
})
export class WrittenAnswerModule {}