// lib/listmonk.ts
const LISTMONK_URL = process.env.LISTMONK_URL || "http://localhost:9000";
const LISTMONK_USERNAME = process.env.LISTMONK_USERNAME;
const LISTMONK_PASSWORD = process.env.LISTMONK_PASSWORD;

const auth = Buffer.from(`${LISTMONK_USERNAME}:${LISTMONK_PASSWORD}`).toString('base64');

interface Subscriber {
  email: string;
  name: string;
  status?: 'enabled' | 'blocklisted';
  lists: number[]; // List IDs
  attribs?: Record<string, unknown>;
}

// interface Campaign {
//   name: string;
//   subject: string;
//   lists: number[];
//   body: string;
//   content_type?: 'richtext' | 'html' | 'plain';
//   send_at?: string; // ISO datetime for scheduled send
//   template_id?: number;
// }

/**
 * Add subscriber to Listmonk
 */
export async function addSubscriber(data: Subscriber) {
  try {
    const response = await fetch(`${LISTMONK_URL}/api/subscribers`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Listmonk error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Listmonk add subscriber error:', error);
    return { success: false, error };
  }
}

/**
 * Send transactional email via Listmonk
 */
export async function sendTransactionalEmail(
  subscriberEmail: string,
  templateId: number,
  data: Record<string, unknown>
) {
  try {
    const response = await fetch(`${LISTMONK_URL}/api/tx`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriber_email: subscriberEmail,
        template_id: templateId,
        data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Listmonk TX error: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Listmonk send email error:', error);
    return { success: false, error };
  }
}

/**
 * Email notification helpers
 */
export const EmailNotifications = {
  // Welcome new candidate
  welcomeCandidate: async (email: string, name: string) => {
    const listId = parseInt(process.env.LISTMONK_CANDIDATE_LIST_ID || "1");
    await addSubscriber({
      email,
      name,
      lists: [listId],
    });
    
    await sendTransactionalEmail(email, 1, { // Template ID 1
      first_name: name,
    });
  },

  // Welcome new employer
  welcomeEmployer: async (email: string, name: string) => {
    const listId = parseInt(process.env.LISTMONK_EMPLOYER_LIST_ID || "2");
    await addSubscriber({
      email,
      name,
      lists: [listId],
    });
    
    await sendTransactionalEmail(email, 5, { // Assume Template ID 5 for Employer Welcome
      first_name: name,
    });
  },

  // CV viewed notification
  cvViewed: async (email: string, name: string, companyName: string, views: number) => {
    await sendTransactionalEmail(email, 2, { // Template ID 2
      first_name: name,
      company_name: companyName,
      total_views: views,
      monthly_views: views,
    });
  },

  // Contact request
  contactRequest: async (
    email: string, 
    name: string, 
    companyName: string, 
    message: string,
    messageId: string
  ) => {
    await sendTransactionalEmail(email, 3, { // Template ID 3
      first_name: name,
      company_name: companyName,
      message,
      message_id: messageId,
    });
  },

  // New match for employer
  newCandidateMatch: async (
    email: string,
    name: string,
    candidateData: {
      candidate_name: string;
      job_title: string;
      match_score: number;
      skills: string;
      cv_slug: string;
    }
  ) => {
    await sendTransactionalEmail(email, 4, { // Template ID 4
      first_name: name,
      ...candidateData,
    });
  },
};
