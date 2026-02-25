import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Wiping all video-related data for ALL profiles...");

  const result = await prisma.cvProfile.updateMany({
    data: {
      videoUrl: null,
      videoThumbnailUrl: null,
      videoDuration: null,
      videoStatus: "deleted"
    }
  });

  console.log(`Successfully updated ${result.count} profiles.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
