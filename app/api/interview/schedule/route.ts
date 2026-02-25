import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";
import { z } from "zod";
import { Notifications } from "@/lib/ntfy";

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

    // TODO: Remove (prisma as any) after running 'npx prisma generate' locally
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const interview = await (prisma as any).interview.create({
      data: {
        jobId: scheduleData.jobId,
        candidateId: scheduleData.candidateId,
        dateTime: new Date(scheduleData.dateTime),
        interviewType: scheduleData.interviewType,
        notes: scheduleData.notes,
        status: "scheduled",
      },
    });

    // Send system notification
    await Notifications.system.newInterviewScheduled(
      scheduleData.candidateId, // Should ideally be name, but we have ID here
      scheduleData.jobId,       // Should ideally be title
      interview.dateTime.toISOString()
    );

    return NextResponse.json(
      {
        success: true,
        message: "Interview scheduled successfully",
        interviewId: interview.id,
        interview: interview,
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

    console.error("Interview scheduling error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
