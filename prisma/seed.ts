import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordCand = await bcrypt.hash('democa123', 10)
  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@demo.com' },
    update: {},
    create: {
      email: 'candidate@demo.com',
      password: passwordCand,
      name: 'Demo Candidate',
      role: 'candidate',
      profile: {
        create: {
          fullName: 'Demo Candidate',
          email: 'candidate@demo.com',
        }
      }
    },
  })

  const passwordEmp = await bcrypt.hash('demoep123', 10)
  const employer = await prisma.user.upsert({
    where: { email: 'employer@demo.com' },
    update: {},
    create: {
      email: 'employer@demo.com',
      password: passwordEmp,
      name: 'Demo Employer',
      role: 'employer',
      profile: {
        create: {
          fullName: 'Demo Employer',
          email: 'employer@demo.com',
        }
      }
    },
  })

  console.log({ candidate, employer })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
