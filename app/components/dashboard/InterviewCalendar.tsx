"use client";

import React from "react";
import { Calendar, Clock } from "lucide-react";

interface Interview {
  id: string;
  candidateName: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled";
}

interface InterviewCalendarProps {
  interviews: Interview[];
}

export default function InterviewCalendar({
  interviews,
}: InterviewCalendarProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-primary-50 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/20 text-primary-600 dark:text-primary-400";
      case "completed":
        return "bg-success-50 dark:bg-success-500/10 border-success-200 dark:border-success-500/20 text-success-600 dark:text-success-400";
      case "cancelled":
        return "bg-error-50 dark:bg-error-500/10 border-error-200 dark:border-error-500/20 text-error-600 dark:text-error-400";
      default:
        return "bg-secondary-50 dark:bg-secondary-500/10 border-secondary-200 dark:border-secondary-500/20 text-secondary-600 dark:text-secondary-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">
          Upcoming Interviews
        </h3>
      </div>
      
      {interviews.length === 0 ? (
        <div className="bg-white/30 dark:bg-secondary-950/30 border border-dashed border-secondary-300 dark:border-secondary-700 rounded-2xl p-12 text-center pointer-events-none">
          <Calendar className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <p className="text-secondary-500 text-lg">No interviews scheduled right now.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition flex flex-col md:flex-row items-start justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl group-hover:scale-105 transition-transform">
                  <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-secondary-900 dark:text-white flex items-center gap-2 mb-1">
                    {interview.candidateName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-secondary-600 dark:text-secondary-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {interview.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {interview.time}
                    </span>
                  </div>
                </div>
              </div>
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(interview.status)} uppercase tracking-wider self-start md:self-center`}
              >
                {interview.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
