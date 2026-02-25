import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const VIDIOCV_URL = process.env.PEERTUBE_URL || "https://peertube.feendesk.com";
  const CORRECT_UUID = "3fa37db4-11e6-4d91-93a1-2c7cc7f029bb";
  const EMBED_URL = `${VIDIOCV_URL}/videos/embed/${CORRECT_UUID}?peertubeLink=0&p2p=0&title=0&warning=0`;

  // Update the only profile we have
  const result = await (prisma as any).cvProfile.updateMany({
    data: {
      videoUrl: EMBED_URL
    }
  });

  console.log(`Updated ${result.count} profiles to: ${EMBED_URL}`);
  
  await prisma.$disconnect();
}

main().catch(console.error);
