import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  BadRequestException,
} from '@nestjs/common';

import { ExamsService } from './exams.service';

@Controller('exams')
export class ExamsController {
  constructor(
    private readonly examsService: ExamsService,
  ) {}

  // =========================
  // CREATE EXAM
  // =========================

  @Post()
  async createExam(@Body() body: any) {
    return this.examsService.createExam(body);
  }

  // =========================
  // GET CLASSROOM EXAMS
  // =========================

  @Get('classroom/:id')
  async getClassroomExams(
    @Param('id') id: string,
  ) {
    return this.examsService.getClassroomExams(
      Number(id),
    );
  }

  // =========================
  // PUBLISH EXAM
  // =========================

  @Post(':id/publish')
  async publishExam(
    @Param('id') id: string,
  ) {
    return this.examsService.publishExam(
      Number(id),
    );
  }

  // =========================
  // ADD QUESTION TO EXAM
  // =========================

  @Post(':examId/question/:questionId')
  async addQuestionToExam(
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.examsService.addQuestionToExam(
      Number(examId),
      Number(questionId),
    );
  }

  // =========================
  // REMOVE QUESTION FROM EXAM
  // =========================

  @Delete(':examId/question/:questionId')
  async removeQuestionFromExam(
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.examsService.removeQuestionFromExam(
      Number(examId),
      Number(questionId),
    );
  }

  // =========================
  // MOVE QUESTION UP
  // =========================

  @Post(':examId/question/:questionId/move-up')
  async moveQuestionUp(
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.examsService.moveQuestionUp(
      Number(examId),
      Number(questionId),
    );
  }

  // =========================
  // MOVE QUESTION DOWN
  // =========================

  @Post(':examId/question/:questionId/move-down')
  async moveQuestionDown(
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.examsService.moveQuestionDown(
      Number(examId),
      Number(questionId),
    );
  }

  // =========================
  // START EXAM
  // =========================

  @Get(':examId/start/:studentId')
  async startExam(
    @Param('examId') examId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.examsService.startExam(
      Number(examId),
      Number(studentId),
    );
  }

  // =========================
  // SUBMIT EXAM
  // =========================

  @Post(':examId/submit')
  async submitExam(
    @Param('examId') examId: string,
    @Body() body: any,
  ) {
    const studentId = Number(
      body.studentId,
    );

    if (!studentId) {
      throw new BadRequestException(
        'studentId is required',
      );
    }

    return this.examsService.submitExam(
      Number(examId),
      studentId,
      body.answers,
    );
  }
}