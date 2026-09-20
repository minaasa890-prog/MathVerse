import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';



@Controller('analytics')
export class AnalyticsController {



  constructor(
    private service: AnalyticsService
  ) {}





  @Get('class/:id')
  async getClassAnalytics(

    @Param('id') id:string

  ){


    return this.service.getClassAnalytics(

      Number(id)

    );


  }



}