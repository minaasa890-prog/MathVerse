import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { AiTutorService } from './ai-tutor.service';

@Controller('ai-tutor')
export class AiTutorController {
  constructor(
    private readonly aiTutorService: AiTutorService,
  ) {}

  // --------------------------------------------------
  // AI PRACTICE
  // --------------------------------------------------

  @Get('practice/:studentId')
  async practice(
    @Param('studentId') studentId: string,
  ) {
    return this.aiTutorService.practice(
      Number(studentId),
    );
  }

  // --------------------------------------------------
  // AI REPORT
  // --------------------------------------------------

  @Get('report/:studentId')
  async report(
    @Param('studentId') studentId: string,
  ) {
    return this.aiTutorService.report(
      Number(studentId),
    );
  }

  // --------------------------------------------------
  // AI TUTOR CHAT
  // --------------------------------------------------

  @Post('chat')
  async chat(
    @Body() data: any,
  ) {
    return this.aiTutorService.chat(data);
  }
}