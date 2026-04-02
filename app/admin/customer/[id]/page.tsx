"use client";

import { motion } from "framer-motion";
import {
  User,
  Trophy,
  Car,
  Bike,
  Activity,
  History,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  CalendarDays,
  Clock,
  Facebook,
  ShieldCheck,
  CheckCircle2, // New icon for the badge
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ─── Mock Data ─── */
const customerData = {
  name: "Eric Monterozo",
  contact_number: "09122011108",
  social: "https://www.facebook.com/emonterozo",
  address: "BLK 31 LOT 17 Gardenia Street Harmony Hills 2",
  email: "test@gmail.com",
  earned_points: 42,
  is_verified: true, // Data flag
  milestone_count: [
    { _id: "1", vehicle_size: "sm", progress: 2, type: 'car' },
    { _id: "2", vehicle_size: "md", progress: 1, type: 'car' },
    { _id: "3", vehicle_size: "lg", progress: 0, type: 'car' },
    { _id: "4", vehicle_size: "xl", progress: 1, type: 'car' },
    { _id: "5", vehicle_size: "xxl", progress: 0, type: 'car' },
    { _id: "6", vehicle_size: "sm", progress: 3, type: 'moto' },
    { _id: "7", vehicle_size: "md", progress: 0, type: 'moto' },
    { _id: "8", vehicle_size: "lg", progress: 1, type: 'moto' },
  ],
  bookings: [
    { id: "BK-9921", vehicle: "Toyota Vios (Sedan)", date: "Apr 12, 2026", slot: "09:00 AM", status: "Completed" },
    { id: "BK-8842", vehicle: "Honda Click (Moto)", date: "Mar 28, 2026", slot: "02:00 PM", status: "Reserved" },
    { id: "BK-7712", vehicle: "Ford Ranger (Pickup)", date: "Feb 15, 2026", slot: "10:30 AM", status: "Completed" },
  ]
};

export default function CustomerDetails() {
  return (
    <section className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* ── HEADER ── */}
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
                  {customerData.name}
                </h1>
                {/* ── VERIFIED BADGE ── */}
                {customerData.is_verified && (
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="flex items-center justify-center p-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  >
                    <CheckCircle2 className="w-5 h-5 md:w-7 md:h-7 text-emerald-400 fill-emerald-400/10" />
                  </motion.div>
                )}
              </div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.4em]">Premium Member Since 2025</p>
            </div>
          </div>
          <div className="px-8 py-5 rounded-[2.5rem] bg-white/[0.03] border border-white/10 flex flex-col items-center">
            <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Loyalty Points</span>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-3xl font-russo">{customerData.earned_points}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-12">
        
        {/* ── VERTICAL INFO GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Contact Info (Vertical stacked) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-md space-y-10"
          >
            <div className="flex items-center gap-3 text-[#dc143c]">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em]">Contact Profile</h3>
            </div>

            <div className="space-y-8">
              <div className="group">
                <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest flex items-center gap-2 mb-2">
                  <Mail className="w-3 h-3 text-[#dc143c]" /> Email Address
                </label>
                <p className="text-gray-200 font-medium text-sm transition-colors group-hover:text-white">{customerData.email}</p>
              </div>

              <div className="group">
                <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest flex items-center gap-2 mb-2">
                  <Phone className="w-3 h-3 text-[#dc143c]" /> Mobile Number
                </label>
                <p className="text-gray-200 font-medium text-sm transition-colors group-hover:text-white">{customerData.contact_number}</p>
              </div>

              <div className="group overflow-hidden">
                <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest flex items-center gap-2 mb-2">
                  <Facebook className="w-3 h-3 text-[#1877F2]" /> Social Media
                </label>
                <a href={customerData.social} className="text-[#ff6b81] font-bold text-xs hover:underline truncate block">
                  {customerData.social}
                </a>
              </div>

              <div className="pt-6 border-t border-white/5 group">
                <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest flex items-center gap-2 mb-3">
                  <MapPin className="w-3 h-3 text-[#dc143c]" /> Location
                </label>
                <p className="text-gray-400 text-xs leading-relaxed italic pr-4 transition-colors group-hover:text-gray-200">
                  "{customerData.address}"
                </p>
              </div>
            </div>
          </motion.div>

          {/* Column 2: Service Progress */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-2 p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-md"
          >
            <div className="flex items-center gap-3 text-[#dc143c] mb-10">
              <Activity className="w-5 h-5" />
              <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em]">Service Milestones</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {customerData.milestone_count.map((m, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center group hover:bg-[#dc143c]/5 transition-all duration-300">
                  <div className="mb-3 p-2 rounded-xl bg-white/5 text-gray-500 group-hover:text-[#dc143c] transition-colors">
                    {m.type === 'car' ? <Car className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
                  </div>
                  <span className="text-[9px] text-gray-600 font-black uppercase tracking-tighter mb-1">{m.vehicle_size}</span>
                  <span className="text-3xl font-russo text-white group-hover:scale-110 transition-transform">{m.progress}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── FULL WIDTH TABLE SECTION ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#dc143c]">
                <History className="w-5 h-5" />
              </div>
              <h3 className="font-russo text-2xl uppercase tracking-tight">Booking History</h3>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-white/[0.01] border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <Table className="table-fixed w-full min-w-[900px]">
                <TableHeader className="bg-white/[0.04]">
                  <TableRow className="border-white/10 h-20">
                    <TableHead className="w-[140px] px-10 text-gray-500 text-[10px] uppercase font-black tracking-widest">ID</TableHead>
                    <TableHead className="px-6 text-gray-500 text-[10px] uppercase font-black tracking-widest">Vehicle Details</TableHead>
                    <TableHead className="w-[220px] px-6 text-gray-500 text-[10px] uppercase font-black tracking-widest text-center">Schedule</TableHead>
                    <TableHead className="w-[180px] px-6 text-center text-gray-500 text-[10px] uppercase font-black tracking-widest">Status</TableHead>
                    <TableHead className="w-[120px] px-10 text-right text-gray-500 text-[10px] uppercase font-black tracking-widest">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerData.bookings.map((booking) => (
                    <TableRow key={booking.id} className="border-white/[0.05] hover:bg-white/[0.03] transition-all h-24 group">
                      <TableCell className="px-10 font-bold text-xs text-[#ff6b81]">{booking.id}</TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                             {booking.vehicle.includes('Moto') ? <Bike className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                           </div>
                           <span className="text-sm font-semibold text-gray-200">{booking.vehicle}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 text-center">
                        <div className="flex flex-col gap-1 items-center">
                          <div className="flex items-center gap-2 text-xs text-gray-200 font-bold">
                            <CalendarDays className="w-3.5 h-3.5 text-[#dc143c]" /> {booking.date}
                          </div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
                            {booking.slot}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 text-center">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                          booking.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        }`}>
                          {booking.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-10 text-right">
                        <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-[#dc143c] hover:border-[#dc143c] transition-all group/btn shadow-lg">
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}