import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = payload.userId;
    const body = await request.json();
    const { title, skills, experiences } = body;

    // Start a transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update or create CvProfile
      let cvProfile = await tx.cvProfile.findFirst({
        where: { userId }
      });

      if (!cvProfile) {
        // Create a default slug if doesn't exist
        const slug = `profile-${userId.substring(0, 8)}-${Date.now()}`;
        cvProfile = await tx.cvProfile.create({
          data: {
            userId,
            slug,
            title: title || "Professional Candidate",
          }
        });
      } else {
        cvProfile = await tx.cvProfile.update({
          where: { id: cvProfile.id },
          data: { title }
        });
      }

      const cvProfileId = cvProfile.id;

      // 2. Sync Skills
      if (Array.isArray(skills)) {
        // Delete existing skills for this profile
        await tx.cvSkill.deleteMany({
          where: { cvProfileId }
        });

        // Create new skills
        for (const skillName of skills) {
          // Find or create the skill in the global Skill table
          let skill = await tx.skill.findUnique({
            where: { name: skillName }
          });

          if (!skill) {
            skill = await tx.skill.create({
              data: {
                name: skillName,
                slug: skillName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
              }
            });
          }

          // Link skill to profile
          await tx.cvSkill.create({
            data: {
              cvProfileId,
              skillId: skill.id,
              proficiencyLevel: "Professional"
            }
          });
        }
      }

      // 3. Sync Work Experiences
      if (Array.isArray(experiences)) {
        // Delete existing experiences
        await tx.workExperience.deleteMany({
          where: { cvProfileId }
        });

        // Create new ones
        for (const exp of experiences) {
          await tx.workExperience.create({
            data: {
              cvProfileId,
              companyName: exp.company,
              position: exp.role,
              startDate: new Date(), // Placeholder as we only have duration string in frontend for now
              isCurrent: exp.duration.toLowerCase().includes("present"),
              description: exp.description || ""
            }
          });
        }
      }

      return cvProfile;
    });

    return NextResponse.json({
      success: true,
      cvProfile: result
    });
  } catch (error) {
    console.error("Profile sync error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
