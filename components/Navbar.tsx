"use client";

import { useState, useEffect, startTransition } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";

export function Navbar() {
  const t = useTranslations("Index.nav");
  const common = useTranslations("Common");
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState("/auth/login");
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

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

  const handleLanguageChange = (locale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale });
      setIsLangMenuOpen(false);
    });
  };

  const locales = ['en', 'fr', 'es', 'de'] as const;

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
          <Link 
            href="/" 
            onClick={(e: React.MouseEvent) => {
              if (pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center group"
          >
          <Image
            src="/logo.png"
            alt="VidioCV Logo"
            width={120}
            height={52}
            priority
            className="object-contain transition-all duration-300 group-hover:scale-105"
            style={{ width: "120px", height: "auto" }}
          />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-7">
          <Link 
            href="/" 
            className="text-sm font-medium transition-colors cursor-pointer" 
            style={{ color: "#ACBAC4" }} 
            onMouseOver={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "#57595B")} 
            onMouseOut={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "#ACBAC4")}
          >
            {t('home')}
          </Link>
          <a href="#how-it-works" className="text-sm font-medium transition-colors" style={{ color: "#ACBAC4" }} onMouseOver={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "#57595B")} onMouseOut={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "#ACBAC4")}>
            {t('howItWorks')}
          </a>
          <a href="#features" className="text-sm font-medium transition-colors" style={{ color: "#ACBAC4" }} onMouseOver={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "#57595B")} onMouseOut={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "#ACBAC4")}>
            {t('features')}
          </a>
          <Link href="/pricing" className="text-sm font-medium transition-colors" style={{ color: "#ACBAC4" }} onMouseOver={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "#57595B")} onMouseOut={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "#ACBAC4")}>
            {t('pricing')}
          </Link>
        </div>

        {/* Desktop Auth & Language */}
        <div className="hidden md:flex items-center gap-5">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#E2E8F0] transition-all text-[#57595B] font-bold text-xs uppercase tracking-widest cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#ACBAC4]" />
              {currentLocale}
              <ChevronDown className={clsx("w-3 h-3 transition-transform", isLangMenuOpen && "rotate-180")} />
            </button>
            
            <AnimatePresence>
              {isLangMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden py-1"
                >
                  {locales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => handleLanguageChange(loc)}
                      className={clsx(
                        "w-full px-4 py-2 text-left text-xs font-bold uppercase tracking-widest transition-colors hover:bg-[#F2F4F4]",
                        currentLocale === loc ? "text-[#F7B980]" : "text-[#57595B]"
                      )}
                    >
                      {common(`languages.${loc}`)}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-6 w-px bg-[#E2E8F0]" />

          {isLoggedIn ? (
            <Link
              href={dashboardUrl}
              className="px-5 py-2 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #F7B980, #F0A060)", color: "#57595B", boxShadow: "0 4px 14px rgba(247,185,128,0.30)" }}
            >
              {t('dashboard')}
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={{ color: "#ACBAC4" }}
              >
                {t('signIn')}
              </Link>
              <Link
                href="/auth/signup"
                className="px-5 py-2 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
                style={{ background: "#57595B", color: "#FFFFFF", boxShadow: "0 4px 14px rgba(87,89,91,0.18)" }}
              >
                {t('getStarted')}
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
            <Link 
              href="/"
              onClick={(e: React.MouseEvent) => {
                setMobileMenuOpen(false);
                if (pathname === "/") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer" 
              style={{ color: "#ACBAC4" }}
            >
              {t('home')}
            </Link>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-medium rounded-xl transition-all" style={{ color: "#ACBAC4" }}>
              {t('howItWorks')}
            </a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-medium rounded-xl transition-all" style={{ color: "#ACBAC4" }}>
              {t('features')}
            </a>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-medium rounded-xl transition-all" style={{ color: "#ACBAC4" }}>
              {t('pricing')}
            </Link>

            <div className="h-px my-1" style={{ background: "#E8ECED" }} />

            {/* Mobile Language Switcher */}
            <div className="flex flex-wrap gap-2 px-4 py-3">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLanguageChange(loc)}
                  className={clsx(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                    currentLocale === loc 
                      ? "bg-[#F7B980] text-white border-[#F7B980]" 
                      : "text-[#ACBAC4] border-[#E2E8F0]"
                  )}
                >
                  {loc}
                </button>
              ))}
            </div>

            <div className="h-px my-1" style={{ background: "#E8ECED" }} />

            {isLoggedIn ? (
              <Link href={dashboardUrl} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-center rounded-xl font-semibold text-sm" style={{ background: "linear-gradient(135deg, #F7B980, #F0A060)", color: "#57595B" }}>
                {t('dashboard')}
              </Link>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-center text-sm font-medium rounded-xl transition-all" style={{ color: "#ACBAC4" }}>
                  {t('signIn')}
                </Link>
                <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-center rounded-xl font-semibold text-sm" style={{ background: "#57595B", color: "#FFFFFF" }}>
                  {t('getStarted')}
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
