"use client";

import { useState, useEffect, startTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import clsx from "clsx";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState("/auth/login");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    if (token && role) {
      startTransition(() => {
        setIsLoggedIn(true);
        setDashboardUrl(
          role === "employer" ? "/dashboard/employer" : "/dashboard/candidate"
        );
      });
    } else {
      startTransition(() => {
        setIsLoggedIn(false);
      });
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={
        isScrolled
          ? { background: "rgba(253,252,250,0.97)", borderBottom: "1px solid #E0E4E3", boxShadow: "0 2px 16px rgba(87,89,91,0.07)" }
          : { background: "rgba(253,252,250,0.90)", borderBottom: "1px solid rgba(191,198,196,0.50)" }
      }
      className={clsx(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled ? "py-1 backdrop-blur-2xl" : "py-1 backdrop-blur-xl"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <Image
            src="/logo.png"
            alt="VidioCV Logo"
            width={120}
            height={52}
            className="object-contain transition-all duration-300 group-hover:scale-105"
            style={{ background: "none" }}
          />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-7">
          <a href="#how-it-works" className="text-sm font-medium transition-colors" style={{ color: "#ACBAC4" }} onMouseOver={e => (e.currentTarget.style.color = "#57595B")} onMouseOut={e => (e.currentTarget.style.color = "#ACBAC4")}>
            How It Works
          </a>
          <a href="#features" className="text-sm font-medium transition-colors" style={{ color: "#ACBAC4" }} onMouseOver={e => (e.currentTarget.style.color = "#57595B")} onMouseOut={e => (e.currentTarget.style.color = "#ACBAC4")}>
            Features
          </a>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href={dashboardUrl}
              className="px-5 py-2 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #F7B980, #F0A060)", color: "#57595B", boxShadow: "0 4px 14px rgba(247,185,128,0.30)" }}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={{ color: "#ACBAC4" }}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-5 py-2 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
                style={{ background: "#57595B", color: "#FFFFFF", boxShadow: "0 4px 14px rgba(87,89,91,0.18)" }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 transition-colors" style={{ color: "#ACBAC4" }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 w-full px-4 pb-4 md:hidden"
        >
          <div className="flex flex-col gap-1 p-3 rounded-2xl shadow-xl mt-2" style={{ background: "rgba(253,252,250,0.98)", border: "1px solid #E0E4E3" }}>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-medium rounded-xl transition-all" style={{ color: "#ACBAC4" }}>
              How It Works
            </a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-medium rounded-xl transition-all" style={{ color: "#ACBAC4" }}>
              Features
            </a>
            <div className="h-px my-1" style={{ background: "#E8ECED" }} />
            {isLoggedIn ? (
              <Link href={dashboardUrl} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-center rounded-xl font-semibold text-sm" style={{ background: "linear-gradient(135deg, #F7B980, #F0A060)", color: "#57595B" }}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-center text-sm font-medium rounded-xl transition-all" style={{ color: "#ACBAC4" }}>
                  Sign In
                </Link>
                <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-center rounded-xl font-semibold text-sm" style={{ background: "#57595B", color: "#FFFFFF" }}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
