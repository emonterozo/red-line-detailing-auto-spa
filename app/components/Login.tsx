"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
} from "lucide-react";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate login
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030303] flex items-center justify-center px-6 py-20 overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* Glow Effects */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] bg-[#dc143c]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#dc143c]/10 blur-[100px] rounded-full" />

      {/* Exit Button */}
      <Link
        href="/"
        className="absolute top-8 right-6 flex items-center gap-2 text-gray-500 hover:text-white transition"
      >
        <span className="text-xs uppercase tracking-widest">Back</span>
        <ChevronLeft className="w-4 h-4 rotate-180" />
      </Link>

      {/* Card */}
      <div className="relative w-full max-w-md z-10">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-sm">
            Sign in to continue to your account
          </p>
        </div>

        {/* Glass Card */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email */}
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

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-gray-400">
                  Password
                </label>
                <Link
                  href="/forgot"
                  className="text-xs text-[#dc143c] hover:underline"
                >
                  Forgot?
                </Link>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  className="w-full h-11 pl-10 pr-10 bg-white/5 border border-white/10 rounded-lg 
                  focus:border-[#dc143c] focus:ring-2 focus:ring-[#dc143c]/30 
                  text-white placeholder:text-gray-500 outline-none transition"
                />

                {/* Toggle */}
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

            {/* Remember Me */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400">
                <input
                  type="checkbox"
                  className="accent-[#dc143c]"
                />
                Remember me
              </label>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-[#dc143c] hover:bg-[#b01030] 
              transition text-white font-medium flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Don’t have an account?{" "}
            <Link
              href="/register"
              className="text-[#dc143c] hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;