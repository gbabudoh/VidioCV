"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Video,
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";
import clsx from "clsx";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "candidate" }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard/candidate";
      } else {
        setErrors({ submit: data.message || "Invalid email or password" });
      }
    } catch {
      setErrors({ submit: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary-50 dark:bg-secondary-950 font-sans p-6 py-12 relative overflow-hidden">
      {/* Soft background glares */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-400/20 dark:bg-primary-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-accent-400/20 dark:bg-accent-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-10 cursor-pointer group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
            <Video className="w-6 h-6" />
          </div>
          <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary-900 to-secondary-700 dark:from-white dark:to-secondary-300 tracking-tight">
            VidioCV
          </span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border border-[#dcdcdc] dark:border-secondary-700 shadow-2xl shadow-secondary-200/40 dark:shadow-black/50"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-2 text-secondary-600 dark:text-secondary-400 text-sm">
              Sign in to your account
            </p>
          </div>

          <div className="flex bg-secondary-100 dark:bg-secondary-900/50 p-1 mb-8 rounded-xl">
            <Link
              href="/auth/login"
              className="flex-1 text-center py-2.5 rounded-lg bg-primary-600 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
            >
              Candidate
            </Link>
            <Link
              href="/auth/employer/login"
              className="flex-1 text-center py-2.5 rounded-lg text-secondary-600 dark:text-secondary-400 font-medium text-sm hover:text-secondary-900 dark:hover:text-white transition-all cursor-pointer"
            >
              Employer
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-400 group-focus-within:text-primary-500 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={clsx(
                    "block w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-secondary-950/50 border border-[#dcdcdc] dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white placeholder-secondary-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none",
                    errors.email &&
                      "border-error-500 focus:border-error-500 focus:ring-error-500/20",
                  )}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-error-500 text-xs mt-1 ml-1 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors cursor-pointer"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-400 group-focus-within:text-primary-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={clsx(
                    "block w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-secondary-950/50 border border-[#dcdcdc] dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white placeholder-secondary-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none",
                    errors.password &&
                      "border-error-500 focus:border-error-500 focus:ring-error-500/20",
                  )}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-error-500 text-xs mt-1 ml-1 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl text-error-700 dark:text-error-400 text-sm flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-error-500 flex-shrink-0" />
                {errors.submit}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 group relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/25 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={async () => {
                setIsLoading(true);
                try {
                  const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: "candidate@demo.com", password: "democa123", role: "candidate" }),
                  });
                  const data = await response.json();
                  if (response.ok) {
                    localStorage.setItem("token", data.token);
                    window.location.href = "/dashboard/candidate";
                  } else {
                    setErrors({ submit: data.message || "Demo login failed" });
                  }
                } catch {
                  setErrors({ submit: "An error occurred. Please try again." });
                } finally {
                  setIsLoading(false);
                }
              }}
              className="w-full mt-3 group overflow-hidden bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white border border-secondary-200 dark:border-secondary-700 font-semibold py-4 rounded-xl transition-all hover:bg-secondary-50 dark:hover:bg-secondary-700 cursor-pointer flex items-center justify-center gap-2"
            >
              Demo Candidate Login
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-secondary-200 dark:border-secondary-800 text-center">
            <p className="text-secondary-600 dark:text-secondary-400 text-sm font-medium">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold transition-colors cursor-pointer"
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
