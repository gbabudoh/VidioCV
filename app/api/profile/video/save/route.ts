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

    const { videoUrl, streamingUrl, duration } = await request.json();

    if (!videoUrl) {
      return NextResponse.json({ error: "videoUrl is required" }, { status: 400 });
    }

    // Find the user's CV profile
    const cvProfile = await prisma.cvProfile.findFirst({
      where: { userId: payload.userId },
    });

    if (!cvProfile) {
      return NextResponse.json({ error: "CV Profile not found" }, { status: 404 });
    }

    // Update the CV profile with the new video info
    const updatedProfile = await prisma.cvProfile.update({
      where: { id: cvProfile.id },
      data: {
        videoUrl: streamingUrl || videoUrl,
        videoStatus: "published",
        videoDuration: duration ? parseInt(duration) : undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        videoUrl: updatedProfile.videoUrl,
        videoStatus: updatedProfile.videoStatus,
      }
    });

  } catch (error) {
    console.error("Video save error:", error);
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
