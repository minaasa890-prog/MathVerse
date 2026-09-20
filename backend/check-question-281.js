const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const question = await prisma.question.findUnique({
    where: { id: 281 },
  });

  console.log(JSON.stringify(question, null, 2));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
