import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AttemptsService } from './attempts.service';

@Controller('attempts')
export class AttemptsController {

  constructor(
    private readonly attemptsService: AttemptsService,
  ) {}



  @Post()
  submitAnswer(
    @Body() body:any,
  ) {

    return this.attemptsService.submitAnswer(body);

  }





  @Get('student/:studentId/exam/:examId')
  getStudentAttempts(

    @Param('studentId') studentId:string,

    @Param('examId') examId:string,

  ){

    return this.attemptsService.getStudentExamAttempts(

      Number(studentId),

      Number(examId),

    );

  }





  @Get('result/student/:studentId/exam/:examId')
  getExamResult(

    @Param('studentId') studentId:string,

    @Param('examId') examId:string,

  ){

    return this.attemptsService.getExamResult(

      Number(studentId),

      Number(examId),

    );

  }





  // نتیجه کل کلاس در یک آزمون

  @Get('classroom/:classroomId/exam/:examId/results')
  getClassExamResults(

    @Param('classroomId') classroomId:string,

    @Param('examId') examId:string,

  ){

    return this.attemptsService.getClassExamResults(

      Number(classroomId),

      Number(examId),

    );

  }
@Get('exam/:examId/statistics')
getExamStatistics(
  @Param('examId') examId: string,
) {

  return this.attemptsService.getExamStatistics(
    Number(examId),
  );

}
@Get('exam/:examId/questions-analysis')
getQuestionsAnalysis(
  @Param('examId') examId:string,
){

  return this.attemptsService.getQuestionsAnalysis(
    Number(examId),
  );

}
@Get('student/:studentId/analysis')
getStudentAnalysis(
  @Param('studentId') studentId: string,
) {

  return this.attemptsService.getStudentAnalysis(
    Number(studentId),
  );

}
@Get('student/:studentId/recommendations')
getStudentRecommendations(
  @Param('studentId') studentId: string,
) {
  return this.attemptsService.getStudentRecommendations(
    Number(studentId),
  );
}
@Get('student/:studentId/exam/:examId/result')
async studentExamResult(
  @Param('studentId') studentId:string,
  @Param('examId') examId:string,
){

  return this.attemptsService.getStudentExamResult(
    Number(studentId),
    Number(examId),
  );

}
}