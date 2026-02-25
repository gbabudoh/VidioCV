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
      icon: <CheckCircle2 className="w-8 h-8 text-success-500" />,
      bg: "bg-success-50 dark:bg-success-500/10",
      border: "border-success-200 dark:border-success-500/20",
    },
    error: {
      icon: <AlertCircle className="w-8 h-8 text-error-500" />,
      bg: "bg-error-50 dark:bg-error-500/10",
      border: "border-error-200 dark:border-error-500/20",
    },
    info: {
      icon: <Info className="w-8 h-8 text-primary-500" />,
      bg: "bg-primary-50 dark:bg-primary-500/10",
      border: "border-primary-200 dark:border-primary-500/20",
    },
    warning: {
      icon: <HelpCircle className="w-8 h-8 text-warning-500" />,
      bg: "bg-warning-50 dark:bg-warning-500/10",
      border: "border-warning-200 dark:border-warning-500/20",
    },
    default: {
      icon: null,
      bg: "bg-white/5 dark:bg-secondary-800/50",
      border: "border-secondary-200 dark:border-secondary-700",
    },
  };

  const config = typeConfig[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-secondary-900/40 dark:bg-black/60 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className={`relative w-full ${maxWidth} bg-white/90 dark:bg-secondary-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border ${config.border} z-10 flex flex-col`}
          >
            {/* Top decorative gradient based on type */}
            {type !== "default" && (
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                type === "success" ? "bg-gradient-to-r from-success-400 to-success-600" :
                type === "error" ? "bg-gradient-to-r from-error-400 to-error-600" :
                "bg-gradient-to-r from-primary-400 to-primary-600"
              }`} />
            )}

            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-secondary-400 hover:text-secondary-600 dark:hover:text-white hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors z-20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 sm:p-10">
              <div className={`flex flex-col ${align === "center" ? "items-center text-center" : "items-start text-left"}`}>
                {config.icon && (
                  <div className={`p-4 rounded-2xl mb-6 shadow-inner ${config.bg} ${config.border} border`}>
                    {config.icon}
                  </div>
                )}
                
                {title && (
                  <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-3">
                    {title}
                  </h2>
                )}
                
                <div className="text-secondary-600 dark:text-secondary-300 text-base leading-relaxed mb-8 w-full">
                  {children}
                </div>

                <div className="flex gap-4 w-full mt-auto">
                  {primaryAction && (
                    <button
                      onClick={primaryAction.onClick}
                      className="flex-1 py-3.5 px-6 bg-secondary-900 hover:bg-secondary-800 dark:bg-white dark:hover:bg-secondary-100 text-white dark:text-secondary-900 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl cursor-pointer"
                    >
                      {primaryAction.label}
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className={`font-semibold rounded-xl py-3.5 px-6 transition-colors duration-200 cursor-pointer ${
                      primaryAction 
                        ? "flex-1 bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-800 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-300"
                        : "w-full bg-secondary-900 hover:bg-secondary-800 dark:bg-white dark:hover:bg-secondary-100 text-white dark:text-secondary-900 shadow-lg"
                    }`}
                  >
                    {primaryAction ? "Cancel" : (closeActionLabel || "Awesome, got it")}
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
