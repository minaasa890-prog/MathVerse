import {
  Controller,
  Get,
  Param
} from '@nestjs/common';

import { DashboardService } from './dashboard.service';



@Controller('dashboard')
export class DashboardController {


  constructor(
    private readonly dashboardService: DashboardService
  ) {}



  // =====================================
  // داشبورد دانش آموز
  // =====================================

  @Get('student/:id')
  getStudentDashboard(
    @Param('id') id:string
  ){

    return this.dashboardService.getStudentDashboard(
      Number(id)
    );

  }





  // =====================================
  // داشبورد هوشمند AI دانش آموز
  // =====================================

  @Get('student/:id/ai')
  getStudentAIDashboard(
    @Param('id') id:string
  ){

    return this.dashboardService.getStudentDashboard(
      Number(id)
    );

  }





  // =====================================
  // داشبورد مدرس
  // =====================================

  @Get('teacher/:id')
  getTeacherDashboard(
    @Param('id') id:string
  ){

    return this.dashboardService.getTeacherDashboard(
      Number(id)
    );

  }


}