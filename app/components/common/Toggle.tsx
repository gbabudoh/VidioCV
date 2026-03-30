"use client";

import React from "react";
import { motion } from "framer-motion";

interface ToggleProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  label?: string;
  description?: string;
  dark?: boolean;
}

export default function Toggle({ enabled, setEnabled, label, description, dark }: ToggleProps) {
  return (
    <div className="flex items-center justify-between group py-2">
      <div className="flex flex-col gap-1 pr-4">
        {label && (
          <span 
            className="text-sm font-bold" 
            style={{ color: dark ? "#FFFFFF" : "#57595B" }}
          >
            {label}
          </span>
        )}
        {description && (
          <p 
            className="text-xs font-medium" 
            style={{ color: dark ? "rgba(255,255,255,0.6)" : "#ACBAC4" }}
          >
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#F7B980]/50 shadow-inner`}
        style={{ background: enabled ? "#F7B980" : dark ? "rgba(255,255,255,0.1)" : "rgba(172, 186, 196, 0.2)" }}
      >
        <span
          aria-hidden="true"
          className={`${
            enabled ? "translate-x-5" : "translate-x-0"
          } pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xl ring-0 transition duration-200 ease-in-out border border-[#E0E4E3]/50 flex items-center justify-center`}
        >
           {enabled && (
             <motion.div 
               initial={{ scale: 0 }} 
               animate={{ scale: 1 }} 
               className="w-1.5 h-1.5 rounded-full bg-[#F7B980]" 
             />
           )}
        </span>
      </button>
    </div>
  );
}
