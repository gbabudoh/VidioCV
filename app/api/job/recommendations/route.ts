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
    if (!payload || payload.role !== "candidate") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // 1. Fetch Candidate Profile with skills, work experiences, etc.
    const candidateProfile = await prisma.cvProfile.findFirst({
      where: { userId: payload.userId as unknown as string },
      include: {
        skills: {
          include: { skill: true }
        },
        workExperiences: true,
      }
    });

    if (!candidateProfile) {
      return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 });
    }

    // Map to MatchCandidate interface
    const matchCandidate: MatchCandidate = {
      id: candidateProfile.id,
      title: candidateProfile.title,
      skills: (candidateProfile as unknown as { skills: { skill: { name: string } }[] }).skills.map((s) => s.skill.name),
      summary: candidateProfile.summary || "",
      yearsOfExperience: candidateProfile.yearsOfExperience || 0,
      remotePreference: candidateProfile.remotePreference || "",
    };

    // 2. Fetch all active Jobs
    const allJobs = await prisma.job.findMany({
      include: {
        employer: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // 3. Score each job in parallel using ML
    const recommendedJobs = await Promise.all(allJobs.map(async (job) => {
      const matchJob: MatchJob = {
        id: job.id,
        title: job.title,
        description: job.description,
        skills: job.skills,
        location: job.location,
      };

      const matchResult = await MatchEngine.calculateMatch(matchCandidate, matchJob);

      return {
        ...job,
        matchScore: matchResult.score,
        matchBreakdown: matchResult.breakdown,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
      };
    }));

    // 4. Sort and return top 10
    const sortedRecommendations = recommendedJobs
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      recommendations: sortedRecommendations
    });

  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
