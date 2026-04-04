"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Label } from "@/components/ui/label";
import { createInquiry } from "../actions/createInquiry";
import { InquiryStatus } from "@/lib/enums";
import { useState } from "react";
import { Activity } from "lucide-react";

const formSchema = z.object({
  fullName: z
    .string()
    .min(5, "Please enter your full name (at least 5 characters).")
    .max(32, "Full name can be at most 32 characters."),
  email: z.email("Please enter a valid email address."),
  contactNumber: z
    .string()
    .trim()
    .regex(
      /^09\d{9}$/,
      "Please enter a valid contact number (11 digits, starting with 09).",
    ),
  message: z
    .string()
    .min(5, "Enter your message (min. 5 characters).")
    .max(250, "Message can be at most 250 characters."),
});

const Contact = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      contactNumber: "",
      message: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setLoading(true);
      const result = await createInquiry({
        name: value.fullName,
        contact_number: value.contactNumber,
        email: value.email,
        message: value.message,
        status: InquiryStatus.NEW,
        created_at: new Date(),
        updated_at: new Date(),
      });
      setLoading(false);
      toast(result.message, {
        position: "bottom-right",
        duration: 3000,
      });
      form.reset();
    },
  });

  return (
    <section
      id="contact"
      className="relative min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center px-6 overflow-hidden font-sans selection:bg-[#dc143c]/30"
    >
      {/* 1. BRANDED AMBIENCE & UPDATED RED BACKGROUND */}
      {/* Deep Red Background Gradient - Adds richer tone */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a0508_0%,#050505_100%)] pointer-events-none" />

      {/* Primary Red Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#dc143c]/15 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#dc143c]/10 blur-[150px] rounded-full pointer-events-none animate-pulse delay-700" />

      {/* Precision Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_80%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="font-russo text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6">
            Get In{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] via-[#ff4d6d] to-[#dc143c] bg-[length:200%_auto] animate-gradient">
              Touch
            </span>
          </h2>

          <p className="text-gray-400 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            {`Have a service in mind? Send us a message, and we’ll provide a personalized quotation based on your needs.`}
          </p>

          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#dc143c]" />
            <Activity className="w-4 h-4 text-[#dc143c] animate-pulse" />
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#dc143c]" />
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
          <form
            className="space-y-6"
            id="contact-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field name="fullName">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel
                        htmlFor={field.name}
                        className="text-gray-500 text-xs uppercase tracking-widest"
                      >
                        Full name
                      </FieldLabel>

                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Full Name (e.g., Juan Dela Cruz)"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <form.Field name="email">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel
                          htmlFor="email"
                          className="text-gray-500 text-xs uppercase tracking-widest"
                        >
                          Email address
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          type="email"
                          placeholder="Enter your email (e.g., juan@email.com)"
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

                <form.Field name="contactNumber">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel
                          htmlFor="phone"
                          className="text-gray-500 text-xs uppercase tracking-widest"
                        >
                          Contact Number
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          type="tel"
                          placeholder="Contact Number (e.g., 09123456789)"
                          maxLength={11}
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

              <form.Field name="message">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                        Message
                      </FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        rows={5}
                        placeholder="Tell us about your vehicle and the service you need"
                        className="px-4 py-3 rounded-xl bg-white/[0.04] border-white/10 text-white placeholder:text-gray-600 text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2 resize-none"
                        maxLength={250}
                      />
                      <Label className="block text-right text-gray-400 mt-1 text-sm">
                        {250 - field.state.value.length}/250 characters
                      </Label>
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
            </FieldGroup>

            <button
              type="submit"
              className="group relative inline-flex items-center gap-3 px-10 py-4 bg-[#dc143c] hover:bg-[#c01236] active:scale-[0.98] text-white font-bold text-base rounded-2xl transition-all duration-200 shadow-xl shadow-[#dc143c]/30 hover:shadow-[#dc143c]/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              disabled={loading}
            >
              {loading ? (
                <svg
                  className="w-5 h-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : (
                <>
                  <span>Submit Inquiry</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
