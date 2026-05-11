"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  Zap,
  Activity,
  Mic,
  Video,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Award
} from "lucide-react";
import LiveKitPlayer from "@/app/components/video-tools/LiveKitPlayer";

interface CoachMetrics {
  energy: number;
  clarity: number;
  pacing: number;
  fillers: number;
  sentiment: string;
  feedback: string[];
}

export default function AICoachContent({ videoUrl, userName }: { videoUrl: string | null; userName: string }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metrics, setMetrics] = useState<CoachMetrics | null>(null);

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setMetrics({
        energy: 88,
        clarity: 94,
        pacing: 135,
        fillers: 3,
        sentiment: "Highly Professional",
        feedback: [
          "Exceptional opening hook - grabbed attention within first 5 seconds.",
          "Good eye contact maintained throughout the transition points.",
          "Slight pacing increase during technical descriptions - try to slow down for impact.",
          "Filler word 'like' detected twice near the conclusion."
        ]
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-[#F7B980] animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Professional Development</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">AI Interview Coach</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Private, high-fidelity analysis of your presentation performance.</p>
        </div>
      </div>

      {!videoUrl ? (
        <div className="bg-white border border-dashed border-[gainsboro] rounded-3xl p-12 text-center space-y-5">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
            <Video className="w-8 h-8 text-slate-300" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-black text-slate-800 mb-2">No Active Pipeline Detected</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-sm">
              Record or upload a Video CV in your Profile tab to activate the AI Coach and receive deep performance insights.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 lg:p-8 shadow-xl shadow-slate-200/40 flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* Left: Video + Audit Button */}
          <div className="w-full lg:w-[260px] xl:w-[290px] flex flex-col gap-4 shrink-0">
            {/* Video */}
            <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-white/10">
              <LiveKitPlayer src={videoUrl} candidateName={userName} showBranding={false} />
            </div>

            {/* Spacer pushes button to bottom on desktop */}
            <div className="flex-1 hidden lg:block" />

            {/* Audit Button */}
            <button
              onClick={handleStartAnalysis}
              disabled={isAnalyzing}
              className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2.5 shadow-lg cursor-pointer ${
                isAnalyzing
                  ? "bg-slate-100 text-slate-400"
                  : "bg-[#1E2333] text-white hover:bg-[#2a3047] active:scale-[0.98]"
              }`}
            >
              {isAnalyzing ? (
                <Sparkles className="w-4 h-4 animate-spin text-[#F7B980]" />
              ) : (
                <>
                  Initialize AI Audit
                  <Zap className="w-4 h-4 text-[#F7B980]" />
                </>
              )}
            </button>
          </div>

          {/* Right: Analytics */}
          <div className="flex-1 flex flex-col gap-5 min-w-0">
            <AnimatePresence mode="wait">
              {!metrics && !isAnalyzing ? (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-10 text-center min-h-[300px]"
                >
                  <Brain className="w-14 h-14 text-slate-200 mb-5" />
                  <h3 className="text-xl font-black text-slate-400">Intelligence Audit Pending</h3>
                  <p className="text-slate-400 font-medium mt-2 max-w-xs text-sm">Click initialize to activate the neural performance calibration engine.</p>
                </motion.div>
              ) : isAnalyzing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center space-y-8 p-10 min-h-[300px]"
                >
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-slate-50 border-t-[#F7B980] rounded-full animate-spin" />
                    <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 text-[#F7B980]" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-black text-slate-800">Processing Professional Signals</h3>
                    <div className="flex flex-col items-center gap-2">
                      {["Analyzing Vocal Clarity", "Measuring Pacing Calibration", "Detecting Filler Patterns", "Synthesizing Sentiment"].map((text, i) => (
                        <motion.div
                          key={text}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.5 }}
                          className="flex items-center gap-2"
                        >
                          <Activity className="w-3 h-3 text-[#F7B980]" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : metrics && (
                <motion.div
                  key="metrics"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-5"
                >
                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <Activity className="w-4 h-4 text-[#F7B980]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Pacing</span>
                      </div>
                      <p className="text-3xl font-black text-slate-800 tracking-tight">{metrics.pacing}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Words Per Min</p>
                    </div>
                    <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <Mic className="w-4 h-4 text-blue-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Clarity</span>
                      </div>
                      <p className="text-3xl font-black text-slate-800 tracking-tight">{metrics.clarity}%</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Speech Quality</p>
                    </div>
                    <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Fillers</span>
                      </div>
                      <p className="text-3xl font-black text-slate-800 tracking-tight">{metrics.fillers}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">UM/AH Detected</p>
                    </div>
                  </div>

                  {/* Intelligence Insights */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 pointer-events-none">
                      <Award className="w-20 h-20 text-[#F7B980] opacity-[0.04]" />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0" />
                      Intelligence Insights
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
                      {metrics.feedback.map((item, idx) => (
                        <div key={idx} className="flex gap-3 group">
                          <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#F7B980]/10 transition-colors">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#F7B980]" />
                          </div>
                          <p className="text-sm font-medium text-slate-600 leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vocal Energy Dynamics */}
                  <div className="bg-[#47494B] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
                    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, white 0.5px, transparent 0.5px)", backgroundSize: "28px 28px" }} />
                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div>
                        <h4 className="text-xl font-black tracking-tight mb-1.5">Vocal Energy Dynamics</h4>
                        <p className="text-white/40 font-medium text-sm leading-relaxed max-w-xs">Real-time engagement calibration throughout the 60s stream.</p>
                      </div>
                      <div className="flex items-end gap-1.5 h-16 shrink-0">
                        {[30, 50, 40, 70, 90, 100, 80, 60, 85, 95, 75, 90, 100, 85, 50, 40, 60, 80, 50, 40].map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.05, duration: 0.8 }}
                            className="w-2.5 bg-[#F7B980] rounded-full opacity-90"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
