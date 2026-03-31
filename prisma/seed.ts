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

  // Create Sample Jobs for the Demo Employer
  const jobs = [
    {
      title: "Senior Full Stack Engineer",
      description: "We are looking for an experienced Full Stack Engineer to lead the development of our core platform. You will be working with React, TypeScript, Node.js, and AWS to build highly scalable microservices.",
      location: "San Francisco, CA (Remote)",
      salaryMin: 140000,
      salaryMax: 180000,
      skills: ["React", "TypeScript", "Node.js", "AWS"],
      department: "Engineering",
      employerId: employer.id
    },
    {
      title: "Product Designer",
      description: "Join our dynamic design team to create stunning user experiences. You'll be responsible for end-to-end product design, wireframing, prototyping, and working closely with engineers.",
      location: "London, UK",
      salaryMin: 70000,
      salaryMax: 90000,
      skills: ["Figma", "UI/UX", "Prototyping"],
      department: "Design",
      employerId: employer.id
    },
    {
      title: "Frontend Developer (React)",
      description: "We need a React specialist to help us revamp our main web application. Experience with Next.js, Framer Motion, and TailwindCSS is highly required for this 6-month contract role.",
      location: "Berlin, Germany",
      salaryMin: 80000,
      salaryMax: 100000,
      skills: ["React", "Next.js", "TailwindCSS"],
      department: "Engineering",
      employerId: employer.id
    },
    {
      title: "Backend Go Developer",
      description: "ScaleTech is migrating from Python to Go. We need strong Go developers to write performant microservices, handle concurrent data pipelines, and scale our cloud infrastructure on GCP.",
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

  console.log({ candidate, employer, jobsCreated: jobs.length })
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
