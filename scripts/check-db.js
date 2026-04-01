
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const jobCount = await prisma.job.count()
  const userCount = await prisma.user.count()
  const employers = await prisma.user.findMany({ where: { role: 'employer' } })
  
  console.log(JSON.stringify({
    jobCount,
    userCount,
    employerEmails: employers.map(e => e.email)
  }, null, 2))
}

main().finally(() => prisma.$disconnect())
