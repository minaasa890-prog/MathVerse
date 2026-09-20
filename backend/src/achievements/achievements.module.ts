import { Module } from '@nestjs/common';

import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';

import { PrismaModule } from '../prisma/prisma.module';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
  imports: [
    PrismaModule,
    RewardsModule,
  ],

  controllers: [
    AchievementsController,
  ],

  providers: [
    AchievementsService,
  ],

  exports: [
    AchievementsService,
  ],
})
export class AchievementsModule {}