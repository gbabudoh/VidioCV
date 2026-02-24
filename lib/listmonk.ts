import axios from "axios";

const LISTMONK_URL = process.env.LISTMONK_URL || "http://localhost:9000";
const LISTMONK_USERNAME = process.env.LISTMONK_USERNAME || "listmonk";
const LISTMONK_PASSWORD = process.env.LISTMONK_PASSWORD || "listmonk";

// Basic auth header for Listmonk API
const authHeader = `Basic ${Buffer.from(`${LISTMONK_USERNAME}:${LISTMONK_PASSWORD}`).toString("base64")}`;

interface SendTransactionalEmailProps {
  subscriber_email: string;
  template_id: number;
  data: Record<string, unknown>;
}

/**
 * Sends a transactional email using the Listmonk API (`/api/tx`)
 */
export async function sendEmail({
  subscriber_email,
  template_id,
  data,
}: SendTransactionalEmailProps) {
  try {
    const response = await axios.post(
      `${LISTMONK_URL}/api/tx`,
      {
        subscriber_email,
        template_id,
        data,
      },
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Failed to send Listmonk email:", error);
    // Optionally throw or swallow depending on if it's a critical path
    return null;
  }
}
