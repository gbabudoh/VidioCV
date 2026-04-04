"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, HelpCircle } from "lucide-react";

export type ModalType = "success" | "error" | "info" | "warning" | "default";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  type?: ModalType;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  closeActionLabel?: string;
  maxWidth?: string;
  align?: "left" | "center";
}

const typeConfig = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    accent: "from-emerald-400 to-emerald-500",
    iconBg: "bg-emerald-50 border-emerald-100",
    primaryBg: "bg-emerald-500 hover:bg-emerald-600 text-white",
  },
  error: {
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    accent: "from-red-400 to-red-500",
    iconBg: "bg-red-50 border-red-100",
    primaryBg: "bg-red-500 hover:bg-red-600 text-white",
  },
  info: {
    icon: <Info className="w-5 h-5 text-[#F7B980]" />,
    accent: "from-[#F7B980] to-[#F0A060]",
    iconBg: "bg-[#F7B980]/10 border-[#F7B980]/20",
    primaryBg: "bg-linear-to-r from-[#F7B980] to-[#F0A060] text-slate-800",
  },
  warning: {
    icon: <HelpCircle className="w-5 h-5 text-amber-500" />,
    accent: "from-amber-400 to-amber-500",
    iconBg: "bg-amber-50 border-amber-100",
    primaryBg: "bg-amber-500 hover:bg-amber-600 text-white",
  },
  default: {
    icon: null,
    accent: "from-slate-200 to-slate-300",
    iconBg: "bg-slate-50 border-slate-100",
    primaryBg: "bg-linear-to-r from-[#F7B980] to-[#F0A060] text-slate-800",
  },
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  type = "default",
  primaryAction,
  closeActionLabel,
  maxWidth = "max-w-lg",
  align = "center",
}: ModalProps) {

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const config = typeConfig[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className={`relative w-full ${maxWidth} bg-white z-10 flex flex-col
              rounded-3xl
              max-h-[80vh]
              shadow-[0_32px_80px_-12px_rgba(0,0,0,0.22)]`}
          >

            {/* Colour accent bar */}
            <div className={`h-1 w-full rounded-t-3xl bg-linear-to-r ${config.accent} shrink-0`} />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
              <div className={`flex items-center gap-3 ${align === "center" ? "mx-auto" : ""}`}>
                {config.icon && (
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${config.iconBg} shrink-0`}>
                    {config.icon}
                  </div>
                )}
                {title && (
                  <h2 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h2>
                )}
              </div>
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className={`flex-1 overflow-y-auto px-6 py-4 text-sm text-slate-600 leading-relaxed
              ${align === "center" ? "text-center" : "text-left"}`}>
              {children}
            </div>

            {/* Footer — action buttons, always visible */}
            <div className="px-6 py-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2 shrink-0 bg-slate-50/60 rounded-b-3xl">
              {primaryAction && (
                <button
                  onClick={primaryAction.onClick}
                  className={`flex-1 py-3 px-5 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm ${config.primaryBg}`}
                >
                  {primaryAction.label}
                </button>
              )}
              <button
                onClick={onClose}
                className={`py-3 px-5 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 ${primaryAction ? "flex-1" : "w-full"}`}
              >
                {closeActionLabel || (primaryAction ? "Cancel" : "Got it")}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
