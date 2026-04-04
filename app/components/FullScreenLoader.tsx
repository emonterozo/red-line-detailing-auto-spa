"use client";

import { motion } from "framer-motion";

export default function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a]/40 backdrop-blur-md transition-all">
      <div className="relative flex flex-col items-center">
        {/* Simple Minimalist Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 rounded-full border-2 border-white/5 border-t-[#dc143c] shadow-[0_0_15px_rgba(220,20,60,0.2)]"
        />
        
        {/* Transparent Text Label */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/50"
        >
          Loading
        </motion.p>
      </div>
    </div>
  );
}