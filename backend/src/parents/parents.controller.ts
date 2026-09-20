import {
  Controller,
  Get,
  Param,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';

import { ParentsService } from './parents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('parent')
@UseGuards(JwtAuthGuard)
export class ParentsController {
  constructor(
    private readonly parentsService: ParentsService,
  ) {}

  // =========================================================
  // داشبورد والد
  // =========================================================

  @Get('dashboard/:id')
  dashboard(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const parentId = Number(id);
    const loggedInUserId = Number(req.user.id);

    if (req.user.role !== 'PARENT') {
      throw new ForbiddenException(
        'Only parents can access this resource',
      );
    }

    if (parentId !== loggedInUserId) {
      throw new ForbiddenException(
        'You can only access your own parent dashboard',
      );
    }

    return this.parentsService.dashboard(parentId);
  }

  // =========================================================
  // روند پیشرفت سؤالات چالشی فرزند
  // =========================================================

  @Get(
    'student/:studentId/challenging-progress',
  )
  challengingProgress(
    @Param('studentId') studentId: string,
    @Request() req: any,
  ) {
    const id = Number(studentId);
    const parentId = Number(req.user.id);

    if (req.user.role !== 'PARENT') {
      throw new ForbiddenException(
        'Only parents can access this resource',
      );
    }

    return this.parentsService.challengingProgress(
      id,
      parentId,
    );
  }

  // =========================================================
  // API تشخیصی پاسخ‌های دانش‌آموز
  // =========================================================

  @Get(
    'student/:studentId/debug-attempts',
  )
  debugStudentAttempts(
    @Param('studentId') studentId: string,
    @Request() req: any,
  ) {
    const id = Number(studentId);
    const parentId = Number(req.user.id);

    if (req.user.role !== 'PARENT') {
      throw new ForbiddenException(
        'Only parents can access this resource',
      );
    }

    return this.parentsService.debugStudentAttempts(
      id,
      parentId,
    );
  }
}

