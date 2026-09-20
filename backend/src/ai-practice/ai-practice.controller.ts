import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AiPracticeService } from './ai-practice.service';

@Controller('ai-practice')
export class AiPracticeController {

  constructor(
    private readonly aiPracticeService: AiPracticeService
  ) {}


  @Get('test')
  getTest(){
    return this.aiPracticeService.getTest();
  }


  @Get('student/:id')
  getStudentPractice(
    @Param('id') id:string
  ){
    return this.aiPracticeService.getStudentPractice(
      Number(id)
    );
  }



  @Post('submit')
  submitPractice(
    @Body() body:{
      studentId:number;
      questionId:number;
      answer:string;
    }
  ){

    return this.aiPracticeService.submitPractice(body);

  }


}