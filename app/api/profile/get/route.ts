import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get basic user info
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get CV profile (where video is stored)
    const cvProfile = await prisma.cvProfile.findFirst({
      where: { userId: payload.userId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        workExperiences: true,
        education: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile,
      },
      cvProfile: cvProfile || null,
    });
  } catch (error) {
    console.error("Profile fetch error full:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 },
    );
  }
}
