"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Car,
  Clock,
  Contact,
  Home,
  Info,
  Motorbike,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getBooking, IBookingResponse } from "../actions/getBooking";
import { BookingStatusDisplay, VehicleType } from "@/lib/enums";
import FullScreenLoader from "./FullScreenLoader";

const config = {
  fee: process.env.NEXT_PUBLIC_TRAVEL_FEE_PER_KM,
  free_distance: process.env.NEXT_PUBLIC_FREE_TRAVEL_DISTANCE_KM,
};

const formattedDate = (date: Date) => {
  return date.toLocaleString("en-US", {
    weekday: undefined,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function BookingConfirmation() {
  const params = useParams();
  const bookingReference = params.id;
  const [booking, setBooking] = useState<IBookingResponse | null>(null);
  const isValid = /^RL-\d{6}-[A-Z0-9]{5}$/.test(bookingReference as string);
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isValid) {
    notFound();
  }

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      if (bookingReference && typeof bookingReference === "string") {
        const bookingData = await getBooking(bookingReference);
        setBooking(bookingData);
        setIsLoading(false);
      }
    };
    init();
  }, [bookingReference]);
  return (
    <section className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {isLoading && <FullScreenLoader />}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a0508_0%,#050505_100%)]" />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[#dc143c]/[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#dc143c]/[0.04] blur-[100px]" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="font-russo text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            BOOKING{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff6b81]">
              CONFIRMATION
            </span>
          </h2>
          <p className="mt-4 text-gray-500 text-base max-w-md mx-auto">
            Your booking has been successfully received! Sit back and relax—our
            team will contact you soon to confirm the details.
          </p>
        </motion.div>

        {booking && (
          <div className="mt-16 relative group">
            <div className="absolute -inset-2 bg-[#dc143c]/5 blur-2xl rounded-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative bg-[#0c0c0c] border border-white/10 rounded-[24px] overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-sm">
              <div className="h-[2px] bg-gradient-to-r from-[#dc143c] via-[#ff6b81] to-transparent opacity-80" />

              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] bg-white/[0.01] relative">
                {/* LEFT SIDE: Date & Ref */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#dc143c]/10 border border-[#dc143c]/20 shadow-[0_0_15px_rgba(220,20,60,0.1)]">
                    <Calendar className="w-5 h-5 text-[#ff6b81]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white text-base font-bold tracking-tight">
                      {formattedDate(booking.created_at)}
                    </span>
                    <span className="text-white/30 text-[11px] uppercase tracking-[0.2em]">
                      {`REF: ${booking.reference_number}`}
                    </span>
                  </div>
                </div>

                {/* RIGHT SIDE: Status Control */}
                <div className="relative flex items-center" ref={popoverRef}>
                  {/* MANUAL TRIGGER (Mobile Only) */}
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`sm:hidden relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                      isOpen
                        ? "bg-amber-500/20 border-amber-500/50 outline-none"
                        : "bg-amber-500/30 border border-white/10"
                    }`}
                  >
                    <Info
                      size={18}
                      className={isOpen ? "text-amber-400" : "text-white/40"}
                    />
                    {!isOpen && (
                      <span className="absolute inset-0 rounded-full bg-amber-500/40 animate-ping [animation-duration:0.6s] opacity-30" />
                    )}
                  </button>

                  {/* THE MANUAL POPOVER (Bottom Positioned) */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-3 z-[100] w-56 pointer-events-auto"
                      >
                        {/* Tooltip Content Card */}
                        <div className="bg-[#0f0f0f] border border-amber-500/40 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
                            <span className="text-amber-500/50 text-[9px] font-black uppercase tracking-[0.3em]">
                              Booking Status
                            </span>
                          </div>

                          <p className="text-white text-[13px] font-bold uppercase tracking-widest">
                            {BookingStatusDisplay[booking.status]}
                          </p>
                        </div>

                        {/* Red Detail Bolt (Visual Accent) */}
                        <div className="absolute -top-1 right-4 w-2 h-2 bg-[#0f0f0f] border-t border-l border-amber-500/40 rotate-45" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* DESKTOP STATUS (Persistent) */}
                  <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-500/5 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-amber-500/90 text-[11px] font-black uppercase tracking-[0.25em]">
                      {BookingStatusDisplay[booking.status]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-white/[0.03] border border-white/[0.1] rounded-2xl p-4 hover:bg-white/[0.05] transition-colors">
                    <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.25em] mb-2">
                      Client Profile
                    </p>
                    <p className="text-white font-bold text-base leading-tight">
                      {booking.name}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-br from-[#dc143c]/20 to-[#dc143c]/5 border border-[#dc143c]/30 shadow-[0_0_15px_rgba(220,20,60,0.1)] group/badge">
                      <div className="relative flex items-center justify-center">
                        <Contact className="w-3.5 h-3.5 text-[#ff6b81] group-hover/badge:scale-110 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-[#ff6b81]/20 blur-md rounded-full" />
                      </div>

                      <span className="text-[#ff6b81] text-[10px] font-black uppercase tracking-[0.25em] leading-none">
                        {booking.contact_number}
                      </span>

                      <div className="w-[1px] h-2 bg-[#ff6b81]/20 ml-0.5" />
                    </div>
                  </div>

                  <div className="bg-white/[0.03] border border-white/[0.1] rounded-2xl p-4 hover:bg-white/[0.05] transition-colors">
                    <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.25em] mb-2">
                      Vehicle Details
                    </p>
                    <p className="text-white font-bold text-base leading-tight">
                      {booking.vehicle_model}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-br from-[#dc143c]/20 to-[#dc143c]/5 border border-[#dc143c]/30 shadow-[0_0_15px_rgba(220,20,60,0.1)] group/badge">
                      <div className="relative flex items-center justify-center">
                        {booking.size.type === VehicleType.CAR ? (
                          <Car className="w-3.5 h-3.5 text-[#ff6b81] group-hover/badge:scale-110 transition-transform duration-300" />
                        ) : (
                          <Motorbike className="w-3.5 h-3.5 text-[#ff6b81] group-hover/badge:scale-110 transition-transform duration-300" />
                        )}
                        <div className="absolute inset-0 bg-[#ff6b81]/20 blur-md rounded-full" />
                      </div>

                      <span className="text-[#ff6b81] text-[10px] font-black uppercase tracking-[0.25em] leading-none">
                        {booking.size.description.toUpperCase()}
                      </span>

                      <div className="w-[1px] h-2 bg-[#ff6b81]/20 ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3.5 bg-black/40 border border-white/[0.05] rounded-2xl">
                  <div className="w-8 h-8 rounded-full bg-white/[0.03] flex items-center justify-center border border-white/5">
                    <Clock className="w-5 h-5 text-white/40" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/40 text-[11px] font-black uppercase tracking-widest">
                      Appointment Slot
                    </span>
                    <span className="text-white/90 text-sm font-bold tracking-wide mt-1">
                      {`${booking.preferred_date.date.toDateString()} · ${booking.time_slot.time}`}
                    </span>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden shadow-inner">
                  <div className="px-5 py-3 bg-white/[0.04] border-b border-white/[0.08] flex justify-between items-center">
                    <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">
                      Selected Services
                    </span>
                    <span className="text-[11px] font-black text-white/20 uppercase tracking-widest">
                      Unit Price
                    </span>
                  </div>

                  <div className="divide-y divide-white/[0.06]">
                    {[...booking.services, ...booking.add_ons].map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center px-5 py-4 hover:bg-white/[0.01] transition-colors"
                      >
                        <div>
                          <p className="text-white/90 text-sm font-bold tracking-tight">
                            {item.title}
                          </p>
                        </div>
                        <span className="text-white font-mono text-sm font-bold">
                          {`₱${item.price.toLocaleString()}`}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-5 py-4 hover:bg-white/[0.01] transition-colors">
                      <div>
                        <p className="text-white/90 text-sm font-bold tracking-tight">
                          Travel Fee
                        </p>
                      </div>
                      <span className="text-white font-mono text-sm font-bold">
                        {`+ ₱${config.fee}/km`}
                      </span>
                    </div>
                  </div>

                  <div className="relative px-5 py-5 bg-gradient-to-b from-white/[0.04] to-transparent border-t border-white/[0.1]">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-white/40 text-[14px] font-black uppercase tracking-[0.3em]">
                          <span className="sm:hidden">Est. Total</span>
                          <span className="hidden sm:inline">
                            Estimated Total
                          </span>
                        </span>
                        <p className="text-white/60 text-[10px] italic font-medium leading-tight">
                          * Excluded Travel fee
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[#ff6b81] font-russo text-2xl tracking-tighter shadow-sm">
                          {`₱${booking.total_amount.toLocaleString()}`}
                        </span>
                        <div className="h-0.5 w-16 bg-[#dc143c] mt-1 shadow-[0_0_12px_rgba(220,20,60,0.6)]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 px-6 pb-2 text-center">
                  <p className="max-w-md mx-auto leading-relaxed">
                    <span className="text-white/40 text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em]">
                      You may save your{" "}
                      <span className="text-white/60">reference number</span> or
                      use this link to preview your booking anytime. Our team
                      will still reach out to
                      <span className="text-[#ff6b81]/50">
                        {" "}
                        confirm the details
                      </span>
                      .
                    </span>
                  </p>
                </div>

                <div className="pt-4">
                  <Link href="/">
                    <button className="w-full relative group/btn overflow-hidden rounded-xl bg-white/[0.03] border border-white/10 py-4 transition-all hover:border-[#dc143c]/50">
                      <div className="absolute inset-0 bg-[#dc143c] translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-300" />
                      <div className="relative flex items-center justify-center gap-3">
                        <Home className="w-4 h-4 text-white group-hover/btn:scale-110 transition-transform" />
                        <span className="text-white text-xs font-black uppercase tracking-[0.3em]">
                          Return to Main Page
                        </span>
                      </div>
                    </button>
                  </Link>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <div className="h-px w-8 bg-white/5" />
                  <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">
                    Red Line Detailing
                  </p>
                  <div className="h-px w-8 bg-white/5" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
