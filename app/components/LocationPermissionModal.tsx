"use client";

import { MapPin, RefreshCw, Lock, ArrowRight } from "lucide-react";

export default function LocationPermissionModal() {
  const handleReload = () => globalThis.location.reload();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <button className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-[#0c0c0c] border border-white/10 rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="h-[3px] bg-gradient-to-r from-[#dc143c] via-[#ff6b81] to-transparent flex-shrink-0" />

        <div className="px-7 pt-6 pb-5 border-b border-white/[0.07] flex items-start justify-between gap-4 flex-shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dc143c]/12 border border-[#dc143c]/25 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dc143c]" />
              <span className="text-[10px] font-bold text-[#ff6b81] uppercase tracking-widest">
                Security Access
              </span>
            </div>
            <h2 className="text-[22px] font-extrabold text-white tracking-tight leading-tight mb-1">
              Location Required
            </h2>
            <p className="text-xs text-white/30">
              We need your coordinates to calculate travel fee.
            </p>
          </div>
        </div>

        <div className="px-7 py-6 space-y-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
              Required Steps
            </span>
          </div>

          <div className="flex items-center justify-between px-4 py-4 rounded-2xl border bg-white/[0.02] border-white/[0.07] hover:bg-white/[0.04] transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                <Lock className="w-4 h-4 text-white/35 group-hover:text-[#ff6b81] transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-white/75 leading-none mb-1 uppercase tracking-wide">
                  Browser Settings
                </p>
                <p className="text-[11px] text-white/30">
                  Click the lock icon in the URL bar
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-white/30 transition-transform group-hover:translate-x-1" />
          </div>

          <div className="flex items-center justify-between px-4 py-4 rounded-2xl border bg-[#dc143c]/5 border-[#dc143c]/20 hover:bg-[#dc143c]/10 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#dc143c]/15 border border-[#dc143c]/30 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-[#ff6b81]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none mb-1 uppercase tracking-wide">
                  Grant Access
                </p>
                <p className="text-[11px] text-[#ff6b81]/60 font-medium">
                  {`Set Location to "Allow"`}
                </p>
              </div>
            </div>
            <div className="px-2 py-0.5 rounded-md bg-[#dc143c]/20 border border-[#dc143c]/30 text-[9px] font-bold text-[#ff6b81] uppercase">
              Action
            </div>
          </div>
        </div>

        <div className="px-7 pb-6 pt-4 border-t border-white/[0.07] bg-[#080808] flex-shrink-0">
          <button
            onClick={handleReload}
            className="w-full group flex items-center justify-between h-[52px] px-5 bg-[#dc143c] hover:bg-[#c01236] active:scale-[0.98] rounded-2xl transition-all duration-200 shadow-lg shadow-[#dc143c]/25 overflow-hidden relative"
          >
            <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <span className="text-white font-extrabold text-sm tracking-wide relative">
              Reload Booking Page
            </span>
            <div className="flex items-center gap-3 relative">
              <span className="w-px h-5 bg-white/20" />
              <RefreshCw className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
