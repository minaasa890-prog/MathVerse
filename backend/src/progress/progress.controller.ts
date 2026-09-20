import {
  Controller,
  Get,
  Post,
  Body,
  Param
} from '@nestjs/common';

import { ProgressService } from './progress.service';



@Controller('progress')
export class ProgressController {



  constructor(
    private service: ProgressService
  ) {}





  // =========================================
  // GET STUDENT PROGRESS
  // =========================================

  @Get('student/:id')
  getStudentProgress(
    @Param('id') id:string
  ){

    return this.service.getStudentProgress(
      Number(id)
    );

  }






  // =========================================
  // CREATE / UPDATE LESSON PROGRESS
  // =========================================

  @Post('lesson')
  createLessonProgress(
    @Body() body:any
  ){

    return this.service.createLessonProgress(
      body
    );

  }







  // =========================================
  // GET SINGLE LESSON PROGRESS
  // =========================================

  @Get('student/:studentId/lesson/:lessonId')
  getLessonProgress(

    @Param('studentId') studentId:string,

    @Param('lessonId') lessonId:string

  ){

    return this.service.getLessonProgress(

      Number(studentId),

      Number(lessonId)

    );

  }







  // =========================================
  // COMPLETE LESSON
  // =========================================

  @Post('complete/:studentId/:lessonId')
  completeLesson(

    @Param('studentId') studentId:string,

    @Param('lessonId') lessonId:string

  ){


    return this.service.completeLesson(

      Number(studentId),

      Number(lessonId)

    );


  }







  // =========================================
  // LEARNING SUMMARY
  // =========================================

  @Get('student/:id/summary')
  summary(

    @Param('id') id:string

  ){

    return this.service.getLearningSummary(

      Number(id)

    );

  }



}