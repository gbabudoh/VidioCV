import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Manually defining this here to avoid import issues from lib
function getVidioCVEmbedUrl(uuid: string): string {
  const VIDIOCV_URL = process.env.PEERTUBE_URL || "https://peertube.feendesk.com";
  return `${VIDIOCV_URL}/videos/embed/${uuid}?peertubeLink=0&p2p=0&title=0&warning=0`;
}

async function main() {
  const profiles = await prisma.cvProfile.findMany({
    where: {
      videoUrl: {
        not: {
          contains: "/embed/"
        }
      }
    }
  });

  console.log(`Found ${profiles.length} profiles to revert.`);

  for (const profile of profiles) {
    if (profile.videoUrl && (profile.videoUrl.includes('peertube') || profile.videoUrl.includes('vidiocv') || profile.videoUrl.includes('feendesk'))) {
      
      let uuid = null;
      
      // Pattern 1: Web video format
      // https://.../static/web-videos/720/3fa37db4-11e6-4d91-93a1-2c7cc7f029bb-720.webm
      const webMatch = profile.videoUrl.match(/web-videos\/[^/]+\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
      if (webMatch) uuid = webMatch[1];
      
      if (!uuid) {
        // Pattern 2: HLS playlist
        const hlsMatch = profile.videoUrl.match(/streaming-playlists\/hls\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
        if (hlsMatch) uuid = hlsMatch[1];
      }

      if (!uuid) {
        // Pattern 3: Generic UUID search
        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
        const match = profile.videoUrl.match(uuidRegex);
        if (match) uuid = match[0];
      }

      if (uuid) {
        const embedUrl = getVidioCVEmbedUrl(uuid);
        console.log(`Reverting profile ID: ${profile.id}, found UUID: ${uuid}, new URL: ${embedUrl}`);
        
        await prisma.cvProfile.update({
          where: { id: profile.id },
          data: { videoUrl: embedUrl }
        });
        console.log(`Successfully reverted profile ${profile.id}`);
      } else {
        console.log(`Could not extract UUID from URL: ${profile.videoUrl}`);
      }
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
