import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { AiSolutionService } from './ai-solution.service';

import { AiProviderService } from './ai-provider.service';

import { AiSolutionController } from './ai-solution.controller';



@Module({

imports:[

PrismaModule

],


controllers:[

AiSolutionController

],


providers:[

AiSolutionService,

AiProviderService

],


exports:[

AiSolutionService

]


})

export class AiSolutionModule {}