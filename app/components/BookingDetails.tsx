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
  BadgePercent,
} from "lucide-react";
import {
  BookingStatus,
  BookingStatusDisplay,
  RewardType,
  ServiceType,
  VehicleSize,
  VehicleType,
} from "@/lib/enums";
import { useParams, useRouter } from "next/navigation";
import { BookingResponse, getBooking } from "../actions/getBooking";
import { updateBooking } from "../actions/updateBooking";
import {
  getVehicleSizes,
  VehicleSizeResponse,
} from "../actions/getVehicleSizes";
import { getServices, ServiceResponse } from "../actions/getServices";
import { motion } from "framer-motion";
import { SectionCard } from "./SectionCard";
import { ReadOnlyField } from "./ReadOnlyField";
import { SelectTrigger } from "./SelectTrigger";
import FullScreenLoader from "./FullScreenLoader";
import { showToast } from "@/lib/toast";
import { CustomerMilestonesPanel } from "./CustomerMilestonesPanel";
import {
  getMilestoneRewards,
  MilestoneRewardsResponse,
} from "../actions/getMilestoneRewards";
import { calculateMilestoneRewardDiscount } from "@/lib/utils";

const config = {
  fee: process.env.NEXT_PUBLIC_TRAVEL_FEE_PER_KM,
  free_distance: process.env.NEXT_PUBLIC_FREE_TRAVEL_DISTANCE_KM,
  deposit: process.env.NEXT_PUBLIC_DOWN_PAYMENT_PERCENTAGE,
};

const dpMultiplier = Number.parseInt(config.deposit as string) / 100;

export const pricingPerSizeSchema = z.object({
  _id: z.string(),
  size_id: z.string(),
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
  pricing_options: z.string().nullable().optional(),
  pricing_per_sizes: z.array(pricingPerSizeSchema),
  price: z.number(),
  notes: z.string(),
});

export const vehicleSizeSchema = z.object({
  _id: z.string(),
  size: z.enum(VehicleSize),
  type: z.enum(VehicleType),
  description: z.string(),
});

export const milestoneRewardSchema = z.object({
  _id: z.string(),
  service_id: z.object({
    _id: z.string(),
    title: z.string(),
  }),
  reward_service_id: z.object({
    _id: z.string(),
    title: z.string(),
  }),
  required_progress_count: z.number(),
  reward_type: z.enum(RewardType),
  discount_percentage: z.number(),
  discount_amount: z.number(),
  vehicle_type: z.enum(VehicleType),
});

export const formSchema = z.object({
  social: z.string(),
  vehicleSizes: z
    .array(vehicleSizeSchema)
    .min(1, "Choose a vehicle type & size."),
  address: z.string(),
  services: z.array(serviceSchema).min(1, "Choose at least one service."),
  pointsUsed: z.number(),
  discount: z.number(),
  reservationFee: z.number(),
  travelFee: z.number(),
  travelDistance: z.string(),
  totalAmount: z.number(),
  notes: z.string(),
  status: z.enum(BookingStatus),
  milestoneReward: z.array(milestoneRewardSchema),
  milestoneDiscount: z.number(),
});

export type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  vehicleSizes: [],
  services: [],
  reservationFee: 0,
  totalAmount: 0,
  travelFee: 0,
  travelDistance: "0",
  pointsUsed: 0,
  discount: 0,
  notes: "",
  social: "",
  address: "",
  status: BookingStatus.FOR_CHECKING,
  milestoneReward: [],
  milestoneDiscount: 0,
};

function Chip({ label }: Readonly<{ label: string }>) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#dc143c]/20 border border-[#dc143c]/40 text-[#ff6b81] text-sm font-medium">
      {label}
    </span>
  );
}

export default function BookingDetails() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id;
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [vehicleSizes, setVehicleSizes] = useState<VehicleSizeResponse[]>([]);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [milestoneRewards, setMilestoneRewards] = useState<
    MilestoneRewardsResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const form = useForm({
    defaultValues,
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      const selectedServices = value.services.map((service) => {
        const price =
          service.pricing_per_sizes.find(
            (item) => item.size_id === value.vehicleSizes[0]._id,
          )?.price ?? 0;
        return {
          _id: service._id,
          title: service.title,
          type: service.type as ServiceType,
          price,
        };
      });

      const travelDistanceInMeters = Number(value.travelDistance) * 1000;
      const result = await updateBooking({
        bookingId: booking?._id ?? "",
        sizeId: value.vehicleSizes[0]._id,
        scheduleId: booking?.preferred_date._id ?? "",
        timeSlotId: booking?.time_slot._id ?? "",
        reservationFee: value.reservationFee,
        travelFee: value.travelFee,
        travelDistance: travelDistanceInMeters,
        discount: value.discount,
        pointsUsed: value.pointsUsed,
        totalAmount: value.totalAmount,
        notes: value.notes,
        status: value.status,
        address: value.address,
        social: value.social,
        services: selectedServices,
        milestone_reward_id: value.milestoneReward.length > 0 ? value.milestoneReward[0]._id : null
      });
      setLoading(false);

      if (result.success) {
        showToast(result.message, "success");
        if (value.status === BookingStatus.COMPLETED) {
          router.push(`/admin/transaction?booking_id=${booking?._id}`);
        } else {
          router.back();
        }
      } else {
        showToast(result.message, "error");
      }
    },
  });

  useEffect(() => {
    const init = async () => {
      if (bookingId) {
        setInitializing(true);
        const [
          servicesData,
          bookingData,
          vehicleSizesData,
          milestoneRewardData,
        ] = await Promise.all([
          getServices(),
          getBooking(bookingId.toString()),
          getVehicleSizes(),
          getMilestoneRewards(),
        ]);
        setServices(servicesData);
        setBooking(bookingData);
        setVehicleSizes(vehicleSizesData);
        setMilestoneRewards(milestoneRewardData);

        if (!bookingData) return;

        form.setFieldValue("social", bookingData.social ?? "");
        form.setFieldValue("address", bookingData.address);
        form.setFieldValue("pointsUsed", bookingData.point_used);
        form.setFieldValue("discount", bookingData.discount);
        form.setFieldValue("reservationFee", bookingData.reservation_fee);
        form.setFieldValue("totalAmount", bookingData.total_amount);
        form.setFieldValue(
          "travelDistance",
          (bookingData.travel_distance / 1000).toString(),
        );
        form.setFieldValue("travelFee", bookingData.travel_fee);
        form.setFieldValue(
          "status",
          bookingData?.status ?? BookingStatus.FOR_CHECKING,
        );
        form.setFieldValue("notes", bookingData.notes ?? "");

        let selectedServiceIds: string[] = [];

        if (bookingData.services && bookingData.add_ons) {
          const result = [...bookingData.services, ...bookingData.add_ons].map(
            (item) => item._id,
          );
          selectedServiceIds = result;
        }

        const selectedServices = servicesData.filter((item) =>
          selectedServiceIds.includes(item._id),
        );

        const vehicleTypeSize = vehicleSizesData.filter(
          (item) => item._id === bookingData.size_id,
        );

        form.setFieldValue("services", selectedServices);
        form.setFieldValue("vehicleSizes", vehicleTypeSize);

        const selectedMilestoneRewards = milestoneRewardData.filter(
          (item) => item._id === bookingData.milestone_reward?._id,
        );
        form.setFieldValue("milestoneReward", selectedMilestoneRewards);

        if (selectedMilestoneRewards.length > 0) {
          const mrService = servicesData.find(
            (s) => s._id === selectedMilestoneRewards[0].reward_service_id._id,
          );

          const mrPrice =
            mrService?.pricing_per_sizes.find(
              (p) =>
                p.type === vehicleTypeSize[0].type &&
                p.size === vehicleTypeSize[0].size,
            )?.price ?? 0;

          const discount = calculateMilestoneRewardDiscount(mrPrice, {
            reward_type: selectedMilestoneRewards[0].reward_type,
            discount_amount: selectedMilestoneRewards[0].discount_amount,
            discount_percentage:
              selectedMilestoneRewards[0].discount_percentage,
          });
          form.setFieldValue("milestoneDiscount", discount);
        }

        setInitializing(false);
      }
    };
    init();
  }, [bookingId, form]);

  const toggleService = (service: ServiceResponse) => {
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

  const onSelectVehicleTypeSize = (size: VehicleSizeResponse) => {
    const selectedServices = form.getFieldValue("services");
    const price = selectedServices.reduce((total, service) => {
      const pricing = service.pricing_per_sizes.find(
        (p) => p.size_id === size._id,
      );
      return total + (pricing?.price ?? 0);
    }, 0);
    form.setFieldValue("totalAmount", price);

    const selectedMilestoneRewards = form.getFieldValue("milestoneReward");
    if (selectedMilestoneRewards.length > 0) {
      const mrService = services.find(
        (s) => s._id === selectedMilestoneRewards[0].reward_service_id._id,
      );

      const mrPrice =
        mrService?.pricing_per_sizes.find(
          (p) => p.type === size.type && p.size === size.size,
        )?.price ?? 0;

      const discount = calculateMilestoneRewardDiscount(mrPrice, {
        reward_type: selectedMilestoneRewards[0].reward_type,
        discount_amount: selectedMilestoneRewards[0].discount_amount,
        discount_percentage: selectedMilestoneRewards[0].discount_percentage,
      });
      form.setFieldValue("milestoneDiscount", discount);
    }
  };

  const onSelectMilestoneReward = (mr: MilestoneRewardsResponse) => {
    const current = form.getFieldValue("milestoneReward");
    const isSelected = current.some((item) => item._id === mr._id);
    form.setFieldValue("milestoneReward", isSelected ? [] : [mr]);

    const mrService = services.find((s) => s._id === mr.reward_service_id._id);
    const mrPrice =
      mrService?.pricing_per_sizes.find(
        (p) =>
          p.type === form.getFieldValue("vehicleSizes")[0].type &&
          p.size === form.getFieldValue("vehicleSizes")[0].size,
      )?.price ?? 0;

    let discountAmount = 0;
    if (!isSelected) {
      discountAmount = calculateMilestoneRewardDiscount(mrPrice, {
        reward_type: mr.reward_type,
        discount_amount: mr.discount_amount,
        discount_percentage: mr.discount_percentage,
      });
    }
    form.setFieldValue("milestoneDiscount", discountAmount);
  };

  return (
    <section className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {initializing && <FullScreenLoader />}
      {booking?.customer && (
        <CustomerMilestonesPanel
          isVisible={true}
          customer={{ ...booking.customer, name: booking.name }}
        />
      )}

      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[#dc143c]/[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#dc143c]/[0.04] blur-[100px]" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
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
              <form.Field name="social">
                {(field) => (
                  <Field>
                    <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                      Social Account
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      placeholder="Social account url"
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.handleChange(v);
                      }}
                      className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
                    />
                  </Field>
                )}
              </form.Field>
            </div>
          </SectionCard>

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
                                  className="flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer text-gray-600 hover:text-white hover:bg-white/[0.06] transition-colors"
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
              <form.Field name="address">
                {(field) => (
                  <Field>
                    <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                      Customer Address
                    </FieldLabel>
                    <Textarea
                      rows={3}
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      placeholder="Customer address"
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.handleChange(v);
                      }}
                      className="px-4 rounded-xl bg-white/[0.04] border-white/10 text-white text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2 resize-none"
                    />
                  </Field>
                )}
              </form.Field>
              <Field>
                <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                  Google Address
                </FieldLabel>
                <a
                  href={`https://www.google.com/maps?q=${booking?.location?.coordinates[1]},${booking?.location?.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group/address cursor-pointer"
                >
                  <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm min-h-[80px] transition-all group-hover/address:bg-white/[0.08] group-hover/address:border-white/20">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {booking?.google_address}
                    </p>
                    <div className="flex justify-end mt-2">
                      <span className="text-[10px] font-black text-[#dc143c] uppercase tracking-widest opacity-0 group-hover/address:opacity-100 transition-opacity">
                        Open in Maps →
                      </span>
                    </div>
                  </div>
                </a>
              </Field>
            </div>
          </SectionCard>

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
                                  className="flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer text-gray-600 hover:text-white hover:bg-white/[0.06] transition-colors"
                                >
                                  <span className="text-sm">
                                    {service.title}
                                  </span>
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
              <form.Field name="milestoneReward">
                {(field) => (
                  <Field>
                    <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                      Milestone Reward
                    </FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className="w-full">
                          <SelectTrigger
                            hasValue={field.state.value.length > 0}
                          >
                            {field.state.value.length > 0 ? (
                              <div className="overflow-x-auto scrollbar-none w-0 flex-1">
                                <div className="flex gap-2 flex-nowrap min-w-max items-center">
                                  {field.state.value.map((item) => (
                                    <Chip
                                      key={item._id}
                                      label={item.reward_service_id.title}
                                    />
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <span>Choose a milestone reward...</span>
                            )}
                          </SelectTrigger>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg max-h-80 overflow-y-auto">
                        <Command>
                          {milestoneRewards
                            .filter(
                              (r) =>
                                r.vehicle_type ===
                                form.getFieldValue("vehicleSizes")[0].type,
                            )
                            .map((mr) => {
                              const isSelected = field.state.value.find(
                                (item) => item._id === mr._id,
                              );
                              return (
                                <CommandItem
                                  key={mr._id}
                                  onSelect={() => onSelectMilestoneReward(mr)}
                                  className="flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer text-gray-600 hover:text-white hover:bg-white/[0.06] transition-colors"
                                >
                                  <span className="text-sm">
                                    {mr.reward_service_id.title}
                                  </span>
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-[#dc143c]" />
                                  )}
                                </CommandItem>
                              );
                            })}
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </Field>
                )}
              </form.Field>
            </div>
          </SectionCard>

          <SectionCard
            icon={<BadgePercent className="w-4 h-4" />}
            title="Rewards Program & Discount"
            subtitle="View applied points and discount."
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReadOnlyField
                  label="Reference Number"
                  value={booking?.reference_number ?? ""}
                />
                <ReadOnlyField
                  label="Promo Code"
                  value={booking?.promo_code_used ?? ""}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <form.Field name="pointsUsed">
                  {(field) => (
                    <Field>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                        Points Used
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const v = e.target.value;
                          const points = v === "" ? 0 : Number.parseInt(v);
                          form.setFieldValue("pointsUsed", points);
                        }}
                        className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
                      />
                    </Field>
                  )}
                </form.Field>
                <form.Field name="discount">
                  {(field) => (
                    <Field>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                        Discount
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const v = e.target.value;
                          const discount = v === "" ? 0 : Number.parseInt(v);
                          form.setFieldValue("discount", discount);
                        }}
                        className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
                      />
                    </Field>
                  )}
                </form.Field>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={<CreditCard className="w-4 h-4" />}
            title="Financials & Notes"
            subtitle="Fee breakdown and internal notes."
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <form.Field name="reservationFee">
                  {(field) => (
                    <Field>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                        Deposit Amount Paid
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
                <form.Field name="totalAmount">
                  {(field) => (
                    <Field>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                        Services Total Amount
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <form.Field name="travelDistance">
                  {(field) => (
                    <Field>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                        Travel Distance (km)
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const v = e.target.value;
                          const distance = v === "" ? 0 : Number.parseFloat(v);

                          const fee = Math.floor(
                            Math.max(
                              0,
                              (distance -
                                Number.parseInt(config.free_distance ?? "0")) *
                                Number.parseInt(config.fee ?? "0"),
                            ),
                          );
                          field.handleChange(v);
                          form.setFieldValue("travelFee", fee);
                        }}
                        className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
                      />
                    </Field>
                  )}
                </form.Field>
                <form.Field name="travelFee">
                  {(field) => (
                    <Field>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                        Travel Fee
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const v = e.target.value;
                          form.setFieldValue("travelFee", Number.parseInt(v));
                        }}
                        className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
                      />
                    </Field>
                  )}
                </form.Field>
              </div>

              <form.Subscribe
                selector={(s) => ({
                  fee: s.values.reservationFee,
                  total: s.values.totalAmount,
                  travelFee: s.values.travelFee,
                  pointsUsed: s.values.pointsUsed,
                  discount: s.values.discount,
                  milestoneReward: s.values.milestoneReward,
                  milestoneDiscount: s.values.milestoneDiscount,
                  vehicleSizes: s.values.vehicleSizes,
                })}
              >
                {({
                  fee,
                  total,
                  travelFee,
                  pointsUsed,
                  discount,
                  milestoneReward,
                  milestoneDiscount,
                  vehicleSizes,
                }) => {
                  const milestoneRewardPrice = (() => {
                    if (!milestoneReward.length) return 0;
                    const rewardService = services.find(
                      (s) => s._id === milestoneReward[0].reward_service_id._id,
                    );
                    return (
                      rewardService?.pricing_per_sizes.find(
                        (p) =>
                          p.type === vehicleSizes[0].type &&
                          p.size === vehicleSizes[0].size,
                      )?.price ?? 0
                    );
                  })();

                  return (
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.02] overflow-hidden shadow-2xl">
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center text-[13px]">
                          <span className="text-neutral-400 font-medium tracking-wide">
                            Services Total Amount
                          </span>
                          <span className="text-white font-bold">
                            + ₱{total.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-[13px]">
                          <span className="text-neutral-400 font-medium tracking-wide">
                            Milestone Service Amount
                          </span>
                          <span className="text-white font-bold">
                            + ₱{milestoneRewardPrice.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-[13px]">
                          <span className="text-neutral-400 font-medium tracking-wide">
                            Travel Fee
                          </span>
                          <span className="text-white font-bold">
                            + ₱{travelFee.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="px-4 py-3 bg-white/[0.03] border-y border-white/[0.06] space-y-2.5">
                        <div className="flex justify-between items-center text-[13px]">
                          <span className="text-neutral-400 font-medium tracking-wide">
                            Total Discount
                          </span>
                          <span className="text-[#00ff88] font-bold">
                            - ₱{(discount + pointsUsed).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-[13px]">
                          <span className="text-neutral-400 font-medium tracking-wide">
                            Milestone Service Discount
                          </span>
                          <span className="text-[#00ff88] font-bold">
                            - ₱{milestoneDiscount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-white font-black text-xs uppercase tracking-widest">
                            Total Amount
                          </span>
                          <span className="text-xl font-black text-white tracking-tighter">
                            ₱
                            {Math.max(
                              0,
                              total +
                                travelFee +
                                milestoneRewardPrice -
                                milestoneDiscount -
                                pointsUsed -
                                discount,
                            ).toLocaleString()}
                          </span>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-neutral-500 font-medium">
                              Reservation Deposit ({dpMultiplier * 100}%)
                            </span>
                            <span className="text-white font-bold">
                              ₱
                              {Math.floor(
                                Math.max(
                                  0,
                                  (total +
                                    milestoneRewardPrice +
                                    travelFee -
                                    milestoneDiscount -
                                    pointsUsed -
                                    discount) *
                                    dpMultiplier,
                                ),
                              ).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-neutral-500 font-medium">
                              Deposit Amount Paid
                            </span>
                            <span className="text-white font-bold">
                              ₱{fee.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#dc143c]/10 border-t border-[#dc143c]/20 px-4 py-4 flex justify-between items-center">
                        <div>
                          <p className="text-[#ff6b81] font-black text-[10px] uppercase tracking-[0.15em] leading-none mb-1">
                            Remaining Balance
                          </p>
                          <p className="text-white/40 text-[9px] font-medium italic">
                            Payable after service completion
                          </p>
                        </div>
                        <span className="text-[#ff6b81] font-black text-lg tracking-tighter">
                          ₱
                          {Math.max(
                            0,
                            total +
                              travelFee +
                              milestoneRewardPrice -
                              milestoneDiscount -
                              pointsUsed -
                              discount -
                              fee,
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                }}
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
                                  onSelect={() =>
                                    field.handleChange(
                                      statusKey as BookingStatus,
                                    )
                                  }
                                  className="flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer text-gray-600 hover:text-white hover:bg-white/[0.06] transition-colors"
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

          <div className="pt-2 flex justify-end">
            <form.Subscribe selector={(state) => state.values.status}>
              {(status) => (
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative inline-flex items-center gap-3 px-10 py-4 bg-[#dc143c] hover:bg-[#c01236] active:scale-[0.98] text-white font-bold text-base rounded-2xl transition-all duration-200 shadow-xl shadow-[#dc143c]/30 hover:shadow-[#dc143c]/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
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
