"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar,
  Clock,
  Car,
  Wrench,
  MapPin,
  User,
  Phone,
  ArrowRight,
  Home,
  Share2,
  ShieldCheck,
  Zap
} from "lucide-react";

/* ─── Sample data ─── */
const SAMPLE_BOOKING = {
  bookingId: "a3f8c01269ce03c8",
  name: "Eric Monterozo",
  contactNumber: "09122011108",
  vehicleModel: "Toyota Vios 2021",
  services: [
    { _id: "1", title: "Premium Detailer Wash" },
    { _id: "2", title: "Interior Vacuum" },
  ],
  addOns: [
    { _id: "3", title: "Engine Bay Cleaning" },
    { _id: "4", title: "Tire Dressing" },
  ],
  preferredDate: "2026-05-10T00:00:00.000Z",
  timeSlot: "9:00 AM – 11:00 AM",
  address: "BLK 31 LOT 17 Gardenia Street, Harmony Hills 2",
  reservationFee: 200,
  totalAmount: 1350,
  createdAt: "2026-04-04T10:32:00.000Z",
};

/* ─── Refined Sub-components ─── */
function SuccessRing() {
  return (
    <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-8">
      <div className="absolute inset-0 rounded-full bg-[#dc143c]/10 animate-ping duration-[2000ms]" />
      <div className="relative w-16 h-16 rounded-2xl bg-[#0a0a0a] border border-[#dc143c]/30 flex items-center justify-center shadow-[0_0_30px_rgba(220,20,60,0.2)] rotate-3 hover:rotate-0 transition-transform duration-500">
        <CheckCircle2 className="w-8 h-8 text-[#dc143c]" />
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/[0.03] last:border-0 group">
      <div className="flex items-center gap-3">
        <div className="text-gray-600 group-hover:text-[#dc143c] transition-colors">{icon}</div>
        <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="text-white text-sm font-semibold tracking-tight">{value || "—"}</p>
    </div>
  );
}

function Chip({ label, neutral }: { label: string; neutral?: boolean }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
      neutral 
        ? "bg-white/[0.02] border-white/10 text-gray-500" 
        : "bg-[#dc143c]/5 border-[#dc143c]/20 text-[#ff6b81]"
    }`}>
      {label}
    </span>
  );
}

/* ─── Main Page ─── */
export default function BookingConfirmation() {
  const booking = SAMPLE_BOOKING;
  const formattedDate = new Date(booking.preferredDate).toLocaleDateString("en-US", {
    weekday: "short", month: "long", day: "numeric", year: "numeric",
  });
  const shortId = `#${booking.bookingId.slice(-8).toUpperCase()}`;
  const remaining = Math.max(0, booking.totalAmount - booking.reservationFee);

  return (
    <section className="min-h-screen bg-[#050505] relative overflow-hidden flex items-center justify-center py-12 px-4">
      {/* Precision Grid & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_100%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#dc143c]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-1000">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <SuccessRing />
          <h1 className="text-4xl font-russo italic text-white uppercase tracking-tighter mb-2">
            YOU'RE <span className="text-[#dc143c]">ALL SET.</span>
          </h1>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="px-3 py-1 rounded-md bg-white/[0.03] border border-white/10 text-[10px] font-black text-gray-500 tracking-[0.2em]">
              ID: <span className="text-white">{shortId}</span>
            </div>
            <div className="px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              VERIFIED
            </div>
          </div>
        </div>

        {/* ── The Digital Ticket ── */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
          {/* Accent Line */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#dc143c] to-transparent opacity-50" />

          {/* Schedule Banner */}
          <div className="bg-[#dc143c]/5 border-b border-white/5 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#dc143c]" />
              </div>
              <div>
                <p className="text-white font-bold text-sm tracking-tight">{formattedDate}</p>
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-0.5">{booking.timeSlot}</p>
              </div>
            </div>
            <Zap className="w-5 h-5 text-[#dc143c] opacity-20" />
          </div>

          <div className="p-8 space-y-6">
            {/* Core Info */}
            <div className="grid grid-cols-1 gap-1">
               <InfoRow icon={<User size={14}/>} label="Client" value={booking.name} />
               <InfoRow icon={<Car size={14}/>} label="Vehicle" value={booking.vehicleModel} />
               <InfoRow icon={<MapPin size={14}/>} label="Location" value={booking.address} />
            </div>

            {/* Services & Add-ons Overlay */}
            <div className="pt-4 border-t border-white/[0.03] space-y-4">
              <div className="flex flex-wrap gap-2">
                {booking.services.map((s) => <Chip key={s._id} label={s.title} />)}
                {booking.addOns.map((a) => <Chip key={a._id} label={a.title} neutral />)}
              </div>
            </div>

            {/* Pricing Ledger */}
            <div className="mt-8 bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between text-xs font-medium text-gray-500">
                <span>Reservation Fee Paid</span>
                <span className="text-white">₱{booking.reservationFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-gray-500">
                <span>Remaining on Service</span>
                <span className="text-white">₱{remaining.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Total Est. Investment</span>
                <span className="text-2xl font-russo text-[#ff6b81]">₱{booking.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Premium Note */}
            <div className="flex gap-4 p-4 rounded-2xl bg-[#dc143c]/5 border border-[#dc143c]/10">
              <ShieldCheck className="w-5 h-5 text-[#dc143c] flex-shrink-0" />
              <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                Our specialists will review your appointment details. You will receive a final confirmation via SMS once your <span className="text-white">Reservation Fee</span> is verified.
              </p>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
           <Link href="/booking" className="sm:col-span-2">
              <button className="w-full h-14 bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3">
                Book Another Service <ArrowRight size={14}/>
              </button>
           </Link>
           <button className="h-14 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 flex items-center justify-center gap-2">
             <Home size={14} className="text-gray-500"/> Dashboard
           </button>
           <button 
             onClick={() => {/* Share Logic */}}
             className="h-14 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 flex items-center justify-center gap-2">
             <Share2 size={14} className="text-gray-500"/> Share Ticket
           </button>
        </div>
      </div>
    </section>
  );
}