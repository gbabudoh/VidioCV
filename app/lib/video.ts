/**
 * Utility to handle Video CV URLs and ensure they use the PeerTube iframe player
 */

export const PEERTUBE_BASE_URL = "https://peertube.feendesk.com";

/**
 * Extracts a PeerTube UUID from various URL formats
 */
export function extractVideoUuid(url: string): string | null {
  if (!url) return null;

  // 1. Check for /videos/embed/UUID
  const embedMatch = url.match(/\/videos\/embed\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  if (embedMatch) return embedMatch[1];

  // 2. Check for /w/UUID or /watch/UUID
  const watchMatch = url.match(/\/(?:w|watch)\/([a-zA-Z0-9-]+)/);
  if (watchMatch) return watchMatch[1];

  // 3. Check for HLS URL: /static/streaming-playlists/hls/UUID/master.m3u8
  const hlsMatch = url.match(/\/hls\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  if (hlsMatch) return hlsMatch[1];

  // 4. Fallback: Search for any UUID-like string
  const uuidMatch = url.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  if (uuidMatch) return uuidMatch[0];

  return null;
}

/**
 * Converts any PeerTube-related URL to a stable embed URL for iframe usage
 */
export function getPeerTubeEmbedUrl(url: string | null): string | null {
  if (!url) return null;

  const uuid = extractVideoUuid(url);
  if (!uuid) {
    // If it's not a PeerTube URL but something else (like a local blob URL for preview)
    // We should return it as is if it's already a blob, but for standard files we might want to be careful
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;
    return url;
  }

  return `${PEERTUBE_BASE_URL}/videos/embed/${uuid}?peertubeLink=0&p2p=0&title=0&warning=0&logo=0`;
}
