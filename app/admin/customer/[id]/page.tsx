"use client";

import { motion } from "framer-motion";
import { 
  User, 
  MapPin, 
  Trophy, 
  History, 
  Mail, 
  Phone, 
  Facebook, 
  Car, 
  Bike,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { FieldLabel } from "@/components/ui/field";

/* ─── Reuse Shared Components ─── */
function SectionCard({
  icon,
  title,
  subtitle,
  children,
  last,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className="relative">
      {!last && (
        <div className="absolute left-5 top-14 bottom-0 w-px bg-gradient-to-b from-[#dc143c]/40 to-transparent z-0" />
      )}
      <div className="relative z-10 flex gap-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#dc143c] flex items-center justify-center text-white shadow-lg shadow-[#dc143c]/30">
          {icon}
        </div>
        <div className="flex-1 pb-10">
          <div className="mb-4">
            <h3 className="text-white font-semibold text-lg leading-tight tracking-tight">{title}</h3>
            {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
  return (
    <div className="space-y-2">
      <FieldLabel className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2">
        {Icon && <Icon className="w-3 h-3 text-[#dc143c]" />} {label}
      </FieldLabel>
      <div className="h-12 px-4 flex items-center rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm font-medium truncate">
        {value || "—"}
      </div>
    </div>
  );
}

/* ─── Mock Data ─── */
const customerData = {
  name: "Eric Monterozo",
  contact_number: "09122011108",
  social: "https://www.facebook.com/emonterozo",
  address: "BLK 31 LOT 17 Gardenia Street Harmony Hills 2",
  email: "test@gmail.com",
  earned_points: 42,
  milestone_count: [
    { _id: "1", vehicle_type: "car", vehicle_size: "sm", progress: 2 },
    { _id: "2", vehicle_type: "car", vehicle_size: "md", progress: 1 },
    { _id: "3", vehicle_type: "car", vehicle_size: "lg", progress: 0 },
    { _id: "4", vehicle_type: "car", vehicle_size: "xl", progress: 1 },
    { _id: "5", vehicle_type: "car", vehicle_size: "xxl", progress: 0 },
    { _id: "6", vehicle_type: "motorcycle", vehicle_size: "sm", progress: 2 },
    { _id: "7", vehicle_type: "motorcycle", vehicle_size: "md", progress: 1 },
    { _id: "8", vehicle_type: "motorcycle", vehicle_size: "lg", progress: 0 },
    // ... rest of data
  ],
  milestone_claimed: [
    {
      service_id: "69cbcf3b6ef2c54804ceadc2",
      price: 400,
      vehicle_model: "Toyota Vios",
      discount: 250,
      claimed_at: "2026-04-02T06:05:58.546Z",
    }
  ]
};

export default function CustomerDetails() {
  return (
    <section className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Polish */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-[#dc143c]/[0.05] blur-[140px]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dc143c]/10 border border-[#dc143c]/20 text-[#dc143c] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            Customer Profile
          </div>
          <h2 className="font-russo text-4xl md:text-6xl font-extrabold text-white tracking-tighter uppercase">
            {customerData.name.split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff6b81]">{customerData.name.split(' ')[1]}</span>
          </h2>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-[px] w-12 bg-gradient-to-r from-transparent to-[#dc143c]" />
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-white font-bold">{customerData.earned_points} Points</span>
            </div>
            <div className="h-[px] w-12 bg-gradient-to-l from-transparent to-[#dc143c]" />
          </div>
        </motion.div>

        {/* ── Section 1: Personal Info ── */}
        <SectionCard 
          icon={<User className="w-4 h-4" />} 
          title="Contact Information" 
          subtitle="Basic identity and social handles."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReadOnlyField label="Email Address" value={customerData.email} icon={Mail} />
            <ReadOnlyField label="Contact Number" value={customerData.contact_number} icon={Phone} />
            <div className="md:col-span-2">
              <ReadOnlyField label="Social Profile" value={customerData.social} icon={Facebook} />
            </div>
            <div className="md:col-span-2 space-y-2">
               <FieldLabel className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                <MapPin className="w-3 h-3 text-[#dc143c]" /> Complete Address
              </FieldLabel>
              <div className="p-4 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm">
                {customerData.address}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Section 2: Milestone Progress ── */}
        <SectionCard 
          icon={<Activity className="w-4 h-4" />} 
          title="Service Progress" 
          subtitle="Count of services per vehicle size."
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {customerData.milestone_count.map((m) => (
              <div key={m._id} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col items-center text-center group hover:border-[#dc143c]/50 transition-colors">
                {m.vehicle_type === 'car' ? <Car className="w-5 h-5 text-gray-500 mb-2" /> : <Bike className="w-5 h-5 text-gray-500 mb-2" />}
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">{m.vehicle_size}</span>
                <span className="text-2xl font-russo text-white mt-1 group-hover:text-[#dc143c] transition-colors">{m.progress}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Section 3: Claims Table ── */}
        <SectionCard 
          icon={<History className="w-4 h-4" />} 
          title="Milestone Claims" 
          subtitle="History of redeemed discounts and rewards."
          last
        >
          <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20">
            <Table className="table-fixed w-full">
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="w-[140px] text-gray-400 text-[10px] uppercase font-bold">Date</TableHead>
                  <TableHead className="w-[180px] text-gray-400 text-[10px] uppercase font-bold">Vehicle</TableHead>
                  <TableHead className="text-gray-400 text-[10px] uppercase font-bold text-right">Benefit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerData.milestone_claimed.map((claim, i) => (
                  <TableRow key={i} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                    <TableCell className="text-xs text-white">
                      {new Date(claim.claimed_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-white font-medium truncate" title={claim.vehicle_model}>
                        {claim.vehicle_model}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                        ₱{claim.discount.toLocaleString()} OFF
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {customerData.milestone_claimed.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-gray-600 text-xs italic">
                      No milestones claimed yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </SectionCard>

      </div>
    </section>
  );
}