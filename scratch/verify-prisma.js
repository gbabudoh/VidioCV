import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  console.log("Checking Prisma Models...");
  console.log("Models available:", Object.keys(prisma).filter(k => !k.startsWith("_") && !k.startsWith("$")));
  
  if (prisma.auditLog) {
    console.log("✅ auditLog is available on prisma client");
  } else {
    console.log("❌ auditLog is NOT available on prisma client");
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
