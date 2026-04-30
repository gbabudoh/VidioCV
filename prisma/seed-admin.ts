import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Admin Site Configuration...");

  const heroConfig = {
    title: "Beyond the Static Resume",
    subtitle: "The future of recruitment is kinetic. VidioCV bridges the gap between digital identity and human presence through AI-verified video portfolios.",
    ctaPrimary: "Launch Video CV",
    ctaSecondary: "Recruit Talent",
    featuredImage: "/vidiocv.png",
    stats: {
      profiles: "10k+",
      partners: "500+"
    }
  };

  await (prisma as unknown as { 
    siteConfig: { 
      upsert: (args: Record<string, unknown>) => Promise<unknown> 
    } 
  }).siteConfig.upsert({
    where: { key: "homepage_hero" },
    update: { value: heroConfig },
    create: { key: "homepage_hero", value: heroConfig }
  });

  // Seed specific Super Admin account
  const superAdminEmail = "superadmin1@vidiocv.com";
  const existingSuperAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } });

  if (!existingSuperAdmin) {
    console.log(`Creating Super Admin: ${superAdminEmail}`);
    const hashedSuperPassword = await bcrypt.hash("LetMePass01", 10);
    
    await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: hashedSuperPassword,
        name: "Command Center Super Admin",
        role: "super_admin",
        emailVerified: true
      }
    });
  }

  // Also seed a default admin if none exists
  const adminEmail = "admin@vidiocv.com";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
     console.log(`Creating default admin: ${adminEmail} (Password: admin123)`);
     const hashedPassword = await bcrypt.hash("admin123", 10);
     
     await prisma.user.create({
       data: {
         email: adminEmail,
         password: hashedPassword,
         name: "System Admin",
         role: "admin",
         emailVerified: true
       }
     });
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
