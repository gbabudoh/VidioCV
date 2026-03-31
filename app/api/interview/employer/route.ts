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
    if (!payload || payload.role !== "employer") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const interviews = await prisma.interview.findMany({
      where: {
        job: {
          employerId: payload.userId,
        },
      },
      include: {
        candidate: {
          select: {
            name: true,
          },
        },
        job: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { dateTime: "asc" },
    });

    return NextResponse.json({
      success: true,
      interviews: interviews.map((i) => ({
        id: i.id,
        candidateName: i.candidate.name,
        date: new Date(i.dateTime).toISOString().split("T")[0],
        time: new Date(i.dateTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: i.status as "scheduled" | "completed" | "cancelled",
        jobTitle: i.job.title,
      })),
    });
  } catch (error) {
    console.error("Dashboard interviews fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
