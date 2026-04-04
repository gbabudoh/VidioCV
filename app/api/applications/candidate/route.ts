import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== "candidate") {
      return NextResponse.json({ success: false, message: "Candidates only" }, { status: 403 });
    }

    const applications = await prisma.application.findMany({
      where: { candidateId: payload.userId },
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          include: {
            employer: {
              include: { profile: { select: { fullName: true } } },
            },
          },
        },
      },
    });

    const formatted = applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job.title,
      company: app.job.employer.profile?.fullName || app.job.employer.name,
      location: app.job.location,
      department: app.job.department,
      status: app.status,
      videoUrl: app.videoUrl,
      message: app.message,
      submittedAt: app.createdAt,
    }));

    return NextResponse.json({ success: true, applications: formatted });
  } catch (error) {
    console.error("Fetch candidate applications error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
