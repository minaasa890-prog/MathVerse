import { Module } from '@nestjs/common';

import { AttemptsService } from './attempts.service';

import { AttemptsController } from './attempts.controller';

import { PrismaModule } from '../prisma/prisma.module';

import { RewardsModule } from '../rewards/rewards.module';

import { AiSolutionModule } from '../ai-solution/ai-solution.module';



@Module({

  imports: [

    PrismaModule,

    RewardsModule,

    AiSolutionModule,

  ],


  controllers: [

    AttemptsController,

  ],


  providers: [

    AttemptsService,

  ],


  exports: [

    AttemptsService,

  ],


})

export class AttemptsModule {}