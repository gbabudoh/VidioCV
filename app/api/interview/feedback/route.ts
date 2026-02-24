import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";
import { z } from "zod";

const feedbackSchema = z.object({
  interviewId: z.string(),
  rating: z.number().min(1).max(5),
  technicalSkills: z.number().min(1).max(5),
  communicationSkills: z.number().min(1).max(5),
  cultureFit: z.number().min(1).max(5),
  comments: z.string().optional(),
  recommendation: z.enum(["strong-yes", "yes", "maybe", "no"]),
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
        { success: false, message: "Only employers can submit feedback" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const feedbackData = feedbackSchema.parse(body);

    await connectDB();

    return NextResponse.json(
      {
        success: true,
        message: "Feedback submitted successfully",
        feedbackId: Math.random().toString(36).substr(2, 9),
        feedback: {
          ...feedbackData,
          submittedAt: new Date().toISOString(),
          submittedBy: payload.userId,
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
