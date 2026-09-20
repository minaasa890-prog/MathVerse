import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { ClassroomsService } from './classrooms.service';

@Controller('classrooms')
export class ClassroomsController {
  constructor(
    private classroomsService: ClassroomsService,
  ) {}

  // ================= CREATE CLASS =================

  @Post()
  async create(
    @Body() body: any,
  ) {
    return this.classroomsService.create(body);
  }

  // ================= ADD STUDENT - LEGACY =================
  // Keeps the existing MathVerse behavior working.

  @Post(':id/add-student')
  async addStudent(
    @Param('id') classroomId: string,
    @Body() body: any,
  ) {
    return this.classroomsService.addStudent(
      Number(classroomId),
      Number(body.studentId),
    );
  }

  // ================= ADD STUDENT TO ANOTHER CLASS =================

  @Post(':id/members')
  async addStudentToClassroom(
    @Param('id') classroomId: string,
    @Body() body: any,
  ) {
    return this.classroomsService.addStudentToClassroom(
      Number(classroomId),
      Number(body.studentId),
    );
  }

  // ================= GET STUDENT CLASSROOMS =================

  @Get('student/:studentId')
  async getStudentClassrooms(
    @Param('studentId') studentId: string,
  ) {
    return this.classroomsService.getStudentClassrooms(
      Number(studentId),
    );
  }

  // ================= REMOVE STUDENT FROM CLASS =================

  @Delete(':id/members/:studentId')
  async removeStudentFromClassroom(
    @Param('id') classroomId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.classroomsService.removeStudentFromClassroom(
      Number(classroomId),
      Number(studentId),
    );
  }

  // ================= ASSIGN TEACHER =================

  @Post(':classroomId/teacher/:teacherId')
  async assignTeacher(
    @Param('classroomId') classroomId: string,
    @Param('teacherId') teacherId: string,
  ) {
    return this.classroomsService.assignTeacher(
      Number(classroomId),
      Number(teacherId),
    );
  }
}