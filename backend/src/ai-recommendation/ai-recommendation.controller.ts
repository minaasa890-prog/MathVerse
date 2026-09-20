import { Controller, Get, Param } from '@nestjs/common';

import { AiRecommendationService } from './ai-recommendation.service';

import { AiPracticeService } from './ai-practice.service';



@Controller('ai-recommendation')
export class AiRecommendationController {


constructor(

private recommendationService: AiRecommendationService,

private practiceService: AiPracticeService

){}




@Get('student/:id')

async recommendation(

@Param('id') id:string

){


return this.recommendationService.getRecommendation(

Number(id)

);


}





@Get('practice/:id')

async practice(

@Param('id') id:string

){


return this.practiceService.generatePractice(

Number(id)

);


}



}