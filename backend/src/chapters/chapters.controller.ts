import { Controller, Get, Post, Body } from '@nestjs/common';
import { ChaptersService } from './chapters.service';

@Controller('chapters')
export class ChaptersController {

  constructor(
    private readonly chaptersService: ChaptersService,
  ) {}

  @Post()
  create(
    @Body() body: {
      title: string;
      subjectId: number;
    },
  ) {
    return this.chaptersService.create(body);
  }


  @Get()
  findAll() {
    return this.chaptersService.findAll();
  }

}