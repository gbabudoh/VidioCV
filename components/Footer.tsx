"use client";

import Image from "next/image";
import {
  Shield,
  Linkedin, Twitter, Github, ArrowUp
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("Footer");
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#F2F4F4] pt-24 pb-12 overflow-hidden selection:bg-[#F7B980]/30 selection:text-[#57595B]">
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
           style={{ 
             backgroundImage: "radial-gradient(circle, #57595B 0.5px, transparent 0.5px)", 
             backgroundSize: "32px 32px"
           }} />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-20">
          
          {/* Brand Identity */}
          <div className="space-y-8 col-span-1 lg:col-span-1">
            <Link href="/" onClick={scrollToTop} className="inline-block group">
              <Image 
                src="/logo.png" 
                alt="VidioCV" 
                width={120} 
                height={48} 
                className="object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <p className="text-[#8A8C8E] font-medium leading-relaxed text-sm">
              {t('tagline')}
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Linkedin, href: "https://linkedin.com" },
                { Icon: Twitter, href: "https://twitter.com" },
                { Icon: Github, href: "https://github.com" }
              ].map((item, i) => (
                <Link key={i} href={item.href} target="_blank" className="p-2.5 rounded-xl bg-white border border-[#E0E4E3] text-[#57595B] hover:text-[#F7B980] hover:border-[#F7B980]/30 transition-all hover:-translate-y-1 shadow-sm">
                  <item.Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#57595B]">{t('sections.platform.title')}</h4>
            <ul className="space-y-4">
              {[
                { label: t('sections.platform.links.home'), href: "/", action: scrollToTop },
                { label: t('sections.platform.links.howItWorks'), href: "/#how-it-works" },
                { label: t('sections.platform.links.features'), href: "/#features" },
                { label: t('sections.platform.links.matching'), href: "/#features" }
              ].map((link, i) => (
                <li key={i}>
                  <Link 
                    href={link.href} 
                    onClick={link.action}
                    className="text-sm font-semibold text-[#8A8C8E] hover:text-[#57595B] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Intelligence Links */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#57595B]">{t('sections.intelligence.title')}</h4>
            <ul className="space-y-4">
              {[
                { label: t('sections.intelligence.links.portfolios'), href: "/portfolios" },
                { label: t('sections.intelligence.links.sourcing'), href: "/pricing" },
                { label: t('sections.intelligence.links.network'), href: "/auth/signup" },
                { label: t('sections.intelligence.links.partner'), href: "/terms" }
              ].map((link, i) => (
                <li key={i}>
                  <Link 
                    href={link.href} 
                    className="text-sm font-semibold text-[#8A8C8E] hover:text-[#57595B] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Meta */}
          <div className="space-y-8">
            <div className="p-6 rounded-[32px] bg-white/70 backdrop-blur-3xl border border-white/60 shadow-xl shadow-[#F7B980]/5 relative group">
              <div className="flex items-center gap-4 mb-4">
                <Shield className="w-5 h-5 text-[#F7B980]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#57595B]">{t('legal.trust')}</span>
              </div>
              <p className="text-xs font-bold text-[#8A8C8E] leading-relaxed">
                {t('legal.encryption')}
              </p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 w-fit">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none pt-0.5">{t('legal.online')}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-[#E0E4E3] flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-xs font-bold text-[#ACBAC4] tracking-wide">
            © 2024 VidioCV. {t('legal.rights')}
          </p>
          <div className="flex items-center gap-10">
            <Link href="/privacy" className="text-xs font-bold text-[#ACBAC4] hover:text-[#57595B] transition-colors">{t('legal.privacy')}</Link>
            <Link href="/terms" className="text-xs font-bold text-[#ACBAC4] hover:text-[#57595B] transition-colors">{t('legal.terms')}</Link>
            <button 
              onClick={scrollToTop}
              className="p-3 rounded-2xl bg-[#57595B] text-white hover:bg-[#F7B980] transition-all hover:shadow-xl hover:shadow-[#F7B980]/20 active:scale-95 group cursor-pointer"
            >
              <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-1" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
