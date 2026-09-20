import { Controller, Get, Param } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';



@Controller('leaderboard')
export class LeaderboardController {



  constructor(
    private service: LeaderboardService
  ) {}





  @Get('class/:id')
  async getClassRanking(

    @Param('id') id:string

  ){


    return this.service.getClassRanking(

      Number(id)

    );


  }



}