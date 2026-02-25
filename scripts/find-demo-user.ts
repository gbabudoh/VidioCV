import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "candidate@demo.com" },
    include: { profile: true }
  });

  if (!user) {
    console.log("Demo user not found");
    return;
  }

  console.log("User ID:", user.id);

  const cvProfile = await prisma.cvProfile.findFirst({
    where: { userId: user.id }
  });

  if (!cvProfile) {
    console.log("No CV Profile found for this user");
    return;
  }

  console.log("CV Profile ID:", cvProfile.id);
  console.log("Current Video URL:", cvProfile.videoUrl);
}

main().catch(console.error).finally(() => prisma.$disconnect());
