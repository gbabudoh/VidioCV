import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/minio";
import { randomUUID } from "crypto";

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

    // Generate unique filename
    const fileExtension = video.name.split(".").pop();
    const fileName = `${randomUUID()}.${fileExtension}`;
    const objectName = `videos/${cvProfileId || "temp"}/${fileName}`;

    // Convert file to buffer
    const bytes = await video.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to MinIO
    const videoUrl = await uploadFile(buffer, objectName, video.type);

    return NextResponse.json({
      success: true,
      videoUrl,
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
