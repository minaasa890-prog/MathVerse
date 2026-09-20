import {
  Controller,
  Get,
  Param,
  Post,
  Body,
} from '@nestjs/common';

import { TeachersService } from './teachers.service';

@Controller('teacher')
export class TeachersController {
  constructor(
    private teachersService: TeachersService,
  ) {}

  // =========================================================
  // داشبورد معلم
  // =========================================================

  @Get('dashboard/:teacherId')
  async dashboard(
    @Param('teacherId') teacherId: string,
  ) {
    return this.teachersService.dashboard(
      Number(teacherId),
    );
  }

  // =========================================================
  // دانش‌آموزان کلاس
  // =========================================================

  @Get('class/:classroomId/students')
  async students(
    @Param('classroomId') classroomId: string,
  ) {
    return this.teachersService.getClassStudents(
      Number(classroomId),
    );
  }

  // =========================================================
  // نتایج کلاس
  // =========================================================

  @Get('class/:classroomId/results')
  async results(
    @Param('classroomId') classroomId: string,
  ) {
    return this.teachersService.getClassResults(
      Number(classroomId),
    );
  }

  // =========================================================
  // رتبه‌بندی کلاس
  // =========================================================

  @Get('class/:classroomId/ranking')
  async ranking(
    @Param('classroomId') classroomId: string,
  ) {
    return this.teachersService.ranking(
      Number(classroomId),
    );
  }

  // =========================================================
  // تحلیل هوشمند کل کلاس
  // =========================================================

  @Get('class/:classroomId/ai-analysis')
  async classAiAnalysis(
    @Param('classroomId') classroomId: string,
  ) {
    return this.teachersService.classAiAnalysis(
      Number(classroomId),
    );
  }

  // =========================================================
  // جزئیات یک آزمون در کلاس
  // =========================================================

  @Get('class/:classroomId/exam/:examId/details')
  async examDetails(
    @Param('classroomId') classroomId: string,
    @Param('examId') examId: string,
  ) {
    return this.teachersService.getExamDetails(
      Number(classroomId),
      Number(examId),
    );
  }

  // =========================================================
  // تحلیل هوشمند دانش‌آموز
  // =========================================================

  @Get('student/:studentId/ai-analysis')
  async aiAnalysis(
    @Param('studentId') studentId: string,
  ) {
    return this.teachersService.aiAnalysis(
      Number(studentId),
    );
  }

  // =========================================================
  // تمرین پیشنهادی دانش‌آموز
  // =========================================================

  @Get('student/:studentId/practice')
  async practice(
    @Param('studentId') studentId: string,
  ) {
    return this.teachersService.practice(
      Number(studentId),
    );
  }

  // =========================================================
  // ساخت آزمون توسط معلم
  // =========================================================

  @Post('exam/create')
  async createExam(
    @Body()
    body: {
      teacherId: number;
      classroomId: number;
      title: string;
      description?: string;
      duration?: number;
      questionCount?: number;
      chapter?: string;
      difficulty?: number;
    },
  ) {
    return this.teachersService.createExam(body);
  }
}