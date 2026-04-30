"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Shield, Globe, ArrowRight, Video, Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Modal from "@/app/components/common/Modal";

interface Candidate {
  id: string;
  userId: string;
  name: string;
  title: string;
  skills: string[];
  videoUrl: string | null;
  aiMatchScore?: number;
}

export default function PortfoliosPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    React.startTransition(() => {
      setIsLoggedIn(!!token);
    });
  }, []);

  const handleViewProfile = (candidateId: string) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    router.push(`/cv/profile-${candidateId}`);
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/candidates");
        const data = await res.json();
        if (data.success) {
          // In a real app, we'd also fetch the slugs, but for now we'll mock it
          // or assume the ID works if we update the CV route.
          setCandidates(data.candidates || []);
        }
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F2F4F4]">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="px-6 py-12 md:py-20 max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#F7B980]/10 border border-[#F7B980]/20 text-[#F7B980] mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Intelligence Network</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-7xl font-black text-[#57595B] leading-[1.1] mb-6"
            >
              Verified Professional <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#57595B] to-[#F7B980]">Identities</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[#8A8C8E] text-lg font-medium leading-relaxed"
            >
              Discover elite talent through AI-verified video portfolios. True professional chemistry, validated by intelligence.
            </motion.p>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="px-6 mb-12 max-w-7xl mx-auto">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, role, or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-6 rounded-[32px] bg-white border border-[#E0E4E3] shadow-xl shadow-[#57595B]/5 focus:outline-none focus:ring-2 focus:ring-[#F7B980]/20 text-lg font-medium"
            />
          </div>
        </section>

        {/* Candidates Grid */}
        <section className="px-6 max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[400px] rounded-[40px] bg-white/50 animate-pulse border border-[#E0E4E3]" />
              ))}
            </div>
          ) : filteredCandidates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCandidates.map((candidate, idx) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-white rounded-[40px] p-8 border border-[#E0E4E3] hover:border-[#F7B980]/30 transition-all hover:shadow-2xl hover:shadow-[#F7B980]/10"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden relative">
                      {candidate.videoUrl ? (
                         <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                           <Video className="w-6 h-6 text-emerald-500" />
                         </div>
                      ) : (
                        <span className="text-xl font-black">{candidate.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <Shield className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-8">
                    <h3 className="text-2xl font-black text-[#57595B] group-hover:text-[#F7B980] transition-colors line-clamp-1">{candidate.name}</h3>
                    <p className="text-[#8A8C8E] font-bold text-sm">{candidate.title}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-10">
                    {candidate.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1.5 rounded-xl bg-slate-50 border border-[gainsboro] text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleViewProfile(candidate.id)}
                    className="w-full py-4 rounded-2xl bg-[#57595B] text-white font-bold flex items-center justify-center gap-2 group-hover:bg-[#F7B980] transition-all cursor-pointer"
                  >
                    View Portfolio <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-[#E0E4E3]">
              <Globe className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-[#57595B] mb-2">No Verified Portfolios Found</h3>
              <p className="text-[#8A8C8E] font-medium">Try refining your search parameters.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Recruitment Authentication Modal */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="Recruitment Authentication Required"
        type="info"
        primaryAction={{
          label: "Employer Login",
          onClick: () => router.push("/auth/login?role=employer")
        }}
        closeActionLabel="Dismiss"
      >
        <div className="space-y-4">
          <div className="w-16 h-16 bg-[#F7B980]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-[#F7B980]" />
          </div>
          <p className="text-slate-600 font-medium">
            To maintain the privacy of our candidates, full video portfolios and professional narratives are exclusively available to verified hiring partners.
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Access Benefits</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F7B980]" />
                Full HD Video Narration
              </li>
              <li className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F7B980]" />
                Intelligence Match Scores
              </li>
              <li className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F7B980]" />
                Direct Communication Portal
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
}
