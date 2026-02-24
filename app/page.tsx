"use client";

import { motion } from "framer-motion";
import {
  Play,
  Zap,
  Users,
  BarChart3,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Navbar } from "@/components/Navbar";
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-secondary-950 dark:via-secondary-900 dark:to-primary-950 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-400/20 dark:bg-primary-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-400/20 dark:bg-accent-600/10 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <div className="pt-32 pb-20 lg:pt-40 lg:pb-28 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Core Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8 max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold border border-primary-200 dark:border-primary-800/50">
                <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
                The Future of Hiring is Here
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold text-secondary-900 dark:text-white leading-[1.1] tracking-tight">
                Stand out with a{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">
                  Video CV
                </span>
              </h1>

              <p className="text-xl text-secondary-600 dark:text-secondary-300 leading-relaxed font-medium">
                Ditch the flat PDF. Showcase your real personality,
                communication skills, and passion through short, powerful video
                profiles. Employers hire people, not paper.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/auth/signup?role=candidate"
                  className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl hover:shadow-medium transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Create Video CV
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/auth/signup?role=employer"
                  className="px-8 py-4 bg-white/50 dark:bg-secondary-900/50 backdrop-blur-md border border-secondary-200 dark:border-secondary-800 text-secondary-900 dark:text-white font-semibold rounded-xl hover:bg-white/80 dark:hover:bg-secondary-800 transition-all flex items-center justify-center shadow-sm hover:shadow-md"
                >
                  I&apos;m Hiring
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-6 text-sm font-medium text-secondary-500 dark:text-secondary-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success-500" /> Free to
                  join
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success-500" /> No
                  credit card
                </div>
              </div>
            </motion.div>

            {/* Right Column - Visual Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="relative lg:h-[600px] flex items-center justify-center"
            >
              {/* Premium Glass Panel Container */}
              <GlassPanel className="relative w-full max-w-[400px] aspect-[9/16] rounded-[2.5rem] p-2 shadow-2xl bg-white/40 dark:bg-secondary-900/40 border-white/60 dark:border-white/10 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 to-accent-500/10 rounded-[2.5rem] pointer-events-none" />

                {/* Screen / Video Content */}
                <div className="relative w-full h-full bg-secondary-900 rounded-[2rem] overflow-hidden shadow-inner">
                  {/* Fake Header */}
                  <div className="absolute top-0 w-full p-6 bg-gradient-to-b from-black/60 to-transparent z-20 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden bg-primary-500 flex items-center justify-center font-bold">
                        JD
                      </div>
                      <div>
                        <p className="font-semibold text-sm">John Doe</p>
                        <p className="text-xs text-white/70">
                          Senior Developer
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Play Button Center Overlay */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-lg cursor-pointer group"
                    >
                      <Play className="w-8 h-8 text-white fill-white translate-x-1 group-hover:scale-110 transition-transform" />
                    </motion.div>
                  </div>

                  {/* Abstract Video Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-secondary-900">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute -top-20 -right-20 w-64 h-64 bg-primary-500/30 blur-3xl rounded-full"
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.5, 1],
                        rotate: [0, -90, 0],
                      }}
                      transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent-500/20 blur-3xl rounded-full"
                    />
                  </div>

                  {/* Fake UI Overlays Bottom */}
                  <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/10">
                          React
                        </span>
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/10">
                          Node.js
                        </span>
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/10">
                          UI/UX
                        </span>
                      </div>
                      <p className="text-sm text-white/90 line-clamp-2">
                        &ldquo;Hi! I&apos;m John, a passionate developer
                        creating beautiful, scalable web applications for over 8
                        years...&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Decorative floating elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -right-12 top-20"
                >
                  <GlassPanel className="p-4 rounded-xl flex items-center gap-3 w-48 shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-success-600" />
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500 font-medium">
                        Hired in
                      </p>
                      <p className="text-sm font-bold text-secondary-900 dark:text-white">
                        3 Days
                      </p>
                    </div>
                  </GlassPanel>
                </motion.div>

                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -left-16 bottom-32"
                >
                  <GlassPanel className="p-4 rounded-xl flex items-center gap-3 w-48 shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-accent-600" />
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500 font-medium">
                        AI Match Score
                      </p>
                      <p className="text-sm font-bold text-secondary-900 dark:text-white">
                        98% Fit
                      </p>
                    </div>
                  </GlassPanel>
                </motion.div>
              </GlassPanel>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section with Glass Panels */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <GlassPanel className="p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-secondary-200 dark:divide-secondary-800">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="py-4 md:py-0"
            >
              <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-primary-400 mb-2">
                50%
              </div>
              <p className="text-lg font-medium text-secondary-600 dark:text-secondary-400">
                Faster Hiring Process
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="py-4 md:py-0"
            >
              <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-accent-600 to-accent-400 mb-2">
                3x
              </div>
              <p className="text-lg font-medium text-secondary-600 dark:text-secondary-400">
                Better Culture Match
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="py-4 md:py-0"
            >
              <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-success-600 to-success-400 mb-2">
                100%
              </div>
              <p className="text-lg font-medium text-secondary-600 dark:text-secondary-400">
                Authentic Representation
              </p>
            </motion.div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
