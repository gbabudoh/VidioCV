
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
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

  const jobs = [
    {
      title: "Senior Full Stack Engineer",
      description: "We are looking for an experienced Full Stack Engineer to lead the development of our core platform.",
      location: "San Francisco, CA (Remote)",
      salaryMin: 140000,
      salaryMax: 180000,
      skills: ["React", "TypeScript", "Node.js", "AWS"],
      department: "Engineering",
      employerId: employer.id
    },
    {
      title: "Product Designer",
      description: "Join our dynamic design team to create stunning user experiences.",
      location: "London, UK",
      salaryMin: 70000,
      salaryMax: 90000,
      skills: ["Figma", "UI/UX", "Prototyping"],
      department: "Design",
      employerId: employer.id
    },
    {
      title: "Frontend Developer (React)",
      description: "We need a React specialist to help us revamp our main web application.",
      location: "Berlin, Germany",
      salaryMin: 80000,
      salaryMax: 100000,
      skills: ["React", "Next.js", "TailwindCSS"],
      department: "Engineering",
      employerId: employer.id
    },
    {
      title: "Backend Go Developer",
      description: "ScaleTech is migrating from Python to Go. We need strong Go developers.",
      location: "Toronto, Canada",
      salaryMin: 120000,
      salaryMax: 150000,
      skills: ["Go", "GCP", "PostgreSQL"],
      department: "Engineering",
      employerId: employer.id
    }
  ];

  for (const job of jobs) {
    await prisma.job.create({ data: job });
  }

  console.log({ employerId: employer.id, jobsCreated: jobs.length })
}

main().finally(() => prisma.$disconnect())
