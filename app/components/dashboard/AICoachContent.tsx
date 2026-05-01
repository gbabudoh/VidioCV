"use client";

import React, { useState } from "react";
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
  Award,
  Shield
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
    // Mocking high-fidelity AI analysis
    setTimeout(() => {
      setMetrics({
        energy: 88,
        clarity: 94,
        pacing: 135, // wpm
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
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#F7B980] animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Professional Development</p>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">AI Interview Coach</h1>
          <p className="text-slate-500 font-medium mt-1">Private, high-fidelity analysis of your presentation performance.</p>
        </div>
      </div>

      {!videoUrl ? (
        <div className="bg-white border border-dashed border-[gainsboro] rounded-[40px] p-16 text-center space-y-6">
          <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto border border-slate-100">
            <Video className="w-10 h-10 text-slate-300" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-black text-slate-800 mb-2">No Active Pipeline Detected</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Record or upload a Video CV in your Profile tab to activate the AI Coach and receive deep performance insights.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Video Preview & Analysis Trigger */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-[gainsboro] rounded-[40px] p-8 shadow-sm">
              <div className="aspect-[9/16] bg-slate-900 rounded-[32px] overflow-hidden mb-6 shadow-2xl relative group">
                <LiveKitPlayer src={videoUrl} candidateName={userName} showBranding={false} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <button
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                className={`w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl cursor-pointer ${
                  isAnalyzing ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-800'
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

            <div className="bg-[#57595B] rounded-[32px] p-6 text-white/90 border border-white/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Shield className="w-16 h-16" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Privacy Protocol</p>
               <p className="text-xs font-medium leading-relaxed">
                 AI Coach feedback is **strictly private**. Neither employers nor platform administrators can see this analysis. Use it to iterate and perfect your delivery.
               </p>
            </div>
          </div>

          {/* Right: Insights Dashboard */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {!metrics && !isAnalyzing ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full bg-slate-50 border border-dashed border-[gainsboro] rounded-[40px] flex flex-col items-center justify-center p-12 text-center"
                >
                  <Brain className="w-16 h-16 text-slate-200 mb-6" />
                  <h3 className="text-2xl font-black text-slate-400">Ready for Intelligence Audit</h3>
                  <p className="text-slate-400 font-medium mt-2 max-w-sm">Trigger the audit to receive high-fidelity performance metrics.</p>
                </motion.div>
              ) : isAnalyzing ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full bg-white border border-[gainsboro] rounded-[40px] p-12 flex flex-col items-center justify-center text-center space-y-12"
                >
                  <div className="relative">
                    <div className="w-32 h-32 border-4 border-slate-50 border-t-[#F7B980] rounded-full animate-[spin:2s_linear_infinite]" />
                    <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-[#F7B980]" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-slate-800">Processing Professional Signals</h3>
                    <div className="flex flex-col items-center gap-2">
                       {['Analyzing Vocal Clarity', 'Measuring Pacing Calibration', 'Detecting Filler Patterns', 'Synthesizing Sentiment'].map((text, i) => (
                         <motion.div 
                           key={text}
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: i * 0.5 }}
                           className="flex items-center gap-2"
                         >
                           <Activity className="w-3 h-3 text-[#F7B980]" />
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{text}</span>
                         </motion.div>
                       ))}
                    </div>
                  </div>
                </motion.div>
              ) : metrics && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-[gainsboro] p-8 rounded-[32px] shadow-sm">
                       <div className="flex items-center justify-between mb-4">
                          <Activity className="w-5 h-5 text-[#F7B980]" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pacing</span>
                       </div>
                       <p className="text-3xl font-black text-slate-800">{metrics.pacing}</p>
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Words Per Min</p>
                    </div>
                    <div className="bg-white border border-[gainsboro] p-8 rounded-[32px] shadow-sm">
                       <div className="flex items-center justify-between mb-4">
                          <Mic className="w-5 h-5 text-blue-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clarity</span>
                       </div>
                       <p className="text-3xl font-black text-slate-800">{metrics.clarity}%</p>
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Speech Quality</p>
                    </div>
                    <div className="bg-white border border-[gainsboro] p-8 rounded-[32px] shadow-sm">
                       <div className="flex items-center justify-between mb-4">
                          <AlertCircle className="w-5 h-5 text-rose-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fillers</span>
                       </div>
                       <p className="text-3xl font-black text-slate-800">{metrics.fillers}</p>
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">UM/AH Detected</p>
                    </div>
                  </div>

                  {/* Summary Block */}
                  <div className="bg-white border border-[gainsboro] rounded-[40px] p-10 shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8">
                        <Award className="w-16 h-16 text-[#F7B980] opacity-10" />
                     </div>
                     <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                        Intelligence Insights
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {metrics.feedback.map((item, idx) => (
                          <div key={idx} className="flex gap-4 group">
                             <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#F7B980]/10 transition-colors">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#F7B980]" />
                             </div>
                             <p className="text-sm font-medium text-slate-600 leading-relaxed">{item}</p>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Energy Chart Mockup */}
                  <div className="bg-[#57595B] rounded-[40px] p-10 text-white relative overflow-hidden">
                     <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle, white 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }} />
                     <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                           <h4 className="text-2xl font-black tracking-tight mb-2">Vocal Energy Dynamics</h4>
                           <p className="text-white/40 font-medium text-sm">Real-time engagement calibration throughout the 60s stream.</p>
                        </div>
                        <div className="flex items-end gap-1.5 h-20 shrink-0">
                           {[40, 60, 30, 80, 95, 70, 50, 90, 100, 85, 60, 75, 40, 55, 70].map((h, i) => (
                             <motion.div 
                               key={i}
                               initial={{ height: 0 }}
                               animate={{ height: `${h}%` }}
                               transition={{ delay: i * 0.05, duration: 1 }}
                               className="w-2.5 bg-[#F7B980] rounded-full opacity-80" 
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
