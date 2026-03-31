"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import NextImage from "next/image";
import { Mail, Lock, Building2, ArrowRight, Globe } from "lucide-react";
import Select, { components, OptionProps, SingleValueProps } from "react-select";
import ReactCountryFlag from "react-country-flag";
import countryList from "country-list";

interface CountryOption {
  value: string;
  label: string;
}

const countryOptions: CountryOption[] = countryList.getData().map((country) => ({
  value: country.code,
  label: country.name,
}));

const Option = (props: OptionProps<CountryOption, false>) => (
  <components.Option {...props}>
    <div className="flex items-center gap-2">
      <ReactCountryFlag countryCode={props.data.value} svg style={{ width: "1.2rem", height: "1.2rem" }} />
      <span>{props.data.label}</span>
    </div>
  </components.Option>
);

const SingleValue = (props: SingleValueProps<CountryOption, false>) => (
  <components.SingleValue {...props}>
    <div className="flex items-center gap-2">
      <ReactCountryFlag countryCode={props.data.value} svg style={{ width: "1.2rem", height: "1.2rem" }} />
      <span>{props.data.label}</span>
    </div>
  </components.SingleValue>
);

const inputStyle = (hasError: boolean) => ({
  background: hasError ? "rgba(254,242,242,0.8)" : "rgba(255,255,255,0.7)",
  border: hasError ? "1px solid #FCA5A5" : "1px solid #E0E4E3",
  color: "#57595B",
  boxShadow: "inset 0 1px 3px rgba(87,89,91,0.05)",
});

const inputFocus = (hasError: boolean) => ({
  border: hasError ? "1px solid #FCA5A5" : "1px solid #F7B980",
  boxShadow: "0 0 0 3px rgba(247,185,128,0.15)",
});

const inputBlur = (hasError: boolean) => ({
  border: hasError ? "1px solid #FCA5A5" : "1px solid #E0E4E3",
  boxShadow: "inset 0 1px 3px rgba(87,89,91,0.05)",
});

export default function EmployerSignupPage() {
  const role = "employer";

  const [formData, setFormData] = useState({ name: "", email: "", password: "", country: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Company Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, country: formData.country, password: formData.password, role }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", "employer");
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
    <div
      className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #F2F4F4 0%, #F9F9F9 45%, #F9F5F1 100%)" }}
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px]" style={{ background: "rgba(247,185,128,0.18)" }} />
        <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[130px]" style={{ background: "rgba(172,186,196,0.20)" }} />
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
          <NextImage
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
              Create Account
            </h2>
            <p className="mt-1.5 text-sm" style={{ color: "#ACBAC4" }}>
              Discover and hire the absolute best talent
            </p>
          </div>

          {/* Candidate / Employer tabs */}
          <div
            className="flex p-1 mb-7 rounded-xl"
            style={{ background: "rgba(191,198,196,0.18)", border: "1px solid #E0E4E3" }}
          >
            <Link
              href="/auth/signup"
              className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ color: "#ACBAC4" }}
            >
              Candidate
            </Link>
            <Link
              href="/auth/employer/signup"
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

            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase ml-0.5" style={{ color: "#8A8C8E" }}>
                Company Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: "#BFC6C4" }}>
                  <Building2 className="h-4 w-4" />
                </div>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Acme Corp"
                  className="block w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle(!!errors.name)}
                  onFocus={e => Object.assign(e.currentTarget.style, inputFocus(!!errors.name))}
                  onBlur={e => Object.assign(e.currentTarget.style, inputBlur(!!errors.name))}
                />
              </div>
              {errors.name && <p className="text-xs ml-0.5 font-medium" style={{ color: "#EF4444" }}>{errors.name}</p>}
            </div>

            {/* Work Email */}
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
                  style={inputStyle(!!errors.email)}
                  onFocus={e => Object.assign(e.currentTarget.style, inputFocus(!!errors.email))}
                  onBlur={e => Object.assign(e.currentTarget.style, inputBlur(!!errors.email))}
                />
              </div>
              {errors.email && <p className="text-xs ml-0.5 font-medium" style={{ color: "#EF4444" }}>{errors.email}</p>}
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase ml-0.5" style={{ color: "#8A8C8E" }}>
                Country
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10" style={{ color: "#BFC6C4" }}>
                  <Globe className="h-4 w-4" />
                </div>
                <Select
                  instanceId="employer-country-select"
                  options={countryOptions}
                  components={{ Option, SingleValue }}
                  onChange={(selectedOption) => {
                    setFormData((prev) => ({ ...prev, country: selectedOption?.value || "" }));
                    if (errors.country) setErrors((prev) => ({ ...prev, country: "" }));
                  }}
                  placeholder="Select your country..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      paddingLeft: "2.5rem",
                      paddingTop: "0.15rem",
                      paddingBottom: "0.15rem",
                      backgroundColor: errors.country ? "rgba(254,242,242,0.8)" : "rgba(255,255,255,0.7)",
                      borderColor: errors.country ? "#FCA5A5" : state.isFocused ? "#F7B980" : "#E0E4E3",
                      borderWidth: "1px",
                      borderRadius: "0.75rem",
                      boxShadow: state.isFocused
                        ? "0 0 0 3px rgba(247,185,128,0.15)"
                        : "inset 0 1px 3px rgba(87,89,91,0.05)",
                      outline: "none",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": { borderColor: state.isFocused ? "#F7B980" : "#BFC6C4" },
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: "rgba(255,255,255,0.97)",
                      backdropFilter: "blur(16px)",
                      borderRadius: "0.75rem",
                      boxShadow: "0 10px 40px rgba(87,89,91,0.12)",
                      border: "1px solid #E0E4E3",
                      zIndex: 50,
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#F7B980"
                        : state.isFocused
                        ? "rgba(247,185,128,0.10)"
                        : "transparent",
                      color: "#57595B",
                      cursor: "pointer",
                      padding: "8px 12px",
                      fontWeight: state.isSelected ? "600" : "400",
                    }),
                    placeholder: (base) => ({ ...base, color: "#BFC6C4" }),
                    singleValue: (base) => ({ ...base, color: "#57595B" }),
                    input: (base) => ({ ...base, color: "#57595B" }),
                    indicatorSeparator: () => ({ display: "none" }),
                    dropdownIndicator: (base) => ({ ...base, color: "#BFC6C4", padding: "0 8px 0 0" }),
                  }}
                />
              </div>
              {errors.country && <p className="text-xs ml-0.5 font-medium" style={{ color: "#EF4444" }}>{errors.country}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide uppercase ml-0.5" style={{ color: "#8A8C8E" }}>
                Password
              </label>
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
                  style={inputStyle(!!errors.password)}
                  onFocus={e => Object.assign(e.currentTarget.style, inputFocus(!!errors.password))}
                  onBlur={e => Object.assign(e.currentTarget.style, inputBlur(!!errors.password))}
                />
              </div>
              {errors.password && <p className="text-xs ml-0.5 font-medium" style={{ color: "#EF4444" }}>{errors.password}</p>}
            </div>

            {/* Submit error */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl text-sm flex items-center gap-2"
                style={{ background: "rgba(254,242,242,0.8)", border: "1px solid #FCA5A5", color: "#DC2626" }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {errors.submit}
              </motion.div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full group flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #F7B980 0%, #F0A060 100%)",
                color: "#57595B",
                boxShadow: "0 6px 20px rgba(247,185,128,0.32)",
              }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(87,89,91,0.25)", borderTopColor: "#57595B" }} />
              ) : (
                <>
                  Create Employer Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-7 pt-6 text-center" style={{ borderTop: "1px solid #E8ECED" }}>
            <p className="text-sm" style={{ color: "#ACBAC4" }}>
              Already have an account?{" "}
              <Link href="/auth/employer/login" className="font-bold transition-colors" style={{ color: "#F7B980" }}>
                Log in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
