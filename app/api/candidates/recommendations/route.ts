/* eslint-disable */
// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";
import { MatchEngine, MatchCandidate, MatchJob } from "@/lib/ai/matcher";

// Server-side in-memory cache: employerId -> { data, expiresAt }
const serverCache = new Map<string, { data: unknown; expiresAt: number }>();
const SERVER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
    const cacheKey = `${payload.userId}:${jobId ?? "all"}`;

    // Return cached result if still fresh
    const cached = serverCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json({ success: true, recommendations: cached.data });
    }

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

    // 2. Fetch top 50 candidates only — enough for meaningful ranking
    const allCandidates = await prisma.cvProfile.findMany({
      take: 50,
      include: {
        skills: { include: { skill: true } },
        workExperiences: true,
        user: { select: { name: true, email: true } }
      }
    });

    // 3. Process jobs sequentially to reduce memory/CPU pressure
    const recommendationsByJob = [];
    for (const job of employerJobs) {
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
          isVerified: candidate.skills.some(s => s.isVerified)
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

      recommendationsByJob.push({
        jobId: job.id,
        jobTitle: job.title,
        topMatches: candidatesWithScores
          .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
          .slice(0, 10)
      });
    }

    // Store in server cache
    serverCache.set(cacheKey, { data: recommendationsByJob, expiresAt: Date.now() + SERVER_CACHE_TTL });

    return NextResponse.json({
      success: true,
      recommendations: recommendationsByJob
    });

  } catch (error) {
    console.error("Talent recommendations error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
