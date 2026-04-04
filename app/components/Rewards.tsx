"use client";

import { Trophy, Gift, Star, Crown, Sparkles } from "lucide-react";


const Rewards = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center px-6 overflow-hidden font-sans selection:bg-[#dc143c]/30">
      
      {/* 1. BRANDED AMBIENCE & UPDATED RED BACKGROUND */}
      {/* Deep Red Background Gradient - Adds richer tone */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a0508_0%,#050505_100%)] pointer-events-none" />

      {/* Primary Red Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#dc143c]/15 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#dc143c]/10 blur-[150px] rounded-full pointer-events-none animate-pulse delay-700" />
      
      {/* Precision Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_80%,transparent_100%)] pointer-events-none" />

      {/* 2. CORE MESSAGING */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">
        
        {/* Status Badge */}
        <div className="mt-10 mb-8 inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-1000">
          <Crown className="w-3.5 h-3.5 text-[#dc143c] animate-bounce" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Exclusive Access Pending</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-6 mb-16">
          <h1 className="font-russo text-6xl md:text-8xl lg:text-9xl uppercase tracking-tighter leading-[0.85] text-white drop-shadow-[0_0_30px_rgba(220,20,60,0.3)]">
            RED LINE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] via-[#ff4d6d] to-[#dc143c] bg-[length:200%_auto] animate-gradient">
              REWARDS.
            </span>
          </h1>
          <p className="max-w-xl mx-auto text-gray-400 text-xs md:text-sm font-medium uppercase tracking-[0.3em] leading-relaxed">
            Your loyalty deserves more than a spotless finish. Our <span className="text-white">Rewards Program</span> is in development, crafted exclusively for our most dedicated clients—get ready to unlock your perks.
          </p>
        </div>

        {/* 3. THE REWARDS VAULT PREVIEW */}
        <div className="relative w-full max-w-2xl mb-16 group">
          {/* Card Outer Glow */}
          <div className="absolute -inset-1 bg-[#dc143c]/25 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-100 transition duration-1000" />
          
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Trophy className="w-40 h-40 text-white" />
            </div>

            {/* Content Preview (Redacted/Blurred) */}
            <div className="space-y-8 blur-sm group-hover:blur-0 transition-all duration-700 opacity-40 group-hover:opacity-100">
               {/* Points Balance Mockup */}
               <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Points Balance</span>
                    <div className="text-4xl font-russo text-white tracking-tighter">8,450 <span className="text-[#dc143c]">XP</span></div>
                  </div>
                  <div className="px-4 py-1.5 rounded-lg bg-[#dc143c]/10 border border-[#dc143c]/20 text-[#dc143c] text-[10px] font-black uppercase tracking-widest">
                    Elite Member
                  </div>
               </div>

               {/* Progress Bar Mockup */}
               <div className="space-y-3">
                  <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    <span>Current Level: Gold</span>
                    <span>Next: Platinum</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-gradient-to-r from-[#dc143c] to-red-500 shadow-[0_0_15px_rgba(220,20,60,0.5)]" />
                  </div>
               </div>

               {/* Reward Cards Mockup */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                    <Gift className="w-5 h-5 text-gray-600" />
                    <div className="w-16 h-2 bg-white/5 rounded-full" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                    <Star className="w-5 h-5 text-gray-600" />
                    <div className="w-16 h-2 bg-white/5 rounded-full" />
                  </div>
               </div>
            </div>

            {/* Overlay Label */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] group-hover:backdrop-blur-none transition-all duration-700 pointer-events-none">
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-[#dc143c] rounded-2xl shadow-2xl animate-pulse">
                        <Crown className="w-8 h-8 text-white" />
                    </div>
                    <span className="font-russo text-white text-xl uppercase tracking-tighter">Initializing_Red_Line_Rewards</span>
                </div>
            </div>
          </div>
        </div>

        {/* 5. BRAND FOOTER */}
        <div className="mt-24 pt-12 border-t border-white/5 w-full flex flex-col items-center gap-6 opacity-30 hover:opacity-100 transition-opacity">
            <div className="flex gap-10 items-center">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-[#dc143c]" />
                    <span className="font-russo text-xs text-white uppercase tracking-tighter">RL-LOYALTY_PROGRAM</span>
                </div>
            </div>
            <p className="text-[7px] font-black text-gray-800 uppercase tracking-[1em]">
                PREMIUM BENEFITS // COMING SOON
            </p>
        </div>
      </div>
    </div>
  );
};

export default Rewards;