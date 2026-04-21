"use client";

import React, { useRef, useState, useEffect } from "react";
import { Activity, RefreshCw, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { formatCountdown } from "@/lib/utils";

type OtpProps = {
  length?: number;
  onVerify: (otp: string) => void;
  countdown: number;
  onResend?: () => void;
  isLoading?: boolean;
  onBack?: () => void;
  previousScreen: string;
  isLock?: boolean;
  isResending?: boolean
};

const Otp = ({
  length = 4,
  onVerify,
  countdown,
  onResend,
  isLoading = false,
  onBack,
  previousScreen,
  isLock,
  isResending = false
}: OtpProps) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Move forward
    if (value && index < length - 1) {
      requestAnimationFrame(() => {
        inputRefs.current[index + 1]?.focus();
      });
    }

    // ✅ NEW: if all filled → remove focus
    const isComplete = newOtp.every((digit) => digit !== "");
    if (isComplete) {
      requestAnimationFrame(() => {
        inputRefs.current[index]?.blur();
      });
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key !== "Backspace") return;

    e.preventDefault();

    setOtp((prev) => {
      const newOtp = [...prev];

      if (newOtp[index]) {
        // Clear current
        newOtp[index] = "";
      } else if (index > 0) {
        // Move back and clear previous
        newOtp[index - 1] = "";

        requestAnimationFrame(() => {
          inputRefs.current[index - 1]?.focus();
        });
      }

      return newOtp;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length === length) {
      onVerify(otpString);
    }
  };

  return (
    <div className="w-full ">
      <h2 className="font-russo text-4xl md:text-6xl font-extrabold text-white tracking-tight">
        VERIFY{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff6b81]">
          IDENTITY
        </span>
      </h2>
      <p className="mt-4 text-gray-500 text-base max-w-md mx-auto">
        {`We sent a ${length}-digit code to your contact number. Enter it below to proceed.`}
      </p>
      <div className="flex items-center justify-center gap-3 mt-6 mb-12">
        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#dc143c]" />
        <Activity className="w-4 h-4 text-[#dc143c] animate-pulse" />
        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#dc143c]" />
      </div>

      <div className="rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
          <div className="flex justify-between gap-3 max-w-md mx-auto">
            {otp.map((digit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative group"
              >
                <input
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="\d{1}"
                  maxLength={1}
                  value={digit}
                  disabled={isLoading}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className="w-16 h-24 sm:w-20 sm:h-28 text-center text-4xl font-russo font-bold 
                       bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl 
                       text-white outline-none transition-all duration-300
                       focus:border-[#dc143c] focus:bg-[#dc143c]/10 
                       focus:shadow-[0_0_25px_rgba(220,20,60,0.25)]"
                />

                <div
                  className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-5 h-1 rounded-full transition-all duration-500 
              ${digit ? "bg-[#dc143c] shadow-[0_0_10px_#dc143c] opacity-100" : "bg-white/5 opacity-0"}`}
                />
              </motion.div>
            ))}
          </div>

          <div className="space-y-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || otp.includes("")}
              className={`group relative w-full h-14 overflow-hidden rounded-xl font-bold tracking-[0.2em] uppercase text-sm transition-all duration-300
              ${
                otp.includes("")
                  ? "bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed"
                  : "bg-[#dc143c] text-white shadow-[0_10px_30px_rgba(220,20,60,0.3)] hover:shadow-[0_15px_40px_rgba(220,20,60,0.5)]"
              }`}
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-white" />
              ) : (
                <span className="flex items-center justify-center gap-3">
                  Complete Verification <ShieldCheck className="w-5 h-5" />
                </span>
              )}
            </motion.button>

            <div className="text-center">
              {isLock ? (
                <span className="flex flex-col items-center gap-5 mt-4">
                  <div className="flex flex-col items-center px-6 py-5 rounded-2xl bg-[#dc143c]/5 border border-[#dc143c]/20 backdrop-blur-md shadow-[0_0_30px_rgba(220,20,60,0.05)]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6b81] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff6b81]"></span>
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff6b81]">
                        Too Many Requests
                      </span>
                    </div>

                    <span className="text-[#ff6b81] text-sm font-medium text-center leading-relaxed max-w-[280px]">
                      Limit reached. Please retry in{" "}
                      <span className="font-bold ml-1">
                        {formatCountdown(countdown)}
                      </span>
                    </span>
                  </div>

                  <button
                    onClick={onBack}
                    className="group flex items-center gap-2 transition-all duration-300"
                  >
                    <div className="h-px w-4 bg-white/20 group-hover:w-8 group-hover:bg-[#dc143c] transition-all" />
                    <span className="text-white/40 group-hover:text-white text-[11px] font-bold uppercase tracking-[0.2em]">
                      {`Back to ${previousScreen}`}
                    </span>
                    <div className="h-px w-4 bg-white/20 group-hover:w-8 group-hover:bg-[#dc143c] transition-all" />
                  </button>
                </span>
              ) : (
                <p className="text-gray-500 text-sm">
                  Didn&apos;t receive the code?{" "}
                  <button
                    type="button"
                    onClick={onResend}
                    disabled={isLoading || isResending || countdown > 0}
                    className="text-[#dc143c] hover:text-[#ff6b81] hover:underline font-medium transition-colors disabled:opacity-50 disabled:no-underline"
                  >
                    {isResending ? (
                      "Sending..."
                    ) : countdown > 0 ? (
                      <span>Resend Code in {formatCountdown(countdown)}</span>
                    ) : (
                      "Resend Code"
                    )}
                  </button>
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Otp;
