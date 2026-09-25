import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';

import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(
    private questionsService: QuestionsService,
  ) {}

  // ===============================
  // CREATE QUESTION
  // ===============================

  @Post()
  create(
    @Body() body: any,
  ) {
    return this.questionsService.create(body);
  }

  // ===============================
  // ALL QUESTIONS IN QUESTION BANK
  // ===============================

  @Get()
  findAll() {
    return this.questionsService.findAll();
  }

  // ===============================
  // SINGLE QUESTION
  // ===============================

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.questionsService.findOne(
      Number(id),
    );
  }

  // ===============================
  // SAVE QUESTION TO QUESTION BANK
  // ===============================

  @Patch(':id/save-to-bank')
  saveToQuestionBank(
    @Param('id') id: string,
  ) {
    return this.questionsService.saveToQuestionBank(
      Number(id),
    );
  }

  // ===============================
  // REMOVE FROM QUESTION BANK
  // ===============================

  @Patch(':id/remove-from-bank')
  removeFromQuestionBank(
    @Param('id') id: string,
  ) {
    return this.questionsService.removeFromQuestionBank(
      Number(id),
    );
  }

  // ===============================
  // DELETE
  // ===============================

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.questionsService.remove(
      Number(id),
    );
  }
}