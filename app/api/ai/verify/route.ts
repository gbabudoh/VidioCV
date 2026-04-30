/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { verifyToken } from "@/app/lib/auth";

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
    const profile = await (prisma.cvProfile as any).findUnique({
      where: { userId: decoded.userId },
      include: { skills: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // --- MOCK AI LOGIC ---
    // In a real app, this would call OpenAI or another LLM to analyze the video/text
    
    // 1. Mark all skills as verified (simulate verification)
    await (prisma.cvSkill as any).updateMany({
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

    await (prisma.cvProfile as any).update({
      where: { id: profile.id },
      data: { aiMatchScore: finalScore },
    });

    return NextResponse.json({
      success: true,
      message: "AI Verification Complete",
      matchScore: finalScore,
    });
  } catch (error: any) {
    console.error("AI Verify Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
