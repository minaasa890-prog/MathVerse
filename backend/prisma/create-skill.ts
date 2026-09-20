import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


async function main(){

const skill = await prisma.studentSkill.upsert({

where:{

studentId_chapter:{

studentId:1,

chapter:"فصل 1 - راهبرد حل مسئله"

}

},


update:{


masteryScore:30,


correctCount:0,


wrongCount:0


},


create:{


studentId:1,


chapter:"فصل 1 - راهبرد حل مسئله",


correctCount:0,


wrongCount:0,


masteryScore:30,


level:1


}


});


console.log(skill);


}


main()
.catch(e=>{

console.error(e);

})
.finally(()=>{

prisma.$disconnect();

});