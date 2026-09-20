const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const students = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
    },
    select: {
      id: true,
      name: true,
      classroomId: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  console.log(JSON.stringify(students, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });