import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
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

    // Verify the interview belongs to a job owned by this employer
    const interview = await prisma.interview.findUnique({
      where: { id: feedbackData.interviewId },
      include: { job: { select: { employerId: true } } },
    });

    if (!interview || interview.job.employerId !== payload.userId) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to submit feedback for this interview" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Feedback submitted successfully",
        feedbackId: crypto.randomUUID(),
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
