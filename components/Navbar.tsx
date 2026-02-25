"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X, Video } from "lucide-react";
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

    // Session detection
    const checkSession = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("userRole");
      if (token && role) {
        setIsLoggedIn(true);
        setDashboardUrl(role === "employer" ? "/dashboard/employer" : "/dashboard/candidate");
      } else {
        setIsLoggedIn(false);
      }
    };
    
    checkSession();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-primary-100/95 dark:bg-secondary-900/95 backdrop-blur-xl border-primary-200 dark:border-secondary-800 shadow-md py-3"
          : "bg-primary-50/90 dark:bg-secondary-900/90 backdrop-blur-lg border-primary-200/50 dark:border-secondary-800/50 shadow-sm py-5",
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-300">
            <Video className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary-900 to-secondary-700 dark:from-white dark:to-secondary-300 tracking-tight">
            VidioCV
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href={dashboardUrl}
                className="px-6 py-2.5 bg-primary-600 text-white hover:bg-primary-700 rounded-xl font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-primary-500/20"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-secondary-600 dark:text-secondary-300 font-semibold hover:text-primary-600 dark:hover:text-white transition-colors text-sm"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-5 py-2.5 bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 hover:bg-primary-600 dark:hover:bg-primary-500 hover:text-white rounded-xl font-semibold text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-secondary-900/20 dark:shadow-white/10"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute top-full left-0 w-full mt-2 px-6 pb-6 md:hidden"
        >
          <div className="flex flex-col gap-2 p-4 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-2xl border border-secondary-200 dark:border-secondary-800 rounded-2xl shadow-xl">
            {isLoggedIn ? (
              <Link
                href={dashboardUrl}
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 text-center bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 text-center rounded-xl text-secondary-700 dark:text-secondary-200 font-semibold hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 text-center bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                >
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
