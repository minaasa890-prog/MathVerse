import { Module } from '@nestjs/common';

import { AiPracticeController }
from './ai-practice.controller';

import { AiPracticeService }
from './ai-practice.service';

import { SolutionGeneratorService }
from './solution-generator.service';

import { PrismaService }
from '../prisma/prisma.service';

import { AdaptiveLearningModule }
from '../adaptive-learning/adaptive-learning.module';


@Module({

  imports: [

    AdaptiveLearningModule,

  ],


  controllers: [

    AiPracticeController,

  ],


  providers: [

    AiPracticeService,

    SolutionGeneratorService,

    PrismaService,

  ],


  exports: [

    AiPracticeService,

    SolutionGeneratorService,

  ],

})


export class AiPracticeModule {}