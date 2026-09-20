import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { ParentsController } from './parents.controller';
import { ParentsService } from './parents.service';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],

  controllers: [
    ParentsController,
  ],

  providers: [
    ParentsService,
  ],
})
export class ParentsModule {}

