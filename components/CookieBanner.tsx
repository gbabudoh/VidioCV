"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Check, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function CookieBanner() {
  const t = useTranslations("Legal.cookie");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Delay showing the banner for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-6 right-6 z-[100] max-w-4xl mx-auto"
        >
          <div className="bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 md:p-8 shadow-[0_32px_128px_rgba(87,89,91,0.15)] flex flex-col md:flex-row items-center gap-6 md:gap-10">
            
            {/* Icon & Text */}
            <div className="flex items-start gap-5 flex-1">
              <div className="p-3.5 rounded-2xl bg-[#F7B980]/10 text-[#F7B980] shrink-0">
                <Cookie className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#57595B]">{t('title')}</h3>
                <p className="text-sm font-medium text-[#8A8C8E] leading-relaxed">
                  {t.rich('description', {
                    privacyLink: (chunks) => (
                      <Link href="/privacy" className="text-[#F7B980] hover:underline">
                        {chunks}
                      </Link>
                    )
                  })}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={handleDecline}
                className="flex-1 md:flex-none px-6 py-3.5 rounded-xl border border-[#E0E4E3] text-[#ACBAC4] hover:text-[#57595B] hover:border-[#ACBAC4] font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
              >
                {t('decline')}
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 md:flex-none px-8 py-3.5 rounded-xl bg-[#334155] hover:bg-[#454749] text-white font-black text-xs uppercase tracking-[0.15em] transition-all shadow-xl shadow-[#334155]/10 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                {t('accept')}
              </button>
            </div>

            {/* GDPR Badge (Desktop Only) */}
            <div className="hidden lg:flex flex-col items-center gap-1 border-l border-[#E0E4E3] pl-8 shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-tighter text-[#ACBAC4]">{t('gdprBadge')}</span>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
