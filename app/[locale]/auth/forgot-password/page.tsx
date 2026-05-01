/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSent(true);
      } else {
        const data = await response.json();
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #F2F4F4 0%, #F9F9F9 45%, #F9F5F1 100%)",
      }}
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px]"
          style={{ background: "rgba(247,185,128,0.18)" }}
        />
        <div
          className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[130px]"
          style={{ background: "rgba(172,186,196,0.20)" }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link href="/auth/login" className="flex items-center justify-center mb-3 group">
          <Image
            src="/logo.png"
            alt="VidioCV Logo"
            width={140}
            height={56}
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-8 sm:p-9 bg-white/85 backdrop-blur-[20px] border border-white/95 shadow-2xl shadow-[#57595B]/10"
        >
          {isSent ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-[#57595B]">Check your email</h2>
              <p className="text-sm text-[#8A8C8E] leading-relaxed">
                We&apos;ve sent a password reset link to <span className="font-bold text-[#57595B]">{email}</span>. 
                Please check your inbox and follow the instructions.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#F7B980] hover:text-[#F0A060] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-7">
                <h2 className="text-2xl font-bold tracking-tight text-[#57595B]">
                  Reset Password
                </h2>
                <p className="mt-1.5 text-sm text-[#ACBAC4]">
                  Enter your email to receive a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wide uppercase ml-0.5 text-[#8A8C8E]">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#BFC6C4]">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="block w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none border border-[#E0E4E3] bg-white/70 focus:border-[#F7B980] focus:ring-4 focus:ring-[#F7B980]/10 transition-all text-[#57595B]"
                    />
                  </div>
                  {error && (
                    <p className="text-xs ml-0.5 font-medium text-red-500">
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all bg-gradient-to-br from-[#F7B980] to-[#F0A060] text-[#57595B] shadow-lg shadow-[#F7B980]/30 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[#57595B]/20 border-t-[#57595B] rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#ACBAC4] hover:text-[#57595B] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
