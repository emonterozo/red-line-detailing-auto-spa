"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandItem } from "@/components/ui/command";
import {
  Activity,
  ArrowRight,
  Car,
  Check,
  Loader2,
  User,
  Wrench,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getSchedules, ISchedulesResponse } from "../actions/getSchedules";
import { ITimeSlot } from "@/lib/db/types";
import { getServices, IServiceResponse } from "../actions/getServices";
import { BookingStatus, ServiceType } from "@/lib/enums";
import Link from "next/link";
import { createBooking } from "../actions/createBooking";
import { motion } from "framer-motion";
import { SectionCard } from "./SectionCard";
import { SelectTrigger } from "./SelectTrigger";

const today = new Date();
today.setHours(23, 59, 59, 59);

export const pricingPerSizeSchema = z.object({
  _id: z.string(),
  type: z.string(),
  size: z.string(),
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

export const formSchema = z.object({
  fullName: z
    .string()
    .min(5, "Please enter your full name (at least 5 characters).")
    .max(32, "Full name can be at most 32 characters."),

  contactNumber: z
    .string()
    .trim()
    .regex(
      /^09\d{9}$/,
      "Please enter a valid contact number (11 digits, starting with 09).",
    ),

  vehicleModel: z
    .string()
    .min(5, "Please enter your vehicle model (at least 5 characters).")
    .max(250, "Vehicle model can be at most 250 characters."),

  services: z
    .array(serviceSchema)
    .min(1, "Please select at least one signature service."),
  addOns: z.array(serviceSchema).optional(),
  social: z
    .url("Please enter a valid link (must start with https://).")
    .optional(),

  preferred_date: z
    .date()
    .nullable()
    .refine((val) => val !== null, {
      message: "Please choose a preferred date.",
    }) as z.ZodType<Date | null>,

  timeSlot: z.string().min(1, "Please select a time slot."),

  address: z
    .string()
    .min(5, "Please enter your address (at least 5 characters).")
    .max(250, "Address can be at most 250 characters."),

  isChecked: z.boolean().refine((val) => val === true, {
    message: "You must agree to continue.",
  }),

  isCreateAccount: z.boolean(),
});

export type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  fullName: "",
  contactNumber: "",
  social: undefined,
  vehicleModel: "",
  services: [],
  addOns: [],
  preferred_date: null,
  timeSlot: "",
  address: "",
  isChecked: false,
  isCreateAccount: false,
};

function Chip({ label }: Readonly<{ label: string }>) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#dc143c]/20 border border-[#dc143c]/40 text-[#ff6b81] text-sm font-medium">
      {label}
    </span>
  );
}

export default function Booking() {
  const [services, setServices] = useState<IServiceResponse[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [schedules, setSchedules] = useState<ISchedulesResponse[]>([]);
  const [slots, setSlots] = useState<(ITimeSlot & { _id: string })[]>([]);
  const [isSlotPickerOpen, setIsSlotPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    const response = await getServices();
    return response;
  };

  const fetchSchedules = async () => {
    const response = await getSchedules();
    return response;
  };

  useEffect(() => {
    const init = async () => {
      const servicesData = await fetchServices();
      const schedulesData = await fetchSchedules();
      setServices(servicesData);
      setSchedules(schedulesData);
    };

    init();
  }, []);

  const toggleService = (service: IServiceResponse, type: ServiceType) => {
    if (type === ServiceType.SERVICE) {
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

      form.setFieldValue("services", newServices);
    } else {
      const currentServices = form.getFieldValue("addOns");

      if (currentServices) {
        let newServices;
        if (currentServices.includes(service)) {
          newServices = currentServices.filter((s) => s !== service);
        } else {
          newServices = [...currentServices, service];
        }
        form.setFieldValue("addOns", newServices);
      }
    }
  };

  const availableSet = new Set<number>(
    schedules?.map((schedule) => {
      const date = new Date(schedule.date);
      date.setHours(23, 59, 59, 59);
      return date.getTime();
    }),
  );

  const fullyBookedSet = new Set<number>(
    schedules
      .filter((schedule) =>
        schedule.time_slots.every((slot) => !slot.is_available),
      )
      .map((schedule) => {
        const d = new Date(schedule.date);
        d.setHours(23, 59, 59, 59);
        return d.getTime();
      }),
  );

  const generateReference = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    const date = new Date();
    const y = date.getFullYear().toString().slice(2);
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    let random = "";
    for (let i = 0; i < 5; i++) {
      random += chars[Math.floor(Math.random() * chars.length)];
    }

    return `RL-${y}${m}${d}-${random}`;
  };

  const form = useForm({
    defaultValues,
    validators: {
      // @ts-expect-error for fixing types error
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setLoading(true);
      const selectedDate = schedules.find(
        (schedule) =>
          schedule.date.getDate() === value.preferred_date?.getDate() &&
          schedule.date.getMonth() === value.preferred_date?.getMonth() &&
          schedule.date.getFullYear() === value.preferred_date?.getFullYear(),
      );
      const selectedTimeSlot = selectedDate?.time_slots.find(
        (item) => item.time === value.timeSlot,
      );

      const selectedServices = value.services.map((service) => ({
        _id: service._id,
        title: service.title,
        type: service.type as ServiceType,
      }));

      const selectedAddOns =
        value.addOns?.map((service) => ({
          _id: service._id,
          title: service.title,
          type: service.type as ServiceType,
        })) ?? [];

      const result = await createBooking({
        name: value.fullName,
        contact_number: value.contactNumber,
        vehicle_model: value.vehicleModel,
        social: value.social ?? '',
        services: selectedServices,
        add_ons: selectedAddOns,
        preferred_date: {
          _id: selectedDate?._id ?? "",
          date: selectedDate?.date ?? new Date(),
        },
        time_slot: {
          _id: selectedTimeSlot?._id ?? "",
          time: selectedTimeSlot?.time ?? "",
        },
        address: value.address,
        status: BookingStatus.FOR_CHECKING,
        travel_fee: 0,
        reservation_fee: 0,
        total_amount: 0,
        travel_distance: 0,
        reference_number: generateReference(),
        notes: "",
        is_create_account: value.isCreateAccount,
        created_at: new Date(),
        updated_at: new Date(),
      });
      setLoading(false);
      if (
        !result.success &&
        result.field &&
        ["preferred_date", "time_slot"].includes(result.field)
      ) {
        const data = await fetchSchedules();
        if (result.field === "preferred_date") {
          setSchedules(data);
          form.setFieldValue("preferred_date", null);
          form.setFieldValue("timeSlot", "");
          form.fieldInfo.preferred_date.instance?.setErrorMap({
            onSubmit: { message: result.message },
          });
        } else {
          const dateTimeSlots = data.find(
            (schedule) =>
              schedule.date.getDate() === value.preferred_date?.getDate() &&
              schedule.date.getMonth() === value.preferred_date?.getMonth() &&
              schedule.date.getFullYear() ===
                value.preferred_date?.getFullYear(),
          );

          setSlots(dateTimeSlots?.time_slots ?? []);
          form.setFieldValue("timeSlot", "");
          form.fieldInfo.timeSlot.instance?.setErrorMap({
            onSubmit: { message: result.message },
          });
        }
      } else {
        const data = await fetchSchedules();
        setSchedules(data);
        setSlots([]);
        toast(result.message, {
          position: "bottom-right",
          duration: 5000,
        });
        if (result.success) {
          form.reset();
        }
      }
    },
  });

  return (
    <section className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
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
            Fill out your details and we’ll get back to you shortly.
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
            title="Customer"
            subtitle="Who made this booking?"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <form.Field name="fullName">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field>
                        <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
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

                <form.Field name="contactNumber">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field>
                        <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                          Contact Number
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          type="tel"
                          maxLength={11}
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
              </div>
              <form.Field name="social">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                        FB, IG or Tiktok Profile URL
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Optional: Profile or Social URL (e.g., https://instagram.com/redlinedetailing.ph)"
                        className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
                      />
                      <FieldDescription>
                        We will use this an additional way to contact you, and
                        to send you a confirmation of your booking.
                      </FieldDescription>
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
          </SectionCard>

          <SectionCard
            icon={<Car className="w-4 h-4" />}
            title="Vehicle & Location"
            subtitle="What and where?"
          >
            <div className="space-y-4">
              <form.Field name="vehicleModel">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                        Vehicle Model
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Vehicle Model (e.g., Toyota Vios 2020)"
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

              <form.Field name="address">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                        Complete Address
                      </FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        rows={5}
                        maxLength={250}
                        placeholder="Complete Address, landmarks & special instructions"
                        className="px-4 rounded-xl bg-white/[0.04] border-white/10 text-white text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2 resize-none"
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
            </div>
          </SectionCard>

          <SectionCard
            icon={<CalendarIcon className="w-4 h-4" />}
            title="Schedule"
            subtitle="When is this happening?"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <form.Field name="preferred_date">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                        Preferred Date
                      </FieldLabel>
                      <Popover
                        open={isCalendarOpen}
                        onOpenChange={setIsCalendarOpen}
                      >
                        <PopoverTrigger asChild>
                          <button type="button" className="w-full">
                            <SelectTrigger hasValue={!!field.state.value}>
                              {field.state.value ? (
                                <div className="overflow-x-auto scrollbar-services w-0 min-w-0 flex-1 py-2 flex-1">
                                  <div className="flex gap-2 flex-nowrap min-w-max items-center">
                                    {field.state.value.toLocaleDateString(
                                      "en-US",
                                      {
                                        dateStyle: "full",
                                      },
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span>Pick your preferred date</span>
                              )}
                            </SelectTrigger>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg overflow-y-auto">
                          <Calendar
                            className="w-full"
                            mode="single"
                            selected={field.state.value as Date}
                            disabled={(day) => {
                              const normalizedDay = new Date(day);
                              normalizedDay.setHours(23, 59, 59, 59);

                              const timestamp = normalizedDay.getTime();

                              const isPast = normalizedDay < today;
                              const isToday = timestamp === today.getTime();
                              const isAvailable = availableSet.has(timestamp);
                              const isFullyBooked =
                                fullyBookedSet.has(timestamp);

                              return (
                                isPast ||
                                isToday ||
                                !isAvailable ||
                                isFullyBooked
                              );
                            }}
                            modifiers={{
                              booked: (day: Date) => {
                                const timestamp = new Date(day).setHours(
                                  23,
                                  59,
                                  59,
                                  59,
                                );
                                return fullyBookedSet.has(timestamp);
                              },
                            }}
                            modifiersClassNames={{
                              booked: "[&>button]:line-through opacity-100",
                            }}
                            onSelect={(date) => {
                              field.handleChange(date ?? null);
                              form.setFieldValue("timeSlot", "");
                              const dateTimeSlots = schedules.find(
                                (schedule) =>
                                  schedule.date.getDate() === date?.getDate() &&
                                  schedule.date.getMonth() ===
                                    date?.getMonth() &&
                                  schedule.date.getFullYear() ===
                                    date?.getFullYear(),
                              );

                              setSlots(dateTimeSlots?.time_slots ?? []);
                              setIsCalendarOpen(false);
                            }}
                          />
                        </PopoverContent>
                        {isInvalid && (
                          <FieldError
                            className="text-[#ff6b81] text-xs mt-1"
                            errors={field.state.meta.errors}
                          />
                        )}
                      </Popover>
                    </Field>
                  );
                }}
              </form.Field>
              <form.Field name="timeSlot">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  const dateValue = form.getFieldValue("preferred_date");

                  return (
                    <Field>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                        Time Slot
                      </FieldLabel>
                      <Popover
                        open={isSlotPickerOpen}
                        onOpenChange={() => setIsSlotPickerOpen(!!dateValue)}
                      >
                        <PopoverTrigger asChild>
                          <button type="button" className="w-full">
                            <SelectTrigger hasValue={!!field.state.value}>
                              {field.state.value ? (
                                <div className="overflow-x-auto scrollbar-services w-0 min-w-0 flex-1 py-2 flex-1">
                                  <div className="flex gap-2 flex-nowrap min-w-max items-center">
                                    {field.state.value}
                                  </div>
                                </div>
                              ) : (
                                <span>Select a convenient time slot</span>
                              )}
                            </SelectTrigger>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg overflow-y-auto">
                          <Command>
                            {slots.map((slot) => {
                              const isSelected =
                                field.state.value === slot.time;
                              return (
                                <CommandItem
                                  key={slot._id}
                                  onSelect={() => {
                                    field.handleChange(slot.time);
                                    setIsSlotPickerOpen(false);
                                  }}
                                  disabled={!slot.is_available}
                                  className={`flex justify-between items-center px-4 py-3 rounded-xl cursor-pointer transition-colors duration-200 ${!slot.is_available && "text-gray-500 line-through opacity-100"}`}
                                >
                                  <span>{slot.time}</span>
                                  {isSelected && (
                                    <Check className="w-5 h-5 text-[#dc143c]" />
                                  )}
                                </CommandItem>
                              );
                            })}
                          </Command>
                        </PopoverContent>
                        {isInvalid && (
                          <FieldError
                            className="text-[#ff6b81] text-xs mt-1"
                            errors={field.state.meta.errors}
                          />
                        )}
                      </Popover>
                    </Field>
                  );
                }}
              </form.Field>
            </div>
          </SectionCard>

          <SectionCard
            icon={<Wrench className="w-4 h-4" />}
            title="Services"
            subtitle="What's being performed?"
          >
            <div className="space-y-4">
              <form.Field name="services">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                        Signature Services
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
                                <span>
                                  Choose at least one signature service
                                </span>
                              )}
                            </SelectTrigger>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg max-h-80 overflow-y-auto">
                          <Command>
                            {services
                              .filter(
                                (service) =>
                                  service.type === ServiceType.SERVICE,
                              )
                              .map((service) => {
                                const isSelected = field.state.value.find(
                                  (item) => item._id === service._id,
                                );
                                return (
                                  <CommandItem
                                    key={service._id}
                                    onSelect={() =>
                                      toggleService(
                                        service,
                                        ServiceType.SERVICE,
                                      )
                                    }
                                    className="flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                                  >
                                    <span>{service.title}</span>
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
              <form.Field name="addOns">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                        Add Ons
                      </FieldLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button type="button" className="w-full">
                            <SelectTrigger
                              hasValue={
                                !!field.state.value &&
                                field.state.value.length > 0
                              }
                            >
                              {field.state.value &&
                              field.state.value.length > 0 ? (
                                <div className="overflow-x-auto scrollbar-services w-0 min-w-0 flex-1 py-2 flex-1">
                                  <div className="flex gap-2 flex-nowrap min-w-max items-center">
                                    {field.state.value.map((item) => (
                                      <Chip key={item._id} label={item.title} />
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <span>Add optional add-on services</span>
                              )}
                            </SelectTrigger>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg max-h-80 overflow-y-auto">
                          <Command>
                            {services
                              .filter(
                                (service) =>
                                  service.type === ServiceType.ADD_ONS,
                              )
                              .map((service) => {
                                const isSelected = field.state.value?.find(
                                  (item) => item._id === service._id,
                                );
                                return (
                                  <CommandItem
                                    key={service._id}
                                    onSelect={() =>
                                      toggleService(
                                        service,
                                        ServiceType.ADD_ONS,
                                      )
                                    }
                                    className="flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                                  >
                                    <span>{service.title}</span>
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
            </div>
          </SectionCard>

          <form.Field name="isChecked">
            {(field) => {
              const showError = !!(
                form.state.submissionAttempts && !field.state.value
              );

              return (
                <div className="ml-5 flex items-start gap-3 py-2 transition-all duration-300 mb-5">
                  <div className="pt-1">
                    <Checkbox
                      id={field.name}
                      name={field.name}
                      className={`w-5 h-5 rounded-md transition-all duration-300 ${
                        showError
                          ? "border-[#dc143c] bg-[#dc143c]/10"
                          : "border-white/30 bg-white/5 data-[state=checked]:bg-[#dc143c]"
                      }`}
                      checked={field.state.value}
                      onCheckedChange={(checked: boolean) =>
                        form.setFieldValue("isChecked", checked)
                      }
                    />
                  </div>

                  <Label
                    htmlFor={field.name}
                    className={`text-sm md:text-base leading-relaxed cursor-pointer select-none transition-colors ${
                      showError ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {/* Using a ternary here is safer than && to avoid ghost zeros */}
                    {showError ? (
                      <span className="text-[#dc143c] font-black uppercase tracking-widest text-[10px] mr-2">
                        Required:
                      </span>
                    ) : null}

                    {showError
                      ? "You must acknowledge and agree to our "
                      : "By checking this box, you acknowledge and agree to our "}

                    <Link
                      href="/booking-policy"
                      target="_blank"
                      className="text-[#dc143c] hover:text-red-400 underline underline-offset-8 decoration-[#dc143c]/20 font-bold"
                    >
                      Booking Policy.
                    </Link>
                  </Label>
                </div>
              );
            }}
          </form.Field>

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
                  Create Transaction
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
