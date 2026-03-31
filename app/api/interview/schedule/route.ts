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

    // Fetch candidate and job details for the notification
    const [candidate, job] = await Promise.all([
      prisma.user.findUnique({
        where: { id: scheduleData.candidateId },
        include: { profile: true },
      }),
      prisma.job.findUnique({
        where: { id: scheduleData.jobId },
        include: { employer: { include: { profile: true } } },
      }),
    ]);

    const interview = await prisma.interview.create({
      data: {
        jobId: scheduleData.jobId,
        candidateId: scheduleData.candidateId,
        dateTime: new Date(scheduleData.dateTime),
        interviewType: scheduleData.interviewType,
        notes: scheduleData.notes,
        status: "scheduled",
      },
    });

    // Send notifications
    const candidateName = candidate?.profile?.fullName || candidate?.name || "Candidate";
    const jobTitle = job?.title || "Position";
    const companyName = job?.employer?.profile?.fullName || job?.employer?.name || "The Employer";

    await Promise.all([
      // Notify the candidate specifically
      Notifications.candidate.interviewScheduled(
        scheduleData.candidateId,
        companyName,
        jobTitle,
        interview.dateTime.toISOString()
      ),
      // Notify the system/admin
      Notifications.system.newInterviewScheduled(
        candidateName,
        jobTitle,
        interview.dateTime.toISOString()
      ),
    ]);

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
