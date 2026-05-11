"use strict";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Layout, 
  Palette, 
  MousePointer2, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Eye,
  Sparkles,
  Loader2,
  Maximize2,
  ChevronRight,
  Layers,
  Target
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

interface DesignAssessmentProps {
  onComplete: (results: AssessmentResults, telemetry: TelemetryData[]) => void | Promise<void>;
  candidateName: string;
}

type StepType = "intro" | "challenge1" | "challenge2" | "challenge3" | "submitting";

const DesignAssessment: React.FC<DesignAssessmentProps> = ({ onComplete, candidateName }) => {
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

  // --- Challenge 1: Contrast & Accessibility ---
  const [c1Selection, setC1Selection] = useState<string | null>(null);
  const c1Options = [
    { id: "A", color: "#F1F5F9", text: "#94A3B8", ratio: "2.1:1" },
    { id: "B", color: "#334155", text: "#F7B980", ratio: "4.8:1" },
    { id: "C", color: "#FFFFFF", text: "#E2E8F0", ratio: "1.2:1" },
    { id: "D", color: "#F7B980", text: "#FFFFFF", ratio: "1.8:1" },
  ];

  // --- Challenge 2: Grid & Alignment ---
  const [c2Alignment, setC2Alignment] = useState<number>(0); // 0 = off, 1 = correct
  const [c2ShowGrid, setC2ShowGrid] = useState(false);

  // --- Challenge 3: Visual Hierarchy ---
  const [c3Hierarchy, setC3Hierarchy] = useState<string[]>([]);
  const c3Items = ["Headline", "Call to Action", "Body Text", "Support Link"];

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
                <Palette className="w-12 h-12 text-[#F7B980]" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-[#334155]">UI/UX Precision Lab</h2>
                <p className="text-[#64748B] text-lg leading-relaxed max-w-md mx-auto">
                  Designer <span className="text-[#F7B980] font-bold">{candidateName}</span>, 
                  your eye for detail is what we&apos;re measuring. This lab evaluates visual logic, accessibility, and hierarchy.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <Eye className="w-5 h-5 text-[#F7B980] mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Aesthetics</p>
                  <p className="text-sm text-[#475569]">Contrast and color harmony</p>
                </div>
                <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <Layers className="w-5 h-5 text-[#F7B980] mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Structure</p>
                  <p className="text-sm text-[#475569]">Grid alignment and spacing</p>
                </div>
                <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <MousePointer2 className="w-5 h-5 text-[#F7B980] mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">UX Flow</p>
                  <p className="text-sm text-[#475569]">Information hierarchy logic</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setStep("challenge1");
                  startChallenge();
                }}
                className="w-full py-4 bg-[#334155] hover:bg-[#1E293B] text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group shadow-xl shadow-[#334155]/10 cursor-pointer"
              >
                Enter Design Studio <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform cursor-pointer" />
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
                  <Eye className="w-6 h-6 text-[#F7B980]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#334155]">Contrast Optimization</h3>
                  <p className="text-sm text-[#64748B]">Select the combination with the highest accessibility compliance.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {c1Options.map((opt) => (
                  <button 
                    key={opt.id}
                    onClick={() => {
                      recordInteraction();
                      setC1Selection(opt.id);
                    }}
                    className={`relative p-8 rounded-[32px] border-4 transition-all cursor-pointer ${
                      c1Selection === opt.id 
                        ? "border-[#F7B980] scale-105 shadow-2xl" 
                        : "border-transparent bg-[#F8FAFC] hover:border-[#E2E8F0]"
                    }`}
                    style={{ backgroundColor: opt.color }}
                  >
                    <span className="text-lg font-black" style={{ color: opt.text }}>
                      Sample Text
                    </span>
                    {c1Selection === opt.id && (
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#F7B980] rounded-full flex items-center justify-center text-white shadow-lg">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button 
                disabled={c1Selection === null}
                onClick={() => completeChallenge("challenge1", { selected: c1Selection, correct: c1Selection === "B" }, "challenge2")}
                className="w-full py-4 bg-[#F7B980] hover:bg-[#F5A65B] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#F7B980]/20 cursor-pointer"
              >
                Verify Contrast <ArrowRight className="w-5 h-5 cursor-pointer" />
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
                  <Maximize2 className="w-6 h-6 text-[#F7B980]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#334155]">Optical Alignment</h3>
                  <p className="text-sm text-[#64748B]">Adjust the element to achieve perfect geometric balance.</p>
                </div>
              </div>

              <div className="bg-[#F8FAFC] p-12 rounded-[40px] border border-[#E2E8F0] relative overflow-hidden flex items-center justify-center min-h-[250px]">
                {c2ShowGrid && (
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                )}
                
                <div className="relative w-48 h-12 bg-white rounded-xl shadow-sm border border-[#E2E8F0] flex items-center justify-center group">
                  <motion.div 
                    drag="x"
                    dragConstraints={{ left: -40, right: 40 }}
                    onDrag={() => recordInteraction()}
                    onDragEnd={(_, info) => {
                       const offset = info.offset.x;
                       if (Math.abs(offset) < 5) setC2Alignment(1);
                       else setC2Alignment(0);
                    }}
                    className="w-8 h-8 bg-[#F7B980] rounded-lg cursor-pointer flex items-center justify-center shadow-lg"
                  >
                    <Target className="w-4 h-4 text-white cursor-pointer" />
                  </motion.div>
                  <div className="absolute -top-8 text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">
                    Optical Center
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    recordInteraction();
                    setC2ShowGrid(!c2ShowGrid);
                  }}
                  className={`px-6 py-4 border rounded-2xl font-bold transition-all cursor-pointer ${c2ShowGrid ? "bg-[#334155] border-[#334155] text-white" : "bg-white border-[#E2E8F0] text-[#64748B]"}`}
                >
                  {c2ShowGrid ? "Hide Grid" : "Show Grid"}
                </button>
                <button 
                  onClick={() => completeChallenge("challenge2", { alignment: c2Alignment, correct: c2Alignment === 1 }, "challenge3")}
                  className="flex-1 py-4 bg-[#334155] hover:bg-[#1E293B] text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#334155]/10 cursor-pointer"
                >
                  Lock Alignment <ArrowRight className="w-5 h-5 cursor-pointer" />
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
                  <Sparkles className="w-6 h-6 text-[#F7B980]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#334155]">Information Hierarchy</h3>
                  <p className="text-sm text-[#64748B]">Rank these elements by visual dominance (Top to Bottom).</p>
                </div>
              </div>

              <div className="space-y-3">
                {c3Items.map((item) => {
                  const index = c3Hierarchy.indexOf(item);
                  return (
                    <button 
                      key={item}
                      onClick={() => {
                        recordInteraction();
                        if (index === -1) setC3Hierarchy(prev => [...prev, item]);
                        else setC3Hierarchy(prev => prev.filter(i => i !== item));
                      }}
                      className={`w-full p-6 rounded-2xl flex items-center justify-between border-2 transition-all cursor-pointer ${
                        index !== -1 
                          ? "bg-[#334155] border-[#334155] text-white shadow-lg" 
                          : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:border-[#F7B980]"
                      }`}
                    >
                      <span className="font-bold">{item}</span>
                      {index !== -1 && (
                        <div className="w-8 h-8 rounded-full bg-[#F7B980] flex items-center justify-center font-black text-xs">
                          {index + 1}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <button 
                disabled={c3Hierarchy.length < 4}
                onClick={() => completeChallenge("challenge3", { hierarchy: c3Hierarchy, correct: c3Hierarchy[0] === "Headline" && c3Hierarchy[1] === "Call to Action" }, "submitting")}
                className="w-full py-4 bg-[#334155] hover:bg-[#1E293B] text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#334155]/10 cursor-pointer"
              >
                Finalize Design Sync <CheckCircle2 className="w-5 h-5 cursor-pointer" />
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
                  <Palette className="w-8 h-8 text-[#334155]" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-[#334155]">Processing Visual Logic</h2>
                <p className="text-[#64748B] max-w-sm mx-auto">
                  Syncing your design archetype with the Verified Talent Mesh. Our AI is analyzing your optical precision telemetry.
                </p>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-[#F8FAFC] rounded-full border border-[#E2E8F0]">
                <Clock className="w-4 h-4 text-[#94A3B8]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Finalizing Asset Map</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Branding */}
      <div className="p-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#F7B980] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8]">Vision Core AI v2.1</span>
        </div>
        <div className="flex items-center gap-4 text-[#CBD5E1]">
          <Layout className="w-4 h-4" />
          <Sparkles className="w-4 h-4" />
          <Target className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default DesignAssessment;
