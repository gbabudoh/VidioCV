import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Resyncing Employer Metadata ---');

  // Update the main demo employer
  const demoEmployer = await prisma.user.update({
    where: { email: 'employer@demo.com' },
    data: {
      country: 'United Kingdom',
      companyType: 'Software & SaaS'
    }
  });

  console.log(`Updated employer: ${demoEmployer.email}`);
  console.log(`New Metadata: Country: ${demoEmployer.country}, Type: ${demoEmployer.companyType}`);

  // Adding a few more mock employers if they exist, or creating them
  const otherEmployers = [
    { name: 'Fintech Forge', email: 'fintech@demo.com', country: 'Germany', companyType: 'Fintech' },
    { name: 'HealthAI', email: 'health@demo.com', country: 'USA', companyType: 'Healthcare' },
    { name: 'Quantum AI', email: 'ai@demo.com', country: 'Canada', companyType: 'AI & Machine Learning' }
  ];

  for (const emp of otherEmployers) {
    const updated = await prisma.user.upsert({
      where: { email: emp.email },
      update: {
        country: emp.country,
        companyType: emp.companyType,
        name: emp.name
      },
      create: {
        email: emp.email,
        name: emp.name,
        role: 'employer',
        country: emp.country,
        companyType: emp.companyType
      }
    });
    console.log(`Upserted employer: ${updated.email} (${updated.companyType})`);
  }

  console.log('--- Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
