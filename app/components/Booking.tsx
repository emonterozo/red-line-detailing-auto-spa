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
import { Check } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getSchedules, ISchedulesResponse } from "../actions/getSchedules";
import { ITimeSlot } from "@/lib/db/types";
import { getServices, IServiceResponse } from "../actions/getServices";
import { BookingStatus, ServiceType } from "@/lib/enums";
import Link from "next/link";
import { createBooking } from "../actions/createBooking";

const today = new Date();
today.setHours(23, 59, 59, 59);

export const pricingPerSizeSchema = z.object({
  _id: z.string(),
  size: z.string(),
  vehicle: z.string(),
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
    .min(5, "Full name must be at least 5 characters.")
    .max(32, "Full name must be at most 32 characters."),
  contactNumber: z
    .string()
    .trim()
    .regex(/^09\d{9}$/, "Contact number must be 11 digits and start with 09."),
  vehicleModel: z
    .string()
    .min(4, "Vehicle model must be at least 5 characters.")
    .max(250, "Vehicle model must be at most 250 characters."),
  services: z
    .array(serviceSchema)
    .min(1, "Choose at least one signature service."),
  addOns: z.array(serviceSchema).optional(),
  social: z
    .url("Enter you social account url.")
    .max(250, "Social account url must be at most 250 characters."),
  preferred_date: z
    .date()
    .nullable()
    .refine((val) => val !== null, {
      message: "Choose a preferred date.",
    }) as z.ZodType<Date | null>,
  timeSlot: z.string().min(1, "Choose a time slot."),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters.")
    .max(250, "Address must be at most 250 characters."),
  isChecked: z.boolean().refine((val) => val === true, {
    message: "You must agree before submitting",
  }),
});

export type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  fullName: "",
  contactNumber: "",
  social: "",
  vehicleModel: "",
  services: [],
  addOns: [],
  preferred_date: null,
  timeSlot: "",
  address: "",
  isChecked: false,
};

export default function Booking() {
  const [services, setServices] = useState<IServiceResponse[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [schedules, setSchedules] = useState<ISchedulesResponse[]>([]);
  const [slots, setSlots] = useState<(ITimeSlot & { _id: string })[]>([]);
  const [isSlotPickerOpen, setIsSlotPickerOpen] = useState(false);

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

  const form = useForm({
    defaultValues,
    validators: {
      // @ts-expect-error for fixing types error
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
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
      }));
      const selectedAddOns =
        value.addOns?.map((service) => ({
          _id: service._id,
          title: service.title,
        })) ?? [];

      const result = await createBooking({
        name: value.fullName,
        contact_number: value.contactNumber,
        vehicle_model: value.vehicleModel,
        social: value.social,
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
        reservation_fee: 0,
        total_amount: 0,
        notes: "",
        created_at: new Date(),
        updated_at: new Date(),
      });
      if (
        !result.success &&
        result.field &&
        ["preferred_date", "time_slot"].includes(result.field)
      ) {
        const data = await fetchSchedules();
        switch (result.field) {
          case "preferred_date":
            setSchedules(data);
            form.setFieldValue("preferred_date", null);
            form.setFieldValue("timeSlot", "");
            form.fieldInfo.preferred_date.instance?.setErrorMap({
              onSubmit: { message: result.message },
            });
            break;

          default:
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

            break;
        }
      } else {
        const data = await fetchSchedules();
        setSchedules(data);
        setSlots([])
        toast(result.message, {
          position: "bottom-right",
          duration: 5000,
        });
      }
      form.reset();
    },
  });

  return (
    <section className="relative w-full bg-black">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="font-russo text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6">
            Book An{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] via-red-500 to-[#dc143c] bg-[length:200%_auto]">
              Appointment
            </span>
          </h2>

          <p className="text-gray-400 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Fill out your details and we’ll get back to you shortly.
          </p>

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
                <form.Field name="fullName">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field>
                        <FieldLabel className="text-gray-300 uppercase">
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

                <form.Field name="contactNumber">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field>
                        <FieldLabel className="text-gray-300 uppercase">
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
                          placeholder="Enter your contact number"
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
              <form.Field name="vehicleModel">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field>
                      <FieldLabel className="text-gray-300 uppercase">
                        Vehicle Model
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter your vehicle model"
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
              <form.Field name="social">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field>
                      <FieldLabel className="text-gray-300 uppercase">
                        Social Account
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter your social url (Facebook, Tiktok, Instagram, etc.)"
                        className="!text-base h-14 px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm focus-visible:border-[#dc143c] focus-visible:ring-[#dc143c]/20"
                      />
                      <FieldDescription>
                        We will use this an additional way to contact you, and
                        to send you a confirmation of your booking.
                      </FieldDescription>
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

              <form.Field name="services">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field>
                      <FieldLabel className="text-gray-300 uppercase">
                        Signature Services
                      </FieldLabel>
                      <Popover>
                        <PopoverTrigger
                          className={`w-full h-14 px-5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md text-base flex items-center ${field.state.value.length > 0 ? "text-white" : "text-gray-400"}`}
                        >
                          <div className="flex-1 overflow-x-auto scrollbar-hide">
                            <div className="flex flex-nowrap gap-3 min-w-max items-center">
                              {field.state.value.length > 0 ? (
                                field.state.value.map((item) => (
                                  <div
                                    key={item._id}
                                    className="relative px-5 py-2 rounded-full bg-gradient-to-br from-[#DC143C] to-[#8B0E2A] border border-[#DC143C]/40 text-white text-sm tracking-wide font-medium shadow-[0_4px_20px_rgba(220,20,60,0.35)]"
                                  >
                                    {item.title}
                                  </div>
                                ))
                              ) : (
                                <div>Choose a signature services</div>
                              )}
                            </div>
                          </div>
                        </PopoverTrigger>

                        <PopoverContent className=" backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg overflow-y-auto">
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
                                    className={`flex justify-between items-center px-4 py-3 rounded-xl cursor-pointer transition-colors duration-200`}
                                  >
                                    <span>{service.title}</span>
                                    {isSelected && (
                                      <Check className="w-5 h-5 text-[#dc143c]" />
                                    )}
                                  </CommandItem>
                                );
                              })}
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FieldDescription>
                        You may select multiple services, but only one of
                        Premium Wash or Decontamination Wash can be chosen at a
                        time.
                      </FieldDescription>
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

              <form.Field name="addOns">
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel className="text-gray-300 uppercase">
                        Add Ons
                      </FieldLabel>
                      <Popover>
                        <PopoverTrigger
                          className={`w-full h-14 px-5 rounded-xl bg-white/10 border-white/20 backdrop-blur-sm text-base flex items-center justify-between ${(field.state.value ?? []).length > 0 ? "text-white" : "text-gray-400"}`}
                        >
                          <div className="flex-1 overflow-x-auto scrollbar-hide">
                            <div className="flex flex-nowrap gap-3 min-w-max items-center">
                              {(field.state.value ?? []).length > 0 ? (
                                field.state.value?.map((item) => (
                                  <div
                                    key={item._id}
                                    className="relative px-5 py-2 rounded-full bg-gradient-to-br from-[#DC143C] to-[#8B0E2A] border border-[#DC143C]/40 text-white text-sm tracking-wide font-medium shadow-[0_4px_20px_rgba(220,20,60,0.35)]"
                                  >
                                    {item.title}
                                  </div>
                                ))
                              ) : (
                                <div>Choose an add ons services</div>
                              )}
                            </div>
                          </div>
                        </PopoverTrigger>

                        <PopoverContent className="backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg overflow-y-auto">
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
                                    className={`flex justify-between items-center px-4 py-3 rounded-xl cursor-pointer transition-colors duration-200`}
                                  >
                                    <span>{service.title}</span>
                                    {isSelected && (
                                      <Check className="w-5 h-5 text-[#dc143c]" />
                                    )}
                                  </CommandItem>
                                );
                              })}
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FieldDescription>
                        You may select multiple add ons services.
                      </FieldDescription>
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="preferred_date">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field>
                      <FieldLabel className="text-gray-300 uppercase">
                        Preferred Date
                      </FieldLabel>
                      <Popover
                        open={isCalendarOpen}
                        onOpenChange={setIsCalendarOpen}
                      >
                        <PopoverTrigger
                          className={` h-14 px-5 rounded-xl bg-white/10 border-white/20 backdrop-blur-sm text-base flex items-center justify-between ${
                            field.state.value ? "text-white" : "text-gray-400"
                          }`}
                        >
                          {field.state.value
                            ? field.state.value.toLocaleDateString("en-US", {
                                dateStyle: "full",
                              })
                            : "Choose a date"}
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
                            className="text-[#dc143c]"
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
                      <FieldLabel className="text-gray-300 uppercase">
                        Time Slot
                      </FieldLabel>
                      <Popover
                        open={isSlotPickerOpen}
                        onOpenChange={() => setIsSlotPickerOpen(!!dateValue)}
                      >
                        <PopoverTrigger
                          className={`w-full h-14 px-5 rounded-xl bg-white/10 border-white/20 backdrop-blur-sm text-base flex items-center justify-between ${
                            field.state.value === ""
                              ? "text-gray-400"
                              : "text-white"
                          }`}
                        >
                          {field.state.value === ""
                            ? "Choose a time slot"
                            : field.state.value}
                        </PopoverTrigger>

                        <PopoverContent className=" backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg overflow-y-auto">
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
                      </Popover>
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

              <form.Field name="address">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field>
                      <FieldLabel className="text-gray-300 uppercase">
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
                        placeholder="Enter your complete address, landmarks, and any specific instructions for our team."
                        className="!text-base  px-5 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-sm focus-visible:border-[#dc143c] focus-visible:ring-[#dc143c]/20 resize-none"
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

              <form.Field name="isChecked">
                {(field) => {
                  const showError =
                    form.state.submissionAttempts && !field.state.value;

                  return (
                    <Field orientation="horizontal">
                      <Checkbox
                        id={field.name}
                        name={field.name}
                        className={`w-5 h-5 border-white/50 rounded-s border-white/50`}
                        checked={field.state.value}
                        onCheckedChange={(checked: boolean) =>
                          form.setFieldValue("isChecked", checked)
                        }
                      />
                      <Label className="leading-relaxed">
                        {`${showError ? "You must you acknowledge and agree to our " : "By checking this box, you acknowledge and agree to our "}`}
                        <Link
                          href="/policy"
                          className="text-[#dc143c] hover:underline"
                        >
                          Booking Policy
                        </Link>
                        .
                      </Label>
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
              <span>Submit Booking</span>
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
