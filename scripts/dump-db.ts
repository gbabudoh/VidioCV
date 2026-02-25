import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const profiles = await prisma.cvProfile.findMany();

  console.log(`--- FULL DB DUMP (${profiles.length} profiles) ---`);
  for (const p of profiles) {
    console.log(`ID: ${p.id}`);
    console.log(`User ID: ${p.userId}`);
    console.log(`Video URL: ${p.videoUrl}`);
    console.log('---');
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
