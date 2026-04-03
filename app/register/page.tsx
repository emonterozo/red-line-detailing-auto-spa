"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  User,
  Phone,
} from "lucide-react";

const CustomerRegister = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030303] flex items-center justify-center px-6 py-20 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Glow Effects */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] bg-[#dc143c]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#dc143c]/10 blur-[100px] rounded-full" />

      {/* Back */}
      <Link
        href="/"
        className="absolute top-8 right-6 flex items-center gap-2 text-gray-500 hover:text-white transition"
      >
        <span className="text-xs uppercase tracking-widest">Back</span>
        <ChevronLeft className="w-4 h-4 rotate-180" />
      </Link>

      {/* Container */}
      <div className="relative w-full max-w-lg z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-400 text-sm">
            Join and start your premium experience
          </p>
        </div>

        {/* Glass Card */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-6">
            {/* FIRST + LAST NAME */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  placeholder="John"
                  className="w-full h-11 pl-10 pr-3 bg-white/5 border border-white/10 rounded-lg 
                    focus:border-[#dc143c] focus:ring-2 focus:ring-[#dc143c]/30 
                    text-white placeholder:text-gray-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  placeholder="Doe"
                  className="w-full h-11 pl-10 pr-3 bg-white/5 border border-white/10 rounded-lg 
                    focus:border-[#dc143c] focus:ring-2 focus:ring-[#dc143c]/30 
                    text-white placeholder:text-gray-500 outline-none transition"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full h-11 pl-10 pr-3 bg-white/5 border border-white/10 rounded-lg 
                  focus:border-[#dc143c] focus:ring-2 focus:ring-[#dc143c]/30 
                  text-white placeholder:text-gray-500 outline-none transition"
                />
              </div>
            </div>

            {/* CONTACT */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Contact Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="tel"
                  required
                  placeholder="09XXXXXXXXX"
                  className="w-full h-11 pl-10 pr-3 bg-white/5 border border-white/10 rounded-lg 
                  focus:border-[#dc143c] focus:ring-2 focus:ring-[#dc143c]/30 
                  text-white placeholder:text-gray-500 outline-none transition"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter password"
                  className="w-full h-11 pl-10 pr-10 bg-white/5 border border-white/10 rounded-lg 
                  focus:border-[#dc143c] focus:ring-2 focus:ring-[#dc143c]/30 
                  text-white placeholder:text-gray-500 outline-none transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Confirm password"
                  className="w-full h-11 pl-10 pr-10 bg-white/5 border border-white/10 rounded-lg 
                  focus:border-[#dc143c] focus:ring-2 focus:ring-[#dc143c]/30 
                  text-white placeholder:text-gray-500 outline-none transition"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-[#dc143c] hover:bg-[#b01030] 
              transition text-white font-medium flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        {/* FOOTER */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#dc143c] hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;
