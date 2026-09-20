import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WrittenAnswerService } from './written-answer.service';

@Controller('written-answer')
export class WrittenAnswerController {
  constructor(
    private readonly writtenAnswerService: WrittenAnswerService,
  ) {}

  @Post('analyze')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: join(
          process.cwd(),
          'uploads',
          'written-answers',
        ),

        filename: (
          req,
          file,
          callback,
        ) => {
          const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
            extname(file.originalname);

          callback(
            null,
            uniqueName,
          );
        },
      }),

      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async analyze(
    @Request() req: any,
    @UploadedFile()
    image: Express.Multer.File,
    @Body('questionId')
    questionId: string,
  ) {
    if (!image) {
      return {
        success: false,
        message: 'Image is required.',
      };
    }

    const authenticatedStudentId =
      Number(req.user.id);

    return this.writtenAnswerService.analyzeWrittenAnswer(
      authenticatedStudentId,
      Number(questionId),
      image.path,
    );
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyWrittenAnswers(
    @Request() req: any,
  ) {
    const authenticatedStudentId =
      Number(req.user.id);

    return this.writtenAnswerService.getMyWrittenAnswers(
      authenticatedStudentId,
    );
  }
}