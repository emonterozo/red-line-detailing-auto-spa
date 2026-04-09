"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import Header from "./Header";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-[#050505] font-sans overflow-hidden">
      <Header />

      <section className="relative h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Luxury Car Detailing"
            fill
            style={{ objectFit: "cover" }}
            className="opacity-60 scale-105"
            quality={90}
            priority
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-transparent lg:via-black/80"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>

        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[15%] right-0 lg:right-10 w-72 h-72 bg-[#dc143c] rounded-full blur-[120px] pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-[20%] left-0 lg:left-10 w-48 h-48 bg-[#dc143c] rounded-full blur-[100px] pointer-events-none"
        />

        <div className="relative z-10 max-w-7xl w-full mx-auto flex items-center">
          <div className="flex-1 space-y-6 lg:space-y-8 pt-10 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl"
            >
              <span className="w-2 h-2 bg-[#dc143c] rounded-full animate-pulse shadow-[0_0_12px_#dc143c]"></span>
              <span className="font-russo text-white/80 text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase">
                Premium Auto Care
              </span>
            </motion.div>

            <h1 className="font-russo text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-extrabold text-white leading-[0.9] tracking-tighter drop-shadow-2xl">
              Precision. Passion. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] via-[#ff4d6d] to-[#dc143c] bg-[length:200%_auto] animate-gradient">
                Perfection.
              </span>
            </h1>

            <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl max-w-lg lg:max-w-xl leading-relaxed border-l-2 border-[#dc143c]/30 pl-6">
              We specialize in paint-safe detailing using premium techniques.
              Every vehicle is treated with meticulous care — no shortcuts, no
              compromise.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/booking"
                className="group relative overflow-hidden bg-[#dc143c] text-white font-black py-4 px-10 rounded-2xl transition-all duration-500 shadow-[0_10px_40px_rgba(220,20,60,0.3)] hover:shadow-[0_15px_50px_rgba(220,20,60,0.5)] flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
              >
                <span className="relative z-10">Book a Service</span>
                <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <div className="group flex items-center gap-4 bg-white/[0.02] hover:bg-white/[0.05] backdrop-blur-2xl border border-white/5 rounded-2xl px-6 py-4 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-[#dc143c]/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#dc143c]/20">
                  <MapPin className="w-6 h-6 text-[#dc143c]" />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">
                    Location
                  </p>
                  <p className="text-white font-bold text-sm truncate">
                    Loma de Gato Marilao Bulacan
                  </p>
                </div>
              </div>

              <div className="group flex items-center gap-4 bg-white/[0.02] hover:bg-white/[0.05] backdrop-blur-2xl border border-white/5 rounded-2xl px-6 py-4 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-[#dc143c]/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#dc143c]/20">
                  <ShieldCheck className="w-6 h-6 text-[#dc143c]" />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">
                    Service
                  </p>
                  <p className="text-white font-bold text-sm truncate">
                    On-the-Go Auto Care
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex absolute bottom-12 right-12 z-20">
          <div className="flex flex-col items-center gap-4">
            <span className="text-white/20 text-[9px] uppercase tracking-[0.5em] font-black rotate-90 mb-8">
              Explore
            </span>
            <div className="w-[1px] h-20 bg-gradient-to-b from-[#dc143c] to-transparent relative">
              <motion.div
                animate={{ y: [0, 40, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-0 left-[-1.5px] w-[4px] h-[4px] bg-white rounded-full shadow-[0_0_8px_white]"
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent"></div>
      </section>
    </section>
  );
};

export default Hero;
