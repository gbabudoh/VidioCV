import { PrismaClient } from "@prisma/client";
import { deleteVideoFromVidioCV } from "../lib/vidiocv";

const prisma = new PrismaClient();

async function main() {
  const email = "candidate@demo.com";
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true }
  });

  if (!user) {
    console.log("Demo user not found");
    return;
  }

  const cvProfile = await prisma.cvProfile.findFirst({
    where: { userId: user.id }
  });

  if (!cvProfile || !cvProfile.videoUrl) {
    console.log("No video to delete for this user");
    return;
  }

  console.log("Found video URL:", cvProfile.videoUrl);

  // Extract UUID
  const uuidMatch = cvProfile.videoUrl.match(/embed\/([a-zA-Z0-9-]+)/) || cvProfile.videoUrl.match(/watch\/([a-zA-Z0-9-]+)/) || cvProfile.videoUrl.match(/w\/([a-zA-Z0-9-]+)/);
  
  if (uuidMatch) {
    const uuid = uuidMatch[1];
    console.log("Attempting to delete video from PeerTube, UUID:", uuid);
    try {
      await deleteVideoFromVidioCV(uuid);
      console.log("Deleted from PeerTube successfully");
    } catch (err) {
      console.warn("Failed to delete from PeerTube (might be already gone):", err instanceof Error ? err.message : err);
    }
  }

  console.log("Wiping database fields for profile:", cvProfile.id);
  await prisma.cvProfile.update({
    where: { id: cvProfile.id },
    data: {
      videoUrl: null,
      videoThumbnailUrl: null,
      videoStatus: "not_uploaded",
      isPublished: false
    }
  });

  console.log("--- Demo Account Reset Successfully ---");
}

main().catch(console.error).finally(() => prisma.$disconnect());
