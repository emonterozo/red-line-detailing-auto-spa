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
import { createCustomer } from "../actions/createCustomer";
import { showToast } from "@/lib/toast";
import Otp from "./Otp";
import { verifyOtp } from "../actions/verifyOtp";
import { OtpType } from "@/lib/enums";
import { useRouter, useSearchParams } from "next/navigation";
import { sendOtp } from "../actions/sendOtp";

export const formSchema = z.object({
  firstName: z
    .string()
    .min(2, "Please enter your first name (at least 2 characters).")
    .max(32, "First name can be at most 32 characters."),
  lastName: z
    .string()
    .min(2, "Please enter your last name (at least 2 characters).")
    .max(32, "Last name can be at most 32 characters."),
  contactNumber: z
    .string()
    .trim()
    .regex(
      /^09\d{9}$/,
      "Please enter a valid contact number (11 digits, starting with 09).",
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password is too long.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character.",
    ),
  confirmPassword: z.string(),
});

const defaultValues: FormValues = {
  firstName: "Eric",
  lastName: "Monterozo",
  contactNumber: "09122011108",
  password: "ABC1234!",
  confirmPassword: "ABC1234!",
};

export type FormValues = z.infer<typeof formSchema>;

const Register = () => {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("referral");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [customerId, setCustomerId] = useState("");

  const [countdown, setCountdown] = useState(0);

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setLoading(true);
      const result = await createCustomer({
        first_name: value.firstName,
        last_name: value.lastName,
        contact_number: value.contactNumber,
        password: value.password,
        referral_code: referralCode ?? undefined,
      });
      setLoading(false);
      if (result.success) {
        setTimeout(() => {
          setCustomerId(result.customer_id);
          setIsOtpStep(true);

          setCountdown(result.retry_after!);
        }, 1500);
      } else {
        showToast(result.message, "error");
      }
    },
  });

  const submitOtp = async (code: string) => {
    setLoading(true);
    const result = await verifyOtp({
      customer_id: customerId,
      type: OtpType.REGISTRATION,
      code: code,
    });
    setLoading(false);
    if (result.success) {
      router.push(`/customer/${result.customer_id}`);
    } else {
      showToast(result.message, "error");
    }
  };

  const resendOtp = async () => {
    if (customerId !== "") {
      const result = await sendOtp(
        customerId,
        form.getFieldValue("contactNumber"),
        OtpType.REGISTRATION,
      );

      setCountdown(result.retry_after);
    }
  };

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

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
                  onBack={() => setIsOtpStep(false)}
                  previousScreen="Registration"
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
                  CREATE{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff6b81]">
                    ACCOUNT
                  </span>
                </h2>
                <p className="mt-4 text-gray-500 text-base max-w-md mx-auto">
                  Join and start your premium experience today.
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <form.Field name="firstName">
                        {(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;
                          return (
                            <Field>
                              <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                                First name
                              </FieldLabel>
                              <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                aria-invalid={isInvalid}
                                placeholder="First Name (e.g., Juan)"
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
                      <form.Field name="lastName">
                        {(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;
                          return (
                            <Field>
                              <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                                Last name
                              </FieldLabel>
                              <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                aria-invalid={isInvalid}
                                placeholder="Last Name (e.g., Dela Cruz)"
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
                    </div>
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
                    <form.Field
                      name="confirmPassword"
                      validators={{
                        onChangeListenTo: ["password"],
                        onChange: ({ value, fieldApi }) => {
                          if (
                            value !== fieldApi.form.getFieldValue("password")
                          ) {
                            return [{ message: "Passwords do not match." }];
                          }
                          return undefined;
                        },
                      }}
                    >
                      {(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid;

                        return (
                          <Field>
                            <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                              Confirm Password
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
                                  passwordVisibility.confirmPassword
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
                                    confirmPassword:
                                      !passwordVisibility.confirmPassword,
                                  })
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#dc143c] 
                     transition-colors duration-200 focus:outline-none"
                                aria-label={
                                  passwordVisibility.confirmPassword
                                    ? "Hide password"
                                    : "Show password"
                                }
                              >
                                {passwordVisibility.confirmPassword ? (
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

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-lg bg-[#dc143c] hover:bg-[#b01030] 
                transition text-white font-medium flex items-center justify-center"
                    >
                      {loading ? (
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-white" />
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </form>
                </div>

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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Register;
