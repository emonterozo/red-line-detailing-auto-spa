"use client";

import React, { useRef, useState, useEffect } from "react";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";

type OtpProps = {
  length?: number;
  onVerify: (otp: string) => void;
  countdown: number;
  message: string;
  onResend?: () => void;
  isLoading?: boolean;
};
const Otp = ({
  length = 4,
  onVerify,
  countdown,
  message,
  onResend,
  isLoading = false,
}: OtpProps) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (value: string, index: number) => {
    if (Number.isNaN(Number(value))) return;

    const newOtp = [...otp];
    // Take only the last character entered
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    // Handle backspace: move focus to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length === length) {
      onVerify(otpString);
    }
  };

  return (
    <div className="w-full">
      <h2 className="font-russo text-4xl md:text-6xl font-extrabold text-white tracking-tight">
        VERIFY{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff6b81]">
          NUMBER
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

      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-2xl text-center">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-between gap-2 max-w-sm mx-auto">
            {otp.map((digit, i) => (
              <motion.div
                key={`${digit}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
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
                  className="w-16 h-20 text-center text-3xl font-russo font-bold 
                               bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl 
                               text-white outline-none transition-all duration-300
                               focus:border-[#dc143c] focus:bg-[#dc143c]/5 
                               focus:shadow-[0_0_20px_rgba(220,20,60,0.2)]"
                />
                <div
                  className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full transition-all duration-300 
                    ${digit ? "bg-[#dc143c] opacity-100" : "bg-white/10 opacity-40"}`}
                />
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading || otp.includes("")}
              className="w-full h-12 rounded-lg bg-[#dc143c] hover:bg-[#b01030] text-white font-bold shadow-[0_0_20px_rgba(220,20,60,0.3)] transition-all"
            >
              Verify & Continue
            </button>
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Didn&apos;t receive the code?{" "}
                <button
                  onClick={onResend}
                  disabled={isLoading || countdown > 0}
                  className="text-[#dc143c] hover:underline font-medium"
                >
                  {countdown > 0
                    ? `Resend Code (${countdown}s)`
                    : "Resend Code"}
                </button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Otp;
