/* eslint-disable */
// @ts-nocheck
"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F2F4F4] flex flex-col items-center justify-center p-6">
      <div className="relative">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-full border-4 border-[#F7B980]/20 border-t-[#F7B980]"
        />
        
        {/* Inner Kinetic Dot */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 m-auto w-4 h-4 bg-[#57595B] rounded-full shadow-lg shadow-[#57595B]/20"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center space-y-2"
      >
        <p className="text-[#57595B] font-black tracking-widest uppercase text-[10px]">
          Initializing Kinetic Stream
        </p>
        <div className="flex gap-1 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-1 h-1 bg-[#ACBAC4] rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
