'use client';

import React from 'react';
import { Bell, Smartphone, Monitor, Globe, CheckCircle2 } from 'lucide-react';

export default function NotificationSetup({ userId }: { userId: string }) {
  const userTopic = `videocv-user-${userId}`;
  const ntfyUrl = `https://ntfy.feendesk.com/${userTopic}`;

  return (
    <div className="bg-white/5 dark:bg-slate-900/50 backdrop-blur-xl border border-white/10 dark:border-slate-800 rounded-[32px] p-8 shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-tr from-[#F7B980] to-[#E58A44] rounded-2xl flex items-center justify-center shadow-lg">
          <Bell className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-wider">Enable Push Alerts</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Stay connected on the go</p>
        </div>
      </div>
      
      <p className="text-sm font-medium mb-8 text-slate-600 dark:text-slate-400 leading-relaxed">
        Get instant, professional alerts directly on your device whenever an employer views your Video CV or schedules an interview.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Web Browser */}
        <div className="p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-4">
            <Monitor className="w-5 h-5 text-[#F7B980]" />
            <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white">Desktop & Web</h4>
          </div>
          <p className="text-[11px] text-slate-500 mb-6 font-medium">Receive alerts in your browser even when VidioCV is closed.</p>
          <a 
            href={ntfyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
          >
            <Globe className="w-3.5 h-3.5" />
            Launch Subscription
          </a>
        </div>

        {/* Mobile App */}
        <div className="p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/20 dark:to-slate-800/5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="w-5 h-5 text-[#F7B980]" />
            <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white">Native Mobile</h4>
          </div>
          <div className="space-y-3">
            {[
              "Download **ntfy** app (iOS/Android)",
              "Add server: `https://ntfy.feendesk.com`",
              `Subscribe to topic: \`${userTopic}\``
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400" dangerouslySetInnerHTML={{ 
                  __html: step.replace(/\*\*(.*?)\*\*/g, '<span class="text-slate-900 dark:text-white">$1</span>')
                              .replace(/`(.*?)`/g, '<code class="bg-slate-200 dark:bg-slate-800 px-1 rounded">$1</code>') 
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
