/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Lock, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const data = await response.json();
        setError(data.message || "Invalid or expired token.");
      }
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F2F4F4]">
        <div className="text-center p-12 bg-white rounded-[48px] shadow-2xl max-w-md">
          <h2 className="text-2xl font-bold text-[#57595B] mb-4">Invalid Link</h2>
          <p className="text-[#8A8C8E] mb-8">This password reset link is missing or invalid.</p>
          <Link href="/auth/forgot-password" style={{ color: "#F7B980" }} className="font-bold">Request a new link</Link>
        </div>
      </div>
    );
  }

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
        <div className="flex justify-center mb-3">
          <Image src="/logo.png" alt="VidioCV" width={140} height={56} className="object-contain" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-8 sm:p-9 bg-white/85 backdrop-blur-[20px] border border-white/95 shadow-2xl shadow-[#57595B]/10"
        >
          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-[#57595B]">Password Updated</h2>
              <p className="text-sm text-[#8A8C8E]">Your password has been reset successfully. You can now log in with your new password.</p>
              <Link
                href="/auth/login"
                className="w-full block py-3.5 rounded-xl font-semibold text-sm bg-[#57595B] text-white hover:bg-[#F7B980] transition-all"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-7">
                <h2 className="text-2xl font-bold text-[#57595B]">New Password</h2>
                <p className="mt-1.5 text-sm text-[#ACBAC4]">Choose a strong password for your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-[#8A8C8E] ml-0.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#BFC6C4]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-11 pr-4 py-3.5 rounded-xl text-sm border border-[#E0E4E3] focus:border-[#F7B980] outline-none transition-all text-[#57595B]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-[#8A8C8E] ml-0.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#BFC6C4]" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-11 pr-4 py-3.5 rounded-xl text-sm border border-[#E0E4E3] focus:border-[#F7B980] outline-none transition-all text-[#57595B]"
                    />
                  </div>
                  {error && <p className="text-xs font-medium text-red-500 mt-1">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-br from-[#F7B980] to-[#F0A060] text-[#57595B] shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? "Updating..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
