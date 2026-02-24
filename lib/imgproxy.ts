/**
 * Generates an Imgproxy URL for optimizing remote images.
 * Basic implementation using plain URLs (no signatures).
 * In production, consider adding URL signatures to prevent abuse.
 */

const IMGPROXY_URL =
  process.env.NEXT_PUBLIC_IMGPROXY_URL || "http://149.102.155.247:8080";

interface ImgproxyOptions {
  width?: number;
  height?: number;
  quality?: number;
  resizingType?: "fit" | "fill" | "crop";
  format?: "webp" | "avif" | "jpeg" | "png";
}

export function getOptimizedImageUrl(
  sourceUrl: string,
  options: ImgproxyOptions = {},
) {
  // Use preset options if none provided
  const width = options.width || 0;
  const height = options.height || 0;
  const resizingType = options.resizingType || "fit";
  const quality = options.quality || 85;
  const format = options.format || "webp";

  // Base64 encode the source URL without padding as required by imgproxy
  const encodedUrl = btoa(sourceUrl)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  // Build the processing path
  // Format: /rs:{resizing_type}:{width}:{height}/q:{quality}/{encoded_url}.{extension}
  const processingOptions = `rs:${resizingType}:${width}:${height}/q:${quality}`;

  return `${IMGPROXY_URL}/insecure/${processingOptions}/${encodedUrl}.${format}`;
}
