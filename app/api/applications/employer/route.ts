import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== "employer") {
      return NextResponse.json({ success: false, message: "Employers only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    const applications = await prisma.application.findMany({
      where: {
        job: { employerId: payload.userId },
        ...(jobId ? { jobId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        job: { select: { id: true, title: true, department: true, location: true } },
        candidate: {
          include: {
            profile: { select: { fullName: true, avatarUrl: true } },
            cvProfile: { select: { slug: true, title: true, skills: { select: { skill: { select: { name: true } } } } } },
          },
        },
      },
    });

    const formatted = applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job.title,
      jobDepartment: app.job.department,
      jobLocation: app.job.location,
      candidateId: app.candidateId,
      candidateName: app.candidate.profile?.fullName || app.candidate.name,
      candidateTitle: app.candidate.cvProfile?.title || "",
      candidateAvatar: app.candidate.profile?.avatarUrl || null,
      candidateSkills: app.candidate.cvProfile?.skills.map((s) => s.skill.name) || [],
      videoUrl: app.videoUrl,
      message: app.message,
      status: app.status,
      submittedAt: app.createdAt,
    }));

    return NextResponse.json({ success: true, applications: formatted });
  } catch (error) {
    console.error("Fetch employer applications error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// Update application status
export async function PATCH(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== "employer") {
      return NextResponse.json({ success: false, message: "Employers only" }, { status: 403 });
    }

    const { applicationId, status } = await request.json();
    if (!applicationId || !status) {
      return NextResponse.json({ success: false, message: "applicationId and status required" }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: { select: { employerId: true } } },
    });

    if (!application || application.job.employerId !== payload.userId) {
      return NextResponse.json({ success: false, message: "Not found or unauthorised" }, { status: 403 });
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status, updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
