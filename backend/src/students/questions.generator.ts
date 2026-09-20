import { Injectable } from '@nestjs/common';


@Injectable()
export class QuestionsGenerator {


generate(
subject:string,
level:string
){


if(subject.includes("Math")){


return {


subject,

level,


questions:[


{
question:"Solve equation: 2x + 5 = 15",
answer:"x = 5",
difficulty:"Easy"
},


{
question:"Calculate area of rectangle length 8 width 5",
answer:"40",
difficulty:"Easy"
},


{
question:"Find x: 3x - 7 = 20",
answer:"x = 9",
difficulty:"Medium"
},


{
question:"Solve x² + 5x + 6 = 0",
answer:"x=-2 or x=-3",
difficulty:"Hard"
}


]


};


}



return {


subject,

level,


questions:[

{
question:"General practice question",
difficulty:"Easy"
}

]


};


}


}