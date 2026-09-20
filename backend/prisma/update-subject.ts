import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

  const result = await prisma.question.updateMany({

    where: {
      subject: "Math"
    },

    data: {
      subject: "Math7"
    }

  });


  console.log("Updated:", result.count);

}


main()
.then(() => prisma.$disconnect())
.catch(async (e) => {

  console.log(e);

  await prisma.$disconnect();

});