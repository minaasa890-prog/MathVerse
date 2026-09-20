import {
  Controller,
  Post,
  Body,
  Param,
} from '@nestjs/common';

import { AiExamService } from './ai-exam.service';

@Controller('ai-exam')
export class AiExamController {
  constructor(
    private aiExamService: AiExamService,
  ) {}

  @Post('generate')
  async generate(
    @Body() data: any,
  ) {
    return this.aiExamService.generate(data);
  }

  @Post('create')
  async createExam(
    @Body() data: any,
  ) {
    return this.aiExamService.generateExam(data);
  }

  @Post('add-to-exam/:examId')
  async addToExam(
    @Param('examId') examId: string,
    @Body() data: any,
  ) {
    return this.aiExamService.addAiQuestionsToExam(
      Number(examId),
      data,
    );
  }

  @Post('adaptive/:studentId')
  async adaptiveExam(
    @Param('studentId') studentId: string,
    @Body() data: any,
  ) {
    return this.aiExamService.adaptiveExam(
      Number(studentId),
      data,
    );
  }
}
