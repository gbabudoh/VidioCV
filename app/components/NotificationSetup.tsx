'use client';

import React from 'react';

export default function NotificationSetup({ userId }: { userId: string }) {
  const userTopic = `videocv-user-${userId}`;
  const ntfyUrl = `https://ntfy.feendesk.com/${userTopic}`;

  return (
    <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6">
      <h3 className="font-bold text-lg mb-4 text-primary-900 dark:text-primary-100">📱 Enable Push Notifications</h3>
      
      <p className="text-sm mb-4 text-primary-700 dark:text-primary-300">
        Get instant alerts when employers view your CV or send messages.
      </p>

      <div className="space-y-6">
        {/* Web Browser */}
        <div>
          <h4 className="font-semibold mb-2 text-primary-800 dark:text-primary-200">On This Browser:</h4>
          <a 
            href={ntfyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Subscribe to Notifications
          </a>
        </div>

        {/* Mobile App */}
        <div>
          <h4 className="font-semibold mb-2 text-primary-800 dark:text-primary-200">On Your Phone:</h4>
          <ol className="text-sm space-y-2 list-decimal list-inside text-primary-700 dark:text-primary-300">
            <li>Download <strong>ntfy</strong> app (iOS/Android)</li>
            <li>Add server: <code className="bg-primary-100 dark:bg-primary-800 px-2 py-1 rounded">https://ntfy.feendesk.com</code></li>
            <li>Subscribe to topic: <code className="bg-primary-100 dark:bg-primary-800 px-2 py-1 rounded">{userTopic}</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}
