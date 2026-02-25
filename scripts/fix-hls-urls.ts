import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to construct embed URL from UUID
function getVidioCVEmbedUrl(uuid: string): string {
  return `https://peertube.feendesk.com/videos/embed/${uuid}?peertubeLink=0&p2p=0&title=0&warning=0&logo=0`;
}

async function main() {
  console.log("--- Starting Video URL Repair ---");
  
  const profiles = await prisma.cvProfile.findMany({
    where: {
      videoUrl: {
        not: {
          contains: "/embed/"
        }
      }
    }
  });

  console.log(`Found ${profiles.length} profiles needing repair.`);

  for (const profile of profiles) {
    if (!profile.videoUrl) continue;

    console.log(`Checking profile ${profile.id} with URL: ${profile.videoUrl}`);
    
    let uuid = null;
    
    // Pattern 1: Web videos
    const webMatch = profile.videoUrl.match(/web-videos\/[^/]+\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (webMatch) uuid = webMatch[1];
    
    if (!uuid) {
      // Pattern 2: HLS playlist
      const hlsMatch = profile.videoUrl.match(/streaming-playlists\/hls\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
      if (hlsMatch) uuid = hlsMatch[1];
    }

    if (!uuid) {
      // Pattern 3: Generic UUID search
      const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
      const match = profile.videoUrl.match(uuidRegex);
      if (match) uuid = match[0];
    }

    if (uuid) {
      const embedUrl = getVidioCVEmbedUrl(uuid);
      console.log(`Updating profile ${profile.id}: ${profile.videoUrl} -> ${embedUrl}`);
      
      await prisma.cvProfile.update({
        where: { id: profile.id },
        data: { videoUrl: embedUrl }
      });
    } else {
      console.warn(`Could not extract UUID from URL: ${profile.videoUrl}`);
    }
  }

  const check = await prisma.cvProfile.findMany();
  console.log("Final check - all URLs in DB:");
  check.forEach(p => console.log(`- ${p.videoUrl}`));

  console.log("--- Repair Complete ---");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
