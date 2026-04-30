"use client";

import { motion } from "framer-motion";
import { Scale, FileCheck, AlertCircle, HelpCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#F2F4F4] selection:bg-[#F7B980]/30 selection:text-[#57595B]">
      <Navbar />
      
      <main className="relative z-10 pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 space-y-6"
          >
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#ACBAC4] hover:text-[#57595B] transition-colors group">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#57595B]">
              Terms of <span className="text-[#F7B980]">Service</span>
            </h1>
            <p className="text-[#8A8C8E] font-medium text-lg">
              Effective Date: April 30, 2026. The legal framework for kinetic recruitment.
            </p>
          </motion.div>

          {/* Content */}
          <div className="space-y-12 bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[48px] p-8 md:p-16 shadow-2xl shadow-[#57595B]/5">
            
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#F7B980]/10 text-[#F7B980]">
                  <Scale className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black text-[#57595B]">1. Acceptance of Terms</h2>
              </div>
              <p className="text-[#8A8C8E] leading-relaxed font-medium">
                By accessing or using the VidioCV platform, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services. These terms apply to all visitors, 
                users, and others who access the service.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#ACBAC4]/10 text-[#ACBAC4]">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black text-[#57595B]">2. User Accounts & Video Content</h2>
              </div>
              <p className="text-[#8A8C8E] leading-relaxed font-medium">
                When you create an account, you must provide accurate and complete information. 
                You are responsible for safeguarding your password and for any activities under your account. 
                By uploading a Video CV, you grant VidioCV a worldwide, non-exclusive license to host, store, 
                and display that content for the purpose of the recruitment service.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#57595B]/10 text-[#57595B]">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black text-[#57595B]">3. Prohibited Conduct</h2>
              </div>
              <p className="text-[#8A8C8E] leading-relaxed font-medium">
                Users are prohibited from:
              </p>
              <ul className="list-disc list-inside text-[#8A8C8E] space-y-2 font-medium ml-4">
                <li>Uploading defamatory, obscene, or infringing content.</li>
                <li>Attempting to circumvent our AI-verification or security measures.</li>
                <li>Using the platform for spam or unsolicited commercial inquiries.</li>
                <li>Impersonating others or misrepresenting professional credentials.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#10B981]/10 text-[#10B981]">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black text-[#57595B]">4. Termination</h2>
              </div>
              <p className="text-[#8A8C8E] leading-relaxed font-medium">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason 
                whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use 
                the service will immediately cease.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
