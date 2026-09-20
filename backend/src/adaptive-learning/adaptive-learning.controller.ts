import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';

import { AdaptiveLearningService } from './adaptive-learning.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('adaptive-learning')
@UseGuards(JwtAuthGuard)
export class AdaptiveLearningController {
  constructor(
    private readonly adaptiveLearningService: AdaptiveLearningService,
  ) {}

  // =====================================
  // بررسی دسترسی دانش آموز
  // =====================================

  private checkStudentAccess(
    requestedStudentId: number,
    authenticatedStudentId: number,
  ) {
    if (
      requestedStudentId !==
      authenticatedStudentId
    ) {
      throw new ForbiddenException(
        'You are not allowed to access another student data.',
      );
    }
  }

  // =====================================
  // شروع تمرین
  // =====================================

  @Post('start/:studentId')
  async startPractice(
    @Param('studentId') studentId: string,
    @Body()
    body: {
      chapter?: string;
    },
    @Request() req: any,
  ) {
    const requestedStudentId =
      Number(studentId);

    const authenticatedStudentId =
      Number(req.user.id);

    this.checkStudentAccess(
      requestedStudentId,
      authenticatedStudentId,
    );

    console.log(
      'ADAPTIVE START REQUEST:',
      {
        studentId:
          requestedStudentId,
        chapter:
          body?.chapter,
      },
    );

    return this.adaptiveLearningService.startPracticeSession(
      requestedStudentId,
      body?.chapter,
    );
  }

  // =====================================
  // دریافت سوال بعدی
  // =====================================

  @Get('next-question/:sessionId')
  async nextQuestion(
    @Param('sessionId') sessionId: string,
    @Request() req: any,
  ) {
    const authenticatedStudentId =
      Number(req.user.id);

    return this.adaptiveLearningService.getNextQuestion(
      Number(sessionId),
      authenticatedStudentId,
    );
  }

  // =====================================
  // ثبت پاسخ
  // =====================================

  @Post('submit-answer')
  async submitAnswer(
    @Body()
    body: {
      sessionId: number;
      studentId: number;
      questionId: number;
      answer: string;
    },
    @Request() req: any,
  ) {
    const requestedStudentId =
      Number(body.studentId);

    const authenticatedStudentId =
      Number(req.user.id);

    this.checkStudentAccess(
      requestedStudentId,
      authenticatedStudentId,
    );

    console.log(
      'CONTROLLER BODY:',
      body,
    );

    return this.adaptiveLearningService.submitSessionAnswer(
      Number(body.sessionId),
      requestedStudentId,
      Number(body.questionId),
      body.answer,
    );
  }

  // =====================================
  // گزارش Session
  // =====================================

  @Get('session-report/:sessionId')
  async sessionReport(
    @Param('sessionId') sessionId: string,
    @Request() req: any,
  ) {
    const authenticatedStudentId =
      Number(req.user.id);

    return this.adaptiveLearningService.getSessionReport(
      Number(sessionId),
      authenticatedStudentId,
    );
  }

  // =====================================
  // تمرین هوشمند
  // =====================================

  @Get('practice/:studentId')
  async smartPractice(
    @Param('studentId') studentId: string,
    @Request() req: any,
  ) {
    const requestedStudentId =
      Number(studentId);

    const authenticatedStudentId =
      Number(req.user.id);

    this.checkStudentAccess(
      requestedStudentId,
      authenticatedStudentId,
    );

    return this.adaptiveLearningService.getSmartPractice(
      requestedStudentId,
    );
  }

  // =====================================
  // تحلیل دانش آموز
  // =====================================

  @Get('analyze/:studentId')
  async analyze(
    @Param('studentId') studentId: string,
    @Request() req: any,
  ) {
    const requestedStudentId =
      Number(studentId);

    const authenticatedStudentId =
      Number(req.user.id);

    this.checkStudentAccess(
      requestedStudentId,
      authenticatedStudentId,
    );

    return this.adaptiveLearningService.analyzeStudent(
      requestedStudentId,
    );
  }

  // =====================================
  // برنامه یادگیری
  // =====================================

  @Get('plan/:studentId')
  async plan(
    @Param('studentId') studentId: string,
    @Request() req: any,
  ) {
    const requestedStudentId =
      Number(studentId);

    const authenticatedStudentId =
      Number(req.user.id);

    this.checkStudentAccess(
      requestedStudentId,
      authenticatedStudentId,
    );

    return this.adaptiveLearningService.createPlan(
      requestedStudentId,
    );
  }

  // =====================================
  // درس بعدی
  // =====================================

  @Get('next-lesson/:studentId')
  async nextLesson(
    @Param('studentId') studentId: string,
    @Request() req: any,
  ) {
    const requestedStudentId =
      Number(studentId);

    const authenticatedStudentId =
      Number(req.user.id);

    this.checkStudentAccess(
      requestedStudentId,
      authenticatedStudentId,
    );

    return this.adaptiveLearningService.nextLesson(
      requestedStudentId,
    );
  }
}
