"use client";

import React, { useEffect, useState } from "react";
import { 
  LayoutDashboard, ShieldCheck, Settings, Bell, 
  Eye, Users, MessageSquare, CalendarCheck, 
  Receipt, TrendingUp, Tag, ArrowUpRight 
} from "lucide-react";
import { getStatistics, StatisticsResponse } from "../actions/getStatistics";

/* ── COMPONENT: HEADER ── */
const DashboardHeader = () => (
  <header className="relative pt-10 pb-8">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md mb-5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#dc143c] shadow-[0_0_8px_#dc143c]" />
          <span className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">System Live</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase leading-none">
          Admin 
          <span className="relative inline-block ml-3">
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">Panel</span>
            <span className="absolute -bottom-1 left-0 w-full h-[6px] bg-[#dc143c] -skew-x-12 -z-0" />
          </span>
        </h1>
        <p className="text-gray-500 mt-4 text-sm font-medium">
          Red Line Detailing <span className="text-gray-800 mx-2">/</span> Performance Metrics
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex bg-white/[0.03] border border-white/[0.08] rounded-2xl p-1">
           <button className="p-2.5 hover:bg-white/[0.05] rounded-xl text-gray-500 transition-all"><Bell size={18} /></button>
           <button className="p-2.5 hover:bg-white/[0.05] rounded-xl text-gray-500 transition-all"><Settings size={18} /></button>
        </div>
        <div className="flex items-center gap-4 pl-4 border-l border-white/[0.1]">
          <div className="text-right hidden sm:block">
            <p className="text-white font-bold text-sm">Administrator</p>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center justify-end gap-1">
              Online <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#222] to-[#111] border border-white/10 flex items-center justify-center text-[#ff6b81] shadow-xl">
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>
    </div>

    <div className="mt-10 flex items-center gap-1">
      <div className="h-1 w-12 bg-[#dc143c] rounded-full" />
      <div className="h-1 w-2 bg-white/10 rounded-full" />
      <div className="h-1 w-2 bg-white/10 rounded-full" />
      <div className="ml-4 flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  </header>
);

/* ── COMPONENT: METRIC CARD ── */
function MetricCard({ icon: Icon, label, value, sub, accent }: any) {
  return (
    <div className={`group relative flex flex-col h-full rounded-3xl border p-6 transition-all duration-500 
      ${accent 
        ? "bg-gradient-to-br from-[#dc143c]/15 via-[#0A0A0A] to-[#0A0A0A] border-[#dc143c]/30 shadow-[0_20px_40px_rgba(0,0,0,0.4)]" 
        : "bg-[#0A0A0A]/60 backdrop-blur-md border-white/[0.05] hover:border-white/20 shadow-xl"
      }`}>
      
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl transition-transform duration-500 group-hover:scale-110
          ${accent ? "bg-[#dc143c] text-white shadow-[0_0_15px_rgba(220,20,60,0.4)]" : "bg-white/[0.03] text-gray-400 group-hover:text-white"}`}>
          <Icon size={20} />
        </div>
        {accent && <ArrowUpRight className="text-[#dc143c] opacity-40 group-hover:opacity-100 transition-opacity" size={20} />}
      </div>

      <div className="space-y-1">
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.15em]">{label}</p>
        <p className={`text-3xl font-bold tracking-tighter ${accent ? "text-white" : "text-gray-100"}`}>{value}</p>
      </div>

      {sub && (
        <div className="mt-6 pt-5 border-t border-white/[0.05] space-y-2.5">
          {sub.map((s: any) => (
            <div key={s.label} className="flex justify-between items-center group/item">
              <span className="text-gray-500 text-[11px] group-hover/item:text-gray-300 transition-colors">{s.label}</span>
              <span className="text-gray-200 text-[11px] font-mono font-medium">{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── MAIN DASHBOARD ── */
const AdminDashboard = () => {
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [activeFilter, setActiveFilter] = useState("All Time");

  useEffect(() => {
    getStatistics().then(setStatistics);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#dc143c]/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#dc143c]/[0.03] blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#dc143c]/[0.02] blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pb-20">
        <DashboardHeader />

        <section className="mt-12 space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-white/[0.02] border border-white/[0.05] rounded-2xl w-fit">
            {["All Time", "Today", "Week", "Month"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all
                  ${activeFilter === f ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Row 1: Operations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard icon={Eye} label="Total Traffic" value={statistics?.visit.total ?? 0} sub={[{ label: "Daily Unique", value: statistics?.visit.today ?? 0 }]} />
            <MetricCard icon={Users} label="Client Base" value={statistics?.customer?.total ?? 0} sub={[{ label: "New Leads", value: statistics?.customer?.new_this_month ?? 0 }]} />
            <MetricCard icon={MessageSquare} label="Inquiries" value={statistics?.inquiry.total ?? 0} sub={[{ label: "Pending", value: statistics?.inquiry.new ?? 0 }, { label: "Closed", value: statistics?.inquiry.completed ?? 0 }]} />
            <MetricCard icon={CalendarCheck} label="Active Bookings" value={statistics?.booking.total ?? 0} sub={[{ label: "Reserved", value: statistics?.booking.reserved ?? 0 }, { label: "Check-ins", value: statistics?.booking.for_checking ?? 0 }]} />
          </div>

          {/* Row 2: Financials */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <MetricCard icon={Receipt} label="Total Orders" value={statistics?.transaction?.total ?? 0} sub={[{ label: "Walk-ins", value: statistics?.transaction?.walk_in ?? 0 }, { label: "Web Bookings", value: statistics?.transaction?.from_booking ?? 0 }]} />
            <MetricCard accent icon={TrendingUp} label="Gross Revenue" value={`₱${(statistics?.transaction?.total_amount ?? 0).toLocaleString()}`} sub={[{ label: "Per Transaction", value: `₱${(statistics?.transaction?.avg_amount ?? 0).toLocaleString()}` }]} />
            <MetricCard icon={Tag} label="Adjustments" value={`₱${(statistics?.transaction?.total_discount ?? 0).toLocaleString()}`} sub={[{ label: "Promotions", value: `₱${(statistics?.transaction?.total_milestone_discount ?? 0).toLocaleString()}` }, { label: "Manual", value: `₱${(statistics?.transaction?.total_manual_discount ?? 0).toLocaleString()}` }]} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;