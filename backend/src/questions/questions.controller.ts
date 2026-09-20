import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete
} from '@nestjs/common';

import { QuestionsService } from './questions.service';



@Controller('questions')
export class QuestionsController {


  constructor(
    private questionsService: QuestionsService
  ){}



  // ===============================
  // CREATE QUESTION
  // ===============================

  @Post()
  create(
    @Body() body:any
  ){

    return this.questionsService.create(body);

  }



  // ===============================
  // ALL QUESTIONS
  // ===============================

  @Get()
  findAll(){

    return this.questionsService.findAll();

  }



  // ===============================
  // SINGLE QUESTION
  // ===============================

  @Get(':id')
  findOne(
    @Param('id') id:string
  ){

    return this.questionsService.findOne(
      Number(id)
    );

  }



  // ===============================
  // DELETE
  // ===============================

  @Delete(':id')
  remove(
    @Param('id') id:string
  ){

    return this.questionsService.remove(
      Number(id)
    );

  }


}