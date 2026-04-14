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
  Activity,
  ArrowRight,
  Car,
  Check,
  Loader2,
  Wrench,
  Calendar as CalendarIcon,
  Receipt,
  AlertCircle,
  Lock,
  Info,
  Star,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getSchedules, ScheduleResponse } from "../actions/getSchedules";
import { ITimeSlot } from "@/lib/db/types";
import { getServices, ServiceResponse } from "../actions/getServices";
import {
  BookingStatus,
  RewardType,
  ServiceType,
  VehicleSize,
  VehicleType,
} from "@/lib/enums";
import Link from "next/link";
import { createBooking } from "../actions/createBooking";
import { motion } from "framer-motion";
import { SectionCard } from "./SectionCard";
import { SelectTrigger } from "./SelectTrigger";
import {
  getVehicleSizes,
  VehicleSizeResponse,
} from "../actions/getVehicleSizes";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import FullScreenLoader from "./FullScreenLoader";
import {
  calculateMilestoneRewardDiscount,
  generateDiscountTiers,
  generateReference,
} from "@/lib/utils";
import {
  getMilestoneRewards,
  MilestoneRewardsResponse,
} from "../actions/getMilestoneRewards";
import { CustomerDetailsResponse, getCustomer } from "../actions/getCustomer";
import { useSession } from "next-auth/react";
import { CONFIG } from "../config/config";

const today = new Date();
today.setHours(23, 59, 59, 59);

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
  pricing_options: z.string().nullable().optional(),
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

export const formSchema = z
  .object({
    vehicleSizes: z
      .array(vehicleSizeSchema)
      .min(1, "Please choose a vehicle type."),
    vehicleModel: z
      .string()
      .min(2, "Please enter your vehicle model (at least 2 characters).")
      .max(250, "Vehicle model can be at most 250 characters."),
    services: z
      .array(serviceSchema)
      .min(1, "Please select at least one signature service."),
    addOns: z.array(serviceSchema).optional(),
    preferred_date: z.coerce
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
    milestoneReward: z.array(milestoneRewardSchema),
    milestoneRewardPrice: z.number(),
    milestoneRewardDiscount: z.number(),
    pointsUsed: z
      .number()
      .refine((val) => val === 0 || val >= CONFIG.MINIMUM_REDEEM_POINTS, {
        message: `Minimum redeemable points is ${CONFIG.MINIMUM_REDEEM_POINTS}.`,
      }),
    totalAmount: z.number(),
  })
  .refine(
    (data) => {
      const maxPointsValue = data.totalAmount * CONFIG.PERCENTAGE_LIMIT;
      return data.pointsUsed <= maxPointsValue;
    },
    {
      message: "You can only use up to 40% of the total amount in points.",
      path: ["pointsUsed"],
    },
  );

export type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  vehicleSizes: [],
  vehicleModel: "",
  services: [],
  addOns: [],
  preferred_date: null,
  timeSlot: "",
  address: "",
  isChecked: false,
  milestoneReward: [],
  milestoneRewardPrice: 0,
  milestoneRewardDiscount: 0,
  pointsUsed: 0,
  totalAmount: 0,
};

function Chip({ label }: Readonly<{ label: string }>) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#dc143c]/20 border border-[#dc143c]/40 text-[#ff6b81] text-sm font-medium">
      {label}
    </span>
  );
}

export default function CustomerBooking() {
  const { data: session } = useSession();
  const router = useRouter();
  const [vehicleSizes, setVehicleSizes] = useState<VehicleSizeResponse[]>([]);
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [slots, setSlots] = useState<(ITimeSlot & { _id: string })[]>([]);
  const [isSlotPickerOpen, setIsSlotPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [milestoneRewards, setMilestoneRewards] = useState<
    MilestoneRewardsResponse[]
  >([]);
  const [customer, setCustomer] = useState<CustomerDetailsResponse | null>(
    null,
  );
  const [vehicleMilestoneRewards, setVehicleMilestoneRewards] = useState<
    MilestoneRewardsResponse[]
  >([]);

  const fetchSchedules = async () => {
    const response = await getSchedules();
    return response;
  };

  const toggleService = (service: ServiceResponse, type: ServiceType) => {
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

      const selectedVehicleSizes = form.getFieldValue("vehicleSizes");
      if (selectedVehicleSizes.length > 0) {
        const rewardsPerVehicle = milestoneRewards.filter(
          (item) => item.vehicle_type === selectedVehicleSizes[0].type,
        );
        const selectedVehicleMilestoneCount = customer?.milestone_count.find(
          (item) => item.size_id === selectedVehicleSizes[0]._id,
        );
        const data = rewardsPerVehicle.filter(
          (item) =>
            (selectedVehicleMilestoneCount?.progress as number) >=
            item.required_progress_count - 1,
        );

        const isPremiumWashSelected = newServices.find(
          (item) => item.title === "Premium Detailer Wash",
        );
        setVehicleMilestoneRewards(isPremiumWashSelected ? data : []);
        form.setFieldValue("milestoneReward", []);

        const addOns = form.getFieldValue("addOns") ?? [];
        const price = getPricing(
          [...newServices, ...addOns],
          selectedVehicleSizes,
        );
        form.setFieldValue("totalAmount", price);
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

        const selectedVehicleSizes = form.getFieldValue("vehicleSizes");
        if (selectedVehicleSizes.length > 0) {
          const services = form.getFieldValue("services") ?? [];
          const price = getPricing(
            [...newServices, ...services],
            selectedVehicleSizes,
          );
          form.setFieldValue("totalAmount", price);
        }
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

      const selectedServices = value.services.map((service) => {
        const price =
          service.pricing_per_sizes.find(
            (item) => item.size_id === value.vehicleSizes[0]._id,
          )?.price ?? 0;

        return {
          _id: service._id,
          title: service.title,
          type: service.type as ServiceType,
          price: price,
        };
      });

      const selectedAddOns =
        value.addOns?.map((service) => {
          const price =
            service.pricing_per_sizes.find(
              (item) => item.size_id === value.vehicleSizes[0]._id,
            )?.price ?? 0;
          return {
            _id: service._id,
            title: service.title,
            type: service.type as ServiceType,
            price: price,
          };
        }) ?? [];

      const reference = generateReference();

      const {
        first_name,
        last_name,
        contact_number,
        social,
        google_address,
        location,
        travel_distance,
        _id,
      } = customer as CustomerDetailsResponse;

      const result = await createBooking({
        customer_id: _id,
        milestone_reward_id:
          value.milestoneReward.length > 0
            ? value.milestoneReward[0]._id
            : null,
        first_name: first_name,
        last_name: last_name,
        contact_number: contact_number,
        vehicle_model: value.vehicleModel,
        social: social ?? "",
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
        google_address: google_address ?? "",
        latitude: location?.coordinates[1] ?? 0,
        longitude: location?.coordinates[0] ?? 0,
        status: BookingStatus.FOR_CHECKING,
        travel_fee: getTravelFee(travel_distance),
        reservation_fee: 0,
        total_amount: getPricing(
          [...value.services, ...value.addOns!],
          value.vehicleSizes,
        ),
        travel_distance: travel_distance,
        reference_number: reference,
        notes: "",
        size_id: value.vehicleSizes[0]._id,
        point_used: value.pointsUsed,
      });
      setLoading(false);
      if (!result.success) showToast(result.message, "error");
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
        if (result.success) {
          window.open(`/booking/${reference}`, "_blank");
          router.back();
          form.reset();
        }
      }
    },
  });

  const getPricing = (
    selectedServices: z.infer<typeof serviceSchema>[],
    selectedVehicleSizes: z.infer<typeof vehicleSizeSchema>[],
  ) => {
    return selectedServices.reduce((total, service) => {
      const pricing = service.pricing_per_sizes.find(
        (p) => p.size_id === selectedVehicleSizes[0]._id,
      );
      return total + (pricing?.price ?? 0);
    }, 0);
  };

  useEffect(() => {
    const init = async () => {
      setInitializing(true);
      if (session?.user) {
        const [
          vehicleSizesData,
          schedulesData,
          servicesData,
          milestoneRewardData,
          customerData,
        ] = await Promise.all([
          getVehicleSizes(),
          fetchSchedules(),
          getServices(),
          getMilestoneRewards(),
          getCustomer(session?.user?.id as string),
        ]);

        form.setFieldValue("address", customerData?.address as string);
        setCustomer(customerData);
        setVehicleSizes(vehicleSizesData);
        setSchedules(schedulesData);
        setServices(servicesData);
        setMilestoneRewards(milestoneRewardData);
        setInitializing(false);
      }
    };

    init();
  }, [form, session]);

  const getTravelFee = (distance: number) => {
    const distanceInKm = distance / 1000;
    const fee = Math.max(
      0,
      (distanceInKm - CONFIG.FREE_TRAVEL_DISTANCE_KM) *
        CONFIG.TRAVEL_FEE_PER_KM,
    );
    return Math.ceil(fee);
  };

  const onSelectMilestoneReward = (mr: MilestoneRewardsResponse) => {
    const vehicleSizes = form.getFieldValue("vehicleSizes");
    if (vehicleSizes.length > 0) {
      const current = form.getFieldValue("milestoneReward");
      const isSelected = current.some((item) => item._id === mr._id);
      form.setFieldValue("milestoneReward", isSelected ? [] : [mr]);

      const mrService = services.find(
        (s) => s._id === mr.reward_service_id._id,
      );
      const mrPrice =
        mrService?.pricing_per_sizes.find(
          (p) =>
            p.type === vehicleSizes[0].type && p.size === vehicleSizes[0].size,
        )?.price ?? 0;

      let discountAmount = 0;
      if (!isSelected) {
        discountAmount = calculateMilestoneRewardDiscount(mrPrice, {
          reward_type: mr.reward_type,
          discount_amount: mr.discount_amount,
          discount_percentage: mr.discount_percentage,
        });
      }
      form.setFieldValue("milestoneRewardPrice", mrPrice);
      form.setFieldValue("milestoneRewardDiscount", discountAmount);
    }
  };

  const onSelectVehicleType = (size: VehicleSizeResponse) => {
    const rewardsPerVehicle = milestoneRewards.filter(
      (item) => item.vehicle_type === size.type,
    );
    const selectedVehicleMilestoneCount = customer?.milestone_count.find(
      (item) => item.size_id === size._id,
    );
    const data = rewardsPerVehicle.filter(
      (item) =>
        (selectedVehicleMilestoneCount?.progress as number) >=
        item.required_progress_count - 1,
    );
    const selectedServices = form.getFieldValue("services");
    const isPremiumWashSelected = selectedServices.find(
      (item) => item.title === "Premium Detailer Wash",
    );
    setVehicleMilestoneRewards(isPremiumWashSelected ? data : []);

    const selectedAddOns = form.getFieldValue("addOns") ?? [];
    const totalPrice = getPricing(
      [...selectedServices, ...selectedAddOns],
      [size],
    );
    form.setFieldValue("totalAmount", totalPrice);
    form.setFieldValue("vehicleSizes", [size]);
    form.setFieldValue("milestoneReward", []);
  };

  return (
    <section className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[#dc143c]/[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#dc143c]/[0.04] blur-[100px]" />
      {initializing && <FullScreenLoader />}

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
                        Vehicle Type
                      </FieldLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button type="button" className="w-full">
                            <SelectTrigger
                              hasValue={field.state.value.length > 0}
                            >
                              <div className="overflow-x-auto scrollbar-services w-0 min-w-0 flex-1 py-2 flex-1">
                                {field.state.value &&
                                field.state.value.length > 0 ? (
                                  <div className="flex gap-2 flex-nowrap min-w-max items-center">
                                    {`${field.state.value[0].description.toUpperCase()}`}
                                  </div>
                                ) : (
                                  <div className="flex gap-2 flex-nowrap min-w-max items-center">
                                    Select your vehicle type
                                  </div>
                                )}
                              </div>
                            </SelectTrigger>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg overflow-y-auto">
                          <Command>
                            {vehicleSizes
                              .filter((item) => item.type === VehicleType.CAR)
                              .map((size) => {
                                const isSelected = field.state.value.find(
                                  (item) => item._id === size._id,
                                );
                                return (
                                  <CommandItem
                                    key={size._id}
                                    onSelect={() => onSelectVehicleType(size)}
                                    className="flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer text-gray-600 hover:text-white hover:bg-white/[0.06] transition-colors"
                                  >
                                    <span>
                                      {size.description.toUpperCase()}
                                    </span>
                                    {isSelected && (
                                      <Check className="w-4 h-4 text-[#dc143c]" />
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
                              <div className="overflow-x-auto scrollbar-services w-0 min-w-0 flex-1 py-2 flex-1">
                                {field.state.value ? (
                                  <div className="flex gap-2 flex-nowrap min-w-max items-center">
                                    {field.state.value.toLocaleDateString(
                                      "en-US",
                                      {
                                        dateStyle: "full",
                                      },
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex gap-2 flex-nowrap min-w-max items-center">
                                    Pick your preferred date
                                  </div>
                                )}
                              </div>
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
                              <div className="overflow-x-auto scrollbar-services w-0 min-w-0 flex-1 py-2 flex-1">
                                {field.state.value ? (
                                  <div className="flex gap-2 flex-nowrap min-w-max items-center">
                                    {field.state.value}
                                  </div>
                                ) : (
                                  <div className="flex gap-2 flex-nowrap min-w-max items-center">
                                    Select a convenient time slot
                                  </div>
                                )}
                              </div>
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
                              <div className="overflow-x-auto scrollbar-services w-0 min-w-0 flex-1 py-2 flex-1">
                                {field.state.value.length > 0 ? (
                                  <div className="flex gap-2 flex-nowrap min-w-max items-center">
                                    {field.state.value.map((item) => (
                                      <Chip key={item._id} label={item.title} />
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex gap-2 flex-nowrap min-w-max items-center">
                                    Choose at least one signature service
                                  </div>
                                )}
                              </div>
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
                                    className="flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer text-gray-600 hover:text-white hover:bg-white/[0.06] transition-colors"
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
                              <div className="overflow-x-auto scrollbar-services w-0 min-w-0 flex-1 py-2 flex-1">
                                {field.state.value &&
                                field.state.value.length > 0 ? (
                                  <div className="flex gap-2 flex-nowrap min-w-max items-center">
                                    {field.state.value.map((item) => (
                                      <Chip key={item._id} label={item.title} />
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex gap-2 flex-nowrap min-w-max items-center">
                                    Add optional add-on services
                                  </div>
                                )}
                              </div>
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
                                    className="flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer text-gray-600 hover:text-white hover:bg-white/[0.06] transition-colors"
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

          <SectionCard
            icon={<Wrench className="w-4 h-4" />}
            title="Rewards Program & Discount"
            subtitle="What's being performed?"
          >
            <div className="space-y-4">
              {/* <form.Field name="milestoneReward">
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
                          {vehicleMilestoneRewards.map((mr) => {
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
              </form.Field> */}
              <form.Field name="milestoneReward">
                {(field) => {
                  const currentVehicle =
                    form.getFieldValue("vehicleSizes")?.[0];
                  const qualifyingServices = [
                    "Premium Detailer Wash",
                    "Full Decontamination Wash",
                  ];
                  const selectedServices = form.getFieldValue("services") || [];

                  const isCorrectService = selectedServices.some((service) =>
                    qualifyingServices.includes(service.title),
                  );

                  const vehicleProgressObj = customer?.milestone_count.find(
                    (m) =>
                      m.vehicle_type === currentVehicle?.type &&
                      m.vehicle_size === currentVehicle?.size,
                  );
                  const currentProgress =
                    (vehicleProgressObj?.progress ?? 0) + 1;

                  const filteredRewards = milestoneRewards.filter(
                    (r) => r.vehicle_type === currentVehicle?.type,
                  );

                  return (
                    <Field className="space-y-2">
                      <div className="flex justify-between items-end px-1">
                        <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest font-semibold">
                          Milestone Rewards
                        </FieldLabel>
                      </div>

                      {!currentVehicle ? (
                        /* LOCKED STATE: Matches the "Points Used" input style */
                        <div className="relative h-12 w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
                          <div className="absolute inset-0 z-10 flex items-center justify-between px-4 bg-black/40 backdrop-blur-[1.5px]">
                            <div className="flex items-center gap-2">
                              <Lock className="w-3.5 h-3.5 text-white/40" />
                              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.1em]">
                                Select vehicle to unlock
                              </p>
                            </div>
                            <div className="h-1.5 w-16 rounded-full bg-white/5" />
                          </div>
                        </div>
                      ) : (
                        /* ACTIVE STATE: Your existing Rewards Grid */
                        <div className="grid grid-cols-1 gap-3 pt-1">
                          {filteredRewards.length > 0 ? (
                            filteredRewards.map((mr) => {
                              const hasProgress =
                                currentProgress >= mr.required_progress_count;
                              const isUnlocked =
                                hasProgress && isCorrectService;
                              const isSelected = field.state.value.some(
                                (item) => item._id === mr._id,
                              );

                              const rewardLabel =
                                mr.reward_type === "free_service"
                                  ? "FREE SERVICE"
                                  : mr.discount_percentage > 0
                                    ? `${mr.discount_percentage}% DISCOUNT`
                                    : `₱${mr.discount_amount.toLocaleString()} OFF`;

                              return (
                                <button
                                  key={mr._id}
                                  type="button"
                                  disabled={!isUnlocked}
                                  onClick={() => onSelectMilestoneReward(mr)}
                                  className={`relative overflow-hidden text-left p-4 rounded-2xl border transition-all duration-300 ${
                                    isSelected
                                      ? "bg-[#dc143c]/10 border-[#dc143c]/40 ring-1 ring-[#dc143c]/20"
                                      : isUnlocked
                                        ? "bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20"
                                        : "bg-black/20 border-white/5 opacity-40 cursor-not-allowed"
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                      <p
                                        className={`text-sm font-bold ${isUnlocked ? "text-white" : "text-gray-500"}`}
                                      >
                                        {mr.reward_service_id.title}
                                      </p>
                                      <p
                                        className={`text-[10px] font-black tracking-widest uppercase ${
                                          isUnlocked
                                            ? mr.reward_type === "free_service"
                                              ? "text-emerald-400"
                                              : "text-[#ff6b81]"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        {rewardLabel}
                                      </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                      {isSelected ? (
                                        <div className="bg-[#dc143c] p-1 rounded-full">
                                          <Check className="w-3 h-3 text-white" />
                                        </div>
                                      ) : isUnlocked ? (
                                        <div className="bg-emerald-500/20 p-1 rounded-full animate-bounce">
                                          <Star className="w-3 h-3 text-emerald-400" />
                                        </div>
                                      ) : (
                                        <div className="bg-white/5 p-1 rounded-full text-gray-600">
                                          <Lock className="w-3 h-3" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })
                          ) : (
                            <div className="p-4 text-center text-gray-600 text-xs italic">
                              No rewards found for this vehicle type.
                            </div>
                          )}
                        </div>
                      )}
                    </Field>
                  );
                }}
              </form.Field>
              {customer &&
                customer.earned_points >= CONFIG.MINIMUM_REDEEM_POINTS && (
                  <form.Field name="pointsUsed">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
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
                )}
              <form.Subscribe selector={(s) => s.values.totalAmount}>
                {(total) => {
                  const userPoints = customer?.earned_points ?? 0;
                  const isLocked = userPoints < CONFIG.MINIMUM_REDEEM_POINTS;

                  const tiers = generateDiscountTiers();
                  const next = tiers.find((t) => total < t.min);

                  return (
                    <div className="relative mt-4 overflow-hidden rounded-xl">
                      {isLocked && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[1.5px] transition-all duration-500 rounded-xl">
                          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5">
                            <Lock className="w-4 h-4 text-white/80" />
                          </div>
                          <p className="text-white font-black text-[11px] uppercase tracking-[0.15em]">
                            Unlock Discounts
                          </p>
                          <p className="text-white/40 text-[10px] font-medium mt-1">
                            Earn {CONFIG.MINIMUM_REDEEM_POINTS - userPoints}{" "}
                            more points to use rewards
                          </p>
                        </div>
                      )}

                      <div
                        className={`rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3 transition-all duration-500 ${
                          isLocked
                            ? "blur-[1.5px] opacity-40 pointer-events-none"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold">
                            Spend Discounts
                          </p>
                          {next ? (
                            <p className="text-gray-500 text-xs">
                              ₱
                              <span className="text-white font-semibold">
                                {next.min - total}
                              </span>{" "}
                              more to unlock ₱{next.off} off
                            </p>
                          ) : (
                            <p className="text-[#ff6b81] text-xs font-semibold">
                              All tiers unlocked 🎉
                            </p>
                          )}
                        </div>
                        <div className="relative h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#dc143c] to-[#ff6b81] transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (total / 375) * 100)}%`,
                            }}
                          />

                          {tiers.map((t) => (
                            <div
                              key={t.min}
                              className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/40"
                              style={{ left: `${(t.min / 375) * 100}%` }}
                            />
                          ))}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {tiers.map((t) => {
                            const unlocked = total >= t.min;
                            return (
                              <div
                                key={t.min}
                                className={`rounded-xl p-3 border text-center transition-all duration-300 ${
                                  unlocked
                                    ? "bg-[#dc143c]/15 border-[#dc143c]/40"
                                    : "bg-white/[0.02] border-white/[0.08]"
                                }`}
                              >
                                <p
                                  className={`text-lg font-bold leading-none ${unlocked ? "text-[#ff6b81]" : "text-gray-600"}`}
                                >
                                  ₱{t.off}
                                  <span className="text-xs font-normal ml-0.5">
                                    off
                                  </span>
                                </p>
                                <p
                                  className={`text-xs mt-1 ${unlocked ? "text-gray-400" : "text-gray-600"}`}
                                >
                                  min ₱{t.min}
                                </p>
                                {unlocked && (
                                  <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-[#dc143c] font-semibold">
                                    <Check className="w-2.5 h-2.5" /> Unlocked
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }}
              </form.Subscribe>
            </div>
          </SectionCard>

          <SectionCard
            icon={<Receipt className="w-4 h-4" />}
            title="Service Quote"
            subtitle="A breakdown of your selected services and estimated pricing"
          >
            <div className="space-y-1">
              <form.Subscribe
                selector={(s) => ({
                  selectedServices: s.values.services,
                  addOns: s.values.addOns,
                  selectedVehicleSizes: s.values.vehicleSizes,
                  milestoneRewardPrice: s.values.milestoneRewardPrice,
                  milestoneRewardDiscount: s.values.milestoneRewardDiscount,
                  pointsUsed: s.values.pointsUsed,
                })}
              >
                {({
                  selectedServices,
                  addOns,
                  selectedVehicleSizes,
                  milestoneRewardPrice,
                  milestoneRewardDiscount,
                  pointsUsed,
                }) => {
                  let servicesAmount = 0;
                  let addOnsAmount = 0;

                  if (
                    selectedServices.length > 0 &&
                    selectedVehicleSizes.length > 0
                  ) {
                    servicesAmount = getPricing(
                      selectedServices,
                      selectedVehicleSizes,
                    );
                  }

                  if (
                    addOns &&
                    addOns.length > 0 &&
                    selectedVehicleSizes.length > 0
                  ) {
                    addOnsAmount = getPricing(addOns, selectedVehicleSizes);
                  }

                  return (
                    <>
                      <div className="rounded-[22px] border border-white/10 bg-white/[0.02] overflow-hidden shadow-2xl">
                        <div className="p-4 space-y-3">
                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-neutral-400 font-medium tracking-wide">
                              Services Total
                            </span>
                            <span className="text-white font-bold">
                              + ₱{servicesAmount.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-neutral-400 font-medium tracking-wide">
                              Add-Ons Total
                            </span>
                            <span className="text-white font-bold">
                              + ₱{addOnsAmount.toLocaleString()}
                            </span>
                          </div>

                          {customer && (
                            <div className="flex justify-between items-center text-[13px]">
                              <span className="text-neutral-400 font-medium tracking-wide">
                                Travel Fee ({customer?.travel_distance / 1000}
                                km)
                              </span>
                              <span className="text-white font-bold">
                                + ₱
                                {getTravelFee(
                                  customer?.travel_distance,
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-neutral-400 font-medium tracking-wide">
                              Milestone Service Price
                            </span>
                            <span className="text-white font-bold">
                              + ₱{milestoneRewardPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="px-4 py-3 bg-white/[0.03] border-y border-white/[0.06] space-y-2.5">
                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-neutral-400 font-medium tracking-wide">
                              Milestone Service Discount
                            </span>
                            <span className="text-[#00ff88] font-bold">
                              - ₱{milestoneRewardDiscount.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-neutral-400 font-medium tracking-wide">
                              Redeemed Points
                            </span>
                            <span className="text-[#00ff88] font-bold">
                              - ₱{pointsUsed.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-white font-black text-xs uppercase tracking-widest">
                              Estimated Total
                            </span>
                            <span className="text-xl font-black text-white tracking-tighter">
                              ₱
                              {(
                                servicesAmount +
                                addOnsAmount +
                                milestoneRewardPrice +
                                getTravelFee(customer?.travel_distance ?? 0) -
                                milestoneRewardDiscount -
                                pointsUsed
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed text-amber-200/60 font-medium">
                          <strong className="text-amber-500 uppercase text-[10px] block mb-0.5">
                            Note:
                          </strong>
                          This total is a preliminary estimate based on the
                          information you provided. Our team will verify your
                          inputs and provide the finalized cost.
                        </p>
                      </div>
                    </>
                  );
                }}
              </form.Subscribe>
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
          <div className="pt-2 flex justify-end">
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
                  Submit Booking
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
