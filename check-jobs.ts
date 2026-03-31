import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const jobsCount = await prisma.job.count();
  console.log(`Jobs count: ${jobsCount}`);
  const jobs = await prisma.job.findMany({
    include: {
      employer: true
    }
  });
  console.log('Jobs:', JSON.stringify(jobs, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
