import { Module } from '@nestjs/common';

import { AdaptiveLearningController } from './adaptive-learning.controller';
import { AdaptiveLearningService } from './adaptive-learning.service';
import { AdaptiveEngineService } from './adaptive-engine.service';

import { PrismaService } from '../prisma/prisma.service';

import { AiQuestionModule } from '../ai-question/ai-question.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AiQuestionModule,
    AuthModule,
  ],

  controllers: [
    AdaptiveLearningController,
  ],

  providers: [
    AdaptiveLearningService,
    AdaptiveEngineService,
    PrismaService,
  ],

  exports: [
    AdaptiveLearningService,
    AdaptiveEngineService,
  ],
})
export class AdaptiveLearningModule {}