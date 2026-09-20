import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { AdaptiveLearningService } from './adaptive-learning.service';


@Controller('adaptive-learning')
export class AdaptiveLearningController {

  constructor(
    private readonly adaptiveLearningService: AdaptiveLearningService,
  ) {}



  // شروع Session
  @Post('session/start')
  async startSession(
    @Body() body:any,
  ){

    return this.adaptiveLearningService
      .startPracticeSession(
        body.studentId
      );

  }



  // گرفتن سوال بعدی
  @Get('session/question/:sessionId')
  async nextQuestion(
    @Param('sessionId') sessionId:string,
  ){

    return this.adaptiveLearningService
      .getNextQuestion(
        Number(sessionId)
      );

  }




  // ثبت جواب
  @Post('session/answer')
  async submitAnswer(
    @Body() body:any,
  ){

    return this.adaptiveLearningService
      .submitSessionAnswer(

        body.sessionId,

        body.studentId,

        body.questionId,

        body.answer

      );

  }





  // گزارش نهایی Session
  @Get('session/report/:sessionId')
  async report(
    @Param('sessionId') sessionId:string,
  ){

    return this.adaptiveLearningService
      .getSessionReport(
        Number(sessionId)
      );

  }



  // پایان Session
  @Get('session/finish/:sessionId')
  async finish(
    @Param('sessionId') sessionId:string,
  ){

    return this.adaptiveLearningService
      .finishSession(
        Number(sessionId)
      );

  }


}