"use client";

import { useEffect, useState } from "react";
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
import { IBooking } from "@/lib/db/types";
import { BookingStatus, BookingStatusDisplay } from "@/lib/enums";
import { useParams, useRouter } from "next/navigation";
import { getBooking } from "../actions/getBooking";
import { updateBooking } from "../actions/updateBooking";

export const formSchema = z.object({
  reservationFee: z.number(),
  totalAmount: z.number(),
  notes: z.string(),
  status: z.string(),
});

export type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  reservationFee: 0,
  totalAmount: 0,
  notes: "",
  status: "",
};

export default function BookingDetails() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id;
  const [booking, setBooking] = useState<(IBooking & { _id: string }) | null>(
    null,
  );
  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await updateBooking({
        bookingId: booking?._id ?? "",
        scheduleId: booking?.preferred_date._id ?? "",
        timeSlotId: booking?.time_slot._id ?? "",
        reservationFee: value.reservationFee,
        totalAmount: value.totalAmount,
        notes: value.notes,
        status: value.status,
      });
      router.back();
    },
  });
  const fetchBooking = async (id: string) => {
    const response = await getBooking(id);
    return response;
  };

  useEffect(() => {
    const init = async () => {
      if (bookingId) {
        const bookingData = await fetchBooking(bookingId.toString());
        setBooking(bookingData);
        form.setFieldValue("reservationFee", bookingData?.reservation_fee ?? 0);
        form.setFieldValue("totalAmount", bookingData?.total_amount ?? 0);
        form.setFieldValue("notes", bookingData?.notes ?? "");
        form.setFieldValue(
          "status",
          bookingData?.status ?? BookingStatus.FOR_CHECKING,
        );
      }
    };

    init();
  }, [bookingId, form]);

  return (
    <section className="relative w-full bg-black">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="font-russo text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6">
            Booking{" "}
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
                <Field>
                  <FieldLabel className="text-gray-300 uppercase">
                    Full name
                  </FieldLabel>
                  <Input
                    readOnly
                    value={booking?.name ?? ""}
                    className="!text-base h-14 px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm "
                  />
                </Field>

                <Field>
                  <FieldLabel className="text-gray-300 uppercase">
                    Contact Number
                  </FieldLabel>
                  <Input
                    readOnly
                    value={booking?.contact_number ?? ""}
                    className="!text-base h-14 px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm "
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel className="text-gray-300 uppercase">
                  Vehicle Model
                </FieldLabel>
                <Input
                  readOnly
                  value={booking?.vehicle_model ?? ""}
                  className="!text-base h-14 px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm "
                />
              </Field>
              <Field>
                <FieldLabel className="text-gray-300 uppercase">
                  Social Account
                </FieldLabel>
                <Input
                  readOnly
                  value={booking?.social ?? ""}
                  className="!text-base h-14 px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm "
                />
              </Field>

              <Field>
                <FieldLabel className="text-gray-300 uppercase">
                  Signature Services
                </FieldLabel>
                <div
                  className={`w-full h-14 px-5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md text-base flex items-center text-white`}
                >
                  <div className="flex-1 overflow-x-auto scrollbar-services">
                    <div className="flex flex-nowrap gap-3 min-w-max items-center mb-1">
                      {booking &&
                        booking.services.length > 0 &&
                        booking.services.map((item) => (
                          <div
                            key={item._id}
                            className="relative px-5 py-2 rounded-full bg-gradient-to-br from-[#DC143C] to-[#8B0E2A] border border-[#DC143C]/40 text-white text-sm tracking-wide font-medium shadow-[0_4px_20px_rgba(220,20,60,0.35)]"
                          >
                            {item.title}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </Field>

              <Field>
                <FieldLabel className="text-gray-300 uppercase">
                  Add Ons
                </FieldLabel>
                <div
                  className={`w-full h-14 px-5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md text-base flex items-center text-white`}
                >
                  <div className="flex-1 overflow-x-auto scrollbar-services my-1">
                    <div className="flex flex-nowrap gap-3 min-w-max items-center">
                      {booking &&
                        booking.services.length > 0 &&
                        booking.add_ons.map((item) => (
                          <div
                            key={item._id}
                            className="relative px-5 py-2 rounded-full bg-gradient-to-br from-[#DC143C] to-[#8B0E2A] border border-[#DC143C]/40 text-white text-sm tracking-wide font-medium shadow-[0_4px_20px_rgba(220,20,60,0.35)]"
                          >
                            {item.title}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </Field>

              <Field>
                <FieldLabel className="text-gray-300 uppercase">
                  Preferred Date
                </FieldLabel>
                <Input
                  readOnly
                  value={booking?.preferred_date.date.toDateString() ?? ""}
                  className="!text-base h-14 px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm "
                />
              </Field>

              <Field>
                <FieldLabel className="text-gray-300 uppercase">
                  Time Slot
                </FieldLabel>
                <Input
                  readOnly
                  value={booking?.time_slot.time ?? ""}
                  className="!text-base h-14 px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm "
                />
              </Field>

              <Field>
                <FieldLabel className="text-gray-300 uppercase">
                  Complete Address
                </FieldLabel>
                <Textarea
                  readOnly
                  rows={5}
                  maxLength={250}
                  value={booking?.address ?? ""}
                  className="!text-base  px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm  resize-none"
                />
              </Field>
              <form.Field name="reservationFee">
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel className="text-gray-300 uppercase">
                        Reservation Fee
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.handleChange(
                            value === "" ? 0 : parseInt(value),
                          );
                        }}
                        className="!text-base h-14 px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm focus-visible:border-[#dc143c] focus-visible:ring-[#dc143c]/20"
                      />
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="totalAmount">
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel className="text-gray-300 uppercase">
                        Total Amount
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.handleChange(
                            value === "" ? 0 : parseInt(value),
                          );
                        }}
                        className="!text-base h-14 px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm focus-visible:border-[#dc143c] focus-visible:ring-[#dc143c]/20"
                      />
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="notes">
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel className="text-gray-300 uppercase">
                        Notes
                      </FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        rows={5}
                        maxLength={250}
                        placeholder="Enter booking notes"
                        className="!text-base  px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm focus-visible:border-[#dc143c] focus-visible:ring-[#dc143c]/20 resize-none"
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
                            BookingStatusDisplay[
                              field.state.value as BookingStatus
                            ]
                          }
                        </PopoverTrigger>

                        <PopoverContent className=" backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg overflow-y-auto">
                          <Command>
                            {Object.entries(BookingStatusDisplay).map(
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
              <span>Update Booking</span>
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
