import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { LessonContentService } from './lesson-content.service';


@Controller('lesson-content')
export class LessonContentController {


  constructor(
    private readonly lessonContentService: LessonContentService,
  ) {}



  @Post()
  create(
    @Body() data:any,
  ){

    return this.lessonContentService.create(data);

  }



  @Get()
  findAll(){

    return this.lessonContentService.findAll();

  }



  @Get('lesson/:lessonId')
  findByLesson(
    @Param('lessonId') lessonId:string,
  ){

    return this.lessonContentService.findByLesson(
      Number(lessonId)
    );

  }



  @Get(':id')
  findOne(
    @Param('id') id:string,
  ){

    return this.lessonContentService.findOne(
      Number(id)
    );

  }



  @Patch(':id')
  update(
    @Param('id') id:string,
    @Body() data:any,
  ){

    return this.lessonContentService.update(
      Number(id),
      data,
    );

  }



  @Post(':id/attach-file/:fileId')
attachFile(
  @Param('id') id:string,
  @Param('fileId') fileId:string,
) {

  return this.lessonContentService.attachFile(
    Number(id),
    fileId,
  );

}


  @Delete(':id')
  remove(
    @Param('id') id:string,
  ){

    return this.lessonContentService.remove(
      Number(id)
    );

  }

}