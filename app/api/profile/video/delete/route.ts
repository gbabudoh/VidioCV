import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const cvProfile = await prisma.cvProfile.findFirst({
      where: { userId: payload.userId }
    });

    return NextResponse.json({
      userId: payload.userId,
      cvProfile: cvProfile
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const cvProfile = await prisma.cvProfile.findFirst({
      where: { userId: payload.userId }
    });

    if (!cvProfile || !cvProfile.videoUrl) {
      return NextResponse.json({ error: "No video found to delete" }, { status: 404 });
    }

    await prisma.cvProfile.update({
      where: { id: cvProfile.id },
      data: {
        videoUrl: null,
        videoThumbnailUrl: null,
        videoStatus: "deleted",
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully"
    });
  } catch (error) {
    console.error("Video deletion error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete video";
    return NextResponse.json({
      success: false,
      error: "Failed to delete video",
      details: errorMessage
    }, { status: 500 });
  }
}
