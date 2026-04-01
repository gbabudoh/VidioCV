
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const jobCount = await prisma.job.count()
  const jobs = await prisma.job.findMany({
    include: {
      employer: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      }
    },
    take: 10
  })

  console.log('Total Jobs in Database:', jobCount)
  console.log('Sample Jobs:', JSON.stringify(jobs, null, 2))

  const employers = await prisma.user.findMany({
    where: { role: 'employer' },
    select: { id: true, email: true, name: true }
  })
  console.log('Employers in Database:', JSON.stringify(employers, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
