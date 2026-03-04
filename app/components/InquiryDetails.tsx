"use client";

import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandItem } from "@/components/ui/command";
import { Check } from "lucide-react";
import {
  InquiryStatus,
  InquiryStatusDisplay,
} from "@/lib/enums";
import { useParams, useRouter } from "next/navigation";
import { getInquiry } from "../actions/getInquiry";
import { updateInquiry } from "../actions/updateInquiry";

export const formSchema = z.object({
  name: z.string(),
  email: z.string(),
  message: z.string(),
  contactNumber: z.string(),
  status: z.string(),
});

export type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  name: "",
  email: "",
  message: "",
  contactNumber: "",
  status: "",
};

export default function InquiryDetails() {
  const router = useRouter();
  const params = useParams();
  const inquiryId = params.id;

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await updateInquiry(inquiryId?.toString() ?? '', value.status as InquiryStatus)
      router.back();
    },
  });
  const fetchInquiry = async (id: string) => {
    const response = await getInquiry(id);
    return response;
  };

  useEffect(() => {
    const init = async () => {
      if (inquiryId) {
        const inquiryData = await fetchInquiry(inquiryId.toString());
        form.setFieldValue("name", inquiryData?.name ?? "");
        form.setFieldValue("email", inquiryData?.email ?? "");
        form.setFieldValue("message", inquiryData?.message ?? "");
        form.setFieldValue("contactNumber", inquiryData?.contact_number ?? "");
        form.setFieldValue("status", inquiryData?.status ?? InquiryStatus.NEW);
      }
    };

    init();
  }, [inquiryId, form]);

  return (
    <section className="relative w-full bg-black">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="font-russo text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6">
            Inquiry{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] via-red-500 to-[#dc143c] bg-[length:200%_auto]">
              Details
            </span>
          </h2>

          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#dc143c]"></div>
            <div className="w-2 h-2 rotate-45 bg-[#dc143c]"></div>
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#dc143c]"></div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-black/40">
          <form
            className="space-y-6"
            id="booking-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <form.Field name="name">
                  {(field) => {
                    return (
                      <Field>
                        <FieldLabel className="text-gray-300 uppercase">
                          Full name
                        </FieldLabel>
                        <Input
                          readOnly
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="!text-base h-14 px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm "
                        />
                      </Field>
                    );
                  }}
                </form.Field>
                <form.Field name="contactNumber">
                  {(field) => {
                    return (
                      <Field>
                        <FieldLabel className="text-gray-300 uppercase">
                          Contact Number
                        </FieldLabel>
                        <Input
                          readOnly
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="!text-base h-14 px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm "
                        />
                      </Field>
                    );
                  }}
                </form.Field>
              </div>

              <form.Field name="email">
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel className="text-gray-300 uppercase">
                        Contact Number
                      </FieldLabel>
                      <Input
                        readOnly
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="!text-base h-14 px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm "
                      />
                    </Field>
                  );
                }}
              </form.Field>
              <form.Field name="message">
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel className="text-gray-300 uppercase">
                        Message
                      </FieldLabel>
                      <Textarea
                      readOnly
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        rows={5}
                        maxLength={250}
                        placeholder="Enter booking message"
                        className="!text-base  px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm resize-none"
                      />
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="status">
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel className="text-gray-300 uppercase">
                        Status
                      </FieldLabel>
                      <Popover>
                        <PopoverTrigger
                          className={`w-full h-14 px-5 rounded-xl bg-white/10 border-white/20 backdrop-blur-sm text-base flex items-center justify-between text-white`}
                        >
                          {
                            InquiryStatusDisplay[
                              field.state.value as InquiryStatus
                            ]
                          }
                        </PopoverTrigger>

                        <PopoverContent className=" backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg overflow-y-auto">
                          <Command>
                            {Object.entries(InquiryStatusDisplay).map(
                              ([statusKey, display]) => {
                                const isSelected =
                                  field.state.value === statusKey;

                                return (
                                  <CommandItem
                                    key={statusKey}
                                    onSelect={() => {
                                      field.handleChange(statusKey);
                                    }}
                                    className={`flex justify-between items-center px-4 py-3 rounded-xl cursor-pointer transition-colors duration-200 text-gray-500`}
                                  >
                                    <span>{display}</span>
                                    {isSelected && (
                                      <Check className="w-5 h-5 text-[#dc143c]" />
                                    )}
                                  </CommandItem>
                                );
                              },
                            )}
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>

            <button
              type="submit"
              form="booking-form"
              className="group w-full md:w-auto md:px-16 py-4 bg-[#dc143c] hover:bg-red-700 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(220,20,60,0.3)] hover:shadow-[0_0_40px_rgba(220,20,60,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-3"
            >
              <span>Update Inquiry</span>
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
}
