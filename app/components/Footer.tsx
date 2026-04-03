"use client";

import Link from "next/link";
import { MapPin, Phone, Instagram, Facebook, ArrowRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-[#050505] border-t border-white/5 pt-16 pb-8 overflow-hidden">
      {/* Decorative Background Logo Watermark */}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex flex-col">
              <h2 className="font-russo text-2xl md:text-3xl tracking-tighter leading-none">
                RED <span className="text-[#dc143c]"> LINE</span>
              </h2>
              <p className="font-sans text-[10px] text-gray-500 uppercase tracking-[0.5em] mt-2 font-black">
                DETAILING & Auto Spa
              </p>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              The pinnacle of automotive care in Marilao. We transform vehicles
              through precision engineering and a passion for flawless finishes.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {[
                {
                  icon: Facebook,
                  href: "https://www.facebook.com/people/Red-Line-Detailing-Auto-Spa/61586431965530/",
                },
                { icon: Instagram, href: "https://instagram.com" },
                { icon: "tiktok" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={
                    typeof social.href === "string"
                      ? social.href
                      : "https://www.tiktok.com/@get.redlinedetailing"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#dc143c] hover:border-[#dc143c] transition-all duration-300 group"
                >
                  {social.icon === "tiktok" ? (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                    </svg>
                  ) : (
                    <social.icon className="w-5 h-5" />
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-4 space-y-6">
            <h4 className="font-russo text-white text-xs uppercase tracking-[0.3em]">
              Technical Support
            </h4>
            <div className="space-y-4">
              <div className="group flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-[#dc143c]/50 transition-colors">
                  <MapPin className="w-4 h-4 text-[#dc143c]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1">
                    HQ Location
                  </p>
                  <p className="text-gray-300 text-sm font-medium">
                    Loma de Gato, Marilao Bulacan
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-[#dc143c]/50 transition-colors">
                  <Phone className="w-4 h-4 text-[#dc143c]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1">
                    Direct Line
                  </p>
                  <a
                    href="tel:+639122011108"
                    className="text-gray-300 text-sm font-medium hover:text-[#dc143c] transition-colors"
                  >
                    +63 912 201 1108
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-6">
            <h4 className="font-russo text-white text-xs uppercase tracking-[0.3em]">
              Client Area
            </h4>
            <ul className="space-y-3">
              {["Services", "Booking Policy", "Client Portal", "Contact"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href={item === "Booking Policy" ? "/policy" : "#"}
                      className="text-gray-500 text-sm hover:text-white flex items-center gap-2 group transition-all"
                    >
                      <ArrowRight className="w-3 h-3 text-[#dc143c] opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {item}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} Red Line Detailing & Auto Spa
          </p>
          <div className="flex gap-8">
            <Link
              href="/policy"
              className="text-[10px] text-gray-600 hover:text-[#dc143c] font-bold uppercase tracking-[0.2em] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/policy"
              className="text-[10px] text-gray-600 hover:text-[#dc143c] font-bold uppercase tracking-[0.2em] transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
