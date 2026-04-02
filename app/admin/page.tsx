"use client";

import RecentBookings from "../components/RecentBookings";
import RecentInquiries from "../components/RecentInquiries";

import AdminDashboard from "../components/AdminDashboard";
import { useRouter } from "next/navigation";
import { Plus, LayoutDashboard } from "lucide-react";
import RecentTransactions from "../components/RecentTransactions";
import RecentCustomers from "../components/RecentCustomers";

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-x-hidden">
      {/* ambient glows */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full bg-[#dc143c]/[0.05] blur-[140px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-[#dc143c]/[0.03] blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Header ── */}
        <header className="mb-12">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#dc143c]/30 bg-[#dc143c]/10 text-[#ff6b81] text-xs font-semibold tracking-widest uppercase mb-4">
                <LayoutDashboard className="w-3 h-3" />
                Admin Panel
              </div>
              <h2 className="font-russo text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Admin{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff6b81]">
                  Dashboard
                </span>
              </h2>
              <p className="text-gray-500 mt-2 text-sm max-w-md">
                Overview of Red Line Detailing &amp; Auto Spa performance
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs text-gray-600 uppercase tracking-widest">
                Welcome back
              </div>
              <div className="font-bold text-white text-lg mt-0.5">
                Administrator
              </div>
              <div className="mt-1 flex justify-end">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-gray-600 ml-1.5">Online</span>
              </div>
            </div>
          </div>

          {/* decorative rule */}
          <div className="flex items-center gap-3 mt-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#dc143c]/30 to-transparent" />
            <div className="w-1.5 h-1.5 rotate-45 bg-[#dc143c]" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#dc143c]/30 to-transparent" />
          </div>
        </header>

        {/* ── Stats ── */}
        <AdminDashboard />

        {/* ── Tables ── */}
        <RecentBookings />
        {/* <RecentTransactions />
        <RecentCustomers />
        <RecentInquiries /> */}
        <RecentInquiries />
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => router.push("/admin/transaction")}
        className="group fixed bottom-6 right-6 z-50 flex items-center gap-3 pl-5 pr-6 h-14 rounded-full bg-[#dc143c] hover:bg-[#c01236] active:scale-95 text-white font-bold text-sm shadow-xl shadow-[#dc143c]/40 transition-all duration-200 overflow-hidden"
      >
        <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
        <Plus className="w-4 h-4" />
        Create Transaction
      </button>
    </div>
  );
}
