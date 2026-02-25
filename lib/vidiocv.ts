import axios from "axios";
import FormData from "form-data";

const VIDIOCV_URL = process.env.PEERTUBE_URL || "https://peertube.feendesk.com";
const VIDIOCV_USERNAME = process.env.PEERTUBE_USERNAME;
const VIDIOCV_PASSWORD = process.env.PEERTUBE_PASSWORD;
const VIDIOCV_CLIENT_ID = process.env.PEERTUBE_CLIENT_ID;
const VIDIOCV_CLIENT_SECRET = process.env.PEERTUBE_CLIENT_SECRET;
const VIDIOCV_CHANNEL_ID = process.env.PEERTUBE_CHANNEL_ID || "1";

interface VidioCVTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface VidioCVUploadResponse {
  video: {
    id: number;
    uuid: string;
    shortLink: string;
    thumbnailPath: string;
    previewPath: string;
  };
}

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Fetches an OAuth2 access token from VidioCV
 */
export async function getVidioCVAccessToken(): Promise<string> {
  // Check if cached token is still valid (with 1 minute buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
  }

  if (!VIDIOCV_CLIENT_ID || !VIDIOCV_CLIENT_SECRET || !VIDIOCV_USERNAME || !VIDIOCV_PASSWORD) {
    throw new Error("Missing VidioCV credentials in environment variables");
  }

  try {
    const params = new URLSearchParams();
    params.append("client_id", VIDIOCV_CLIENT_ID!);
    params.append("client_secret", VIDIOCV_CLIENT_SECRET!);
    params.append("grant_type", "password");
    params.append("username", VIDIOCV_USERNAME!);
    params.append("password", VIDIOCV_PASSWORD!);

    const response = await axios.post<VidioCVTokenResponse>(
      `${VIDIOCV_URL}/api/v1/users/token`,
      params
    );

    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000;
    
    console.log("Successfully authenticated with VidioCV");
    return cachedToken;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("VidioCV Auth Error Details:", error.response?.data || error.message);
    } else {
      console.error("VidioCV Auth Error:", error);
    }
    throw new Error("VidioCV Authentication Failed");
  }
}

/**
 * Uploads a video to VidioCV
 */
export async function uploadVideoToVidioCV(
  videoBuffer: Buffer,
  fileName: string,
  contentType: string,
  options: { title: string; description?: string }
): Promise<VidioCVUploadResponse> {
  const token = await getVidioCVAccessToken();

  const formData = new FormData();
  formData.append("videofile", videoBuffer, {
    filename: fileName,
    contentType: contentType,
  });
  formData.append("name", options.title);
  formData.append("description", options.description || "");
  formData.append("channelId", VIDIOCV_CHANNEL_ID.toString());
  formData.append("privacy", "1"); // 1 = Public
  formData.append("category", "15"); // 15 = Science & Tech (often used for resumes)

  try {
    const response = await axios.post<VidioCVUploadResponse>(
      `${VIDIOCV_URL}/api/v1/videos/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("VidioCV Upload Error Details:", JSON.stringify(error.response?.data, null, 2) || error.message);
    } else {
      console.error("VidioCV Upload Error:", error);
    }
    throw new Error("Video upload to VidioCV failed");
  }
}

/**
 * Gets the direct file URL for a video (useful for native <video> tag)
 */
export async function getVidioCVFileUrl(uuid: string): Promise<string | null> {
  try {
    const response = await axios.get(`${VIDIOCV_URL}/api/v1/videos/${uuid}`);
    const files = response.data.files || [];
    if (files.length > 0) {
      // Return the highest resolution or just the first one
      return `${VIDIOCV_URL}${files[0].fileDownloadUrl}`;
    }
    
    // Fallback to HLS if web-videos aren't available
    const streamingPlaylists = response.data.streamingPlaylists || [];
    if (streamingPlaylists.length > 0) {
      return `${VIDIOCV_URL}${streamingPlaylists[0].playlistUrl}`;
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch video file URL:", error);
    return null;
  }
}

/**
 * Gets the watch URL for a video UUID
 */
export function getVidioCVWatchUrl(uuid: string): string {
  return `${VIDIOCV_URL}/videos/watch/${uuid}`;
}

/**
 * Gets the embed URL for a video UUID
 */
export function getVidioCVEmbedUrl(uuid: string): string {
  return `${VIDIOCV_URL}/videos/embed/${uuid}?peertubeLink=0&p2p=0&title=0&warning=0&logo=0`;
}
/**
 * Deletes a video from VidioCV using its UUID
 */
export async function deleteVideoFromVidioCV(uuid: string): Promise<boolean> {
  const token = await getVidioCVAccessToken();

  try {
    await axios.delete(`${VIDIOCV_URL}/api/v1/videos/${uuid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`Successfully deleted video ${uuid} from VidioCV`);
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("VidioCV Deletion Error Details:", error.response?.data || error.message);
      // If it's 404, it's already gone, so we can consider it a success
      if (error.response?.status === 404) return true;
    } else {
      console.error("VidioCV Deletion Error:", error);
    }
    return false;
  }
}
