// lib/ntfy.ts
const NTFY_URL = process.env.NTFY_URL || 'https://ntfy.feendesk.com';
const NTFY_USERNAME = process.env.NTFY_USERNAME;
const NTFY_PASSWORD = process.env.NTFY_PASSWORD;

interface NotificationOptions {
  title: string;
  message: string;
  priority?: 'min' | 'low' | 'default' | 'high' | 'urgent';
  tags?: string[];
  click?: string;
  actions?: Array<{
    action: 'view' | 'http';
    label: string;
    url: string;
  }>;
}

interface NtfyPayload {
  topic: string;
  message: string;
  title: string;
  priority: string;
  tags?: string[];
  click?: string;
  actions?: Array<{
    action: 'view' | 'http';
    label: string;
    url: string;
  }>;
}

/**
 * Sends a notification to a specific user topic
 */
export async function sendUserNotification(
  userId: string,
  options: NotificationOptions
) {
  const userTopic = `videocv-user-${userId}`;
  return sendNotification(userTopic, options);
}

/**
 * Sends a notification to the admin/system topic
 */
export async function sendSystemNotification(options: NotificationOptions) {
  const systemTopic = process.env.NTFY_TOPIC || 'vidiocv-notifications';
  return sendNotification(systemTopic, options);
}

/**
 * Core notification function using fetch
 */
export async function sendNotification(topic: string, options: NotificationOptions) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authentication
    if (NTFY_USERNAME && NTFY_PASSWORD) {
      const auth = Buffer.from(`${NTFY_USERNAME}:${NTFY_PASSWORD}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }

    const body: NtfyPayload = {
      topic,
      message: options.message,
      title: options.title,
      priority: options.priority || 'default',
      tags: options.tags,
      click: options.click,
    };

    if (options.actions && options.actions.length > 0) {
      body.actions = options.actions;
    }

    const response = await fetch(NTFY_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`ntfy error: ${response.status}`);
    }

    return { success: true, topic };
  } catch (error) {
    console.error('ntfy notification error:', error);
    return { success: false, error };
  }
}

/**
 * Notification templates for different user roles and system events
 */
export const Notifications = {
  // For Candidates
  candidate: {
    cvViewed: (userId: string, viewerCompany: string, cvUrl: string) =>
      sendUserNotification(userId, {
        title: '👀 Your CV Was Viewed',
        message: `${viewerCompany} just viewed your video CV!`,
        tags: ['eyes', 'briefcase'],
        priority: 'high',
        click: cvUrl,
      }),

    contactRequest: (userId: string, companyName: string, message: string) =>
      sendUserNotification(userId, {
        title: '📧 New Contact Request',
        message: `${companyName} wants to connect: "${message}"`,
        tags: ['email', 'star'],
        priority: 'urgent',
        click: `${process.env.NEXT_PUBLIC_APP_URL || ''}/messages`,
      }),

    cvLiked: (userId: string, companyName: string) =>
      sendUserNotification(userId, {
        title: '❤️ Someone Liked Your CV',
        message: `${companyName} liked your video CV`,
        tags: ['heart'],
        priority: 'default',
      }),

    profileIncomplete: (userId: string) =>
      sendUserNotification(userId, {
        title: '⚠️ Complete Your Profile',
        message: 'Add your work experience and skills to get more views',
        tags: ['warning'],
        priority: 'low',
        click: `${process.env.NEXT_PUBLIC_APP_URL || ""}/profile/edit`,
      }),

    interviewScheduled: (userId: string, companyName: string, jobTitle: string, dateTime: string) =>
      sendUserNotification(userId, {
        title: '📅 New Interview Scheduled',
        message: `You have an interview with ${companyName} for ${jobTitle} on ${new Date(dateTime).toLocaleString()}`,
        tags: ['calendar', 'tada'],
        priority: 'urgent',
        click: `${process.env.NEXT_PUBLIC_APP_URL || ""}/dashboard/candidate`,
      }),
  },

  // For Employers
  employer: {
    newCVMatch: (userId: string, candidateName: string, matchScore: number, cvUrl: string) =>
      sendUserNotification(userId, {
        title: '🎯 New Candidate Match',
        message: `${candidateName} (${matchScore}% match) uploaded a video CV`,
        tags: ['dart', 'star'],
        priority: 'high',
        click: cvUrl,
        actions: [
          {
            action: 'view',
            label: 'View CV',
            url: cvUrl,
          },
        ],
      }),

    candidateApplied: (userId: string, candidateName: string, jobTitle: string) =>
      sendUserNotification(userId, {
        title: '📝 New Application',
        message: `${candidateName} applied to ${jobTitle}`,
        tags: ['memo', 'tada'],
        priority: 'urgent',
        click: `${process.env.NEXT_PUBLIC_APP_URL || ''}/applications`,
      }),
  },

  // System/Admin notifications
  system: {
    newUserRegistered: (userName: string, userType: 'candidate' | 'employer') =>
      sendSystemNotification({
        title: '👤 New User Registered',
        message: `${userName} joined as ${userType}`,
        tags: ['bust_in_silhouette', 'tada'],
        priority: 'default',
      }),

    newCVUploaded: async (candidateName: string | undefined, cvUrl: string | undefined) => {
      const name = candidateName || "Candidate";
      const url = cvUrl || "";
      
      return sendSystemNotification({
        title: '🎥 New Video CV',
        message: `${name} uploaded a video CV`,
        tags: ['video', 'new'],
        priority: 'default',
        click: url,
      });
    },

    newJobPosted: (companyName: string, jobTitle: string) =>
      sendSystemNotification({
        title: '💼 New Job Posted',
        message: `${companyName} posted a new job: ${jobTitle}`,
        tags: ['briefcase', 'new'],
        priority: 'default',
      }),

    newInterviewScheduled: (candidateName: string, jobTitle: string, dateTime: string) =>
      sendSystemNotification({
        title: '📅 Interview Scheduled',
        message: `${candidateName} for ${jobTitle} on ${dateTime}`,
        tags: ['calendar', 'alarm_clock'],
        priority: 'high',
      }),
  },
};
