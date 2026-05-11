import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: {
      role: { in: ['admin', 'super_admin'] }
    },
    select: {
      email: true,
      role: true
    }
  });
  console.log("Admins found:", admins);
}

main().catch(console.error).finally(() => prisma.$disconnect());
