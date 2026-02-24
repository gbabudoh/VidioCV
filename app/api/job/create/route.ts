import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";
import { z } from "zod";

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

    await connectDB();

    return NextResponse.json(
      {
        success: true,
        message: "Job posted successfully",
        jobId: Math.random().toString(36).substr(2, 9),
        job: jobData,
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

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
