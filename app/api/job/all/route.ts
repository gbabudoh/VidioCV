import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    // Fetch all jobs including basic employer details
    const jobs = await prisma.job.findMany({
      include: {
        employer: {
          select: {
            name: true,
            country: true,
            profile: {
              select: {
                fullName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Map database jobs to the frontend expected format
    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.employer?.profile?.fullName || job.employer?.name || "Unknown Company",
      countryCode: job.employer?.country || "US", // Default to US if not set
      location: job.location,
      type: "Full-time", // In this case we default to Full-time as model doesn't have type
      salary: job.salaryMin && job.salaryMax 
        ? `$${Number(job.salaryMin).toLocaleString()} - $${Number(job.salaryMax).toLocaleString()}`
        : "Competitive",
      description: job.description,
      skills: job.skills || []
    }));

    return NextResponse.json({
      success: true,
      jobs: formattedJobs
    });

  } catch (error) {
    console.error("Job fetching error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
