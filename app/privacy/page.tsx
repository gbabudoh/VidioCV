"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function PrivacyPolicy() {
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
              Privacy <span className="text-[#F7B980]">Policy</span>
            </h1>
            <p className="text-[#8A8C8E] font-medium text-lg">
              Last Updated: April 30, 2026. Your privacy is the cornerstone of our kinetic identity system.
            </p>
          </motion.div>

          {/* Content */}
          <div className="space-y-12 bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[48px] p-8 md:p-16 shadow-2xl shadow-[#57595B]/5">
            
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#F7B980]/10 text-[#F7B980]">
                  <Shield className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black text-[#57595B]">1. Data Collection</h2>
              </div>
              <p className="text-[#8A8C8E] leading-relaxed font-medium">
                VidioCV collects personal identification information, including name, email address, and professional background. 
                Our primary data source is the video CVs you record and the structured profile data you provide. 
                We also collect technical data such as IP addresses and device information to ensure platform stability and security.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#ACBAC4]/10 text-[#ACBAC4]">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black text-[#57595B]">2. How We Use Your Data</h2>
              </div>
              <p className="text-[#8A8C8E] leading-relaxed font-medium">
                Your data is used to:
              </p>
              <ul className="list-disc list-inside text-[#8A8C8E] space-y-2 font-medium ml-4">
                <li>Create and manage your VidioCV account.</li>
                <li>Facilitate the recruitment process between candidates and employers.</li>
                <li>Power our Neural Match AI to provide personalized job recommendations.</li>
                <li>Improve our video processing and transcription services.</li>
                <li>Send system notifications and recruitment updates.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#57595B]/10 text-[#57595B]">
                  <Eye className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black text-[#57595B]">3. Data Sharing & Privacy</h2>
              </div>
              <p className="text-[#8A8C8E] leading-relaxed font-medium">
                VidioCV does not sell your personal data to third parties. We share your information only with:
              </p>
              <ul className="list-disc list-inside text-[#8A8C8E] space-y-2 font-medium ml-4">
                <li>Employers and recruiters explicitly authorized by you.</li>
                <li>Trusted service providers (e.g., Stripe for payments, Cloudinary for video storage).</li>
                <li>Legal authorities when required by law to protect our rights and users.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#10B981]/10 text-[#10B981]">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black text-[#57595B]">4. Your Rights (GDPR)</h2>
              </div>
              <p className="text-[#8A8C8E] leading-relaxed font-medium">
                Under the General Data Protection Regulation (GDPR), you have the right to access, rectify, or erase your personal data. 
                You can also object to the processing of your data or request data portability. 
                To exercise these rights, please contact us at <span className="text-[#F7B980] font-bold">privacy@vidio-cv.com</span>.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
