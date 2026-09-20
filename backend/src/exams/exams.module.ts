import { Module } from '@nestjs/common';

import { ExamsController } from './exams.controller';
import { StudentExamsController } from './student-exams.controller';

import { ExamsService } from './exams.service';

import { PrismaModule } from '../prisma/prisma.module';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
  imports: [
    PrismaModule,
    RewardsModule,
  ],

  controllers: [
    ExamsController,
    StudentExamsController,
  ],

  providers: [
    ExamsService,
  ],

  exports: [
    ExamsService,
  ],
})
export class ExamsModule {}

