"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Undo2, Gauge, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full bg-[#050505] flex items-center justify-center px-6 overflow-hidden font-sans">
      {/* 1. BRANDED AMBIENCE */}
      {/* Soft Red Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#dc143c]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Subtle Technical Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center">
        {/* THE 404 WATERMARK */}
        <div className="relative mb-8">
          <span className="font-russo text-[12rem] md:text-[18rem] leading-none text-white/[0.03] select-none">
            404
          </span>
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
            <h1 className="font-russo text-4xl md:text-6xl uppercase tracking-tighter text-white mb-2">
              Off <span className="text-[#dc143c]">Track</span>
            </h1>
            <div className="h-1 w-12 bg-[#dc143c] rounded-full" />
          </div>
        </div>

        {/* CUSTOMER-FRIENDLY COPY */}
        <div className="space-y-4 mb-12 px-4">
          <h2 className="text-gray-400 text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">
            Navigation Error // Destination Unknown
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-sm mx-auto leading-relaxed font-medium">
            {`It looks like the page you’re looking for has been moved or doesn't exist. Let’s get you back to the showroom.`}
          </p>
        </div>

        {/* REFINED ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
          {/* Main Action - Using Shadcn-style Button props */}
          <Button
            asChild
            className="h-14 px-10 bg-[#dc143c] hover:bg-red-700 text-white rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-[0_10px_30px_rgba(220,20,60,0.2)] border-none"
          >
            <Link
              href="/"
              className="flex items-center gap-3 font-russo uppercase tracking-widest text-xs"
            >
              <Home className="w-4 h-4" />
              Return to Base
            </Link>
          </Button>

          {/* Secondary Action */}
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="h-14 px-10 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl transition-all group"
          >
            <Undo2 className="w-4 h-4 mr-3 text-gray-500 group-hover:text-white transition-colors" />
            <span className="font-russo uppercase tracking-widest text-xs">
              Go Back
            </span>
          </Button>
        </div>

        {/* NAVIGATION HELP - A bit of extra customer service */}
        <div className="mt-20 pt-10 border-t border-white/5 w-full max-w-sm">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700 mb-6">
            Quick Navigation
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/#services"
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#dc143c]/30 transition-all group"
            >
              <span className="text-[10px] font-bold text-gray-500 group-hover:text-white uppercase tracking-widest">
                Services
              </span>
              <ChevronRight className="w-3 h-3 text-[#dc143c]" />
            </Link>
            <Link
              href="/booking"
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#dc143c]/30 transition-all group"
            >
              <span className="text-[10px] font-bold text-gray-500 group-hover:text-white uppercase tracking-widest">
                Book Now
              </span>
              <ChevronRight className="w-3 h-3 text-[#dc143c]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative "Dashboard" Gauge at bottom corner */}
      <div className="absolute bottom-10 right-10 hidden lg:flex items-center gap-4 opacity-10">
        <div className="text-right">
          <p className="font-russo text-xs text-white">SYSTEM_STATUS</p>
          <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest tracking-widest">
            Operational
          </p>
        </div>
        <Gauge className="w-10 h-10 text-white" strokeWidth={1} />
      </div>
    </div>
  );
}
