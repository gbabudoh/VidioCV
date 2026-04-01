// [HMR Version: 1.0.1 - Resyncing Module Graph]
"use client";

import { useState, useEffect, startTransition } from "react";
import { motion, type Transition } from "framer-motion";
import {
  Video,
  Brain,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Shield,
  MessageSquare,
  Globe,
  Eye,
  Award
} from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// Premium Sage/Amber Design System
// Background: #F2F4F4 (Muted)
// Amber: #F7B980
// Sage: #BFC6C4
// Steel: #57595B

const springTransition: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 20
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    dashboardUrl: "/auth/login",
  });

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const role = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;

    if (token && role) {
      startTransition(() => {
        setAuthState({
          isLoggedIn: true,
          dashboardUrl: role === "employer" ? "/dashboard/employer" : "/dashboard/candidate",
        });
      });
    }
  }, []);

  const { isLoggedIn, dashboardUrl } = authState;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F2F4F4] selection:bg-[#F7B980]/30 selection:text-[#57595B]">
      
      {/* 🔮 Ambient Intelligence - Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[70vw] h-[70vw] rounded-full blur-[140px] opacity-[0.14]" 
             style={{ background: "radial-gradient(circle, #F7B980 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-5%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-[0.12]"
             style={{ background: "radial-gradient(circle, #ACBAC4 0%, transparent 70%)" }} />
        <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full blur-[160px] opacity-[0.08]"
             style={{ background: "radial-gradient(circle, #BFC6C4 0%, transparent 70%)" }} />
      </div>

      {/* 🏁 Dot Mesh Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.4]"
           style={{ 
             backgroundImage: "radial-gradient(circle, #57595B 0.5px, transparent 0.5px)", 
             backgroundSize: "32px 32px",
             maskImage: "radial-gradient(ellipse at center, black 40%, transparent 100%)"
           }} />

      <Navbar />

      <main className="relative z-10 pt-12">
        
        {/* ================= HERO SECTION ================= */}
        <section className="min-h-[90vh] flex items-center px-6 md:px-12">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center py-10">
            
            {/* Left Content — The Messaging */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-10"
            >
              <motion.div 
                variants={fadeUp}
                transition={springTransition}
                className="inline-flex items-center gap-3.5 px-5 py-2.5 rounded-2xl bg-white/70 backdrop-blur-3xl border-white/40 shadow-xl shadow-[#F7B980]/5 group cursor-default"
              >
                <div className="relative">
                  <Sparkles className="w-5 h-5 text-[#F7B980] animate-pulse" />
                  <div className="absolute inset-0 blur-md bg-[#F7B980] opacity-50 animate-pulse" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#57595B] opacity-80">
                  Human Talent, AI-Verified
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
              </motion.div>

              <motion.div variants={fadeUp} transition={springTransition}>
                <h1 className="text-4xl sm:text-7xl md:text-8xl font-black leading-[1.1] tracking-tighter text-[#57595B] group">
                  Beyond the <br />
                  <span className="inline-block py-2 text-transparent bg-clip-text bg-gradient-to-r from-[#57595B] via-[#8A8C8E] to-[#F7B980]">
                    Static Resume
                  </span>
                </h1>
                <p className="mt-8 text-lg sm:text-xl text-[#8A8C8E] font-medium leading-relaxed max-w-lg">
                  The future of recruitment is kinetic. VidioCV bridges the gap between digital identity and human presence through AI-verified video portfolios.
                </p>
              </motion.div>

              <motion.div 
                variants={fadeUp} 
                transition={springTransition}
                className="flex flex-col sm:flex-row gap-5"
              >
                {isLoggedIn ? (
                  <Link href={dashboardUrl} className="group relative px-10 py-5 rounded-2xl bg-[#57595B] text-white font-bold overflow-hidden shadow-2xl shadow-[#57595B]/20 transition-all hover:-translate-y-1">
                    <span className="relative z-10 flex items-center gap-3">
                      Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-[#F7B980] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0" />
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/signup" className="relative px-10 py-5 rounded-2xl bg-[#F7B980] text-white font-bold shadow-xl shadow-[#F7B980]/25 transition-all hover:-translate-y-1 hover:shadow-2xl overflow-hidden group">
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="flex items-center gap-3">
                        Launch Video CV <Video className="w-5 h-5" />
                      </span>
                    </Link>
                    <Link href="/auth/employer/signup" className="px-10 py-5 rounded-2xl bg-white/70 backdrop-blur-3xl border-white/40 text-[#57595B] font-bold shadow-soft transition-all hover:bg-white hover:-translate-y-1">
                      Recruit Talent
                    </Link>
                  </>
                )}
              </motion.div>

              <motion.div 
                variants={fadeUp} 
                transition={springTransition}
                className="flex items-center gap-8 pt-4"
              >
                <div className="flex -space-x-4">
                  {[
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop"
                  ].map((url, i) => (
                    <div key={i} className="relative w-12 h-12 rounded-2xl border-4 border-[#F2F4F4] bg-[#ACBAC4] overflow-hidden shadow-lg">
                      <NextImage 
                        src={url}
                        alt={`Profile ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-black text-[#57595B]">10k+ Kinetic Profiles</p>
                  <p className="text-xs font-bold text-[#ACBAC4]">Join 500+ Hiring Partners</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side — High-res Asset Integration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-square lg:aspect-auto lg:h-[700px] flex items-center justify-center lg:justify-end"
            >
              <div className="relative w-full h-full max-w-[640px] group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#F7B980]/20 to-[#ACBAC4]/20 blur-[100px] group-hover:scale-110 transition-transform duration-1000" />
                
                <div className="relative w-full h-full bg-white/70 backdrop-blur-3xl border-white/40 rounded-[48px] md:rounded-[64px] overflow-hidden shadow-[0_32px_80px_rgba(87,89,91,0.08)]">
                  <NextImage 
                    src="/vidiocv.png" 
                    alt="VidioCV Experience" 
                    fill 
                    className="object-contain p-6 sm:p-12 transition-transform duration-[2000ms] group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/40 to-transparent pointer-events-none" />
                </div>

                {/* 🏷️ Floating Intelligence Cards */}
                <motion.div 
                  animate={{ y: [-15, 15, -15] }} 
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-12 lg:-right-8 top-10 lg:top-20 bg-white/80 backdrop-blur-3xl border-white/60 p-4 lg:p-6 rounded-[24px] lg:rounded-[32px] shadow-2xl flex items-center gap-5 w-56 lg:w-64 scale-[0.7] sm:scale-100 origin-right transition-transform"
                >
                  <div className="w-12 lg:w-14 h-12 lg:h-14 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                    <TrendingUp className="w-6 lg:w-7 h-6 lg:h-7 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-[#ACBAC4]">Neural Match</h4>
                    <p className="text-lg lg:text-xl font-black text-[#57595B]">98.4% Fit</p>
                  </div>
                </motion.div>

                <motion.div 
                   animate={{ y: [15, -15, 15] }} 
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                   className="absolute -left-16 lg:-left-12 bottom-20 lg:bottom-32 bg-white/80 backdrop-blur-3xl border-white/60 p-4 lg:p-6 rounded-[24px] lg:rounded-[32px] shadow-2xl flex items-center gap-5 w-56 lg:w-64 scale-[0.7] sm:scale-100 origin-left transition-transform"
                >
                  <div className="w-12 lg:w-14 h-12 lg:h-14 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                    <Brain className="w-6 lg:w-7 h-6 lg:h-7 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-[#ACBAC4]">AI Verified</h4>
                    <p className="text-lg lg:text-xl font-black text-[#57595B]">Top 2% Talent</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section id="how-it-works" className="py-24 lg:py-40 relative px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-[#57595B]">The Kinetic Workflow</h2>
              <p className="text-[#8A8C8E] font-medium text-lg max-w-2xl mx-auto">From digital signal to human connection in three strategic phases.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
               {/* Connecting lines - Desktop */}
               <div className="hidden md:block absolute top-[68px] left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-[#F7B980]/30 z-0" />
               
               {[
                 { step: "01", title: "Record Identity", desc: "Use our zero-lag studio to capture your professional narration.", icon: Video, color: "#F7B980" },
                 { step: "02", title: "AI-Verify", desc: "Our intelligence engine validates skills and optimizes your match score.", icon: Brain, color: "#ACBAC4" },
                 { step: "03", title: "Global Match", desc: "Unlock high-fidelity inquiries from elite hiring partners.", icon: Globe, color: "#57595B" }
               ].map((item, i) => (
                 <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-8 border border-[#E2E8F0] group-hover:scale-110 transition-transform duration-500">
                       <item.icon className="w-10 h-10" style={{ color: item.color }} />
                       <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#57595B] text-white flex items-center justify-center text-[10px] font-black">{item.step}</div>
                    </div>
                    <h3 className="text-2xl font-black text-[#57595B] mb-3">{item.title}</h3>
                    <p className="text-[#8A8C8E] font-semibold text-sm leading-relaxed px-6">{item.desc}</p>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* ================= FEATURES GRID ================= */}
        <section id="features" className="py-24 lg:py-40 bg-white relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1 space-y-6">
                 <div className="w-20 h-1 bg-[#F7B980] rounded-full" />
                 <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-[#57595B]">High Fidelity <br /> Sourcing</h2>
                 <p className="text-[#8A8C8E] font-medium text-base sm:text-lg leading-relaxed">
                   Experience the fusion of human personality with predictive analysis. Our engine handles the complexity so you can focus on connection.
                 </p>
                 <div className="pt-10 flex gap-4">
                    <div className="p-4 rounded-3xl bg-[#F2F4F4] shadow-soft border-[#E2E8F0] border">
                       <Award className="w-6 h-6 text-[#F7B980]" />
                    </div>
                    <div className="p-4 rounded-3xl bg-[#F2F4F4] shadow-soft border-[#E2E8F0] border">
                       <Shield className="w-6 h-6 text-[#ACBAC4]" />
                    </div>
                 </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: "Smart Inquiries", desc: "Recruiters can secure introductions without the overhead of immediate scheduling.", icon: MessageSquare, accent: "#F7B980" },
                  { title: "CV Watchboard", desc: "Watch high-definition video portfolios directly from your workspace.", icon: Eye, accent: "#ACBAC4" },
                  { title: "Neural Matching", desc: "Our AI prioritizes candidates based on true professional chemistry.", icon: Brain, accent: "#57595B" },
                  { title: "Global Mesh", desc: "Sync your professional identity with hiring partners worldwide.", icon: Globe, accent: "#10B981" }
                ].map((item, i) => (
                  <div key={i} className="p-10 rounded-[40px] border-2 border-[#F2F4F4] hover:border-[#F7B980]/20 transition-all group cursor-pointer hover:shadow-2xl hover:shadow-[#F7B980]/5">
                    <div className="w-14 h-14 rounded-2xl bg-[#F2F4F4] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                       <item.icon className="w-7 h-7" style={{ color: item.accent }} />
                    </div>
                    <h3 className="text-2xl font-black text-[#57595B] mb-4">{item.title}</h3>
                    <p className="text-[#8A8C8E] font-semibold text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= CALL TO ACTION ================= */}
        <section className="py-24 lg:py-40 relative px-6">
           <div className="max-w-5xl mx-auto rounded-[32px] md:rounded-[64px] overflow-hidden relative shadow-[0_48px_120px_rgba(247,185,128,0.15)] group bg-[#57595B]">
              <div className="absolute inset-0 opacity-[0.05] z-0"
                   style={{ 
                     backgroundImage: "radial-gradient(circle, white 0.5px, transparent 0.5px)", 
                     backgroundSize: "24px 24px"
                   }} />
              
              <div className="relative z-10 px-8 py-16 md:px-10 md:py-24 text-center space-y-10">
                <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter">
                  Ready to evolve your <br />
                  <span className="text-[#F7B980]">Recruitment Journey?</span>
                </h2>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  {isLoggedIn ? (
                     <Link href={dashboardUrl} className="px-12 py-5 rounded-2xl bg-white text-[#57595B] font-bold shadow-xl shadow-white/5 transition-all hover:-translate-y-1">
                        Go to Your Dashboard
                     </Link>
                  ) : (
                    <>
                      <Link href="/auth/signup" className="px-12 py-5 rounded-2xl bg-[#F7B980] text-white font-bold shadow-xl shadow-[#F7B980]/20 transition-all hover:-translate-y-1">
                        Create Your Future
                      </Link>
                      <Link href="/auth/employer/signup" className="px-12 py-5 rounded-2xl border-2 border-white/20 text-white font-bold hover:bg-white/10 transition-all">
                        Scale Your Team
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Decorative Blur */}
              <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#F7B980]/20 blur-[120px] pointer-events-none rounded-full" />
           </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
