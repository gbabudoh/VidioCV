"use client";

import React from "react";
import { Star, MessageSquare, Calendar, Video, Briefcase, Sparkles } from "lucide-react";
import Button from "@/app/components/common/Button";

interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description?: string;
}

interface ProfessionalSkill {
  name: string;
  level: string;
  years: number | null;
}

interface Candidate {
  id: string;
  userId: string;
  name: string;
  title: string;
  skills: string[];
  fullSkills?: ProfessionalSkill[];
  videoUrl: string | null;
  rating: number;
  experience?: Experience[];
}

interface CandidateListProps {
  candidates: Candidate[];
  onSelectCandidate?: (candidate: Candidate) => void;
  onViewVideo?: (candidate: Candidate) => void;
  onViewExperience?: (candidate: Candidate) => void;
  onViewSkills?: (candidate: Candidate) => void;
  onMessage?: (candidate: Candidate) => void;
  onSchedule?: (candidate: Candidate) => void;
}

export default function CandidateList({
  candidates,
  onSelectCandidate,
  onViewVideo,
  onViewExperience,
  onViewSkills,
  onMessage,
  onSchedule,
}: CandidateListProps) {
  return (
    <div className="space-y-4">
      {candidates.map((candidate) => (
        <div
          key={candidate.id}
          onClick={() => onSelectCandidate?.(candidate)}
          className="group bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {candidate.name}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 font-medium">{candidate.title}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 rounded-xl text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300"
                >
                  {skill}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < candidate.rating
                      ? "fill-accent-400 text-accent-400"
                      : "fill-secondary-200 text-secondary-200 dark:fill-secondary-800 dark:text-secondary-800"
                  }`}
                />
              ))}
              <span className="text-sm text-secondary-500 dark:text-secondary-400 ml-2 font-medium">{candidate.rating}.0</span>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 mt-4 md:mt-0">
            <Button 
               onClick={(e) => { e.stopPropagation(); onViewVideo?.(candidate); }}
               className="bg-primary-50 hover:bg-primary-600 text-primary-600 hover:text-white dark:bg-primary-500/10 dark:hover:bg-primary-500 dark:text-primary-400 dark:hover:text-white font-semibold transition-all py-1.5 px-3 rounded-md text-xs border-transparent hover:shadow-md hover:shadow-primary-500/20 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" /> View Video
              </span>
            </Button>
            <Button 
               onClick={(e) => { e.stopPropagation(); onViewExperience?.(candidate); }}
               className="bg-secondary-50 hover:bg-secondary-600 text-secondary-600 hover:text-white dark:bg-secondary-500/10 dark:hover:bg-secondary-500 dark:text-secondary-400 dark:hover:text-white font-semibold transition-all py-1.5 px-3 rounded-md text-xs border-transparent hover:shadow-md hover:shadow-secondary-500/20 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Work Experience
              </span>
            </Button>
            <Button 
               onClick={(e) => { e.stopPropagation(); onViewSkills?.(candidate); }}
               className="bg-accent-50 hover:bg-accent-600 text-accent-600 hover:text-white dark:bg-accent-500/10 dark:hover:bg-accent-500 dark:text-accent-400 dark:hover:text-white font-semibold transition-all py-1.5 px-3 rounded-md text-xs border-transparent hover:shadow-md hover:shadow-accent-500/20 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Professional Skills
              </span>
            </Button>
            <Button 
               onClick={(e) => { e.stopPropagation(); onMessage?.(candidate); }}
               className="bg-white/50 hover:bg-secondary-100 text-secondary-700 dark:bg-secondary-900/50 dark:hover:bg-secondary-800 dark:text-secondary-300 font-medium transition-all py-1.5 px-3 rounded-md text-xs border border-secondary-200 dark:border-secondary-700 hover:border-transparent cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Message
              </span>
            </Button>
            <Button 
               onClick={(e) => { e.stopPropagation(); onSchedule?.(candidate); }}
               className="bg-white/50 hover:bg-secondary-100 text-secondary-700 dark:bg-secondary-900/50 dark:hover:bg-secondary-800 dark:text-secondary-300 font-medium transition-all py-1.5 px-3 rounded-md text-xs border border-secondary-200 dark:border-secondary-700 hover:border-transparent cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Schedule
              </span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
