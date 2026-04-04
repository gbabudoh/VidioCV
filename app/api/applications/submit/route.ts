import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== "candidate") {
      return NextResponse.json({ success: false, message: "Only candidates can submit applications" }, { status: 403 });
    }

    const { jobId, message } = await request.json();
    if (!jobId) return NextResponse.json({ success: false, message: "jobId is required" }, { status: 400 });

    // Verify job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ success: false, message: "Job not found" }, { status: 404 });

    // Get candidate's video URL
    const cvProfile = await prisma.cvProfile.findUnique({
      where: { userId: payload.userId },
      select: { videoUrl: true },
    });

    // Upsert — prevent duplicate applications
    const application = await prisma.application.upsert({
      where: { jobId_candidateId: { jobId, candidateId: payload.userId } },
      update: { status: "submitted", message: message || null, updatedAt: new Date() },
      create: {
        jobId,
        candidateId: payload.userId,
        videoUrl: cvProfile?.videoUrl || null,
        message: message || null,
        status: "submitted",
      },
    });

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    console.error("Application submit error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
