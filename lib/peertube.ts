

export interface PeerTubeConfig {
  instanceUrl: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
}

export class PeerTubeService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private config: PeerTubeConfig) {}

  private async getAccessToken() {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch(`${this.config.instanceUrl}/api/v1/users/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: "password",
        username: this.config.username,
        password: this.config.password,
        response_type: "code",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to authenticate with PeerTube");
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  async uploadVideo(buffer: Buffer, originalName: string, title: string) {
    const token = await this.getAccessToken();
    const formData = new FormData();
    
    // Create a Blob from the buffer for the FormData
    const blob = new Blob([new Uint8Array(buffer)], { type: "video/webm" });
    formData.append("videofile", blob, originalName);
    formData.append("name", title);
    formData.append("channelId", "1"); // Default channel
    formData.append("privacy", "1");   // Public by default, could be 4 (Internal/Private)

    const response = await fetch(`${this.config.instanceUrl}/api/v1/videos/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`PeerTube upload failed: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }
}

// Singleton instance helper
export const getPeerTubeService = () => {
  return new PeerTubeService({
    instanceUrl: process.env.PEERTUBE_URL || "https://peertube.example.com",
    clientId: process.env.PEERTUBE_CLIENT_ID || "",
    clientSecret: process.env.PEERTUBE_CLIENT_SECRET || "",
    username: process.env.PEERTUBE_USERNAME || "",
    password: process.env.PEERTUBE_PASSWORD || "",
  });
};
