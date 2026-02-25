import { NextRequest, NextResponse } from "next/server";
import { deleteVideoFromVidioCV } from "@/lib/vidiocv";
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
      console.error("Deletion API: Token verification failed for token:", token.substring(0, 15) + "...");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    console.log("Deletion API: Request authorized for user:", payload.userId);

    // Find the user's CvProfile
    const cvProfile = await prisma.cvProfile.findFirst({
      where: { userId: payload.userId }
    });

    if (!cvProfile || !cvProfile.videoUrl) {
      return NextResponse.json({ error: "No video found to delete" }, { status: 404 });
    }

    // Extract UUID from videoUrl
    // Case 1: embed URL
    // https://.../videos/embed/uuid?...
    let uuid = null;
    const embedMatch = cvProfile.videoUrl.match(/embed\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (embedMatch) {
      uuid = embedMatch[1];
    } else {
      // Case 2: direct/fallback UUID search
      const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
      const match = cvProfile.videoUrl.match(uuidRegex);
      if (match) uuid = match[0];
    }

    if (uuid) {
      console.log(`Deletion API: Found UUID ${uuid}. Attempting VidioCV server removal...`);
      // 1. Delete from VidioCV server
      const serverDeleted = await deleteVideoFromVidioCV(uuid);
      if (!serverDeleted) {
        console.warn(`Deletion API: Failed to delete video ${uuid} from VidioCV server, but proceeding with DB update.`);
      } else {
        console.log(`Deletion API: Successfully confirmed removal from VidioCV server for ${uuid}`);
      }
    } else {
      console.warn(`Deletion API: No UUID extracted from URL: ${cvProfile.videoUrl}`);
    }

    // 2. Clear from Database
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
