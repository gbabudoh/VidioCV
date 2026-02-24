"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Video,
  Mail,
  Lock,
  Building2,
  ArrowRight,
  Globe,
} from "lucide-react";
import clsx from "clsx";
import Select, { components } from "react-select";
import ReactCountryFlag from "react-country-flag";
import countryList from "country-list";

const countryOptions = countryList.getData().map((country) => ({
  value: country.code,
  label: country.name,
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Option = (props: any) => {
  return (
    <components.Option {...props}>
      <div className="flex items-center gap-2">
        <ReactCountryFlag countryCode={props.data.value} svg style={{ width: "1.2rem", height: "1.2rem" }} />
        <span>{props.data.label}</span>
      </div>
    </components.Option>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SingleValue = (props: any) => {
  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-2">
        <ReactCountryFlag countryCode={props.data.value} svg style={{ width: "1.2rem", height: "1.2rem" }} />
        <span>{props.data.label}</span>
      </div>
    </components.SingleValue>
  );
};

export default function EmployerSignupPage() {
  const role = "employer";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    country: "",
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

    if (!formData.name) newErrors.name = "Company Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          country: formData.country,
          password: formData.password,
          role,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard/employer";
      } else {
        const data = await response.json();
        setErrors({ submit: data.error || "Signup failed. Please try again." });
      }
    } catch {
      setErrors({ submit: "A network error occurred. Please try again." });
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
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
            <Video className="w-6 h-6" />
          </div>
          <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary-900 to-secondary-700 dark:from-white dark:to-secondary-300 tracking-tight">
            VidioCV
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border border-[#dcdcdc] dark:border-secondary-700 shadow-2xl shadow-secondary-200/40 dark:shadow-black/50"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white tracking-tight">
              Create Account
            </h2>
            <p className="mt-2 text-secondary-600 dark:text-secondary-400 text-sm">
              Discover and hire the absolute best talent.
            </p>
          </div>

          <div className="flex bg-secondary-100 dark:bg-secondary-900/50 p-1 mb-8 rounded-xl">
            <Link
              href="/auth/signup"
              className="flex-1 text-center py-2.5 rounded-lg text-secondary-600 dark:text-secondary-400 font-medium text-sm hover:text-secondary-900 dark:hover:text-white transition-all"
            >
              Candidate
            </Link>
            <Link
              href="/auth/employer/signup"
              className="flex-1 text-center py-2.5 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white font-semibold text-sm shadow-sm transition-all"
            >
              Employer
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 ml-1">
                Company Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-400 group-focus-within:text-primary-500 transition-colors">
                  <Building2 className="h-5 w-5" />
                </div>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={clsx(
                    "block w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-secondary-950/50 border border-[#dcdcdc] dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white placeholder-secondary-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none",
                    errors.name &&
                      "border-error-500 focus:border-error-500 focus:ring-error-500/20",
                  )}
                  placeholder="Acme Corp"
                />
              </div>
              {errors.name && (
                <p className="text-error-500 text-xs mt-1 ml-1 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 ml-1">
                Work Email Address
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
                  placeholder="hello@acmecorp.com"
                />
              </div>
              {errors.email && (
                <p className="text-error-500 text-xs mt-1 ml-1 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 ml-1">
                Country
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10 text-secondary-400 group-focus-within:text-primary-500 transition-colors">
                  <Globe className="h-5 w-5" />
                </div>
                <Select
                  options={countryOptions}
                  components={{ Option, SingleValue }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(selectedOption: any) => {
                    setFormData((prev) => ({ ...prev, country: selectedOption?.value || "" }));
                    if (errors.country) setErrors((prev) => ({ ...prev, country: "" }));
                  }}
                  placeholder="Select your country..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      width: "100%",
                      paddingLeft: "2.5rem",
                      paddingRight: "1rem",
                      paddingTop: "0.2rem",
                      paddingBottom: "0.2rem",
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                      borderColor: errors.country ? "#ef4444" : state.isFocused ? "#8b5cf6" : "#cbd5e1",
                      borderWidth: "2px",
                      borderRadius: "0.75rem",
                      boxShadow: state.isFocused ? "0 0 0 4px rgba(139, 92, 246, 0.2)" : "none",
                      outline: "none",
                      transition: "all 0.2s ease-in-out",
                      className: "dark:bg-secondary-950/50 dark:border-secondary-700",
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(16px)",
                      borderRadius: "0.75rem",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                      overflow: "hidden",
                      border: "1px solid #e2e8f0",
                      zIndex: 50,
                      className: "dark:bg-secondary-900/95 dark:border-secondary-800",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? "#8b5cf6" : state.isFocused ? "rgba(139, 92, 246, 0.1)" : "transparent",
                      color: state.isSelected ? "white" : "inherit",
                      cursor: "pointer",
                      padding: "8px 12px",
                    }),
                  }}
                />
              </div>
              {errors.country && (
                <p className="text-error-500 text-xs mt-1 ml-1 font-medium">
                  {errors.country}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 ml-1">
                Password
              </label>
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
                    "block w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-secondary-950/50 border-2 border-secondary-300 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white placeholder-secondary-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none",
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
              className="w-full mt-4 group relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Employer Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-secondary-200 dark:border-secondary-800 text-center">
            <p className="text-secondary-600 dark:text-secondary-400 text-sm font-medium">
              Already have an account?{" "}
              <Link
                href="/auth/employer/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>


        </motion.div>
      </div>
    </div>
  );
}
