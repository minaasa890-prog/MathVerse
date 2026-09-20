import { Module } from '@nestjs/common';

import { AiRecommendationController } from './ai-recommendation.controller';

import { AiRecommendationService } from './ai-recommendation.service';

import { AiPracticeService } from './ai-practice.service';

import { PrismaService } from '../prisma/prisma.service';



@Module({

  controllers:[

    AiRecommendationController

  ],


  providers:[

    AiRecommendationService,

    AiPracticeService,

    PrismaService

  ],


  exports:[

    AiPracticeService

  ]

})
export class AiRecommendationModule {}