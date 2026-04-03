"use client";

import { MilestoneCount } from "@/lib/db/types";
import { VehicleType } from "@/lib/enums";
import { motion } from "framer-motion";
import {
  Car,
  Bike,
  Activity,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Globe,
} from "lucide-react";

interface CustomerInfoProps {
  email: string;
  contactNumber: string;
  social: string;
  address: string;
  milestoneCount: MilestoneCount[];
}

export default function CustomerInfo({
  email,
  contactNumber,
  social,
  address,
  milestoneCount,
}: Readonly<CustomerInfoProps>) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Column 1: Contact Info (Vertical stacked) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-1 p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-md space-y-10"
      >
        <div className="flex items-center gap-3 text-[#dc143c]">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em]">
            Contact Profile
          </h3>
        </div>

        <div className="space-y-8">
          <div className="group">
            <label className="text-[12px] text-gray-600 uppercase font-black tracking-widest flex items-center gap-2 mb-2">
              <Mail className="w-3 h-3 text-[#dc143c]" /> Email Address
            </label>
            <p className="text-gray-200 font-medium text-sm transition-colors group-hover:text-white">
              {email}
            </p>
          </div>

          <div className="group">
            <label className="text-[12px] text-gray-600 uppercase font-black tracking-widest flex items-center gap-2 mb-2">
              <Phone className="w-3 h-3 text-[#dc143c]" /> Mobile Number
            </label>
            <p className="text-gray-200 font-medium text-sm transition-colors group-hover:text-white">
              {contactNumber}
            </p>
          </div>

          <div className="group overflow-hidden">
            <label className="text-[12px] text-gray-600 uppercase font-black tracking-widest flex items-center gap-2 mb-2">
              <Globe className="w-3 h-3 text-[#dc143c]" /> Social Account
            </label>
            <a
              href={social}
              className="text-[#ff6b81] font-bold text-xs hover:underline truncate block"
            >
              {social}
            </a>
          </div>

          <div className="pt-6 border-t border-white/5 group">
            <label className="text-[12px] text-gray-600 uppercase font-black tracking-widest flex items-center gap-2 mb-3">
              <MapPin className="w-3 h-3 text-[#dc143c]" /> Location
            </label>
            <p className="text-gray-400 text-xs leading-relaxed italic pr-4 transition-colors group-hover:text-gray-200">
              {address}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Column 2: Service Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="lg:col-span-2 p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-md"
      >
        <div className="flex items-center gap-3 text-[#dc143c] mb-10">
          <Activity className="w-5 h-5" />
          <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em]">
            Service Milestones
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {milestoneCount.map((milestone) => (
            <div
              key={milestone._id}
              className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center group hover:bg-[#dc143c]/5 transition-all duration-300"
            >
              <div className="mb-3 p-2 rounded-xl bg-white/5 text-gray-500 group-hover:text-[#dc143c] transition-colors">
                {milestone.vehicle_type === VehicleType.CAR ? (
                  <Car className="w-5 h-5" />
                ) : (
                  <Bike className="w-5 h-5" />
                )}
              </div>
              <span className="text-[12px] text-gray-600 font-black uppercase tracking-tighter mb-1">
                {milestone.vehicle_size}
              </span>
              <span className="text-3xl font-russo text-white group-hover:scale-110 transition-transform">
                {milestone.progress}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
