import { Controller, Get, Param } from '@nestjs/common';
import { AiSolutionService } from './ai-solution.service';


@Controller('ai-solution')
export class AiSolutionController {


constructor(
private readonly aiSolutionService: AiSolutionService
){}



@Get(':id')
async getSolution(
@Param('id') id:string
){


console.log("QUESTION ID FROM URL:", id);



return this.aiSolutionService.getSolution(
Number(id)
);


}


}