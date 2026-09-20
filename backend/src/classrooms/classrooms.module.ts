import { Module } from '@nestjs/common';

import { ClassroomsService } from './classrooms.service';
import { ClassroomsController } from './classrooms.controller';

import { PrismaModule } from '../prisma/prisma.module';


@Module({
  imports: [
    PrismaModule,
  ],

  providers: [
    ClassroomsService,
  ],

  controllers: [
    ClassroomsController,
  ],
})
export class ClassroomsModule {}