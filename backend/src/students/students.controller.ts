import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';

import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('students')
export class StudentsController {

  constructor(
    private readonly studentsService: StudentsService
  ) {}


  // =========================
  // داشبورد اصلی دانش آموز
  // =========================

  @UseGuards(JwtAuthGuard)
  @Get(':id/dashboard')
  async dashboard(
    @Param('id') id: string,
    @Request() req: any,
  ) {

    const studentId = Number(id);

    // کاربر فقط اجازه دسترسی به داشبورد خودش را دارد
    if (req.user.id !== studentId) {
      throw new ForbiddenException(
        'You are not allowed to access this student dashboard'
      );
    }

    return this.studentsService.getAiDashboard(
      studentId
    );

  }


  // =========================
  // داشبورد هوش مصنوعی دانش آموز
  // =========================

  @UseGuards(JwtAuthGuard)
  @Get(':id/ai-dashboard')
  async aiDashboard(
    @Param('id') id: string,
    @Request() req: any,
  ) {

    const studentId = Number(id);

    // کاربر فقط اجازه دسترسی به AI Dashboard خودش را دارد
    if (req.user.id !== studentId) {
      throw new ForbiddenException(
        'You are not allowed to access this student AI dashboard'
      );
    }

    return this.studentsService.getAiDashboard(
      studentId
    );

  }


  // =========================
  // گزارش AI Tutor
  // =========================

  @Get(':id/ai-tutor')
  async aiTutor(
    @Param('id') id: string
  ) {

    return this.studentsService.aiTutor(
      Number(id)
    );

  }


  // =========================
  // ساخت تمرین پیشنهادی
  // =========================

  @Get(':id/generate-practice')
  async generatePractice(
    @Param('id') id: string
  ) {

    return this.studentsService.generatePractice(
      Number(id)
    );

  }


  // =========================
  // درس های دانش آموز
  // =========================

  @Get(':id/lessons')
  async lessons(
    @Param('id') id: string
  ) {

    return this.studentsService.lessons(
      Number(id)
    );

  }

}