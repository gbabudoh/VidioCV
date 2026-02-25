import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("--- DATABASE AUDIT ---");
  try {
    const profiles = await prisma.cvProfile.findMany();
    console.log(`Total Profiles: ${profiles.length}`);
    for (const p of profiles) {
      console.log(`ID: ${p.id}`);
      console.log(`User ID: ${p.userId}`);
      console.log(`Video URL: ${p.videoUrl}`);
      console.log('---');
    }
  } catch (err) {
    console.error("Audit failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
