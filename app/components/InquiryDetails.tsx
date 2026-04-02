"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandItem } from "@/components/ui/command";
import {
  Check,
  ChevronDown,
  User,
  MessageSquare,
  Activity,
  Settings,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { InquiryStatus, InquiryStatusDisplay } from "@/lib/enums";
import { useParams, useRouter } from "next/navigation";
import { getInquiry } from "../actions/getInquiry";
import { updateInquiry } from "../actions/updateInquiry";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

function SectionCard({
  icon,
  title,
  subtitle,
  children,
  last,
}: Readonly<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  last?: boolean;
}>) {
  return (
    <div className="relative">
      {!last && (
        <div className="absolute left-5 top-14 bottom-0 w-px bg-gradient-to-b from-[#dc143c]/40 to-transparent z-0" />
      )}
      <div className="relative z-10 flex gap-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#dc143c] flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-[#dc143c]/40">
          <span className="w-4 h-4">{icon}</span>
        </div>

        <div className="flex-1 pb-10">
          <div className="mb-4">
            <h3 className="text-white font-semibold text-lg leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
            )}
          </div>
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <Field>
      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
        {label}
      </FieldLabel>
      <Input
        readOnly
        value={value}
        className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white placeholder:text-gray-600 text-sm
             focus-visible:outline-none focus-visible:ring-0 focus-visible:border-white/10"
      />
    </Field>
  );
}

function SelectTrigger({
  hasValue,
  children,
}: Readonly<{
  hasValue: boolean;
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`w-full h-12 px-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 group
        ${
          hasValue
            ? "bg-white/[0.06] border-white/20 text-white"
            : "bg-white/[0.02] border-white/10 text-gray-500 hover:border-white/20"
        }`}
    >
      <div className="flex-1 min-w-0 overflow-hidden flex items-center">
        {children}
      </div>
      <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors flex-shrink-0 ml-2" />
    </div>
  );
}

export default function InquiryDetails() {
  const router = useRouter();
  const params = useParams();
  const inquiryId = params.id;
  const [loading, setLoading] = useState(false);
  const [inquiry, setInquiry] = useState({
    name: "",
    email: "",
    message: "",
    contactNumber: "",
  });

  const form = useForm({
    defaultValues: {
      status: "",
    },
    onSubmit: async ({ value }) => {
      setLoading(true);
      await updateInquiry(
        inquiryId?.toString() ?? "",
        value.status as InquiryStatus,
      );
      setLoading(false);
      router.back();
    },
  });

  useEffect(() => {
    const init = async () => {
      if (inquiryId) {
        const data = await getInquiry(inquiryId.toString());
        setInquiry({
          name: data?.name ?? "",
          email: data?.email ?? "",
          message: data?.message ?? "",
          contactNumber: data?.contact_number ?? "",
        });
        form.setFieldValue("status", data?.status ?? InquiryStatus.NEW);
      }
    };
    init();
  }, [form, inquiryId]);

  return (
    <section className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-[#dc143c]/[0.08] blur-[140px]" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="font-russo text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            INQUIRY{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff6b81]">
              DETAILS
            </span>
          </h2>
          <p className="mt-4 text-gray-500 text-base max-w-md mx-auto">
            Review customer inquiry details and manage its status.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#dc143c]" />
            <Activity className="w-4 h-4 text-[#dc143c] animate-pulse" />
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#dc143c]" />
          </div>
        </motion.div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-0"
        >
          <SectionCard
            icon={<User className="w-4 h-4" />}
            title="Lead Information"
            subtitle="Contact details provided by the client."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReadOnlyField label="Full Name" value={inquiry.name} />
              <ReadOnlyField
                label="Contact Number"
                value={inquiry.contactNumber}
              />
              <div className="md:col-span-2">
                <ReadOnlyField label="Email Address" value={inquiry.email} />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={<MessageSquare className="w-4 h-4" />}
            title="Inquiry Content"
            subtitle="The specific request or message."
          >
            <Field>
              <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                Message Body
              </FieldLabel>
              <Textarea
                readOnly
                value={inquiry.message}
                rows={5}
                className="px-4 rounded-xl bg-white/[0.04] border-white/10 text-white placeholder:text-gray-600 text-sm
             focus-visible:outline-none focus-visible:ring-0 focus-visible:border-white/10 resize-none"
              />
            </Field>
          </SectionCard>

          <SectionCard
            icon={<Settings className="w-4 h-4" />}
            title="Action Center"
            subtitle="Update the status and finalize."
            last
          >
            <form.Field name="status">
              {(field) => (
                <Field>
                  <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                    Current Status
                  </FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button" className="w-full">
                        <SelectTrigger hasValue={field.state.value.length > 0}>
                          {field.state.value.length > 0 ? (
                            <div className="overflow-x-auto scrollbar-services w-0 min-w-0 flex-1 py-2 flex-1">
                              <div className="flex gap-2 flex-nowrap min-w-max items-center">
                                {field.state.value.toUpperCase()}
                              </div>
                            </div>
                          ) : (
                            <span>Choose services...</span>
                          )}
                        </SelectTrigger>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg max-h-80 overflow-y-auto">
                      <Command>
                        <div className="space-y-1">
                          {Object.entries(InquiryStatusDisplay).map(
                            ([statusKey, display]) => {
                              const isSelected =
                                field.state.value === statusKey;
                              return (
                                <CommandItem
                                  key={statusKey}
                                  onSelect={() => field.handleChange(statusKey)}
                                  className="flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                                >
                                  <span className="font-bold text-xs uppercase tracking-wider">
                                    {display}
                                  </span>
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-[#dc143c]" />
                                  )}
                                </CommandItem>
                              );
                            },
                          )}
                        </div>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </Field>
              )}
            </form.Field>
          </SectionCard>

          {/* Submit */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="group relative inline-flex items-center gap-3 px-10 py-4 bg-[#dc143c] hover:bg-[#c01236] active:scale-[0.98] text-white font-bold text-base rounded-2xl transition-all duration-200 shadow-xl shadow-[#dc143c]/30 hover:shadow-[#dc143c]/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              {/* shimmer */}
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Update Inquiry
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
