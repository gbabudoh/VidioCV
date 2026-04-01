"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface MobileBottomNavProps {
  items: NavItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ items, activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden">
      <div 
        className="bg-white/90 backdrop-blur-2xl border-t border-white/50 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] grid grid-cols-6 p-2 pb-6 relative overflow-hidden"
      >
        {/* Active Tab Glow */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(247,185,128,0.05) 0%, transparent 70%)"
          }}
        />

        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="relative flex flex-col items-center justify-center py-3 px-0.5 transition-all duration-500 ease-out min-w-0"
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 bg-[#334155] rounded-[24px]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </AnimatePresence>

              <div className="relative z-10 flex flex-col items-center gap-1">
                <Icon 
                  size={20} 
                  className={`transition-all duration-500 ${isActive ? "text-white" : "text-[#64748B]"}`} 
                />
                <span 
                  className={`text-[8px] font-black uppercase tracking-[0.1em] transition-all duration-500 ${isActive ? "text-white opacity-100" : "text-[#64748B] opacity-60"}`}
                >
                  {item.label}
                </span>
              </div>

              {isActive && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-1 w-1 h-1 bg-[#F7B980] rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
