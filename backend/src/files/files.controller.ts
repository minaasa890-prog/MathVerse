import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { FilesService } from './files.service';


@Controller('files')
export class FilesController {

  constructor(
    private readonly filesService: FilesService,
  ) {}


  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({

        destination: './uploads',

        filename: (req, file, callback) => {

          const uniqueName =
            Date.now() + extname(file.originalname);

          callback(null, uniqueName);

        },

      }),
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
  ){

    return this.filesService.upload(file);

  }



  @Get()
  findAll(){

    return this.filesService.findAll();

  }



  @Get('user/:id')
  findUserFiles(
    @Param('id') id:string,
  ){

    return this.filesService.findByUser(
      Number(id)
    );

  }



  @Get('classroom/:id')
  findClassroomFiles(
    @Param('id') id:string,
  ){

    return this.filesService.findByClassroom(
      Number(id)
    );

  }



  @Delete(':id')
  remove(
    @Param('id') id:string,
  ){

    return this.filesService.remove(
      Number(id)
    );

  }

}