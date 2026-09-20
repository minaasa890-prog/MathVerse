import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

  await prisma.question.update({
    where:{
      id:277
    },
    data:{
      explanation:
      "برای پیدا کردن عدد اولیه، ابتدا 5 را به 17 اضافه می‌کنیم سپس تقسیم بر 2 می‌کنیم.",
      
      solution:
      "x × 2 - 5 = 17\nx × 2 = 22\nx = 11"
    }
  });


  await prisma.question.update({
    where:{
      id:284
    },
    data:{
      explanation:
      "ابتدا عملیات جمع و تفریق را از چپ به راست انجام می‌دهیم.",
      
      solution:
      "-5 + 3 - 7 + 10 = 1"
    }
  });


  await prisma.question.update({
    where:{
      id:282
    },
    data:{
      explanation:
      "ضرب عدد منفی در عدد مثبت همیشه منفی است.",
      
      solution:
      "-6 × 3 = -18"
    }
  });


  console.log("Solutions updated");

}


main()
.catch(console.error)
.finally(()=>prisma.$disconnect());