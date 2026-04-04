"use client";

import Link from "next/link";
import {
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  AlertTriangle,
  Wrench,
  CloudRain,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Footer from "../components/Footer";
import { ReactNode } from "react";

const config = {
  fee: process.env.NEXT_PUBLIC_TRAVEL_FEE_PER_KM,
  free_distance: process.env.NEXT_PUBLIC_FREE_TRAVEL_DISTANCE_KM,
  deposit: process.env.NEXT_PUBLIC_DOWN_PAYMENT_PERCENTAGE,
};

const PolicyPage = () => {
  const policies = [
    {
      id: "01",
      icon: <Calendar className="w-5 h-5" />,
      title: "Availability & Schedule",
      description:
        "Our services are currently available on weekends, with limited availability during selected holidays. We operate by appointment only.",
      highlights: [
        "Weekends only",
        "By appointment only",
        "Early booking recommended",
      ],
    },
    {
      id: "02",
      icon: <Clock className="w-5 h-5" />,
      title: "Advance Requirement",
      description:
        "Appointments must be scheduled at least 24 hours prior. Your appointment is not officially confirmed until you receive our notice.",
      highlights: ["24h Lead time", "Verification required"],
    },
    {
      id: "03",
      icon: <CreditCard className="w-5 h-5" />,
      title: "Reservation Fee",
      description: `A non-refundable reservation fee of ${config.deposit}% to secures your exclusive slot. This fee is deducted from your total service cost and includes the travel fee.`,
      highlights: [
        `${config.deposit}% Deposit`,
        "Non-refundable",
        "Deducted from total",
      ],
    },
    {
      id: "04",
      icon: <MapPin className="w-5 h-5" />,
      title: "Travel & Distance",
      description: `Free within ${config.free_distance}km of base. Beyond ${config.free_distance}km, a travel fee of ₱${config.fee}/km applies based on Google Maps driving distance.`,
      highlights: [
        `Free < ${config.free_distance}km`,
        `₱${config.fee}/km excess`,
        "20km Max radius",
      ],
    },
    {
      id: "05",
      icon: <AlertTriangle className="w-5 h-5" />,
      title: "Cancellation Policy",
      description:
        "Rescheduling must be requested at least 24 hours before your appointment. Late cancellations result in fee forfeiture.",
      highlights: ["24h Reschedule window", "Late cancel = Forfeit deposit"],
    },
    {
      id: "06",
      icon: <Wrench className="w-5 h-5" />,
      title: "Service Conditions",
      description:
        "We require access to electricity, water, and a dedicated safe work area. We do not provide services on illegal sidewalks.",
      highlights: ["Water & Power access", "Safe work zone", "No sidewalk work"],
    },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-[#dc143c]/30">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#dc143c]/10 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-[#dc143c]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                Operating Protocols
              </span>
            </div>

            <h1 className="font-russo text-5xl md:text-7xl lg:text-8xl tracking-tighter uppercase leading-none">
              The <span className="text-[#dc143c]">Red Line</span> <br />
              Standard
            </h1>

            <p className="max-w-2xl text-gray-500 text-sm md:text-base leading-relaxed font-medium">
              We deliver an elite, showroom-quality finish with zero compromise.
              Review our terms of engagement to ensure a seamless detailing
              experience.
            </p>
          </div>
        </div>
      </section>

      {/* --- PROTOCOL GRID --- */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="group relative bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 transition-all duration-500 hover:bg-white/[0.04] hover:border-[#dc143c]/30"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="p-3 bg-[#dc143c]/10 rounded-xl group-hover:scale-110 transition-transform">
                  <div className="text-[#dc143c]">{policy.icon}</div>
                </div>
                <span className="font-russo text-3xl text-white/5 group-hover:text-[#dc143c]/10 transition-colors">
                  {policy.id}
                </span>
              </div>

              <h3 className="font-russo text-xl uppercase tracking-tighter mb-4 group-hover:text-[#dc143c] transition-colors">
                {policy.title}
              </h3>

              <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                {policy.description}
              </p>

              {/* Tag Highlights */}
              <div className="flex flex-wrap gap-2">
                {policy.highlights.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 border border-white/5 rounded-md text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Details (Weather & Pricing) */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SecondaryPolicy
            icon={<CloudRain className="w-5 h-5" />}
            title="Weather Contingency"
            text="Severe weather may affect appointments. We may reschedule to maintain quality or offer a full refund if rescheduling is impossible."
          />
          <SecondaryPolicy
            icon={<DollarSign className="w-5 h-5" />}
            title="Dynamic Pricing"
            text="Rates are fixed by vehicle size, but condition-based adjustments may apply. All changes are approved prior to starting work."
          />
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-r from-[#dc143c] to-[#8B0E2A] p-12 md:p-20 text-center">
          {/* Visual Flare */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 skew-x-[45deg] translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-white mb-6 opacity-50" />
            <h2 className="font-russo text-3xl md:text-5xl text-white uppercase tracking-tighter mb-6">
              Ready for the <br /> Perfectionist touch?
            </h2>
            <Link
              href="/booking"
              className="group flex items-center gap-3 bg-white text-black font-russo uppercase tracking-widest px-10 py-5 rounded-2xl hover:bg-black hover:text-white transition-all shadow-2xl"
            >
              Initialize Booking
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

/* --- Helper Components --- */

const SecondaryPolicy = ({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) => (
  <div className="flex items-start gap-6 p-8 bg-white/[0.01] border border-white/5 rounded-[2rem] hover:border-white/10 transition-colors">
    <div className="p-3 bg-white/5 rounded-xl text-[#dc143c]">{icon}</div>
    <div>
      <h4 className="font-russo text-lg uppercase tracking-tighter mb-2">
        {title}
      </h4>
      <p className="text-gray-500 text-sm leading-relaxed font-medium">
        {text}
      </p>
    </div>
  </div>
);

export default PolicyPage;
