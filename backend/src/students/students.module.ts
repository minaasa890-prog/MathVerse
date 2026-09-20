import { Module } from '@nestjs/common';

import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

import { PrismaModule } from '../prisma/prisma.module';
import { QuestionsGenerator } from './questions.generator';

import { AuthModule } from '../auth/auth.module';


@Module({

  imports: [

    PrismaModule,

    AuthModule

  ],

  controllers: [

    StudentsController

  ],

  providers: [

    StudentsService,

    QuestionsGenerator

  ],

  exports: [

    StudentsService

  ]

})

export class StudentsModule {}