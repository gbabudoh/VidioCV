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

    const jobs = await prisma.job.findMany({
      where: { employerId: payload.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      jobs: jobs.map((job) => ({
        id: job.id,
        title: job.title,
        views: 0, // Placeholder as schema doesn't have views per job
        applicants: 0, // Placeholder as schema doesn't have direct applicants count
        days: Math.floor(
          (new Date().getTime() - new Date(job.createdAt).getTime()) /
            (1000 * 3600 * 24)
        ),
      })),
    });
  } catch (error) {
    console.error("Dashboard jobs fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
