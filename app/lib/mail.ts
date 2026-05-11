/**
 * Postal Email Service Utility
 * Handles transactional email delivery via the Postal HTTP API.
 */

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const apiUrl = process.env.POSTAL_API_URL || "https://postal.feendesk.com";
  const apiKey = process.env.POSTAL_API_KEY;
  const fromEmail = process.env.POSTAL_FROM_EMAIL || "no-reply@vidio-cv.com";
  const fromName = process.env.POSTAL_FROM_NAME || "VidioCV";

  if (!apiKey) {
    console.error("Postal API Key is missing. Email skipped.");
    return { success: false, error: "Missing API Key" };
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/send/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Server-API-Key": apiKey,
      },
      body: JSON.stringify({
        to: [to],
        from: `${fromName} <${fromEmail}>`,
        subject: subject,
        html_body: html,
        plain_body: text || html.replace(/<[^>]*>?/gm, ''), // Basic fallback
      }),
    });

    const data = await response.json();

    if (data.status === "success") {
      return { success: true, messageId: data.data.message_id };
    } else {
      console.error("Postal Email Error:", data);
      return { success: false, error: data.data?.message || "Failed to send email" };
    }
  } catch (error) {
    console.error("Postal Fetch Error:", error);
    return { success: false, error: "Network error" };
  }
}
