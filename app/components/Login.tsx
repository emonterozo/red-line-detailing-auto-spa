"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ChevronRight, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { showToast } from "@/lib/toast";
import Otp from "./Otp";
import { verifyOtp } from "../actions/verifyOtp";
import { OtpType } from "@/lib/enums";
import { useRouter } from "next/navigation";
import { login } from "../actions/login";
import { sendOtp } from "../actions/sendOtp";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";

export const formSchema = z.object({
  contactNumber: z
    .string()
    .trim()
    .regex(
      /^09\d{9}$/,
      "Please enter a valid contact number (11 digits, starting with 09).",
    ),
  password: z.string().min(8, "Password must be at least 8 characters."),
  isChecked: z.boolean(),
});

const defaultValues: FormValues = {
  contactNumber: "",
  password: "",
  isChecked: false,
};

export type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const { update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isLock, setIsLock] = useState(true);
  const [isResending, setIsResending] = useState(false);

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setLoading(true);
      if (value.isChecked) {
        localStorage.setItem("contact_number", value.contactNumber);
      } else {
        localStorage.removeItem("contact_number");
      }
      const result = await login({
        contact_number: value.contactNumber,
        password: value.password,
      });
      setLoading(false);
      if (result?.success) {
        await update();
        router.push(`/customer/me`);
      } else if (!result?.success && result?.customer) {
        setTimeout(() => {
          setCustomerId(result.customer.customer_id);
          setIsOtpStep(true);
          setCountdown(result.retry_after);
        }, 1500);
      } else {
        showToast(result?.message as string, "error");
      }
    },
  });

  const submitOtp = async (code: string) => {
    setLoading(true);
    const result = await verifyOtp({
      customer_id: customerId,
      type: OtpType.REGISTRATION,
      code: code,
      password: form.getFieldValue("password"),
    });
    setLoading(false);
    if (result.success) {
      await update();
      router.push(`/customer/me`);
    } else {
      showToast(result?.message as string, "error");
    }
  };

  const resendOtp = async () => {
    if (customerId !== "") {
      setIsResending(true);
      const result = await sendOtp(
        customerId,
        form.getFieldValue("contactNumber"),
        OtpType.REGISTRATION,
      );

      if (result.message.includes("Too many attempts detected")) {
        setIsLock(true);
      }
      setIsResending(false);
      setCountdown(result.retry_after);
    }
  };

  useEffect(() => {
    if (countdown <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (isLock) setIsLock(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isLock]);

  useEffect(() => {
    const contactNumber = localStorage.getItem("contact_number");

    if (contactNumber) {
      form.setFieldValue("contactNumber", contactNumber);
      form.setFieldValue("isChecked", true);
    }
  }, [form]);

  return (
    <div className="relative min-h-screen w-full bg-[#030303] flex overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#dc143c]/15 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#dc143c]/10 blur-[150px] rounded-full animate-pulse delay-700" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_80%,transparent_100%)]" />
      </div>
      <div className="hidden lg:block relative w-1/2 h-screen overflow-hidden border-r border-white/10">
        <Image
          src="https://images.unsplash.com/photo-1689869698035-373c21c5bda0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Red Line Care"
          fill
          priority
          className="object-cover opacity-60"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-[#030303]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent" />
        <div className="absolute bottom-12 left-12 z-20">
          <div className="flex items-center gap-3 text-white">
            <Activity className="w-6 h-6 text-[#dc143c]" />
            <span className="font-russo text-2xl tracking-widest uppercase">
              Red Line Care
            </span>
          </div>
        </div>

        <Link
          href="/"
          className="absolute top-8 left-6 flex items-center gap-2 text-white-900 hover:text-white-50 transition z-20"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span className="text-xs uppercase tracking-widest">
            Back to home
          </span>
        </Link>
      </div>
      <div className="relative flex-1 flex items-center justify-center px-6 py-6 overflow-y-auto">
        <div className="relative w-full max-w-xl z-10">
          <AnimatePresence mode="wait">
            {isOtpStep ? (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Otp
                  onVerify={submitOtp}
                  onResend={resendOtp}
                  isLoading={loading}
                  countdown={countdown}
                  previousScreen="Login"
                  onBack={() => setIsOtpStep(false)}
                  isLock={isLock}
                  isResending={isResending}
                />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="font-russo text-4xl md:text-6xl font-extrabold text-white tracking-tight">
                  WELCOME{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff6b81]">
                    BACK
                  </span>
                </h2>
                <p className="mt-4 text-gray-500 text-base max-w-md mx-auto">
                  Let’s get you into your premium experience.
                </p>
                <div className="flex items-center justify-center gap-3 mt-6 mb-12">
                  <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#dc143c]" />
                  <Activity className="w-4 h-4 text-[#dc143c] animate-pulse" />
                  <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#dc143c]" />
                </div>

                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
                  <form
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault();
                      form.handleSubmit();
                    }}
                  >
                    <form.Field name="contactNumber">
                      {(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid;
                        return (
                          <Field>
                            <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                              Contact number
                            </FieldLabel>
                            <Input
                              maxLength={11}
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="Contact Number (e.g., 09123456789)"
                              className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
                            />
                            {isInvalid && (
                              <FieldError
                                className="text-[#ff6b81] text-xs mt-1"
                                errors={field.state.meta.errors}
                              />
                            )}
                          </Field>
                        );
                      }}
                    </form.Field>
                    <form.Field name="password">
                      {(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid;
                        return (
                          <Field>
                            <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                              Password
                            </FieldLabel>
                            <div className="relative group">
                              <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                aria-invalid={isInvalid}
                                type={
                                  passwordVisibility.password
                                    ? "text"
                                    : "password"
                                }
                                placeholder="••••••••••••••••"
                                className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setPasswordVisibility({
                                    ...passwordVisibility,
                                    password: !passwordVisibility.password,
                                  })
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#dc143c] 
                     transition-colors duration-200 focus:outline-none"
                                aria-label={
                                  passwordVisibility.password
                                    ? "Hide password"
                                    : "Show password"
                                }
                              >
                                {passwordVisibility.password ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            {isInvalid && (
                              <FieldError
                                className="text-[#ff6b81] text-xs mt-1"
                                errors={field.state.meta.errors}
                              />
                            )}
                          </Field>
                        );
                      }}
                    </form.Field>
                    <form.Field name="isChecked">
                      {(field) => {
                        return (
                          <div className="flex items-start gap-3 transition-all duration-300">
                            <div className="pt-1">
                              <Checkbox
                                id={field.name}
                                name={field.name}
                                checked={field.state.value}
                                onCheckedChange={(checked: boolean) =>
                                  form.setFieldValue("isChecked", checked)
                                }
                                className={`w-5 h-5 rounded-md transition-all duration-300 border-white/30 bg-white/5 data-[state=checked]:bg-[#dc143c]`}
                              />
                            </div>

                            <Label
                              className={`text-sm md:text-base leading-relaxed cursor-pointer select-none transition-colors text-gray-400`}
                            >
                              Remember me
                            </Label>
                          </div>
                        );
                      }}
                    </form.Field>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-lg bg-[#dc143c] hover:bg-[#b01030] 
                transition text-white font-medium flex items-center justify-center"
                    >
                      {loading ? (
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-white" />
                      ) : (
                        "Log In"
                      )}
                    </button>
                  </form>
                </div>

                <div className="text-center mt-6">
                  <p className="text-gray-500 text-sm">
                    Don’t have an account?{" "}
                    <Link
                      href="register"
                      className="text-[#dc143c] hover:underline font-medium"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Login;
