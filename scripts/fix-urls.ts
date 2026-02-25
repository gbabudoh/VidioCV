import { PrismaClient } from "@prisma/client";
import { getVidioCVFileUrl } from "../lib/vidiocv";

const prisma = new PrismaClient();

async function main() {
  const profiles = await prisma.cvProfile.findMany({
    where: {
      videoUrl: {
        contains: "/embed/"
      }
    }
  });

  console.log(`Found ${profiles.length} profiles to update.`);

  for (const profile of profiles) {
    if (profile.videoUrl) {
      const match = profile.videoUrl.match(/embed\/([^?]+)/);
      if (match && match[1]) {
        const uuid = match[1];
        console.log(`Migrating profile ID: ${profile.id}, video UUID: ${uuid}`);
        
        try {
          const directFileUrl = await getVidioCVFileUrl(uuid);
          if (directFileUrl) {
            await prisma.cvProfile.update({
              where: { id: profile.id },
              data: { videoUrl: directFileUrl }
            });
            console.log(`Successfully updated profile ${profile.id} to ${directFileUrl}`);
          } else {
            console.log(`Could not find direct file URL for ${uuid}`);
          }
        } catch (error) {
           console.error(`Error updating profile ${profile.id}:`, error);
        }
      }
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
