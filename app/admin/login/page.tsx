"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Terminal, 
  Lock, 
  Mail, 
  ArrowRight, 
  RefreshCcw,
  Sparkles,
  AlertCircle
} from "lucide-react";

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "admin" }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        window.location.href = "/admin";
      } else {
        setError(data.message || "Invalid administrative credentials");
      }
    } catch {
      setError("Secure link establishment failed. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Premium Gradient Background Elements */}
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#F8FAFC] via-white/50 to-[#F8FAFC]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Enterprise Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Image 
              src="/logo.png" 
              alt="VidioCV Logo" 
              width={200} 
              height={60} 
              className="h-auto w-auto max-h-14 object-contain"
              priority
            />
          </motion.div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-2">
            VidioCV <span className="text-[#F7B980] not-italic">Command Center</span>
          </h1>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
            <Terminal className="w-3 h-3" />
            Administrative Access
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#F7B980] to-transparent opacity-40" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Secure Identity</label>
              <div className="relative group/input">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 transition-colors group-focus-within/input:text-[#F7B980]" />
                <input 
                  required
                  type="email"
                  placeholder="ADMIN_EMAIL"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-[#F7B980]/5 focus:border-[#F7B980]/50 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Verification Key</label>
              <div className="relative group/input">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 transition-colors group-focus-within/input:text-[#F7B980]" />
                <input 
                  required
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-[#F7B980]/5 focus:border-[#F7B980]/50 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <button 
              disabled={isLoading}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 relative overflow-hidden group/btn shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
              {isLoading ? (
                <RefreshCcw className="w-4 h-4 animate-spin text-[#F7B980]" />
              ) : (
                <>
                  Authenticate Access
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Proprietary Enterprise Software<br />
              © 2026 VidioCV Intelligence Systems
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
            Node-01-SYD
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-[#F7B980]" />
            AES-256 Secured
          </div>
        </div>
      </motion.div>
    </div>
  );
}
