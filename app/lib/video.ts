/**
 * Video URL utility — MinIO-based direct URLs
 */

/**
 * Returns the video URL as-is (MinIO direct URLs need no transformation).
 */
export function getVideoUrl(url: string | null): string | null {
  return url || null;
}
