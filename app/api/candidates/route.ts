import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

interface WorkExperience {
  id: string;
  position: string;
  companyName: string;
  startDate: Date | string;
  endDate?: Date | string | null;
  isCurrent?: boolean | null;
  description?: string | null;
}

interface SkillRelation {
  proficiencyLevel: string | null;
  yearsOfExperience: number | null;
  skill: {
    name: string;
  };
}

export async function GET() {
  try {
    // Fetch profiles that have a video and are ideally published (videoStatus = 'published' or simply has a URL)
    const profiles = await prisma.cvProfile.findMany({
      where: {
        videoUrl: {
          not: null, // Include candidates who have uploaded a Video CV
        },
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        workExperiences: {
          orderBy: {
            startDate: 'desc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc', // Show most recently updated candidates first
      },
      take: 50, // Limit for performance
    });

    // We fetch UserProfiles to get the actual names since CvProfile doesn't have an explicit relation to User
    const userIds = profiles.map(p => p.userId).filter(Boolean);
    const userProfiles = await prisma.userProfile.findMany({
      where: { userId: { in: userIds } }
    });

    const formattedCandidates = profiles.map((profile) => {
      const userProfile = userProfiles.find(up => up.userId === profile.userId);
      return {
        id: profile.id,
        userId: profile.userId,
        name: userProfile?.fullName || profile.title || "Anonymous Candidate",
        title: profile.title || "Professional",
        skills: profile.skills?.map((s) => s.skill.name).slice(0, 5) || [], // Only grab top 5 skills
        videoUrl: profile.videoUrl,
        rating: 5, // Placeholder/static rating since there's no rating field currently
        experience: profile.workExperiences?.map((exp: WorkExperience) => ({
          id: exp.id,
          role: exp.position,
          company: exp.companyName,
          duration: `${new Date(exp.startDate).getFullYear()} - ${exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : 'N/A'}`,
          description: exp.description
        })) || [],
        fullSkills: profile.skills?.map((s: SkillRelation) => ({
          name: s.skill.name,
          level: s.proficiencyLevel || "Professional",
          years: s.yearsOfExperience || (profile.yearsOfExperience || 0)
        })) || []
      };
    });

    return NextResponse.json({ success: true, candidates: formattedCandidates });
  } catch (error) {
    console.error("Failed to fetch candidates:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
