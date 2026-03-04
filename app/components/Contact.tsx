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

const formSchema = z.object({
  fullName: z
    .string()
    .min(5, "Full name must be at least 5 characters.")
    .max(32, "Full name must be at most 32 characters."),
  email: z.email("Please enter a valid email address."),
  contactNumber: z
    .string()
    .trim()
    .regex(/^09\d{9}$/, "Contact number must be 11 digits and start with 09."),
  message: z
    .string()
    .min(5, "Message must be at least 5 characters.")
    .max(250, "Message must be at most 250 characters."),
});

const Contact = () => {
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
      const result = await createInquiry({
        name: value.fullName,
        contact_number: value.contactNumber,
        email: value.email,
        message: value.message,
        status: InquiryStatus.NEW,
        created_at: new Date(),
        updated_at: new Date(),
      });
      toast(result.message, {
        position: "bottom-right",
        duration: 3000,
      });
      form.reset();
    },
  });

  return (
    <section id="contact" className="relative w-full bg-black">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1710078064201-e4b068f6936d?ixlib=rb-4.0.3&q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="font-russo text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6">
            Get In{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] via-red-500 to-[#dc143c] bg-[length:200%_auto]">
              Touch
            </span>
          </h2>

          <p className="text-gray-400 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            {`Have a service in mind? Send us a message, and we’ll provide a personalized quotation based on your needs.`}
          </p>

          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#dc143c]"></div>
            <div className="w-2 h-2 rotate-45 bg-[#dc143c]"></div>
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#dc143c]"></div>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-black/40">
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
                        className="text-gray-300 uppercase"
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
                        placeholder="Enter your full name"
                        className="!text-base h-14 px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm focus-visible:border-[#dc143c] focus-visible:ring-[#dc143c]/20"
                      />
                      {isInvalid && (
                        <FieldError
                          className="text-[#dc143c]"
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
                          className="text-gray-300 uppercase"
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
                          placeholder="Enter your email address"
                          className="!text-base h-14 px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm focus-visible:border-[#dc143c] focus-visible:ring-[#dc143c]/20"
                        />
                        {isInvalid && (
                          <FieldError
                            className="text-[#dc143c]"
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
                          className="text-gray-300 uppercase"
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
                          placeholder="Enter your contact number"
                          maxLength={11}
                          className="!text-base h-14 px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm focus-visible:border-[#dc143c] focus-visible:ring-[#dc143c]/20"
                        />
                        {isInvalid && (
                          <FieldError
                            className="text-[#dc143c]"
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
                      <FieldLabel className="text-gray-300 uppercase">
                        Your Message
                      </FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        rows={5}
                        placeholder="Tell us about your vehicle and the service you're interested in..."
                        className="!text-base  px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm focus-visible:border-[#dc143c] focus-visible:ring-[#dc143c]/20 resize-none "
                        maxLength={250}
                      />
                      <Label className="block text-right text-gray-400 mt-1 text-sm">
                        {250 - field.state.value.length}/250 characters
                      </Label>
                      {isInvalid && (
                        <FieldError
                          className="text-[#dc143c]"
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
              form="contact-form"
              className="group w-full md:w-auto md:px-16 py-4 bg-[#dc143c] hover:bg-red-700 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(220,20,60,0.3)] hover:shadow-[0_0_40px_rgba(220,20,60,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-3"
            >
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
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
