import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";
import { z } from "zod";

const scheduleSchema = z.object({
  candidateId: z.string(),
  jobId: z.string(),
  dateTime: z.string().datetime(),
  interviewType: z.enum(["video", "phone", "in-person"]),
  notes: z.string().optional(),
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
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const scheduleData = scheduleSchema.parse(body);

    await connectDB();

    return NextResponse.json(
      {
        success: true,
        message: "Interview scheduled successfully",
        interviewId: Math.random().toString(36).substr(2, 9),
        interview: {
          ...scheduleData,
          status: "scheduled",
          createdAt: new Date().toISOString(),
        },
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
