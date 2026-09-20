import { Module } from '@nestjs/common';

import { AiQuestionController } 
from './ai-question.controller';

import { AiQuestionService } 
from './ai-question.service';

import { AiSolutionService } 
from './ai-solution.service';

import { AdaptiveQuestionService } 
from './adaptive-question.service';

import { DeepSeekService } 
from './deepseek.service';

import { PrismaService } 
from '../prisma/prisma.service';

import { AuthModule } 
from '../auth/auth.module';


@Module({

  imports: [
    AuthModule,
  ],

  controllers: [

    AiQuestionController,

  ],

  providers: [

    AiQuestionService,

    AiSolutionService,

    AdaptiveQuestionService,

    DeepSeekService,

    PrismaService,

  ],

  exports: [

    AiSolutionService,

    AdaptiveQuestionService,

    DeepSeekService,

  ],

})

export class AiQuestionModule {}