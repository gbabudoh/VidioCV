import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";
import { z } from "zod";
import { Notifications } from "@/lib/ntfy";

const jobSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  location: z.string(),
  salary: z.object({
    min: z.number(),
    max: z.number(),
  }),
  skills: z.array(z.string()),
  department: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "employer") {
      return NextResponse.json(
        { success: false, message: "Only employers can post jobs" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const jobData = jobSchema.parse(body);

    // TODO: Remove (prisma as any) after running 'npx prisma generate' locally
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job = await (prisma as any).job.create({
      data: {
        title: jobData.title,
        description: jobData.description,
        location: jobData.location,
        salaryMin: jobData.salary.min,
        salaryMax: jobData.salary.max,
        skills: jobData.skills,
        department: jobData.department,
        employerId: payload.userId,
      },
    });

    // Send system notification
    await Notifications.system.newJobPosted(payload.userId, job.title);

    return NextResponse.json(
      {
        success: true,
        message: "Job posted successfully",
        jobId: job.id,
        job: job,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 },
      );
    }

    console.error("Job creation error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
