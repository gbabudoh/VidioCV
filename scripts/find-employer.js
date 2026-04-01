
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const employers = await prisma.user.findMany({ where: { role: 'employer' } })
  console.log(JSON.stringify(employers, null, 2))
}

main().finally(() => prisma.$disconnect())
