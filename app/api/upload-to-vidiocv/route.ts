import { NextRequest, NextResponse } from "next/server";
import {
  uploadVideoToVidioCV,
  getVidioCVWatchUrl,
  getVidioCVEmbedUrl
} from "@/lib/vidiocv";
import { Notifications } from "@/lib/ntfy";
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

    const formData = await request.formData();
    const video = formData.get("video") as File | null;
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;

    if (!video) {
      return NextResponse.json({ error: "No video provided" }, { status: 400 });
    }

    console.log(`Upload: Received video "${video.name}" (${(video.size / 1024 / 1024).toFixed(1)}MB, type: ${video.type})`);

    // Upload directly to PeerTube — it handles transcoding
    const videoBuffer = Buffer.from(await video.arrayBuffer());
    console.log(`Upload: Buffer created (${videoBuffer.length} bytes)`);

    let uploadResult;
    try {
      uploadResult = await uploadVideoToVidioCV(
        videoBuffer,
        video.name,
        video.type,
        {
          title: title || "Video CV",
          description: description || "",
        }
      );
    } catch (peertubeError) {
      console.error("PeerTube upload error:", peertubeError);
      const msg = peertubeError instanceof Error ? peertubeError.message : "Unknown PeerTube error";
      return NextResponse.json({
        success: false,
        error: "PeerTube upload failed",
        details: msg,
      }, { status: 502 });
    }

    const videoData = uploadResult.video;
    const videoUrl = getVidioCVWatchUrl(videoData.uuid);
    const embedUrl = getVidioCVEmbedUrl(videoData.uuid);

    const thumbnailUrl = videoData.thumbnailPath
      ? `${process.env.PEERTUBE_URL}${videoData.thumbnailPath}`
      : null;

    // Find or create CvProfile for the user
    let cvProfile = await prisma.cvProfile.findFirst({
      where: { userId: payload.userId }
    });

    if (!cvProfile) {
      cvProfile = await prisma.cvProfile.create({
        data: {
          userId: payload.userId,
          slug: `cv-${payload.userId.split('-')[0]}-${Date.now().toString().slice(-4)}`,
          title: "My Video CV",
          videoUrl: embedUrl,
          videoThumbnailUrl: thumbnailUrl,
          videoStatus: "published",
          isPublished: true,
        }
      });
    } else {
      await prisma.cvProfile.update({
        where: { id: cvProfile.id },
        data: {
          videoUrl: embedUrl,
          videoThumbnailUrl: thumbnailUrl,
          videoStatus: "published",
          isPublished: true,
          updatedAt: new Date(),
        }
      });
    }

    Notifications.system.newCVUploaded(title || "Video CV", videoUrl).catch(() => {});

    return NextResponse.json({
      success: true,
      videoId: videoData.id,
      videoUuid: videoData.uuid,
      videoUrl: embedUrl,
      embedUrl,
      thumbnailUrl,
    });
  } catch (error: unknown) {
    console.error("Upload route error:", error);

    return NextResponse.json({
      success: false,
      error: "Video upload failed",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
