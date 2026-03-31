"use client";

import { useState, useEffect, startTransition } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Video,
  Brain,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Users,
  BarChart3,
  ArrowRight,
  Camera,
  Briefcase,
  TrendingUp,
  Shield,
  MessageSquare,
  Globe,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

// Brand palette
// #BFC6C4 – muted sage
// #ACBAC4 – steel blue-gray
// #BFC9D1 – light slate
// #57595B – dark charcoal
// #F7B980 – warm amber/peach (accent)

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    dashboardUrl: "/auth/login",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (token && role) {
      startTransition(() => {
        setAuthState({
          isLoggedIn: true,
          dashboardUrl:
            role === "employer" ? "/dashboard/employer" : "/dashboard/candidate",
        });
      });
    }
  }, []);

  const { isLoggedIn, dashboardUrl } = authState;

  return (
    <div
      className="min-h-screen overflow-hidden relative"
      style={{
        background:
          "linear-gradient(135deg, #F2F4F4 0%, #F9F9F9 45%, #F9F5F1 100%)",
      }}
    >
      {/* Ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[160px]"
          style={{ background: "rgba(247,185,128,0.18)" }}
        />
        <div
          className="absolute top-[15%] right-[-15%] w-[50%] h-[50%] rounded-full blur-[140px]"
          style={{ background: "rgba(172,186,196,0.22)" }}
        />
        <div
          className="absolute bottom-[-10%] left-[30%] w-[45%] h-[45%] rounded-full blur-[120px]"
          style={{ background: "rgba(191,201,209,0.18)" }}
        />
      </div>

      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(87,89,91,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse 90% 90% at 50% 40%, black 50%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 90% at 50% 40%, black 50%, transparent 100%)",
        }}
      />

      <Navbar />

      {/* ========== HERO ========== */}
      <section className="relative z-10 min-h-screen flex items-center pt-14">
        <div className="max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — text */}
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="space-y-8"
            >
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                  style={{
                    background: "rgba(247,185,128,0.15)",
                    border: "1px solid rgba(247,185,128,0.45)",
                    color: "#57595B",
                  }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: "#F7B980" }} />
                  Professional Video Recruitment
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "#F7B980" }}
                  />
                </div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1
                  className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight"
                  style={{ color: "#57595B" }}
                >
                  Let Your{" "}
                  <span
                    className="text-transparent bg-clip-text"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #57595B 0%, #F7B980 100%)",
                    }}
                  >
                    Personality
                  </span>
                  <br />
                  Speak First
                </h1>
              </motion.div>

              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg leading-relaxed max-w-lg"
                style={{ color: "#8A8C8E" }}
              >
                VidioCV transforms how talent meets opportunity. Record a short
                video introduction and let employers discover the real you —
                beyond keywords and paper qualifications.
              </motion.p>

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row gap-4"
              >
                {isLoggedIn ? (
                  <Link
                    href={dashboardUrl}
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                    style={{
                      background: "linear-gradient(135deg, #57595B 0%, #454749 100%)",
                      color: "#FFFFFF",
                      boxShadow: "0 12px 32px rgba(87,89,91,0.25)",
                    }}
                  >
                    <Briefcase className="w-5 h-5 text-[#F7B980]" />
                    Back to Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/signup?role=candidate"
                      className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                      style={{
                        background:
                          "linear-gradient(135deg, #F7B980 0%, #F0A060 100%)",
                        color: "#57595B",
                        boxShadow: "0 8px 24px rgba(247,185,128,0.35)",
                      }}
                    >
                      <Camera className="w-5 h-5" />
                      Create Your Video CV
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/auth/signup?role=employer"
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #BFC6C4",
                        color: "#57595B",
                        boxShadow: "0 2px 8px rgba(87,89,91,0.08)",
                      }}
                    >
                      <Briefcase className="w-5 h-5" style={{ color: "#ACBAC4" }} />
                      Hire Top Talent
                    </Link>
                  </>
                )}
              </motion.div>

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-6 text-sm"
                style={{ color: "#ACBAC4" }}
              >
                {["Free to join", "No credit card", "5 min setup"].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" style={{ color: "#F7B980" }} />
                    {t}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — phone mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center justify-center lg:justify-end"
            >
              <div className="relative w-[280px] h-[570px]">
                {/* Glow halo */}
                <div
                  className="absolute inset-0 rounded-[44px] blur-3xl scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(247,185,128,0.35) 0%, rgba(172,186,196,0.30) 100%)",
                  }}
                />

                {/* Phone frame */}
                <div
                  className="relative w-full h-full rounded-[44px] shadow-2xl overflow-hidden"
                  style={{
                    border: "1px solid rgba(255,255,255,0.45)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {/* Video background */}
                  <div className="absolute inset-0">
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, #1a1f24 0%, #232a30 50%, #141a1f 100%)",
                      }}
                    />
                    {/* Head silhouette */}
                    <div className="absolute top-[14%] left-1/2 -translate-x-1/2">
                      <div
                        className="w-20 h-20 rounded-full blur-[6px]"
                        style={{
                          background:
                            "radial-gradient(circle, rgba(247,185,128,0.45) 0%, rgba(240,160,96,0.25) 50%, transparent 100%)",
                        }}
                      />
                    </div>
                    {/* Shoulder gradient */}
                    <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-44 h-36">
                      <div
                        className="w-full h-full rounded-full blur-xl"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(87,89,91,0.5) 0%, rgba(87,89,91,0.25) 50%, transparent 100%)",
                        }}
                      />
                    </div>
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, transparent, transparent, rgba(247,185,128,0.06))",
                      }}
                    />
                  </div>

                  {/* Top HUD */}
                  <div className="absolute top-0 left-0 right-0 p-5 bg-gradient-to-b from-black/70 to-transparent z-20">
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{
                          background: "rgba(247,185,128,0.15)",
                          border: "1px solid rgba(247,185,128,0.35)",
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ background: "#F7B980" }}
                        />
                        <span
                          className="text-[11px] font-bold tracking-wide"
                          style={{ color: "#F7B980" }}
                        >
                          REC
                        </span>
                      </div>
                      <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.45)" }}>
                        02:47
                      </span>
                    </div>
                  </div>

                  {/* Play button */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.93 }}
                      className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer shadow-2xl"
                      style={{
                        background: "rgba(247,185,128,0.20)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(247,185,128,0.35)",
                      }}
                    >
                      <Play className="w-7 h-7 fill-white translate-x-0.5" style={{ color: "white" }} />
                    </motion.div>
                  </div>

                  {/* Waveform */}
                  <div className="absolute bottom-[128px] left-0 right-0 z-20 px-7 flex items-end justify-center gap-[3px]">
                    {[4, 9, 6, 13, 7, 11, 5, 10, 7, 12, 5, 9, 4, 8, 11, 6, 10, 4].map(
                      (h, i) => (
                        <motion.div
                          key={i}
                          className="w-1 rounded-full"
                          style={{ background: "rgba(247,185,128,0.55)" }}
                          animate={{ height: [`${h}px`, `${h * 2.6}px`, `${h}px`] }}
                          transition={{
                            duration: 0.75 + (i % 5) * 0.18,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.055,
                          }}
                        />
                      )
                    )}
                  </div>

                  {/* Bottom overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/95 via-black/65 to-transparent z-20">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold border shrink-0"
                          style={{
                            background: "linear-gradient(135deg, #F7B980, #F0A060)",
                            borderColor: "rgba(255,255,255,0.20)",
                            color: "#57595B",
                          }}
                        >
                          AD
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white leading-tight">
                            Alex Davies
                          </p>
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>
                            Senior UX Designer · London
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {["Figma", "Design Systems", "React"].map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-0.5 rounded-full text-[11px]"
                            style={{
                              background: "rgba(255,255,255,0.10)",
                              border: "1px solid rgba(255,255,255,0.12)",
                              color: "rgba(255,255,255,0.75)",
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Notch */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-30" />
                </div>
              </div>

              {/* Floating card — AI match */}
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute right-[-8px] top-[12%] lg:right-[-44px]"
              >
                <div
                  className="px-4 py-3 rounded-2xl flex items-center gap-3 w-48"
                  style={{
                    background: "rgba(255,255,255,0.88)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow: "0 8px 32px rgba(87,89,91,0.10)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(247,185,128,0.15)",
                      border: "1px solid rgba(247,185,128,0.30)",
                    }}
                  >
                    <TrendingUp className="w-4 h-4" style={{ color: "#F7B980" }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium" style={{ color: "#ACBAC4" }}>
                      Candidate Match Score
                    </p>
                    <p className="text-sm font-bold" style={{ color: "#57595B" }}>
                      98% Fit
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Floating card — hired in */}
              <motion.div
                animate={{ y: [8, -8, 8] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-[-4px] lg:left-[-56px] bottom-[18%]"
              >
                <div
                  className="px-4 py-3 rounded-2xl flex items-center gap-3 w-44"
                  style={{
                    background: "rgba(255,255,255,0.88)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow: "0 8px 32px rgba(87,89,91,0.10)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(191,198,196,0.25)",
                      border: "1px solid rgba(191,198,196,0.40)",
                    }}
                  >
                    <Users className="w-4 h-4" style={{ color: "#57595B" }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium" style={{ color: "#ACBAC4" }}>
                      Hired In
                    </p>
                    <p className="text-sm font-bold" style={{ color: "#57595B" }}>
                      3 Days
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Floating card — profile views */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute left-[-4px] lg:left-[-44px] top-[22%]"
              >
                <div
                  className="px-4 py-3 rounded-2xl flex items-center gap-3 w-48"
                  style={{
                    background: "rgba(255,255,255,0.88)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.95)",
                    boxShadow: "0 8px 32px rgba(87,89,91,0.10)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(172,186,196,0.20)",
                      border: "1px solid rgba(172,186,196,0.35)",
                    }}
                  >
                    <Eye className="w-4 h-4" style={{ color: "#ACBAC4" }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium" style={{ color: "#ACBAC4" }}>
                      Profile Views
                    </p>
                    <p className="text-sm font-bold" style={{ color: "#57595B" }}>
                      1.2k this week
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== STATS STRIP ========== */}
      <section className="relative z-10 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div
            className="grid grid-cols-3 rounded-2xl overflow-hidden divide-x"
            style={{
              background: "rgba(255,255,255,0.78)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.95)",
              boxShadow: "0 4px 40px rgba(87,89,91,0.07)",
              borderColor: "#E8ECED",
            }}
          >
            {[
              {
                value: "50%",
                label: "Faster Hiring Process",
                gradient: "linear-gradient(135deg, #F7B980, #F0A060)",
              },
              {
                value: "3x",
                label: "Better Culture Match",
                gradient: "linear-gradient(135deg, #57595B, #8A8C8E)",
              },
              {
                value: "10k+",
                label: "Active Candidates",
                gradient: "linear-gradient(135deg, #ACBAC4, #BFC9D1)",
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="py-10 px-8 text-center transition-colors"
                style={{ borderRight: i < 2 ? "1px solid #E8ECED" : undefined }}
              >
                <div
                  className="text-4xl font-black mb-1.5 text-transparent bg-clip-text"
                  style={{ backgroundImage: s.gradient }}
                >
                  {s.value}
                </div>
                <p className="text-sm font-medium" style={{ color: "#ACBAC4" }}>
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="relative z-10 py-28">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6"
              style={{
                background: "#FFFFFF",
                border: "1px solid #BFC6C4",
                color: "#8A8C8E",
                boxShadow: "0 2px 8px rgba(87,89,91,0.06)",
              }}
            >
              Simple by design
            </div>
            <h2
              className="text-4xl lg:text-5xl font-black mb-4"
              style={{ color: "#57595B" }}
            >
              Three steps.{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(135deg, #57595B 0%, #F7B980 100%)",
                }}
              >
                Zero friction.
              </span>
            </h2>
            <p className="text-lg max-w-lg mx-auto" style={{ color: "#ACBAC4" }}>
              Go from signup to getting noticed in under 10 minutes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: Camera,
                title: "Record Your Story",
                desc: "Use our built-in recorder or upload an existing clip. Share your personality, skills, and what makes you unique in 60 seconds.",
                accentColor: "#F7B980",
                accentBg: "rgba(247,185,128,0.12)",
                accentBorder: "rgba(247,185,128,0.30)",
                hoverBorder: "#F7B980",
              },
              {
                step: "02",
                icon: Brain,
                title: "AI Enhances Your Profile",
                desc: "Our AI analyzes your video, generates a smart summary, and matches you with relevant roles based on your unique strengths.",
                accentColor: "#57595B",
                accentBg: "rgba(87,89,91,0.08)",
                accentBorder: "rgba(87,89,91,0.20)",
                hoverBorder: "#BFC6C4",
              },
              {
                step: "03",
                icon: Briefcase,
                title: "Get Discovered & Hired",
                desc: "Employers browse video profiles, request interviews, and connect directly. Skip the queue and get hired faster.",
                accentColor: "#ACBAC4",
                accentBg: "rgba(172,186,196,0.15)",
                accentBorder: "rgba(172,186,196,0.35)",
                hoverBorder: "#ACBAC4",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="group relative p-8 rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1"
                style={{
                  border: "1px solid #E8ECED",
                  boxShadow: "0 2px 16px rgba(87,89,91,0.06)",
                }}
              >
                <div
                  className="text-6xl font-black mb-3 leading-none select-none"
                  style={{ color: "#F2F3F3" }}
                >
                  {item.step}
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{
                    background: item.accentBg,
                    border: `1px solid ${item.accentBorder}`,
                  }}
                >
                  <item.icon className="w-6 h-6" style={{ color: item.accentColor }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "#57595B" }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#ACBAC4" }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES GRID ========== */}
      <section id="features" className="relative z-10 py-28">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6"
              style={{
                background: "#FFFFFF",
                border: "1px solid #BFC6C4",
                color: "#8A8C8E",
                boxShadow: "0 2px 8px rgba(87,89,91,0.06)",
              }}
            >
              Everything you need
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-4" style={{ color: "#57595B" }}>
              Built for{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(135deg, #57595B 0%, #F7B980 100%)",
                }}
              >
                Modern Hiring
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Video, title: "HD Video CVs", desc: "Record, upload, or stream directly. Crisp 1080p video with professional-grade playback.", warm: true },
              { icon: Brain, title: "AI Skill Matching", desc: "Intelligent algorithms match candidates to roles based on communication style, skills, and cultural fit.", warm: false },
              { icon: Shield, title: "Privacy Controls", desc: "Granular visibility settings. Share with specific employers or keep your profile public.", warm: true },
              { icon: MessageSquare, title: "Live Interview Suite", desc: "Built-in video interviewing with recording, real-time notes, and candidate scoring.", warm: false },
              { icon: BarChart3, title: "Analytics Dashboard", desc: "Track profile views, application status, and employer engagement in real time.", warm: true },
              { icon: Globe, title: "Global Reach", desc: "Access thousands of employers worldwide or filter by location, industry, and company size.", warm: false },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group p-7 rounded-2xl bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  border: "1px solid #E8ECED",
                  boxShadow: "0 2px 12px rgba(87,89,91,0.05)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: feature.warm
                      ? "rgba(247,185,128,0.12)"
                      : "rgba(172,186,196,0.15)",
                    border: feature.warm
                      ? "1px solid rgba(247,185,128,0.28)"
                      : "1px solid rgba(172,186,196,0.32)",
                  }}
                >
                  <feature.icon
                    className="w-5 h-5"
                    style={{ color: feature.warm ? "#F7B980" : "#ACBAC4" }}
                  />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#57595B" }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#ACBAC4" }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FOR CANDIDATES / EMPLOYERS ========== */}
      <section className="relative z-10 py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Candidates */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative p-10 rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #FDF6EE 0%, #FEF9F4 100%)",
                border: "1px solid rgba(247,185,128,0.35)",
                boxShadow: "0 4px 32px rgba(247,185,128,0.10)",
              }}
            >
              <div
                className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"
                style={{
                  background: "radial-gradient(circle, rgba(247,185,128,0.18) 0%, transparent 70%)",
                }}
              />
              <div className="relative z-10">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background: "rgba(247,185,128,0.15)",
                    border: "1px solid rgba(247,185,128,0.35)",
                  }}
                >
                  <Camera className="w-6 h-6" style={{ color: "#F7B980" }} />
                </div>
                <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#F7B980" }}>
                  For Candidates
                </p>
                <h3 className="text-3xl font-black mb-4" style={{ color: "#57595B" }}>
                  Show who you really are
                </h3>
                <p className="mb-8 leading-relaxed" style={{ color: "#8A8C8E" }}>
                  Your personality is your biggest asset. A video CV lets
                  employers see your communication skills, enthusiasm, and
                  professionalism before even meeting you.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "60-second video introduction",
                    "AI-powered skill highlights",
                    "Profile analytics & insights",
                    "Direct employer messaging",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "#57595B" }}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#F7B980" }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup?role=candidate"
                  className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-200 text-sm hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #F7B980 0%, #F0A060 100%)",
                    color: "#57595B",
                    boxShadow: "0 6px 20px rgba(247,185,128,0.30)",
                  }}
                >
                  Create Free Profile
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Employers */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative p-10 rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #F1F4F6 0%, #F5F7F9 100%)",
                border: "1px solid #BFC9D1",
                boxShadow: "0 4px 32px rgba(172,186,196,0.12)",
              }}
            >
              <div
                className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"
                style={{
                  background: "radial-gradient(circle, rgba(172,186,196,0.22) 0%, transparent 70%)",
                }}
              />
              <div className="relative z-10">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background: "rgba(172,186,196,0.20)",
                    border: "1px solid #ACBAC4",
                  }}
                >
                  <Briefcase className="w-6 h-6" style={{ color: "#57595B" }} />
                </div>
                <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#ACBAC4" }}>
                  For Employers
                </p>
                <h3 className="text-3xl font-black mb-4" style={{ color: "#57595B" }}>
                  Find the perfect culture fit
                </h3>
                <p className="mb-8 leading-relaxed" style={{ color: "#8A8C8E" }}>
                  Go beyond the resume. Browse authentic video profiles and
                  identify candidates who will thrive in your team — before
                  spending a minute in interviews.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Browse curated video profiles",
                    "AI-powered candidate matching",
                    "Integrated interview scheduling",
                    "Team collaboration & scoring",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "#57595B" }}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#ACBAC4" }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup?role=employer"
                  className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-200 text-sm hover:-translate-y-0.5"
                  style={{
                    background: "#57595B",
                    color: "#FFFFFF",
                    boxShadow: "0 6px 20px rgba(87,89,91,0.20)",
                  }}
                >
                  Start Hiring
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative text-center p-14 rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #3D3F41 0%, #57595B 50%, #4A4C4E 100%)",
              boxShadow: "0 24px 80px rgba(87,89,91,0.28)",
            }}
          >
            <div
              className="absolute top-1/2 left-1/4 -translate-y-1/2 w-56 h-56 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(247,185,128,0.18) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute top-1/2 right-1/4 -translate-y-1/2 w-56 h-56 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(191,201,209,0.15) 0%, transparent 70%)",
              }}
            />
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-5 leading-tight">
                Ready to stand{" "}
                <span
                  className="text-transparent bg-clip-text"
                  style={{
                    backgroundImage: "linear-gradient(135deg, #F7B980 0%, #FACCA0 100%)",
                  }}
                >
                  out from the crowd?
                </span>
              </h2>
              <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
                Join thousands of professionals who&apos;ve replaced their PDF
                resume with a video CV that gets real results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup?role=candidate"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #F7B980 0%, #F0A060 100%)",
                    color: "#57595B",
                    boxShadow: "0 8px 28px rgba(247,185,128,0.35)",
                  }}
                >
                  <Camera className="w-5 h-5" />
                  Get Started Free
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-xl transition-all duration-300"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    color: "#FFFFFF",
                  }}
                >
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer
        className="relative z-10 py-8"
        style={{
          borderTop: "1px solid #E8ECED",
          background: "rgba(255,255,255,0.50)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="font-bold text-base" style={{ color: "#57595B" }}>
            VidioCV
          </div>
          <div style={{ color: "#BFC6C4" }}>© 2025 VidioCV. All rights reserved.</div>
          <div className="flex gap-6" style={{ color: "#BFC6C4" }}>
            <a href="#" className="hover:text-[#57595B] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#57595B] transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
