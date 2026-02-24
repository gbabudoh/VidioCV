import axios from "axios";

const NTFY_URL = process.env.NTFY_URL || "https://ntfy.sh";
const NTFY_TOPIC = process.env.NTFY_TOPIC || "videocv_alerts";

interface NtfyOptions {
  title?: string;
  tags?: string[];
  priority?: 1 | 2 | 3 | 4 | 5; // 1=min, 3=default, 5=max
  click?: string;
}

/**
 * Sends a push notification via ntfy.sh or a self-hosted ntfy instance
 */
export async function sendNotification(message: string, options?: NtfyOptions) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "text/plain",
    };

    if (options?.title) headers["Title"] = options.title;
    if (options?.tags) headers["Tags"] = options.tags.join(",");
    if (options?.priority) headers["Priority"] = options.priority.toString();
    if (options?.click) headers["Click"] = options.click;

    const response = await axios.post(`${NTFY_URL}/${NTFY_TOPIC}`, message, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to send ntfy notification:", error);
    // Don't throw to prevent interrupting core applicant flows just because of notification failures
    return null;
  }
}
