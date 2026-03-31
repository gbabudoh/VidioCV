import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "candidate") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const interviews = await prisma.interview.findMany({
      where: {
        candidateId: payload.userId,
      },
      include: {
        job: {
          include: {
            employer: {
              select: {
                name: true,
                profile: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { dateTime: "asc" },
    });

    return NextResponse.json({
      success: true,
      interviews: interviews.map((i) => ({
        id: i.id,
        company: i.job.employer?.profile?.fullName || i.job.employer?.name || "Unknown Company",
        jobTitle: i.job.title,
        date: new Date(i.dateTime).toLocaleDateString(),
        time: new Date(i.dateTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: i.interviewType,
        status: i.status,
        notes: i.notes,
      })),
    });
  } catch (error) {
    console.error("Candidate interviews fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
