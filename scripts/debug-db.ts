import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.cvProfile.findFirst({
    where: {
      userId: "3fa37db4-11e6-4d91-93a1-2c7cc7f029bb" // From previous logs
    }
  });

  if (profile) {
    console.log("Found profile for user:");
    console.log(JSON.stringify(profile, null, 2));
  } else {
    console.log("Profile not found for this user ID. Listing all profiles:");
    const all = await prisma.cvProfile.findMany();
    console.log(JSON.stringify(all, null, 2));
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
