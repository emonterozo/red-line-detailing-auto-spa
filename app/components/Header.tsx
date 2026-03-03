"use client";

import { useState } from "react";
import { Menu, X, ChevronRight } from "lucide-react";

import Logo from "./Logo";

const navigationLinks = [
  { name: "Home", href: "" },
  { name: "Services", href: "#services" },
  { name: "About Us", href: "#about" },
  { name: "Contact Us", href: "#contact" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className=" fixed top-0 w-full z-50 bg-[#111111]/85  border-b border-white/10 shadow-lg">
      <div>
        <div className="flex items-center justify-between h-16 md:h-20">
          <Logo className="h-56 w-auto fill-current" />
          <div className="hidden md:flex gap-2">
            {navigationLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-white hover:text-[#dc143c] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-[#dc143c] p-2 focus:outline-none transition-colors"
              aria-label="Toggle menu"
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

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black border-t border-white/10 shadow-2xl animate-in slide-in-from-top-2">
          <div className="px-4 py-4 space-y-3">
            {navigationLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={closeMenu}
                className="block px-4 py-3 text-base font-medium text-white hover:text-[#dc143c] hover:bg-white/5 rounded-lg transition flex items-center justify-between group"
              >
                {link.name}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
