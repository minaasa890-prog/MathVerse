import {
Controller,
Get,
Post,
Param
} from '@nestjs/common';


import { RewardsService } from './rewards.service';



@Controller('rewards')
export class RewardsController {



constructor(
private rewardsService: RewardsService
){}




@Post('add-xp/:studentId/:amount')
async addXP(

@Param('studentId')
studentId:string,


@Param('amount')
amount:string

){


return this.rewardsService.addXP(

Number(studentId),

Number(amount)

);


}





@Get(':studentId')
async getReward(

@Param('studentId')
studentId:string

){


return this.rewardsService.getReward(

Number(studentId)

);


}



}