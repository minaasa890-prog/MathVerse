import { Module } from '@nestjs/common';

import { AiExamController } 
from './ai-exam.controller';

import { AiExamService } 
from './ai-exam.service';


import { PrismaModule } 
from '../prisma/prisma.module';



@Module({

imports:[
 PrismaModule,
],


controllers:[
 AiExamController,
],


providers:[
 AiExamService,
],


exports:[
 AiExamService,
],


})

export class AiExamModule {}