"use client";

import React, { useEffect } from "react";
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
  
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const typeConfig: Record<ModalType, { icon: React.ReactNode; bg: string; border: string }> = {
    success: {
      icon: <CheckCircle2 className="w-8 h-8 text-[#10B981]" />,
      bg: "bg-[#10B981]/10",
      border: "border-[#10B981]/20",
    },
    error: {
      icon: <AlertCircle className="w-8 h-8 text-[#EF4444]" />,
      bg: "bg-[#EF4444]/10",
      border: "border-[#EF4444]/20",
    },
    info: {
      icon: <Info className="w-8 h-8 text-[#F7B980]" />,
      bg: "bg-[#F7B980]/10",
      border: "border-[#F7B980]/20",
    },
    warning: {
      icon: <HelpCircle className="w-8 h-8 text-[#F59E0B]" />,
      bg: "bg-[#F59E0B]/10",
      border: "border-[#F59E0B]/20",
    },
    default: {
      icon: null,
      bg: "bg-white/5",
      border: "border-[#E0E4E3]",
    },
  };

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
            onClick={onClose}
            className="absolute inset-0 bg-[#57595B]/20 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className={`relative w-full ${maxWidth} bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-2xl overflow-hidden border border-white z-10 flex flex-col`}
            style={{ boxShadow: "0 24px 64px rgba(87,89,91,0.12)" }}
          >
            {/* Top decorative gradient based on type */}
            {type !== "default" && (
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                type === "success" ? "bg-[#10B981]" :
                type === "error" ? "bg-[#EF4444]" :
                "bg-gradient-to-r from-[#F7B980] to-[#F0A060]"
              }`} />
            )}

            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl text-[#ACBAC4] hover:text-[#57595B] hover:bg-[#F2F4F4]/50 transition-colors z-20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-10">
              <div className={`flex flex-col ${align === "center" ? "items-center text-center" : "items-start text-left"}`}>
                {config.icon && (
                  <div className={`p-4 rounded-2xl mb-6 shadow-inner ${config.bg} ${config.border} border`}>
                    {config.icon}
                  </div>
                )}
                
                {title && (
                  <h2 className="text-xl font-bold text-[#57595B] mb-2 tracking-tight">
                    {title}
                  </h2>
                )}
                
                <div className="text-[#ACBAC4] text-sm leading-relaxed mb-6 w-full font-medium">
                  {children}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full mt-auto">
                  {primaryAction && (
                    <button
                      onClick={primaryAction.onClick}
                      className="flex-1 py-3.5 px-6 rounded-2xl font-bold transition-all shadow-lg hover:-translate-y-1 cursor-pointer"
                      style={{ 
                        background: "linear-gradient(135deg, #F7B980 0%, #F0A060 100%)", 
                        color: "#57595B",
                        boxShadow: "0 8px 24px rgba(247,185,128,0.3)"
                      }}
                    >
                      {primaryAction.label}
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className={`font-bold rounded-2xl py-3.5 px-6 transition-all duration-300 cursor-pointer ${
                      primaryAction 
                        ? "flex-1 bg-[#F2F4F4] hover:bg-[#E8ECED] text-[#ACBAC4] hover:text-[#57595B]"
                        : "w-full shadow-lg hover:-translate-y-1"
                    }`}
                    style={primaryAction ? {} : { 
                      background: "#57595B", 
                      color: "#FFFFFF",
                      boxShadow: "0 8px 24px rgba(87,89,91,0.18)"
                    }}
                  >
                    {primaryAction ? "Cancel" : (closeActionLabel || "Got it")}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
