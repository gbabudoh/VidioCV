"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { GoogleLoginButton } from "@/app/components/common/GoogleLoginButton";

function LoginContent() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setVerified(true);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "employer" }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", "employer");
        window.location.href = "/dashboard/employer";
      } else {
        setErrors({ submit: data.message || "Invalid email or password" });
      }
    } catch {
      setErrors({ submit: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    setIsLoading(true);
    setErrors({});
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential, role: "employer" }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", "employer");
        window.location.href = "/dashboard/employer";
      } else {
        setErrors({ submit: data.message || "Google authentication failed" });
      }
    } catch {
      setErrors({ submit: "A network error occurred. Please try again." });
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

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(87,89,91,0.06) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-3 group">
          <Image
            src="/logo.png"
            alt="VidioCV Logo"
            width={140}
            height={56}
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            style={{ background: "none" }}
          />
        </Link>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl p-8 sm:p-9"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.95)",
            boxShadow: "0 8px 48px rgba(87,89,91,0.10), 0 2px 12px rgba(87,89,91,0.06)",
          }}
        >
          {/* Header */}
          <div className="text-center mb-7">
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: "#57595B" }}>
              Welcome Back
            </h2>
            <p className="mt-1.5 text-sm" style={{ color: "#ACBAC4" }}>
              Sign in to manage your talent pipeline
            </p>
          </div>

          <AnimatePresence>
            {verified && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="p-4 rounded-2xl flex items-center gap-3 overflow-hidden"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-sm font-medium text-green-700">Account verified successfully! You can now sign in.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Candidate / Employer tabs */}
          <div
            className="flex p-1 mb-7 rounded-xl"
            style={{ background: "rgba(191,198,196,0.18)", border: "1px solid #E0E4E3" }}
          >
            <Link
              href="/auth/login"
              className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ color: "#ACBAC4" }}
            >
              Candidate
            </Link>
            <Link
              href="/auth/employer/login"
              className="flex-1 text-center py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: "linear-gradient(135deg, #F7B980, #F0A060)",
                color: "#57595B",
                boxShadow: "0 2px 10px rgba(247,185,128,0.28)",
              }}
            >
              Employer
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase ml-0.5" style={{ color: "#8A8C8E" }}>
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: "#BFC6C4" }}>
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hello@acmecorp.com"
                  className="block w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: errors.email ? "rgba(254,242,242,0.8)" : "rgba(255,255,255,0.7)",
                    border: errors.email ? "1px solid #FCA5A5" : "1px solid #E0E4E3",
                    color: "#57595B",
                    boxShadow: "inset 0 1px 3px rgba(87,89,91,0.05)",
                  }}
                  onFocus={e => {
                    e.currentTarget.style.border = errors.email ? "1px solid #FCA5A5" : "1px solid #F7B980";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(247,185,128,0.15)";
                  }}
                  onBlur={e => {
                    e.currentTarget.style.border = errors.email ? "1px solid #FCA5A5" : "1px solid #E0E4E3";
                    e.currentTarget.style.boxShadow = "inset 0 1px 3px rgba(87,89,91,0.05)";
                  }}
                />
              </div>
              {errors.email && (
                <p className="text-xs ml-0.5 font-medium" style={{ color: "#EF4444" }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-0.5">
                <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#8A8C8E" }}>
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-semibold transition-colors cursor-pointer"
                  style={{ color: "#F7B980" }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: "#BFC6C4" }}>
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: errors.password ? "rgba(254,242,242,0.8)" : "rgba(255,255,255,0.7)",
                    border: errors.password ? "1px solid #FCA5A5" : "1px solid #E0E4E3",
                    color: "#57595B",
                    boxShadow: "inset 0 1px 3px rgba(87,89,91,0.05)",
                  }}
                  onFocus={e => {
                    e.currentTarget.style.border = errors.password ? "1px solid #FCA5A5" : "1px solid #F7B980";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(247,185,128,0.15)";
                  }}
                  onBlur={e => {
                    e.currentTarget.style.border = errors.password ? "1px solid #FCA5A5" : "1px solid #E0E4E3";
                    e.currentTarget.style.boxShadow = "inset 0 1px 3px rgba(87,89,91,0.05)";
                  }}
                />
              </div>
              {errors.password && (
                <p className="text-xs ml-0.5 font-medium" style={{ color: "#EF4444" }}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit error */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl text-sm flex items-center gap-2"
                style={{
                  background: "rgba(254,242,242,0.8)",
                  border: "1px solid #FCA5A5",
                  color: "#DC2626",
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {errors.submit}
              </motion.div>
            )}

            {/* Sign in */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full group cursor-pointer flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #F7B980 0%, #F0A060 100%)",
                color: "#57595B",
                boxShadow: "0 6px 20px rgba(247,185,128,0.32)",
              }}
            >
              {isLoading ? (
                <div
                  className="w-5 h-5 border-2 rounded-full animate-spin"
                  style={{ borderColor: "rgba(87,89,91,0.25)", borderTopColor: "#57595B" }}
                />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8ECED]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-white/80 backdrop-blur-md px-4 text-[#ACBAC4] font-black">Or continue with</span>
              </div>
            </div>

            {/* Google Login */}
            <GoogleLoginButton 
              onSuccess={handleGoogleSuccess}
              onError={(err) => setErrors({ submit: "Google login failed: " + err })}
              isLoading={isLoading}
            />

          </form>

          {/* Footer */}
          <div className="mt-7 pt-6 text-center" style={{ borderTop: "1px solid #E8ECED" }}>
            <p className="text-sm" style={{ color: "#ACBAC4" }}>
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/employer/signup"
                className="font-bold transition-colors"
                style={{ color: "#F7B980" }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function EmployerLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
