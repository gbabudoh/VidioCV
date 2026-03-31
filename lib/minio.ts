import * as Minio from "minio";

// Initialize MinIO Client
export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});

export const BUCKET_NAME = process.env.MINIO_BUCKET || "videocv";

// Ensure bucket exists with public read policy
export async function ensureBucket() {
  const exists = await minioClient.bucketExists(BUCKET_NAME);

  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
  }

  // Always enforce public read policy so browser can load videos directly
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
      },
    ],
  };

  await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
}

// Upload file
export async function uploadFile(
  buffer: Buffer,
  objectName: string,
  contentType: string,
): Promise<string> {
  await ensureBucket();

  await minioClient.putObject(BUCKET_NAME, objectName, buffer, buffer.length, {
    "Content-Type": contentType,
  });

  // Return public URL
  const protocol = process.env.MINIO_USE_SSL === "true" ? "https" : "http";
  return `${protocol}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/${objectName}`;
}

// Get presigned URL (for temporary access)
export async function getPresignedUrl(
  objectName: string,
  expiry = 3600,
): Promise<string> {
  return await minioClient.presignedGetObject(BUCKET_NAME, objectName, expiry);
}

// Delete file
export async function deleteFile(objectName: string): Promise<void> {
  await minioClient.removeObject(BUCKET_NAME, objectName);
}
