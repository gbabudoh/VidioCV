/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F2F4F4] flex items-center justify-center p-6 selection:bg-[#F7B980]/30 selection:text-[#57595B]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[48px] p-12 text-center shadow-2xl shadow-[#57595B]/5 border border-white"
      >
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-black text-[#57595B] mb-4 tracking-tight">
          System <span className="text-rose-500">Anomaly</span>
        </h1>
        
        <p className="text-[#8A8C8E] font-medium mb-10 leading-relaxed">
          Something went wrong in the kinetic stream. We've logged the event and our engineers are investigating.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full py-4 rounded-2xl bg-[#F7B980] text-white font-black flex items-center justify-center gap-3 shadow-lg shadow-[#F7B980]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="w-full py-4 rounded-2xl bg-[#F2F4F4] text-[#57595B] font-black flex items-center justify-center gap-3 hover:bg-[#E8ECED] transition-all"
          >
            <Home className="w-5 h-5" />
            Return Home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-[10px] font-black uppercase tracking-widest text-[#ACBAC4]">
            Error ID: {error.digest}
          </p>
        )}
      </motion.div>
    </div>
  );
}
