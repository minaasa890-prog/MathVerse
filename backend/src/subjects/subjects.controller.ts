import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
} from '@nestjs/common';

import { SubjectsService } from './subjects.service';



@Controller('subjects')
export class SubjectsController {


  constructor(
    private readonly subjectsService: SubjectsService,
  ) {}



  @Post()
  create(
    @Body() body:{
      name:string;
      description?:string;
    },
  ){

    return this.subjectsService.create(body);

  }



  @Get()
  findAll(){

    return this.subjectsService.findAll();

  }



  @Get(':id')
  findOne(
    @Param('id') id:string,
  ){

    return this.subjectsService.findOne(
      Number(id)
    );

  }



  @Delete(':id')
  remove(
    @Param('id') id:string,
  ){

    return this.subjectsService.remove(
      Number(id)
    );

  }

}