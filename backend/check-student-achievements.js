const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const studentAchievements =
    await prisma.studentAchievement.findMany({
      orderBy: { id: 'asc' },
    });

  console.log(
    JSON.stringify(studentAchievements, null, 2)
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
