"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandItem } from "@/components/ui/command";
import {
  Check,
  User,
  Car,
  Calendar,
  Wrench,
  FileText,
  CreditCard,
  ArrowRight,
  Loader2,
  Activity,
} from "lucide-react";
import { IBooking } from "@/lib/db/types";
import {
  BookingStatus,
  BookingStatusDisplay,
  VehicleSize,
  VehicleType,
} from "@/lib/enums";
import { useParams, useRouter } from "next/navigation";
import { getBooking } from "../actions/getBooking";
import { updateBooking } from "../actions/updateBooking";
import {
  getVehicleSizes,
  IVehicleSizesResponse,
} from "../actions/getVehicleSizes";
import { getServices, IServiceResponse } from "../actions/getServices";
import { motion } from "framer-motion";
import { SectionCard } from "./SectionCard";
import { ReadOnlyField } from "./ReadOnlyField";
import { SelectTrigger } from "./SelectTrigger";

export const pricingPerSizeSchema = z.object({
  _id: z.string(),
  type: z.string(),
  size: z.string(),
  size_id: z.string(),
  description: z.string(),
  price: z.number(),
});

export const serviceSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.string(),
  pricing_per_sizes: z.array(pricingPerSizeSchema),
  price: z.number(),
  pricing_options: z.string().nullable(),
});

export const vehicleSizeSchema = z.object({
  _id: z.string(),
  size: z.enum(VehicleSize),
  type: z.enum(VehicleType),
  description: z.string(),
});

export const formSchema = z.object({
  vehicleSizes: z
    .array(vehicleSizeSchema)
    .min(1, "Choose a vehicle type & size."),
  services: z.array(serviceSchema).min(1, "Choose at least one service."),
  reservationFee: z.number(),
  travelFee: z.number(),
  travelDistance: z.number(),
  totalAmount: z.number(),
  notes: z.string(),
  status: z.enum(BookingStatus),
});

export type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  vehicleSizes: [],
  services: [],
  reservationFee: 0,
  totalAmount: 0,
  travelFee: 0,
  travelDistance: 0,
  notes: "",
  status: BookingStatus.FOR_CHECKING,
};

function Chip({ label }: Readonly<{ label: string }>) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#dc143c]/20 border border-[#dc143c]/40 text-[#ff6b81] text-sm font-medium">
      {label}
    </span>
  );
}

const dpMultiplier = Number.parseInt(process.env.NEXT_PUBLIC_DOWN_PAYMENT_PERCENTAGE as string) / 100


/* ─── Main component ─── */
export default function BookingDetails() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id;
  const [booking, setBooking] = useState<(IBooking & { _id: string }) | null>(
    null,
  );
  const [vehicleSizes, setVehicleSizes] = useState<IVehicleSizesResponse[]>([]);
  const [services, setServices] = useState<IServiceResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues,
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      setLoading(true);
      const result = await updateBooking({
        bookingId: booking?._id ?? "",
        sizeId: value.vehicleSizes[0]._id,
        scheduleId: booking?.preferred_date._id ?? "",
        timeSlotId: booking?.time_slot._id ?? "",
        reservationFee: value.reservationFee,
        travelFee: value.travelFee,
        travelDistance: value.travelDistance,
        totalAmount: value.totalAmount,
        notes: value.notes,
        status: value.status,
      });
      setLoading(false);
      if (result.success && value.status === BookingStatus.COMPLETED) {
        router.push(`/admin/transaction?booking_id=${booking?._id}`);
      } else {
        router.back();
      }
    },
  });

  useEffect(() => {
    const init = async () => {
      if (bookingId) {
        const [servicesData, bookingData, vehicleSizesData] = await Promise.all(
          [getServices(), getBooking(bookingId.toString()), getVehicleSizes()],
        );
        let selectedServiceIds: string[] = [];

        if (bookingData?.services && bookingData.add_ons) {
          const result = [...bookingData.services, ...bookingData.add_ons].map(
            (item) => item._id,
          );
          selectedServiceIds = result;
        }

        const selectedServices = servicesData.filter((item) =>
          selectedServiceIds.includes(item._id),
        );

        const vehicleTypeSize = vehicleSizesData.filter(
          (item) => item._id === bookingData?.size_id,
        );

        setServices(servicesData);
        setVehicleSizes(vehicleSizesData);
        setBooking(bookingData);
        form.setFieldValue("reservationFee", bookingData?.reservation_fee ?? 0);
        form.setFieldValue("travelFee", bookingData?.travel_fee ?? 0);
        form.setFieldValue("totalAmount", bookingData?.total_amount ?? 0);
        form.setFieldValue("notes", bookingData?.notes ?? "");
        form.setFieldValue(
          "status",
          bookingData?.status ?? BookingStatus.FOR_CHECKING,
        );
        form.setFieldValue("services", selectedServices);
        form.setFieldValue("vehicleSizes", vehicleTypeSize);
        form.setFieldValue("travelDistance", bookingData?.travel_distance ?? 0)
      }
    };
    init();
  }, [bookingId, form]);

  const toggleService = (service: IServiceResponse) => {
    const currentServices = form.getFieldValue("services");

    let newServices;

    if (currentServices.includes(service)) {
      newServices = currentServices.filter((s) => s !== service);
    } else if (service.title === "Premium Detailer Wash") {
      newServices = [
        ...currentServices.filter(
          (s) => s.title !== "Full Decontamination Wash",
        ),
        service,
      ];
    } else if (service.title === "Full Decontamination Wash") {
      newServices = [
        ...currentServices.filter((s) => s.title !== "Premium Detailer Wash"),
        service,
      ];
    } else {
      newServices = [...currentServices, service];
    }

    let total = 0;

    newServices.forEach((service) => {
      const pricing = service.pricing_per_sizes.find(
        (p) => p.type === "car" && p.size === "sm",
      );

      if (pricing) {
        total += pricing.price;
      }
    });

    form.setFieldValue("totalAmount", total);
    form.setFieldValue("services", newServices);
  };

  const onSelectVehicleTypeSize = (size: IVehicleSizesResponse) => {
    const selectedServices = form.getFieldValue("services");
    const price = selectedServices.reduce((total, service) => {
      const pricing = service.pricing_per_sizes.find(
        (p) => p.size_id === size._id,
      );
      return total + (pricing?.price ?? 0);
    }, 0);
    form.setFieldValue("totalAmount", price);
  };

  return (
    <section className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[#dc143c]/[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#dc143c]/[0.04] blur-[100px]" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="font-russo text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            BOOKING{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff6b81]">
              DETAILS
            </span>
          </h2>
          <p className="mt-4 text-gray-500 text-base max-w-md mx-auto">
            Review booking information and update status.
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
          {/* SECTION 1 — Customer Info */}
          <SectionCard
            icon={<User className="w-4 h-4" />}
            title="Customer"
            subtitle="Who made this booking?"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4">
                <ReadOnlyField label="Full Name" value={booking?.name ?? ""} />
                <ReadOnlyField
                  label="Contact Number"
                  value={booking?.contact_number ?? ""}
                />
              </div>
              <ReadOnlyField
                label="Social Account"
                value={booking?.social ?? ""}
              />
            </div>
          </SectionCard>

          {/* SECTION 2 — Vehicle & Address */}
          <SectionCard
            icon={<Car className="w-4 h-4" />}
            title="Vehicle & Location"
            subtitle="What and where?"
          >
            <div className="space-y-4">
              <form.Field name="vehicleSizes">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                        Vehicle Type & Size
                      </FieldLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button type="button" className="w-full">
                            <SelectTrigger
                              hasValue={field.state.value.length > 0}
                            >
                              {field.state.value.length > 0 ? (
                                <div className="overflow-x-auto scrollbar-services w-0 min-w-0 flex-1 py-2 flex-1">
                                  <div className="flex gap-2 flex-nowrap min-w-max items-center">
                                    {field.state.value.map((item) => (
                                      <Chip
                                        key={item._id}
                                        label={`${item.type.toUpperCase()} • ${item.description.toUpperCase()}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <span>Choose vehicle type & size...</span>
                              )}
                            </SelectTrigger>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg max-h-80 overflow-y-auto">
                          <Command>
                            {vehicleSizes.map((size) => {
                              const isSelected = field.state.value.find(
                                (item) => item._id === size._id,
                              );
                              return (
                                <CommandItem
                                  key={size._id}
                                  onSelect={() => {
                                    field.setValue([size]);
                                    onSelectVehicleTypeSize(size);
                                  }}
                                  className="flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                                >
                                  <span className="text-sm">{`${size.type.toUpperCase()} • ${size.description.toUpperCase()}`}</span>
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-[#dc143c]" />
                                  )}
                                </CommandItem>
                              );
                            })}
                          </Command>
                        </PopoverContent>
                      </Popover>
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
              <ReadOnlyField
                label="Vehicle Model"
                value={booking?.vehicle_model ?? ""}
              />
              <Field>
                <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                  Complete Address
                </FieldLabel>
                <Textarea
                  readOnly
                  rows={3}
                  value={booking?.address ?? ""}
                  className="px-4 py-3 rounded-xl bg-white/[0.03] border-white/[0.08] text-white text-sm resize-none focus-visible:ring-0"
                />
              </Field>
            </div>
          </SectionCard>

          {/* SECTION 3 — Schedule */}
          <SectionCard
            icon={<Calendar className="w-4 h-4" />}
            title="Schedule"
            subtitle="When is this happening?"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ReadOnlyField
                label="Preferred Date"
                value={
                  booking?.preferred_date?.date
                    ? new Date(booking.preferred_date.date).toDateString()
                    : ""
                }
              />
              <ReadOnlyField
                label="Time Slot"
                value={booking?.time_slot?.time ?? ""}
              />
            </div>
          </SectionCard>

          {/* SECTION 4 — Services */}
          <SectionCard
            icon={<Wrench className="w-4 h-4" />}
            title="Services"
            subtitle="What's being performed?"
          >
            <form.Field name="services">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field>
                    <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                      Availed Services
                    </FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className="w-full">
                          <SelectTrigger
                            hasValue={field.state.value.length > 0}
                          >
                            {field.state.value.length > 0 ? (
                              <div className="overflow-x-auto scrollbar-services w-0 min-w-0 flex-1 py-2 flex-1">
                                <div className="flex gap-2 flex-nowrap min-w-max items-center">
                                  {field.state.value.map((item) => (
                                    <Chip key={item._id} label={item.title} />
                                  ))}
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
                          {services.map((service) => {
                            const isSelected = field.state.value.find(
                              (item) => item._id === service._id,
                            );
                            return (
                              <CommandItem
                                key={service._id}
                                onSelect={() => toggleService(service)}
                                className="flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                              >
                                <span className="text-sm">{service.title}</span>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-[#dc143c]" />
                                )}
                              </CommandItem>
                            );
                          })}
                        </Command>
                      </PopoverContent>
                    </Popover>
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
          </SectionCard>

          {/* SECTION 5 — Financials & Notes */}
          <SectionCard
            icon={<CreditCard className="w-4 h-4" />}
            title="Financials & Notes"
            subtitle="Fee breakdown and internal notes."
          >
            <div className="space-y-4">
              <form.Field name="reservationFee">
                {(field) => (
                  <Field>
                    <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                      Reservation Fee
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.handleChange(v === "" ? 0 : Number.parseInt(v));
                      }}
                      className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
                    />
                  </Field>
                )}
              </form.Field>
              <form.Field name="travelDistance">
                {(field) => (
                  <Field>
                    <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                      Travel Distance
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const v = e.target.value;
                        const distance = v === "" ? 0 : Number.parseInt(v);

                        const fee = Math.max(
                          0,
                          (distance -
                            Number.parseInt(
                              process.env.NEXT_PUBLIC_FREE_TRAVEL_DISTANCE_KM ??
                                "0",
                            )) *
                            Number.parseInt(
                              process.env.NEXT_PUBLIC_TRAVEL_FEE_PER_KM ?? "0",
                            ),
                        );
                        field.handleChange(distance);
                        form.setFieldValue("travelFee", fee);
                      }}
                      className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
                    />
                  </Field>
                )}
              </form.Field>
              <form.Field name="travelFee">
                {(field) => (
                  <ReadOnlyField
                    label="Travel Fee"
                    value={field.state.value.toLocaleString()}
                  />
                )}
              </form.Field>

              <form.Field name="totalAmount">
                {(field) => (
                  <Field>
                    <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                      Total Amount
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.handleChange(v === "" ? 0 : Number.parseInt(v));
                      }}
                      className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
                    />
                  </Field>
                )}
              </form.Field>

              {/* Amount summary row */}
              <form.Subscribe
                selector={(s) => ({
                  fee: s.values.reservationFee,
                  total: s.values.totalAmount,
                  travelFee: s.values.travelFee,
                })}
              >
                {({ fee, total, travelFee }) => (
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] divide-y divide-white/[0.06]">
                    <div className="flex justify-between items-center px-4 py-3">
                      <span className="text-gray-500 text-sm">
                        {`Reservation Deposit - ${dpMultiplier * 100}%`}
                      </span>
                      <span className="text-white font-medium text-sm">
                        ₱
                        {Math.max(
                          0,
                          (total + travelFee) * dpMultiplier,
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3">
                      <span className="text-gray-500 text-sm">
                        Reservation Fee
                      </span>
                      <span className="text-white font-medium text-sm">
                        ₱{fee.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3">
                      <span className="text-gray-500 text-sm">
                        Remaining Balance
                      </span>
                      <span className="text-white font-medium text-sm">
                        ₱{Math.max(0, total + travelFee - fee).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 bg-[#dc143c]/10 rounded-b-xl">
                      <span className="text-white font-semibold text-sm">
                        Total Amount
                      </span>
                      <span className="text-[#ff6b81] font-bold text-lg">
                        ₱{Math.max(0, total + travelFee).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </form.Subscribe>

              <form.Field name="notes">
                {(field) => (
                  <Field>
                    <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                      Notes
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      rows={4}
                      maxLength={250}
                      placeholder="Enter booking notes..."
                      className="px-4 py-3 rounded-xl bg-white/[0.04] border-white/10 text-white placeholder:text-gray-600 text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2 resize-none"
                    />
                  </Field>
                )}
              </form.Field>
            </div>
          </SectionCard>

          {/* SECTION 6 — Status */}
          <SectionCard
            icon={<FileText className="w-4 h-4" />}
            title="Status"
            subtitle="Update the current booking status."
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
                                {BookingStatusDisplay[field.state.value]}
                              </div>
                            </div>
                          ) : (
                            <span>Select a status...</span>
                          )}
                        </SelectTrigger>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg max-h-80 overflow-y-auto">
                      <Command>
                        <div className="space-y-1">
                          {Object.entries(BookingStatusDisplay).map(
                            ([statusKey, display]) => {
                              const isSelected =
                                field.state.value === statusKey;
                              return (
                                <CommandItem
                                  key={statusKey}
                                  onSelect={() => field.handleChange(statusKey as BookingStatus)}
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
            <form.Subscribe selector={(state) => state.values.status}>
              {(status) => (
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
                      {status === BookingStatus.COMPLETED
                        ? "Create Transaction"
                        : "Update Booking"}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>
    </section>
  );
}
