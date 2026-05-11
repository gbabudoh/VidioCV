"use strict";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Target, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Loader2
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

interface LogicAssessmentProps {
  onComplete: (results: AssessmentResults, telemetry: TelemetryData[]) => void | Promise<void>;
  candidateName: string;
}

type StepType = "intro" | "challenge1" | "challenge2" | "challenge3" | "submitting";

const LogicAssessment: React.FC<LogicAssessmentProps> = ({ onComplete, candidateName }) => {
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

  // --- Challenge 1: Pattern Recognition ---
  const [c1Selection, setC1Selection] = useState<number | null>(null);
  const c1Pattern = [2, 4, 8, 16, 32];
  const c1Options = [48, 64, 128, 56];

  // --- Challenge 2: Efficient Logic ---
  const [c2Nodes, setC2Nodes] = useState<number[]>([]);
  const c2Target = 15;
  const c2Values = [3, 5, 2, 7, 1];

  // --- Challenge 3: Edge Case Detection ---
  const c3Items = [
    { id: 1, type: "data", value: "Valid", error: false },
    { id: 2, type: "data", value: "Valid", error: false },
    { id: 3, type: "data", value: "NullPtr", error: true },
    { id: 4, type: "data", value: "Valid", error: false },
  ];
  const [c3Selected, setC3Selected] = useState<number | null>(null);

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
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E2E8F0] min-h-[500px] flex flex-col">
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
                <Brain className="w-12 h-12 text-[#F7B980]" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-[#334155]">Neural Skill Sync</h2>
                <p className="text-[#64748B] text-lg leading-relaxed max-w-md mx-auto">
                  Welcome, <span className="text-[#F7B980] font-bold">{candidateName}</span>. 
                  This is not a traditional test. We analyze your problem-solving style to build your 360-degree profile.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <Zap className="w-5 h-5 text-[#F7B980] mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Velocity</p>
                  <p className="text-sm text-[#475569]">Analysis of speed vs. precision</p>
                </div>
                <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <Target className="w-5 h-5 text-[#F7B980] mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Efficiency</p>
                  <p className="text-sm text-[#475569]">Optimization of logical paths</p>
                </div>
                <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <Sparkles className="w-5 h-5 text-[#F7B980] mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Behavior</p>
                  <p className="text-sm text-[#475569]">AI-driven solving archetype</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setStep("challenge1");
                  startChallenge();
                }}
                className="w-full py-4 bg-[#334155] hover:bg-[#1E293B] text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group shadow-xl shadow-[#334155]/10 cursor-pointer"
              >
                Initiate Sync <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform cursor-pointer" />
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
                  <Zap className="w-6 h-6 text-[#F7B980]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#334155]">Pattern Recognition</h3>
                  <p className="text-sm text-[#64748B]">Identify the next logical increment in the sequence.</p>
                </div>
              </div>

              <div className="flex justify-center gap-4 py-8">
                {c1Pattern.map((val, i) => (
                  <div key={i} className="w-12 h-16 bg-[#F1F5F9] rounded-xl flex items-center justify-center text-xl font-black text-[#334155] border border-[#E2E8F0]">
                    {val}
                  </div>
                ))}
                <div className="w-12 h-16 bg-white border-2 border-dashed border-[#CBD5E1] rounded-xl flex items-center justify-center text-2xl text-[#CBD5E1]">
                  ?
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {c1Options.map((opt, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      recordInteraction();
                      setC1Selection(opt);
                    }}
                    className={`py-6 rounded-2xl font-black text-xl transition-all border-2 cursor-pointer ${
                      c1Selection === opt 
                        ? "bg-[#334155] border-[#334155] text-white shadow-lg" 
                        : "bg-white border-[#E2E8F0] text-[#475569] hover:border-[#F7B980]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <button 
                disabled={c1Selection === null}
                onClick={() => completeChallenge("challenge1", { selected: c1Selection, correct: c1Selection === 64 }, "challenge2")}
                className="w-full py-4 bg-[#F7B980] hover:bg-[#F5A65B] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#F7B980]/20 cursor-pointer"
              >
                Validate Pattern <ArrowRight className="w-5 h-5 cursor-pointer" />
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
                  <Target className="w-6 h-6 text-[#F7B980]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#334155]">Target Optimization</h3>
                  <p className="text-sm text-[#64748B]">Select values to reach the target sum of <span className="font-bold text-[#334155]">{c2Target}</span>.</p>
                </div>
              </div>

              <div className="bg-[#F8FAFC] p-8 rounded-3xl border border-[#E2E8F0] space-y-6">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#94A3B8] mb-2">Current Sum</p>
                  <p className="text-5xl font-black text-[#334155]">
                    {c2Nodes.reduce((a, b) => a + b, 0)}
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  {c2Values.map((val, i) => {
                    const isSelected = c2Nodes.includes(val);
                    return (
                      <button 
                        key={i}
                        onClick={() => {
                          recordInteraction();
                          if (isSelected) {
                            setC2Nodes(prev => prev.filter(n => n !== val));
                          } else {
                            setC2Nodes(prev => [...prev, val]);
                          }
                        }}
                        className={`w-14 h-14 rounded-full font-black text-lg transition-all border-2 cursor-pointer ${
                          isSelected 
                            ? "bg-[#F7B980] border-[#F7B980] text-white scale-110 shadow-lg" 
                            : "bg-white border-[#E2E8F0] text-[#475569] hover:scale-105"
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setRetries(prev => prev + 1);
                    setC2Nodes([]);
                  }}
                  className="px-6 py-4 bg-white border border-[#E2E8F0] text-[#64748B] font-bold rounded-2xl hover:bg-[#F8FAFC]"
                >
                  Reset
                </button>
                <button 
                  disabled={c2Nodes.reduce((a, b) => a + b, 0) === 0}
                  onClick={() => completeChallenge("challenge2", { nodes: c2Nodes, sum: c2Nodes.reduce((a, b) => a + b, 0), correct: c2Nodes.reduce((a, b) => a + b, 0) === c2Target }, "challenge3")}
                  className="flex-1 py-4 bg-[#334155] hover:bg-[#1E293B] text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#334155]/10 cursor-pointer"
                >
                  Confirm Logic <ArrowRight className="w-5 h-5 cursor-pointer" />
                </button>
              </div>
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
                  <AlertTriangle className="w-6 h-6 text-[#F7B980]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#334155]">System Integrity</h3>
                  <p className="text-sm text-[#64748B]">Identify the anomalous entry in the data stream.</p>
                </div>
              </div>

              <div className="space-y-3">
                {c3Items.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      recordInteraction();
                      setC3Selected(item.id);
                    }}
                    className={`w-full p-6 rounded-2xl flex items-center justify-between border-2 transition-all cursor-pointer ${
                      c3Selected === item.id 
                        ? "bg-[#334155] border-[#334155] text-white shadow-lg" 
                        : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:border-[#F7B980]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${c3Selected === item.id ? "bg-[#F7B980]" : "bg-[#CBD5E1]"}`} />
                      <span className="font-mono text-sm uppercase tracking-widest">{item.type}::{item.id}</span>
                    </div>
                    <span className={`font-black ${c3Selected === item.id ? "text-white" : "text-[#94A3B8]"}`}>
                      {item.value}
                    </span>
                  </button>
                ))}
              </div>

              <button 
                disabled={c3Selected === null}
                onClick={() => completeChallenge("challenge3", { selected: c3Selected, correct: c3Selected === 3 }, "submitting")}
                className="w-full py-4 bg-[#334155] hover:bg-[#1E293B] text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#334155]/10 cursor-pointer"
              >
                Finalize Sync <CheckCircle2 className="w-5 h-5 cursor-pointer" />
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
                  <Brain className="w-8 h-8 text-[#334155]" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-[#334155]">Neural Analysis in Progress</h2>
                <p className="text-[#64748B] max-w-sm mx-auto">
                  Our AI is processing your telemetry and behavior patterns to build your professional archetype.
                </p>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-[#F8FAFC] rounded-full border border-[#E2E8F0]">
                <Clock className="w-4 h-4 text-[#94A3B8]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Finalizing Profile Sync</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Branding */}
      <div className="p-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#F7B980] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8]">Neural Match AI v4.0</span>
        </div>
        <div className="flex items-center gap-4 text-[#CBD5E1]">
          <Brain className="w-4 h-4" />
          <Zap className="w-4 h-4" />
          <Target className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default LogicAssessment;
