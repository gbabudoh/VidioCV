"use strict";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Send, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Volume2,
  Sparkles,
  Loader2,
  MessageCircle,
  ChevronRight,
  ShieldAlert,
  Ear
} from "lucide-react";

interface TelemetryData {
  challengeId: string;
  startTime: number;
  endTime?: number;
  interactions: number;
  retries: number;
}

interface ChallengeResult {
  correct: boolean;
  [key: string]: string | number | boolean | null | number[] | string[];
}

interface AssessmentResults {
  [key: string]: ChallengeResult;
}

interface CommunicationAssessmentProps {
  onComplete: (results: AssessmentResults, telemetry: TelemetryData[]) => void | Promise<void>;
  candidateName: string;
}

type StepType = "intro" | "challenge1" | "challenge2" | "challenge3" | "submitting";

const CommunicationAssessment: React.FC<CommunicationAssessmentProps> = ({ onComplete, candidateName }) => {
  const [step, setStep] = useState<StepType>("intro");
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([]);
  const [currentChallengeStart, setCurrentChallengeStart] = useState<number>(0);
  const [interactions, setInteractions] = useState<number>(0);
  const [retries, setRetries] = useState<number>(0);
  const [results, setResults] = useState<AssessmentResults>({});

  const startChallenge = () => {
    setCurrentChallengeStart(Date.now());
    setInteractions(0);
    setRetries(0);
  };

  const recordInteraction = () => setInteractions(prev => prev + 1);

  const completeChallenge = (id: string, challengeResult: ChallengeResult, nextStep: StepType) => {
    const data: TelemetryData = {
      challengeId: id,
      startTime: currentChallengeStart,
      endTime: Date.now(),
      interactions,
      retries
    };
    setTelemetry(prev => [...prev, data]);
    setResults(prev => ({ ...prev, [id]: challengeResult }));
    setStep(nextStep);
    if (nextStep !== "submitting") {
      startChallenge();
    }
  };

  // --- Challenge 1: Stakeholder Tone ---
  const [c1Selection, setC1Selection] = useState<number | null>(null);
  const c1Scenario = "A client is frustrated because a feature delivery is delayed by 48 hours due to a critical security patch.";
  const c1Options = [
    { id: 1, text: "It's not our fault, security is more important than your deadline. We'll get to it when we can.", tone: "Defensive" },
    { id: 2, text: "I understand the frustration this delay causes. We've prioritized a critical security patch to ensure your data remains protected. I'll provide an update every 12 hours.", tone: "Empathetic/Proactive" },
    { id: 3, text: "The feature is delayed. We are working on a patch. Please wait for further instructions.", tone: "Abrupt" },
  ];

  // --- Challenge 2: Professional Brevity ---
  const [c2Selection, setC2Selection] = useState<number | null>(null);
  const c2Options = [
    { id: 1, text: "I am writing this email to inform you that I might be a little late for the meeting we scheduled at 2 PM because my previous call is running over.", words: 32 },
    { id: 2, text: "Running 10 mins late for our 2 PM. Please start without me, I'll join as soon as possible.", words: 17 },
    { id: 3, text: "Apologies, my 1 PM is overrunning. I'll join our 2 PM meeting 10 minutes late. Please proceed with the first agenda item.", words: 22 },
  ];

  // --- Challenge 3: Active Listening (Anomalies) ---
  const [c3Selection, setC3Selection] = useState<string | null>(null);
  const c3Transcript = "I love the new UI, but the dashboard loading time is killing our productivity. The colors are great though.";
  const c3Options = ["UI Aesthetics", "System Performance", "Feature Set", "Color Palette"];

  useEffect(() => {
    if (step === "submitting") {
      setTimeout(() => {
        onComplete(results, telemetry);
      }, 2000);
    }
  }, [step, results, telemetry, onComplete]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E2E8F0] min-h-[550px] flex flex-col">
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-[#F1F5F9] flex">
        <motion.div 
          className="h-full bg-[#F7B980]"
          initial={{ width: "0%" }}
          animate={{ 
            width: step === "intro" ? "0%" : 
                   step === "challenge1" ? "33%" : 
                   step === "challenge2" ? "66%" : "100%" 
          }}
        />
      </div>

      <div className="p-8 md:p-12 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div 
              key="intro"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-center space-y-8"
            >
              <div className="inline-flex p-4 bg-[#F7B980]/10 rounded-2xl">
                <MessageSquare className="w-12 h-12 text-[#F7B980]" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-[#334155]">Soft Skills & Comms</h2>
                <p className="text-[#64748B] text-lg leading-relaxed max-w-md mx-auto">
                  Hello <span className="text-[#F7B980] font-bold">{candidateName}</span>. 
                  High-performance teams run on clear communication. This lab evaluates your empathy, brevity, and active listening.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <Volume2 className="w-5 h-5 text-[#F7B980] mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Tone</p>
                  <p className="text-sm text-[#475569]">Adapting to stakeholder needs</p>
                </div>
                <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <Send className="w-5 h-5 text-[#F7B980] mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Brevity</p>
                  <p className="text-sm text-[#475569]">Maximizing clarity, minimizing words</p>
                </div>
                <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <Ear className="w-5 h-5 text-[#F7B980] mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Listening</p>
                  <p className="text-sm text-[#475569]">Extracting core requirements</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setStep("challenge1");
                  startChallenge();
                }}
                className="w-full py-4 bg-[#334155] hover:bg-[#1E293B] text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group shadow-xl shadow-[#334155]/10 cursor-pointer"
              >
                Start Communication Sync <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform cursor-pointer" />
              </button>
            </motion.div>
          )}

          {step === "challenge1" && (
            <motion.div 
              key="challenge1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[#F7B980]/10 rounded-lg">
                  <ShieldAlert className="w-6 h-6 text-[#F7B980]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#334155]">Conflict Tone Sync</h3>
                  <p className="text-sm text-[#64748B]">Choose the response that balances transparency with professional empathy.</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl italic text-slate-600 text-sm leading-relaxed">
                &quot;{c1Scenario}&quot;
              </div>

              <div className="space-y-3">
                {c1Options.map((opt) => (
                  <button 
                    key={opt.id}
                    onClick={() => {
                      recordInteraction();
                      setC1Selection(opt.id);
                    }}
                    className={`w-full p-5 rounded-2xl border-2 transition-all text-left group cursor-pointer ${
                      c1Selection === opt.id 
                        ? "bg-[#334155] border-[#334155] text-white shadow-lg" 
                        : "bg-white border-[#E2E8F0] text-[#475569] hover:border-[#F7B980]"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <p className="text-sm font-medium leading-relaxed">{opt.text}</p>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shrink-0 ${c1Selection === opt.id ? "bg-white/10 text-white" : "bg-slate-100 text-slate-400"}`}>
                        {opt.tone}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <button 
                disabled={c1Selection === null}
                onClick={() => completeChallenge("challenge1", { selected: c1Selection, correct: c1Selection === 2 }, "challenge2")}
                className="w-full py-4 bg-[#F7B980] hover:bg-[#F5A65B] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#F7B980]/20 cursor-pointer"
              >
                Validate Tone <ArrowRight className="w-5 h-5 cursor-pointer" />
              </button>
            </motion.div>
          )}

          {step === "challenge2" && (
            <motion.div 
              key="challenge2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[#F7B980]/10 rounded-lg">
                  <Send className="w-6 h-6 text-[#F7B980]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#334155]">Professional Brevity</h3>
                  <p className="text-sm text-[#64748B]">Select the version that provides maximum clarity with optimal word count.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {c2Options.map((opt) => (
                  <button 
                    key={opt.id}
                    onClick={() => {
                      recordInteraction();
                      setC2Selection(opt.id);
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden group cursor-pointer ${
                      c2Selection === opt.id 
                        ? "bg-[#334155] border-[#334155] text-white shadow-xl" 
                        : "bg-white border-[#E2E8F0] text-[#475569] hover:border-[#F7B980]"
                    }`}
                  >
                    <p className="text-sm font-bold leading-relaxed pr-16">{opt.text}</p>
                    <div className={`absolute top-0 right-0 h-full w-14 flex items-center justify-center font-black text-xs ${c2Selection === opt.id ? "bg-white/10" : "bg-slate-50 text-slate-300"}`}>
                      {opt.words}w
                    </div>
                  </button>
                ))}
              </div>

              <button 
                disabled={c2Selection === null}
                onClick={() => completeChallenge("challenge2", { selected: c2Selection, correct: c2Selection === 3 }, "challenge3")}
                className="w-full py-4 bg-[#334155] hover:bg-[#1E293B] text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#334155]/10 cursor-pointer"
              >
                Lock Response <ArrowRight className="w-5 h-5 cursor-pointer" />
              </button>
            </motion.div>
          )}

          {step === "challenge3" && (
            <motion.div 
              key="challenge3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[#F7B980]/10 rounded-lg">
                  <Ear className="w-6 h-6 text-[#F7B980]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#334155]">Active Listening</h3>
                  <p className="text-sm text-[#64748B]">Identify the primary functional requirement from the user transcript.</p>
                </div>
              </div>

              <div className="p-6 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs border border-slate-800 relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F7B980]/30 to-transparent" />
                 <span className="text-slate-500 mr-2">[TRANSCRIPT]:</span> 
                 &quot;{c3Transcript}&quot;
              </div>

              <div className="grid grid-cols-2 gap-3">
                {c3Options.map((opt) => (
                  <button 
                    key={opt}
                    onClick={() => {
                      recordInteraction();
                      setC3Selection(opt);
                    }}
                    className={`p-5 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer ${
                      c3Selection === opt 
                        ? "bg-[#334155] border-[#334155] text-white shadow-lg" 
                        : "bg-white border-[#E2E8F0] text-slate-400 hover:border-[#F7B980] hover:text-slate-600"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <button 
                disabled={c3Selection === null}
                onClick={() => completeChallenge("challenge3", { selected: c3Selection, correct: c3Selection === "System Performance" }, "submitting")}
                className="w-full py-4 bg-[#334155] hover:bg-[#1E293B] text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#334155]/10 cursor-pointer"
              >
                Finalize Communication Sync <CheckCircle2 className="w-5 h-5 cursor-pointer" />
              </button>
            </motion.div>
          )}

          {step === "submitting" && (
            <motion.div 
              key="submitting"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-center space-y-8 flex-1 flex flex-col items-center justify-center"
            >
              <div className="relative">
                <Loader2 className="w-20 h-20 text-[#F7B980] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-[#334155]" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-[#334155]">Synthesizing Soft Skills</h2>
                <p className="text-[#64748B] max-w-sm mx-auto">
                  Calculating your professional communication archetype based on empathy, brevity, and active listening metrics.
                </p>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-[#F8FAFC] rounded-full border border-[#E2E8F0]">
                <Clock className="w-4 h-4 text-[#94A3B8]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Finalizing Persona Sync</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Branding */}
      <div className="p-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#F7B980] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8]">Comms Core AI v1.4</span>
        </div>
        <div className="flex items-center gap-4 text-[#CBD5E1]">
          <MessageSquare className="w-4 h-4" />
          <Sparkles className="w-4 h-4" />
          <Send className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default CommunicationAssessment;
