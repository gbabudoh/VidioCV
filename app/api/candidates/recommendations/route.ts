import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";
import { MatchEngine, MatchCandidate, MatchJob } from "@/lib/ai/matcher";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "employer") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    // 1. Fetch Employer's Jobs (or specific job)
    const employerJobs = await prisma.job.findMany({
      where: { 
        employerId: payload.userId,
        ...(jobId ? { id: jobId } : {})
      }
    });

    if (employerJobs.length === 0) {
      return NextResponse.json({ success: false, message: "Job not found" }, { status: 404 });
    }

    // 2. Fetch all Candidates with full profiles
    const allCandidates = await prisma.cvProfile.findMany({
      include: {
        skills: { include: { skill: true } },
        workExperiences: true,
        // @ts-expect-error - relation exists in schema but not in client yet
        user: { select: { name: true, email: true } }
      }
    });

    // 3. For each job, rank candidates synchronously using ML parallelization
    const recommendationsByJob = await Promise.all(employerJobs.map(async (job) => {
      const matchJob: MatchJob = {
        id: job.id,
        title: job.title,
        description: job.description,
        skills: job.skills,
        location: job.location,
      };

      const candidatesWithScores = await Promise.all(allCandidates.map(async (candidate) => {
        const typedCandidate = candidate as unknown as {
          id: string;
          userId: string;
          title: string;
          summary: string | null;
          yearsOfExperience: number | null;
          remotePreference: string | null;
          videoUrl: string | null;
          skills: { skill: { name: string } }[];
          user: { name: string; email: string };
        };

        const matchCandidate: MatchCandidate = {
          id: typedCandidate.id,
          title: typedCandidate.title,
          skills: typedCandidate.skills.map((s) => s.skill.name),
          summary: typedCandidate.summary || "",
          yearsOfExperience: typedCandidate.yearsOfExperience || 0,
          remotePreference: typedCandidate.remotePreference || "",
        };

        const matchResult = await MatchEngine.calculateMatch(matchCandidate, matchJob);

        return {
          id: typedCandidate.id,
          userId: typedCandidate.userId,
          name: typedCandidate.user.name,
          title: typedCandidate.title,
          skills: typedCandidate.skills.map((s) => s.skill.name),
          videoUrl: typedCandidate.videoUrl,
          matchScore: matchResult.score,
          matchBreakdown: matchResult.breakdown,
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills,
        };
      }));

      return {
        jobId: job.id,
        jobTitle: job.title,
        topMatches: candidatesWithScores
          .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
          .slice(0, 10)
      };
    }));

    return NextResponse.json({
      success: true,
      recommendations: recommendationsByJob
    });

  } catch (error) {
    console.error("Talent recommendations error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
