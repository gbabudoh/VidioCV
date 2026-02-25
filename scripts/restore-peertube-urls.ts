import { PrismaClient } from "@prisma/client";
import { extractVideoUuid, PEERTUBE_BASE_URL } from "../app/lib/video";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting PeerTube URL restoration...");

  const profiles = await prisma.cvProfile.findMany({
    where: {
      videoUrl: {
        not: null,
      },
    },
  });

  console.log(`Found ${profiles.length} profiles with video URLs.`);

  let fixCount = 0;
  for (const profile of profiles) {
    const url = profile.videoUrl!;
    
    // We want to fix anything that is NOT a standard embed URL
    // Especially HLS master playlists
    if (url.includes("/hls/") || url.includes(".m3u8") || (url.includes(PEERTUBE_BASE_URL) && !url.includes("/videos/embed/"))) {
      const uuid = extractVideoUuid(url);
      
      if (uuid) {
        const newUrl = `${PEERTUBE_BASE_URL}/videos/embed/${uuid}?peertubeLink=0&p2p=0&title=0&warning=0&logo=0`;
        
        console.log(`Fixing URL for profile ${profile.slug}:`);
        console.log(`  Old: ${url}`);
        console.log(`  New: ${newUrl}`);
        
        await prisma.cvProfile.update({
          where: { id: profile.id },
          data: { videoUrl: newUrl },
        });
        
        fixCount++;
      } else {
        console.warn(`Could not extract UUID from URL: ${url}`);
      }
    }
  }

  console.log(`\nRestoration complete. Fixed ${fixCount} URLs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
