import { Controller, Get, Param, Post } from '@nestjs/common';
import { AchievementsService } from './achievements.service';

@Controller('achievements')
export class AchievementsController {
  constructor(
    private readonly service: AchievementsService,
  ) {}

  /**
   * دریافت Achievementهای دانش‌آموز
   */
  @Get('student/:id')
  async getAchievements(
    @Param('id') id: string,
  ) {
    return this.service.getStudentAchievements(
      Number(id),
    );
  }

  /**
   * بررسی و اعطای Achievementهای جدید
   */
  @Post('check/:id')
  async checkAchievements(
    @Param('id') id: string,
  ) {
    return this.service.checkAndGrantAchievements(
      Number(id),
    );
  }
}