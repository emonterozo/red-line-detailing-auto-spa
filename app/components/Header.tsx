"use client";

import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, UserCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";

const navigationLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "#services" },
  { name: "About Us", href: "#about" },
  { name: "Contact Us", href: "#contact" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Adds a shadow/background effect when the user scrolls
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-[100] transition-all duration-500 px-6 py-4 md:px-10 ${
        scrolled ? "md:py-4" : "md:py-6"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto px-6 md:px-8 rounded-2xl transition-all duration-500 border relative ${
          scrolled
            ? "bg-black/60 backdrop-blur-xl border-white/10 shadow-2xl"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 flex-shrink-0 origin-left transition-all duration-300 pointer-events-none">
            <Logo className="h-24 sm:h-36 md:h-48 w-auto fill-current text-white" />
          </div>

          <div className="hidden md:block w-48 lg:w-64" />

          <div className="hidden md:flex items-center gap-2">
            {navigationLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-white/60 hover:text-[#dc143c] px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300"
              >
                {link.name}
              </a>
            ))}

            <div className="w-[1px] h-4 bg-white/10 mx-2" />

            <Link
              href="/login"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-[#dc143c] hover:border-[#dc143c] transition-all duration-300 group"
            >
              <UserCircle2 className="w-4 h-4 text-[#dc143c] group-hover:text-white transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Client Portal
              </span>
            </Link>
          </div>

          <div className="md:hidden ml-auto flex items-center gap-4 relative z-10">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2 focus:outline-none active:scale-90 transition-transform"
            >
              {isMenuOpen ? (
                <X className="w-8 h-8" />
              ) : (
                <Menu className="w-8 h-8" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-24 left-6 right-6 bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-6 space-y-2">
            {navigationLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-4 text-sm font-bold text-white/70 hover:text-white hover:bg-white/5 rounded-2xl transition-all group"
              >
                <span className="uppercase tracking-widest">{link.name}</span>
                <ChevronRight className="w-4 h-4 text-[#dc143c] opacity-0 group-hover:opacity-100 transition-all" />
              </a>
            ))}

            <div className="pt-4 border-t border-white/5">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-3 w-full p-4 bg-[#dc143c] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_10px_20px_rgba(220,20,60,0.2)]"
              >
                <ShieldCheck className="w-4 h-4" />
                Client Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
