"use client";

import { motion } from "framer-motion";
import { User, Trophy, CheckCircle2 } from "lucide-react";

interface CustomerDetailHeaderProps {
  firstName: string;
  lastName: string;
  isVerified: boolean;
  verifiedAt: Date;
  points: number;
}

const formatted = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

export default function CustomerDetailsHeader({
  firstName,
  lastName,
  isVerified,
  verifiedAt,
  points,
}: Readonly<CustomerDetailHeaderProps>) {
  return (
    <div className="relative border-b border-white/10 bg-white/[0.01] py-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[#dc143c]/[0.03] blur-[100px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#dc143c] to-[#ff6b81] flex items-center justify-center shadow-2xl shadow-[#dc143c]/20">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="font-russo text-4xl md:text-6xl uppercase tracking-tighter leading-none">
                {firstName}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff6b81]">
                  {lastName}
                </span>
              </h1>
              {isVerified && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center p-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  <CheckCircle2 className="w-5 h-5 md:w-7 md:h-7 text-emerald-400 fill-emerald-400/10" />
                </motion.div>
              )}
            </div>
            {isVerified && (
              <p className="text-gray-500 text-[12px] font-bold uppercase tracking-[0.2em]">
                {`Verified Customer Since ${formatted(verifiedAt)}`}
              </p>
            )}
          </div>
        </div>
        <div className="px-8 py-5 rounded-[2.5rem] bg-white/[0.03] border border-white/10 flex flex-col items-center">
          <span className="text-[12px] text-gray-500 uppercase font-black tracking-widest mb-1">
            Earned Points
          </span>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-3xl font-russo">
              {points.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
