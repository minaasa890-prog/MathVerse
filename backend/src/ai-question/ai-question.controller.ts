import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AiQuestionService } from './ai-question.service';
import { AdaptiveQuestionService } from './adaptive-question.service';
import { AiSolutionService } from './ai-solution.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai-question')
export class AiQuestionController {
  constructor(
    private readonly aiQuestionService: AiQuestionService,
    private readonly adaptiveQuestionService: AdaptiveQuestionService,
    private readonly aiSolutionService: AiSolutionService,
  ) {}

  // =====================================
  // تولید سوالات معمولی AI
  // =====================================

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generate(
    @Request() req: any,
    @Body() body: any,
  ) {
    const studentId = Number(req.user.id);

    return this.aiQuestionService.generateQuestions(
      body,
      studentId,
    );
  }

  // =====================================
  // تولید سوالات تطبیقی
  // =====================================

  @Post('adaptive')
  async adaptive(
    @Body()
    body: {
      studentId: number;
      subject: string;
      chapter: string;
      count: number;
    },
  ) {
    return this.adaptiveQuestionService.generateAdaptiveQuestions(
      body.studentId,
      body.subject,
      body.chapter,
      body.count,
    );
  }

  // =====================================
  // تولید و ذخیره توضیح حل سوال
  // =====================================

  @Post('solution/:id')
  async createSolution(
    @Param('id') id: string,
  ) {
    return this.aiSolutionService.generateSolution(
      Number(id),
    );
  }

  // =====================================
  // دریافت توضیح حل ذخیره شده
  // =====================================

  @Get('solution/:id')
  async getSolution(
    @Param('id') id: string,
  ) {
    return this.aiSolutionService.getSolution(
      Number(id),
    );
  }
}