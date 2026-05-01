"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Beaker, 
  Trophy, 
  Clock, 
  ChevronRight, 
  Terminal, 
  Layout, 
  MessageSquare, 
  Zap, 
  ShieldCheck,
  Star,
  CheckCircle2,
  Lock,
  ArrowRight,
  Target,
  LucideIcon
} from "lucide-react";

interface Assessment {
  id: string;
  title: string;
  category: "Technical" | "Design" | "Strategy" | "Communication";
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  points: number;
  status: "available" | "in-progress" | "verified";
  score?: number;
  icon: LucideIcon;
}

export default function SkillLabsContent() {
  const [assessments] = useState<Assessment[]>([
    {
      id: "tech-01",
      title: "System Architecture & Scalability",
      category: "Technical",
      duration: "15 mins",
      difficulty: "Advanced",
      points: 850,
      status: "verified",
      score: 94,
      icon: Terminal
    },
    {
      id: "design-01",
      title: "UI/UX Precision & Visual Logic",
      category: "Design",
      duration: "12 mins",
      difficulty: "Intermediate",
      points: 450,
      status: "in-progress",
      icon: Layout
    },
    {
      id: "strat-01",
      title: "Strategic Business Case Analysis",
      category: "Strategy",
      duration: "20 mins",
      difficulty: "Intermediate",
      points: 600,
      status: "available",
      icon: Target
    },
    {
      id: "comm-01",
      title: "Professional Communication & Soft Skills",
      category: "Communication",
      duration: "10 mins",
      difficulty: "Beginner",
      points: 300,
      status: "available",
      icon: MessageSquare
    }
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="relative p-10 rounded-[48px] bg-slate-900 text-white overflow-hidden group">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
          <Beaker className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-[#F7B980]/20 text-[#F7B980] border border-[#F7B980]/30 text-[10px] font-black uppercase tracking-widest">
              Beta Access
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Verified Talent Mesh Active</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            VidioCV <span className="text-[#F7B980]">Skill Labs</span>
          </h1>
          <p className="text-lg text-white/60 font-medium leading-relaxed">
            Objective verification for elite performers. Complete high-fidelity challenges to earn verified badges and highlight your competence to top-tier employers.
          </p>
          
          <div className="flex flex-wrap items-center gap-8 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#F7B980]" />
              </div>
              <div>
                <p className="text-xl font-black">1,450</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Total Lab Points</p>
              </div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xl font-black">1 / 4</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Verified Badges</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left: Assessment Inventory */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Available Pathways</h3>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
               <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> All Categories</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {assessments.map((lab) => (
              <motion.div
                key={lab.id}
                whileHover={{ y: -4 }}
                className={`group relative p-6 rounded-[32px] border transition-all duration-300 flex items-center gap-6 cursor-pointer ${
                  lab.status === 'verified' 
                    ? 'bg-white border-slate-200' 
                    : lab.status === 'in-progress'
                    ? 'bg-slate-50/50 border-[#F7B980]/30'
                    : 'bg-white border-slate-100'
                }`}
              >
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500 ${
                  lab.status === 'verified' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-500'
                }`}>
                  <lab.icon className="w-8 h-8" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{lab.category}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{lab.difficulty}</span>
                  </div>
                  <h4 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-[#F7B980] transition-colors">{lab.title}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Clock className="w-3.5 h-3.5" /> {lab.duration}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Zap className="w-3.5 h-3.5" /> {lab.points} XP
                    </span>
                  </div>
                </div>

                {/* Status/Action */}
                <div className="shrink-0 flex items-center gap-4">
                  {lab.status === 'verified' ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <div className="text-center mr-2 pr-4 border-r border-emerald-100">
                        <p className="text-[8px] font-black uppercase">Score</p>
                        <p className="text-sm font-black">{lab.score}%</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : lab.status === 'in-progress' ? (
                    <button className="px-6 py-3 rounded-2xl bg-[#F7B980] text-black text-xs font-black uppercase tracking-widest hover:bg-[#F0A060] transition-all shadow-lg shadow-[#F7B980]/20 flex items-center gap-2">
                      Resume <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button className="p-3 rounded-2xl bg-slate-100 text-slate-400 group-hover:bg-slate-800 group-hover:text-white transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Leaderboard & Stats */}
        <div className="space-y-8">
          {/* Rank Card */}
          <div className="p-8 rounded-[40px] bg-white border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Star className="w-20 h-20" />
             </div>
             <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Global Standing</h3>
             <div className="flex items-end gap-2 mb-2">
                <p className="text-5xl font-black text-slate-800 leading-none">Top 12%</p>
                <div className="mb-1 flex items-center gap-1 text-emerald-500 font-bold text-sm">
                   <TrendingUp className="w-4 h-4" /> +2%
                </div>
             </div>
             <p className="text-xs font-medium text-slate-400 leading-relaxed">
               You are currently performing better than 88% of candidates in the Technical & Systems Architecture categories.
             </p>
             
             <div className="mt-8 space-y-4">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "88%" }}
                     transition={{ duration: 1.5, ease: "easeOut" }}
                     className="h-full bg-gradient-to-r from-slate-400 to-[#F7B980]" 
                   />
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                   <span>Bronze</span>
                   <span className="text-slate-800">Gold (Current)</span>
                   <span>Elite</span>
                </div>
             </div>
          </div>

          {/* Locked Features */}
          <div className="p-8 rounded-[40px] bg-slate-50 border border-dashed border-slate-200 space-y-6">
             <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-slate-300" />
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Enterprise Access</h4>
             </div>
             <div className="space-y-4 opacity-40 grayscale pointer-events-none">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                   <span>Real-time Pair Programming</span>
                   <ChevronRight className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                   <span>AI Code Sandbox Analysis</span>
                   <ChevronRight className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                   <span>Live Market Trading Sim</span>
                   <ChevronRight className="w-4 h-4" />
                </div>
             </div>
             <p className="text-[10px] font-bold text-center text-slate-400 uppercase tracking-widest">Complete more verified labs to unlock</p>
          </div>
        </div>

      </div>
    </div>
  );
}

// Reuse TrendingUp from lucide-react if possible, otherwise import it.
import { TrendingUp } from "lucide-react";
