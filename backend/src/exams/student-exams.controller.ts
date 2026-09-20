import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import { ExamsService } from './exams.service';

@Controller('student')
export class StudentExamsController {
  constructor(
    private readonly examsService: ExamsService,
  ) {}

  // دریافت آزمون‌های دانش‌آموز
  //
  // نمونه:
  // GET /student/exams?studentId=1
  //
  // اگر studentId ارسال نشود،
  // برای سازگاری با نسخه قبلی،
  // همه آزمون‌های منتشرشده برگردانده می‌شوند.

  @Get('exams')
  async getStudentExams(
    @Query('studentId') studentId?: string,
  ) {
    if (studentId) {
      return this.examsService.getStudentExams(
        Number(studentId),
      );
    }

    return this.examsService.getStudentExams();
  }
}