import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/minio";
import { randomUUID } from "crypto";
import { Notifications } from "@/lib/ntfy";
import { getPeerTubeService } from "@/lib/peertube";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const video = formData.get("video") as File;
    const cvProfileId = formData.get("cvProfileId") as string;
    const duration = formData.get("duration") as string;

    if (!video) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 },
      );
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (video.size > maxSize) {
      return NextResponse.json(
        { error: "Video file too large (max 500MB)" },
        { status: 400 },
      );
    }

    // Normalize MIME type — strip codec params (e.g. video/webm;codecs=vp8,opus → video/webm)
    const mimeBase = (video.type || "video/webm").split(";")[0].trim();

    // Determine file extension from MIME type for consistent filenames
    const extMap: Record<string, string> = {
      "video/webm": "webm",
      "video/mp4": "mp4",
      "video/ogg": "ogv",
      "video/quicktime": "mov",
    };
    const fileExtension = extMap[mimeBase] || video.name.split(".").pop() || "webm";
    const fileName = `${randomUUID()}.${fileExtension}`;
    const objectName = `videos/${cvProfileId || "temp"}/${fileName}`;

    // Convert file to buffer
    const bytes = await video.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to MinIO with clean MIME type
    const videoUrl = await uploadFile(buffer, objectName, mimeBase);

    // Optional: Upload to PeerTube for high-fidelity streaming
    let streamingUrl = videoUrl;
    try {
      const peertube = getPeerTubeService();
      if (process.env.PEERTUBE_URL) {
        const peertubeResponse = await peertube.uploadVideo(buffer, fileName, `Video CV - ${cvProfileId || "temp"}`);
        // PeerTube typically provides a URL to the video, but it takes time to transcode
        // You might want to save the PeerTube UUID or embed URL here.
        if (peertubeResponse?.video?.uuid) {
          streamingUrl = `${process.env.PEERTUBE_URL}/videos/embed/${peertubeResponse.video.uuid}`;
        }
      }
    } catch (ptError) {
      console.error("PeerTube upload skipped or failed:", ptError);
      // Fallback to MinIO URL is already set
    }

    // Send system notification
    await Notifications.system.newCVUploaded(cvProfileId || "temp", streamingUrl);

    return NextResponse.json({
      success: true,
      videoUrl,
      streamingUrl,
      objectName,
      duration: parseInt(duration || "0"),
      size: video.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
