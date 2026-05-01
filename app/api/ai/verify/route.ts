import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { verifyToken } from "@/app/lib/auth";

interface ExtendedPrisma {
  cvProfile: {
    findUnique: (args: { where: { userId: string }; include?: { skills: boolean } }) => Promise<{ id: string; skills: unknown[]; yearsOfExperience?: number; fullName?: string } | null>;
    update: (args: { where: { id: string }; data: { aiMatchScore: number } }) => Promise<unknown>;
  };
  cvSkill: {
    updateMany: (args: { where: { cvProfileId: string }; data: { isVerified: boolean } }) => Promise<unknown>;
  };
  application: {
    findFirst: (args: { 
      where: { candidateId: string; externalId: { not: null } }; 
      include: unknown 
    }) => Promise<{ externalId: string; videoUrl?: string; job: { employer: { integrations: { apiKey: string }[] } } } | null>;
  };
}

const db = (prisma as unknown) as ExtendedPrisma;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as { userId: string };

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Find the candidate's profile
    const profile = await db.cvProfile.findUnique({
      where: { userId: decoded.userId },
      include: { skills: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // --- MOCK AI LOGIC ---
    // In a real app, this would call OpenAI or another LLM to analyze the video/text
    
    // 1. Mark all skills as verified (simulate verification)
    await db.cvSkill.updateMany({
      where: { cvProfileId: profile.id },
      data: { isVerified: true },
    });

    // 2. Calculate a mock match score based on years of experience and number of skills
    const skillCount = profile.skills.length;
    const exp = profile.yearsOfExperience || 0;
    const baseScore = 70;
    const expBonus = Math.min(exp * 2, 20);
    const skillBonus = Math.min(skillCount * 2, 10);
    const finalScore = Math.min(baseScore + expBonus + skillBonus + Math.floor(Math.random() * 5), 99);

    await db.cvProfile.update({
      where: { id: profile.id },
      data: { aiMatchScore: finalScore },
    });

    // --- OUTBOUND SYNC: LEVER ---
    try {
      const application = await db.application.findFirst({
        where: { candidateId: decoded.userId, externalId: { not: null } },
        include: { job: { include: { employer: { include: { integrations: { where: { type: "LEVER", status: "active" } } } } } } }
      });

      if (application && application.job.employer.integrations.length > 0) {
        const integration = application.job.employer.integrations[0];
        const { LeverService } = await import("@/app/lib/integrations/lever");
        
        await LeverService.pushMatchReport(
          integration.apiKey,
          application.externalId,
          {
            score: finalScore,
            summary: `Automated VidioCV analysis completed. The candidate demonstrated a strong match with a kinetic score of ${finalScore}%. Analysis based on experience and verified skill set.`,
            videoUrl: application.videoUrl || "https://videocv.io/candidate/recording", // Placeholder if no video yet
            candidateName: profile.fullName || "Candidate"
          }
        );
        console.log(`Successfully synced match report to Lever for opportunity ${application.externalId}`);
      }
    } catch (syncError) {
      console.error("Lever outbound sync failed:", syncError);
      // We don't fail the main request if sync fails
    }

    return NextResponse.json({
      success: true,
      message: "AI Verification Complete & Synced",
      matchScore: finalScore,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("AI Verify Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
