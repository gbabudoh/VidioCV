/**
 * Lever ATS Integration Service
 * Handles bi-directional synchronization with Lever
 */
export class LeverService {
  private static BASE_URL = "https://api.lever.co/v1";

  /**
   * Push a Kinetic Match Report to a Lever Opportunity
   */
  static async pushMatchReport(
    apiKey: string,
    opportunityId: string,
    data: {
      score: number;
      summary: string;
      videoUrl: string;
      candidateName: string;
    }
  ) {
    const noteContent = `
## ⚡ VidioCV Kinetic Match Report
**Candidate:** ${data.candidateName}
**AI Match Score:** ${data.score}%

### 🧠 Analysis Summary
${data.summary}

### 🎥 Kinetic Recording
[View Video Interview](${data.videoUrl})

---
*Generated automatically by VidioCV Integration*
    `.trim();

    try {
      const response = await fetch(`${this.BASE_URL}/opportunities/${opportunityId}/notes`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: noteContent,
          type: "internal", // Lever internal note
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Lever API Error: ${error.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[Lever Sync Error]:", error);
      throw error;
    }
  }

  /**
   * Fetch Candidate Details from Lever
   */
  static async getOpportunity(apiKey: string, opportunityId: string) {
    try {
      const response = await fetch(`${this.BASE_URL}/opportunities/${opportunityId}`, {
        headers: {
          "Authorization": `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch Lever opportunity");
      return await response.json();
    } catch (error) {
      console.error("[Lever Fetch Error]:", error);
      throw error;
    }
  }
}
