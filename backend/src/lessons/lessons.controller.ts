import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
} from '@nestjs/common';

import { LessonsService } from './lessons.service';

@Controller('lessons')
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
  ) {}

  @Post()
  create(
    @Body()
    body: {
      title: string;
      content?: string;
      chapterId: number;
    },
  ) {
    return this.lessonsService.create(body);
  }

  @Get()
  findAll() {
    return this.lessonsService.findAll();
  }

  @Get('chapter/:chapterId')
  findByChapter(
    @Param('chapterId') chapterId: string,
  ) {
    return this.lessonsService.findByChapter(
      Number(chapterId),
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.lessonsService.findOne(
      Number(id),
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.lessonsService.remove(
      Number(id),
    );
  }
}
