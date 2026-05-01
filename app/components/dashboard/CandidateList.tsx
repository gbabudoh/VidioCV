"use client";

import { MessageSquare, Calendar, Video } from "lucide-react";

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
  candidates: (Candidate & { matchScore?: number })[];
  viewMode?: 'grid' | 'list';
  columns?: 1 | 2;
  onSelectCandidate?: (candidate: Candidate) => void;
  onViewVideo?: (candidate: Candidate) => void;
  onMessage?: (candidate: Candidate) => void;
  onSchedule?: (candidate: Candidate) => void;
  isAnonymized?: boolean;
}

function MatchBadge({ score }: { score: number }) {
  const color =
    score >= 65
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : score >= 40
      ? "bg-amber-50 text-amber-600 border-amber-100"
      : "bg-rose-50 text-rose-500 border-rose-100";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${score >= 65 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-rose-400"}`} />
      {score}% match
    </span>
  );
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

/** Vertical card — used in grid mode */
function CandidateCard({
  candidate,
  onSelectCandidate,
  onViewVideo,
  onMessage,
  isAnonymized,
}: {
  candidate: Candidate & { matchScore?: number };
  onSelectCandidate?: (c: Candidate) => void;
  onViewVideo?: (c: Candidate) => void;
  onMessage?: (c: Candidate) => void;
  isAnonymized?: boolean;
}) {
  return (
    <div
      onClick={() => onSelectCandidate?.(candidate)}
      className="group bg-white border border-[gainsboro] rounded-2xl p-7 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col gap-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-base shrink-0 transition-all ${
            isAnonymized 
              ? "bg-slate-300 group-hover:bg-slate-400" 
              : "bg-gradient-to-br from-slate-700 to-slate-900 group-hover:from-slate-600 group-hover:to-slate-800"
          }`}>
            {isAnonymized ? "?" : getInitials(candidate.name)}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-800 truncate leading-tight">
              {isAnonymized ? `Candidate ${candidate.id.slice(0, 4).toUpperCase()}` : candidate.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1 truncate">{candidate.title}</p>
          </div>
        </div>
        {candidate.matchScore !== undefined && (
          <MatchBadge score={candidate.matchScore} />
        )}
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2">
        {candidate.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="px-3 py-1.5 bg-slate-50 border border-[gainsboro] rounded-lg text-xs font-medium text-slate-600">
            {skill}
          </span>
        ))}
        {candidate.skills.length > 4 && (
          <span className="px-3 py-1.5 bg-slate-50 border border-[gainsboro] rounded-lg text-xs font-medium text-slate-400">
            +{candidate.skills.length - 4}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-[gainsboro]">
        <button
          onClick={(e) => { e.stopPropagation(); onViewVideo?.(candidate); }}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <Video className="w-4 h-4" />
          Watch CV
        </button>
        <div className="flex-1" />
        <button
          onClick={(e) => { e.stopPropagation(); onMessage?.(candidate); }}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Inquire
        </button>
      </div>
    </div>
  );
}

/** Horizontal row — used in list mode */
function CandidateRow({
  candidate,
  onSelectCandidate,
  onViewVideo,
  onMessage,
  onSchedule,
  isAnonymized,
}: {
  candidate: Candidate & { matchScore?: number };
  onSelectCandidate?: (c: Candidate) => void;
  onViewVideo?: (c: Candidate) => void;
  onMessage?: (c: Candidate) => void;
  onSchedule?: (c: Candidate) => void;
  isAnonymized?: boolean;
}) {
  return (
    <div
      onClick={() => onSelectCandidate?.(candidate)}
      className="group bg-white border border-slate-100 rounded-2xl px-5 py-4 hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer flex items-center gap-5"
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 transition-all ${
        isAnonymized 
          ? "bg-slate-300 group-hover:bg-slate-400" 
          : "bg-gradient-to-br from-slate-700 to-slate-900 group-hover:from-slate-600 group-hover:to-slate-800"
      }`}>
        {isAnonymized ? "?" : getInitials(candidate.name)}
      </div>

      {/* Identity */}
      <div className="w-44 shrink-0 min-w-0">
        <h3 className="text-sm font-semibold text-slate-800 truncate leading-tight">
          {isAnonymized ? `Candidate ${candidate.id.slice(0, 4).toUpperCase()}` : candidate.name}
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{candidate.title}</p>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
        {candidate.skills.slice(0, 5).map((skill) => (
          <span key={skill} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-medium text-slate-600 whitespace-nowrap">
            {skill}
          </span>
        ))}
        {candidate.skills.length > 5 && (
          <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-medium text-slate-400 whitespace-nowrap">
            +{candidate.skills.length - 5}
          </span>
        )}
      </div>

      {/* Match badge */}
      {candidate.matchScore !== undefined && (
        <div className="shrink-0">
          <MatchBadge score={candidate.matchScore} />
        </div>
      )}

      {/* Divider */}
      <div className="w-px h-8 bg-slate-100 shrink-0" />

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onViewVideo?.(candidate); }}
          className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-700 transition-colors px-2 py-1.5 cursor-pointer"
        >
          <Video className="w-3.5 h-3.5" />
          Watch CV
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onSchedule?.(candidate); }}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Calendar className="w-3 h-3" />
          Schedule
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMessage?.(candidate); }}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <MessageSquare className="w-3 h-3" />
          Inquire
        </button>
      </div>
    </div>
  );
}

export default function CandidateList({
  candidates,
  viewMode = 'grid',
  columns = 2,
  onSelectCandidate,
  onViewVideo,
  onMessage,
  onSchedule,
  isAnonymized,
}: CandidateListProps) {
  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-2">
        {candidates.map((candidate) => (
          <CandidateRow
            key={candidate.id}
            candidate={candidate}
            onSelectCandidate={onSelectCandidate}
            onViewVideo={onViewVideo}
            onMessage={onMessage}
            onSchedule={onSchedule}
            isAnonymized={isAnonymized}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={columns === 1 ? "flex flex-col gap-4" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          onSelectCandidate={onSelectCandidate}
          onViewVideo={onViewVideo}
          onMessage={onMessage}
          isAnonymized={isAnonymized}
        />
      ))}
    </div>
  );
}
