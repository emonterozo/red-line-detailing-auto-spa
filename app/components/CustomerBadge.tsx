"use client";

import {
  Star,
  ShieldCheck,
  Zap,
  Lock,
  BadgeQuestionMark,
  CircleDashed,
  ChevronRight,
} from "lucide-react";
import { CustomerBadge as ECustomerBadge } from "@/lib/enums";

interface BadgeProps {
  type: ECustomerBadge | "locked";
  points?: number;
  count?: number;
  limit?: number;
}

export const CustomerBadge = ({ type, points, count, limit }: BadgeProps) => {
  if (type === "locked") {
    return (
      <div className="p-5 rounded-[2rem] bg-[#141414] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-[#dc143c]/20 blur-[40px] rounded-full pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="bg-neutral-800/80 p-3.5 rounded-2xl border border-white/10 shadow-xl">
            <div className="relative">
              <BadgeQuestionMark className="w-7 h-7 text-neutral-400 group-hover:text-white transition-colors" />

              <div className="absolute -top-1.5 -right-1.5 bg-[#dc143c] rounded-lg p-1 shadow-lg border-2 border-[#141414]">
                <Lock className="w-2 h-2 text-white" />
              </div>
            </div>
          </div>
          <div className="text-left">
            <h4 className="text-neutral-400 text-sm font-black tracking-[0.2em] uppercase">
              Shadow Member
            </h4>

            <p className="text-[10px] text-[#dc143c] font-black uppercase tracking-[0.15em] mt-0.5 flex items-center gap-2">
              <CircleDashed className="w-3 h-3 animate-spin-slow" />
              Badge Unknown
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5 flex items-center justify-between group-hover:bg-white/10 transition-colors">
          <p className="text-[10px] text-white font-black uppercase tracking-tight">
            Complete 1st booking to unlock
          </p>
          <div className="bg-white/10 p-1 rounded-full">
            <ChevronRight className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
    );
  }

  if (type === ECustomerBadge.THE_APEX) {
    return (
      <div className="p-5 rounded-[2rem] bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="bg-gradient-to-b from-amber-300 to-amber-600 p-3 rounded-2xl shadow-lg">
              <Star className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl border-2 border-amber-400 animate-ping opacity-20" />
          </div>
          <div className="text-left">
            <h4 className="text-amber-400 text-sm font-black tracking-[0.2em] uppercase">
              {type}
            </h4>
            <p className="text-[10px] text-white/80 font-bold uppercase mt-0.5">
              {`Founding Customer · ${count} of ${limit}`}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
          <Zap className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] font-black text-white">
            {`+${points} WELCOME PTS EARNED`}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-[2rem] bg-[#111111] border border-white/10 shadow-[0_0_20px_rgba(220,20,60,0.15)] relative overflow-hidden">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="bg-[#dc143c] p-3 rounded-2xl shadow-[0_0_15px_rgba(220,20,60,0.4)]">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-[#dc143c] animate-ping opacity-20" />
        </div>
        <div className="text-left">
          <h4 className="text-white text-sm font-black tracking-[0.2em] uppercase">
            {type}
          </h4>
          <p className="text-[10px] text-white/80 font-bold uppercase mt-0.5">
            First Service Completed
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
        <Zap className="w-3 h-3 text-[#dc143c]" />
        <span className="text-[10px] font-black text-white">
          {`+${points} WELCOME PTS EARNED`}
        </span>
      </div>
    </div>
  );
};
