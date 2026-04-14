"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, User, ArrowRight, Loader2 } from "lucide-react";
import {
  DiscountType,
  DiscountTypeDisplay,
  RewardType,
  TransactionFrom,
  VehicleSize,
  VehicleType,
} from "@/lib/enums";
import {
  getMilestoneRewards,
  MilestoneRewardsResponse,
} from "../actions/getMilestoneRewards";
import { getServices, ServiceResponse } from "../actions/getServices";
import { createTransaction } from "../actions/createTransaction";
import {
  CustomerMilestoneResponse,
  getCustomersMilestone,
} from "../actions/getCustomersMilestone";
import { useRouter, useSearchParams } from "next/navigation";
import { getBooking } from "../actions/getBooking";
import {
  getVehicleSizes,
  VehicleSizeResponse,
} from "../actions/getVehicleSizes";
import { SelectTrigger } from "./SelectTrigger";
import { Textarea } from "@/components/ui/textarea";
import { getTransaction } from "../actions/getTransaction";
import { CustomerMilestonesPanel } from "./CustomerMilestonesPanel";
import { ReadOnlyField } from "./ReadOnlyField";
import FullScreenLoader from "./FullScreenLoader";
import { showToast } from "@/lib/toast";
import { calculateMilestoneRewardDiscount } from "@/lib/utils";

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

export const customerSchema = z.object({
  _id: z.string(),
  name: z.string(),
  earned_points: z.number(),
  milestone_count: z.array(
    z.object({
      _id: z.string(),
      size_id: z.object({
        _id: z.string(),
        size: z.enum(VehicleSize),
        type: z.enum(VehicleType),
        sort_order: z.number(),
      }),
      progress: z.number(),
    }),
  ),
});

export const formSchema = z.object({
  customer: z.array(customerSchema),
  vehicleSizes: z.array(vehicleSizeSchema),
  vehicleModel: z
    .string()
    .min(2, "Please enter your vehicle model (at least 2 characters).")
    .max(250, "Vehicle model must be at most 250 characters."),
  services: z.array(serviceSchema).min(1, "Choose at least one service."),
  travelFee: z.number(),
  downPayment: z.number(),
  totalAmount: z.number(),
  additionalCost: z.number(),
  totalDiscount: z.number(),
  pointsUsed: z.number(),
  milestoneReward: z.array(milestoneRewardSchema),
  discountType: z.union([z.enum(DiscountType), z.string()]),
  milestoneDiscount: z.number(),
  notes: z.string(),
  plateNumber: z.string(),
});

export type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  vehicleSizes: [],
  customer: [],
  vehicleModel: "",
  services: [],
  travelFee: 0,
  downPayment: 0,
  totalAmount: 0,
  additionalCost: 0,
  totalDiscount: 0,
  pointsUsed: 0,
  milestoneReward: [],
  discountType: "",
  notes: "",
  milestoneDiscount: 0,
  plateNumber: "",
};

function SectionCard({
  step,
  title,
  subtitle,
  children,
}: Readonly<{
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="relative">
      {step < 5 && (
        <div className="absolute left-5 top-14 bottom-0 w-px bg-gradient-to-b from-[#dc143c]/40 to-transparent z-0" />
      )}

      <div className="relative z-10 flex gap-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#dc143c] flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-[#dc143c]/40">
          {step}
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

function Chip({ label }: Readonly<{ label: string }>) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#dc143c]/20 border border-[#dc143c]/40 text-[#ff6b81] text-sm font-medium">
      {label}
    </span>
  );
}

const multiplier =
  Number.parseInt(process.env.NEXT_PUBLIC_PERCENTAGE_LIMIT as string) / 100;

export default function Transaction() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const transactionId = searchParams.get("transaction_id");

  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [milestoneRewards, setMilestoneRewards] = useState<
    MilestoneRewardsResponse[]
  >([]);
  const [vehicleSizes, setVehicleSizes] = useState<VehicleSizeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<
    CustomerMilestoneResponse[]
  >([]);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [isFabVisible, setIsFabVisible] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      getCustomersMilestone(customerQuery || "").then(setCustomerResults);
    }, 300);
    return () => clearTimeout(timer);
  }, [customerQuery]);

  const getPointsEarned = (amount: number) => {
    return (
      Math.floor(
        amount /
          Number.parseInt(process.env.NEXT_PUBLIC_PESO_PER_POINTS ?? "100"),
      ) * Number.parseInt(process.env.NEXT_PUBLIC_POINTS_PER_UNIT ?? "2")
    );
  };

  const form = useForm({
    defaultValues,
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      setLoading(true);
      let milestone_reward = null;
      let totalAmount = value.totalAmount + value.additionalCost;
      let totalDiscount = value.totalDiscount + value.pointsUsed;
      const availedServices = value.services.map((item) => {
        const price =
          item.pricing_per_sizes.find(
            (p) =>
              p.type === value.vehicleSizes[0].type &&
              p.size === value.vehicleSizes[0].size,
          )?.price ?? 0;

        return {
          _id: item._id,
          title: item.title,
          price: price,
          discount: 0,
        };
      });
      if (value.milestoneReward.length > 0) {
        const { reward_service_id } = value.milestoneReward[0];
        const milestoneRewardService = services.find(
          (s) => s._id === reward_service_id._id,
        );
        const milestoneRewardPrice =
          milestoneRewardService?.pricing_per_sizes.find(
            (p) =>
              p.type === value.vehicleSizes[0].type &&
              p.size === value.vehicleSizes[0].size,
          )?.price ?? 0;
        milestone_reward = {
          _id: value.milestoneReward[0]._id,
          service_id: reward_service_id._id,
          title: value.milestoneReward[0].reward_service_id.title,
          required_progress_count:
            value.milestoneReward[0].required_progress_count,
          price: milestoneRewardPrice,
        };
        availedServices.push({
          _id: value.milestoneReward[0].reward_service_id._id,
          title: value.milestoneReward[0].reward_service_id.title,
          price: milestoneRewardPrice,
          discount: value.milestoneDiscount,
        });
        totalAmount += milestone_reward.price;
        totalDiscount += value.milestoneDiscount;
      }

      const totalAmountPaid = totalAmount - totalDiscount;
      const pointsEarned = getPointsEarned(totalAmountPaid);

      const result = await createTransaction({
        customer_id: value.customer.length > 0 ? value.customer[0]._id : null,
        booking_id: bookingId,
        transaction_from: bookingId
          ? TransactionFrom.BOOKING
          : TransactionFrom.WALK_IN,
        vehicle_type: value.vehicleSizes[0].type,
        vehicle_size: value.vehicleSizes[0].size,
        vehicle_model: value.vehicleModel,
        plate_number: value.plateNumber,
        services: availedServices,
        discount_type: value.discountType as DiscountType,
        notes: value.notes,
        reservation_fee: value.downPayment,
        total_service_amount: totalAmount,
        additional_cost: value.additionalCost,
        points: {
          total: pointsEarned,
          service: pointsEarned,
          badge: 0,
          referral: 0,
        },
        travel_fee: value.travelFee,
        discount: value.totalDiscount,
        points_used: value.pointsUsed,
        net_total: totalAmountPaid,
        gross_total: totalAmount + value.travelFee,
        total_discount: totalDiscount,
        milestone_reward,
        milestone_discount: value.milestoneDiscount,
        promotion_id: null,
        promo_code_used: null,
      });
      setLoading(false);
      showToast(result.message, result.success ? "success" : "error");
      if (result.success) {
        router.push("/admin");
      }
    },
  });

  useEffect(() => {
    const init = async () => {
      setInitializing(true);
      const [serviceData, milestoneRewardData, customerData, vehicleSizeData] =
        await Promise.all([
          getServices(),
          getMilestoneRewards(),
          getCustomersMilestone(),
          getVehicleSizes(),
        ]);
      setServices(serviceData);
      setMilestoneRewards(milestoneRewardData);
      setCustomerResults(customerData);
      setVehicleSizes(vehicleSizeData);
      form.setFieldValue("vehicleSizes", [vehicleSizeData[0]]);

      if (bookingId) {
        const bookingData = await getBooking(bookingId);

        if (bookingData) {
          const selectedServiceIds = new Set(
            [...bookingData.services, ...bookingData.add_ons].map(
              (item) => item._id,
            ),
          );

          const customer = customerData.filter(
            (item) => item._id === bookingData.customer?._id,
          );

          let discountType = "";
          if (bookingData.point_used > 0 || bookingData.milestone_reward) {
            discountType = DiscountType.PROMOTIONS;
          } else if (bookingData.point_used === 0 && bookingData.discount > 0) {
            discountType = DiscountType.MANUAL;
          }

          form.setFieldValue("vehicleModel", bookingData.vehicle_model);
          form.setFieldValue("travelFee", bookingData.travel_fee);
          form.setFieldValue("downPayment", bookingData.reservation_fee);
          form.setFieldValue("totalAmount", bookingData.total_amount);
          form.setFieldValue("totalDiscount", bookingData.discount);
          form.setFieldValue("pointsUsed", bookingData.point_used);
          form.setFieldValue("discountType", discountType);
          form.setFieldValue("customer", customer);
          setIsFabVisible(customer.length > 0);

          const selectedServices = serviceData.filter((item) =>
            selectedServiceIds.has(item._id),
          );

          const vehicleTypeSize = vehicleSizeData.filter(
            (item) => item._id === bookingData.size_id,
          );
          form.setFieldValue("vehicleSizes", vehicleTypeSize);
          form.setFieldValue("services", selectedServices);

          const milestoneReward = milestoneRewardData.filter(
            (item) => item._id === bookingData.milestone_reward?._id,
          );

          const milestoneRewardService = serviceData.find(
            (item) =>
              item._id === bookingData.milestone_reward?.reward_service_id,
          );

          const milestoneRewardServicePrice =
            milestoneRewardService?.pricing_per_sizes.find(
              (item) =>
                item.size === vehicleTypeSize[0].size &&
                item.type === vehicleTypeSize[0].type,
            )?.price ?? 0;

          form.setFieldValue("milestoneReward", milestoneReward);

          const discountAmount = calculateMilestoneRewardDiscount(
            milestoneRewardServicePrice,
            {
              reward_type: milestoneReward[0].reward_type,
              discount_amount: milestoneReward[0].discount_amount,
              discount_percentage: milestoneReward[0].discount_percentage,
            },
          );

          form.setFieldValue("milestoneDiscount", discountAmount);
        }
      }

      if (transactionId) {
        const transactionData = await getTransaction(transactionId);
        if (transactionData) {
          const selectedServices = serviceData.filter((item) =>
            transactionData.services.includes(item._id),
          );

          const vehicleTypeSize = vehicleSizeData.filter(
            (item) =>
              item.type === transactionData.vehicle_type &&
              item.size === transactionData.vehicle_size,
          );

          const customer = customerData.filter(
            (item) => item._id === transactionData.customer_id,
          );

          const milestoneReward = milestoneRewardData.filter(
            (item) => item._id === transactionData.milestone_reward?._id,
          );

          const milestoneRewardPrice =
            transactionData.milestone_reward?.price ?? 0;
          form.setFieldValue("customer", customer);
          form.setFieldValue("vehicleSizes", vehicleTypeSize);
          form.setFieldValue("vehicleModel", transactionData.vehicle_model);
          form.setFieldValue("services", selectedServices);
          form.setFieldValue("travelFee", transactionData.travel_fee);
          form.setFieldValue("downPayment", transactionData.reservation_fee);
          form.setFieldValue(
            "totalAmount",
            transactionData.total_service_amount - milestoneRewardPrice,
          );
          form.setFieldValue("additionalCost", transactionData.additional_cost);
          form.setFieldValue("totalDiscount", transactionData.discount);
          form.setFieldValue("pointsUsed", transactionData.points_used);
          form.setFieldValue("milestoneReward", milestoneReward);
          form.setFieldValue("discountType", transactionData.discount_type);
          form.setFieldValue(
            "milestoneDiscount",
            transactionData.milestone_reward?.discount ?? 0,
          );
          form.setFieldValue("notes", transactionData.notes ?? "");
          form.setFieldValue("plateNumber", transactionData.plate_number ?? "");
        }
      }
      setInitializing(false);
    };
    init();
  }, [bookingId, form, transactionId]);

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
        (p) =>
          p.type === form.getFieldValue("vehicleSizes")[0].type &&
          p.size === form.getFieldValue("vehicleSizes")[0].size,
      );

      if (pricing) {
        total += pricing.price;
      }
    });

    form.setFieldValue("totalAmount", total);
    form.setFieldValue("services", newServices);
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

  const onSelectVehicleSize = (vehicleSize: VehicleSizeResponse) => {
    const current = form.getFieldValue("vehicleSizes");
    const isSelected = current.some((item) => item._id === vehicleSize._id);
    form.setFieldValue("vehicleSizes", isSelected ? [] : [vehicleSize]);
    form.setFieldValue("totalAmount", 0);
    form.setFieldValue("services", []);
    form.setFieldValue("milestoneReward", []);
    form.setFieldValue("milestoneDiscount", 0);
  };

  return (
    <section className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {initializing && <FullScreenLoader />}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[#dc143c]/[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#dc143c]/[0.04] blur-[100px]" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="mb-14 text-center">
          <h2 className="font-russo text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            {`${transactionId ? "Transaction" : "Create"} `}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff6b81]">
              {`${transactionId ? "Details" : "Transaction"}`}
            </span>
          </h2>
          <p className="mt-4 text-gray-500 text-base max-w-md mx-auto">
            {`${transactionId ? "Review transaction summary, customer activity, and applied rewards." : "Fill in the details below to log a new service transaction."}`}
          </p>
        </div>

        <CustomerMilestonesPanel
          isVisible={isFabVisible}
          customer={form.getFieldValue("customer")[0]}
        />

        <form
          id="booking-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-0"
        >
          <SectionCard
            step={1}
            title="Customer"
            subtitle="Who's availing the service?"
          >
            <form.Field name="customer">
              {(field) => (
                <Field>
                  <Popover
                    open={isCustomerOpen}
                    onOpenChange={setIsCustomerOpen}
                  >
                    <PopoverTrigger asChild>
                      <button type="button" className="w-full">
                        <SelectTrigger hasValue={field.state.value.length > 0}>
                          {field.state.value.length > 0 ? (
                            <div className="flex gap-2 flex-wrap">
                              {field.state.value.map((c) => (
                                <Chip key={c._id} label={c.name} />
                              ))}
                            </div>
                          ) : (
                            <span className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Search customer...
                            </span>
                          )}
                        </SelectTrigger>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg max-h-80 overflow-y-auto">
                      <Command>
                        <CommandInput
                          placeholder="Type a name..."
                          value={customerQuery}
                          onValueChange={setCustomerQuery}
                          className=" placeholder:text-gray-600 bg-transparent border-none focus:ring-0 text-sm mb-1"
                        />
                        <CommandEmpty className="text-gray-600 text-sm py-3 text-center">
                          No customer found.
                        </CommandEmpty>
                        <CommandGroup>
                          {customerResults.map((customer) => {
                            const isSelected = field.state.value?.some(
                              (v) => v._id === customer._id,
                            );
                            return (
                              <CommandItem
                                key={customer._id}
                                onSelect={() => {
                                  field.setValue(isSelected ? [] : [customer]);
                                  setIsFabVisible(!isSelected);
                                }}
                                className="flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer text-gray-600 hover:text-white hover:bg-white/[0.06] transition-colors"
                              >
                                <span className="text-sm">{customer.name}</span>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-[#dc143c]" />
                                )}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </Field>
              )}
            </form.Field>
          </SectionCard>

          <SectionCard
            step={2}
            title="Vehicle Details"
            subtitle="What are we working on today?"
          >
            <div className="space-y-4">
              <form.Field name="vehicleSizes">
                {(field) => (
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
                              <div className="overflow-x-auto scrollbar-none w-0 flex-1">
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
                                onSelect={() => onSelectVehicleSize(size)}
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
                  </Field>
                )}
              </form.Field>
              <form.Field name="vehicleModel">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                        Model
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="e.g. Toyota Vios 2022"
                        className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white placeholder:text-gray-600 text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
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
              <form.Field name="plateNumber">
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                        Plate Number
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.value.toUpperCase())
                        }
                        placeholder="e.g. RLD2026"
                        className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white placeholder:text-gray-600 text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
                      />
                    </Field>
                  );
                }}
              </form.Field>
            </div>
          </SectionCard>

          <SectionCard
            step={3}
            title="Services & Rewards"
            subtitle="Select what's being performed."
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
            step={4}
            title="Transaction Notes"
            subtitle="Additional details for this transaction."
          >
            <div className="space-y-4">
              <form.Field name="discountType">
                {(field) => (
                  <Field>
                    <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                      Discount Type
                    </FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className="w-full">
                          <SelectTrigger
                            hasValue={field.state.value.length > 0}
                          >
                            {field.state.value === "" ? (
                              <span>Choose discount type...</span>
                            ) : (
                              <div className="overflow-x-auto scrollbar-none w-0 flex-1">
                                <div className="flex gap-2 flex-nowrap min-w-max items-center">
                                  <Chip
                                    key={field.state.value}
                                    label={field.state.value.toUpperCase()}
                                  />
                                </div>
                              </div>
                            )}
                          </SelectTrigger>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-lg max-h-80 overflow-y-auto">
                        <Command>
                          {Object.entries(DiscountTypeDisplay).map(
                            ([statusKey, display]) => {
                              const isSelected =
                                field.state.value === statusKey;
                              return (
                                <CommandItem
                                  key={statusKey}
                                  onSelect={() =>
                                    field.handleChange(
                                      isSelected ? "" : statusKey,
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
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </Field>
                )}
              </form.Field>
              <form.Field name="notes">
                {(field) => {
                  return (
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
                        rows={3}
                        placeholder="Transaction additional notes"
                        className="resize-none px-4 rounded-xl bg-white/[0.04] border-white/10 text-white placeholder:text-gray-600 text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
                      />
                    </Field>
                  );
                }}
              </form.Field>
            </div>
          </SectionCard>

          <SectionCard
            step={5}
            title="Summary"
            subtitle="Review amounts before submitting."
          >
            <div className="space-y-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <form.Field name="totalAmount">
                  {(field) => (
                    <ReadOnlyField
                      label="Services Total Amount"
                      value={field.state.value.toString()}
                    />
                  )}
                </form.Field>

                <form.Field name="additionalCost">
                  {(field) => (
                    <Field>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest">
                        Additional Cost
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
                        className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white placeholder:text-gray-600 text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
                      />
                    </Field>
                  )}
                </form.Field>
              </div>

              <form.Subscribe selector={(s) => s.values.totalAmount}>
                {(total) => {
                  const tiers = [
                    { off: 50, min: 125 },
                    { off: 100, min: 250 },
                    { off: 150, min: 375 },
                  ];
                  const next = tiers.find((t) => total < t.min);

                  return (
                    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
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

                      {/* progress bar */}
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
                  );
                }}
              </form.Subscribe>

              <div className="mt-4 space-y-1 rounded-xl overflow-hidden">
                <form.Subscribe
                  selector={(s) => ({
                    discount: s.values.totalDiscount,
                    milestoneDiscount: s.values.milestoneDiscount,
                    total: s.values.totalAmount,
                    additionalCost: s.values.additionalCost,
                    milestoneReward: s.values.milestoneReward,
                    vehicleSizes: s.values.vehicleSizes,
                    travelFee: s.values.travelFee,
                    downPayment: s.values.downPayment,
                    pointsUsed: s.values.pointsUsed,
                  })}
                >
                  {({
                    discount,
                    milestoneDiscount,
                    total,
                    additionalCost,
                    milestoneReward,
                    vehicleSizes,
                    travelFee,
                    downPayment,
                    pointsUsed,
                  }) => {
                    // Price of the milestone reward service based on current vehicle type + size
                    const milestoneRewardPrice = (() => {
                      if (!milestoneReward.length) return 0;
                      const rewardService = services.find(
                        (s) =>
                          s._id === milestoneReward[0].reward_service_id._id,
                      );
                      return (
                        rewardService?.pricing_per_sizes.find(
                          (p) =>
                            p.type === vehicleSizes[0].type &&
                            p.size === vehicleSizes[0].size,
                        )?.price ?? 0
                      );
                    })();

                    const grossTotal =
                      total + additionalCost + milestoneRewardPrice + travelFee;
                    const netTotal = Math.max(
                      0,
                      grossTotal -
                        discount -
                        milestoneDiscount -
                        downPayment -
                        pointsUsed,
                    );

                    const amountPaid =
                      total +
                      additionalCost +
                      milestoneRewardPrice -
                      discount -
                      milestoneDiscount -
                      pointsUsed;
                    const pointsEarned = getPointsEarned(amountPaid);

                    const maximumPoints =
                      (total + additionalCost - discount) * multiplier;

                    return (
                      <div className="space-y-1">
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                            <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1">
                              Redemption Limit
                            </p>
                            <p className="text-sm font-bold text-white">
                              {maximumPoints.toLocaleString()}{" "}
                              <span className="text-[10px] text-neutral-500">
                                pts
                              </span>
                            </p>
                          </div>
                          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                            <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1">
                              Points to Earn
                            </p>
                            <p className="text-sm font-bold text-[#00ff88]">
                              +{pointsEarned.toLocaleString()}{" "}
                              <span className="text-[10px] opacity-50 text-[#00ff88]">
                                pts
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="px-1 space-y-3 pb-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-neutral-400">
                              Services Subtotal
                            </span>
                            <span className="text-white font-semibold">
                              ₱{total.toLocaleString()}
                            </span>
                          </div>

                          {milestoneRewardPrice > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-neutral-400">
                                Milestone Service
                              </span>
                              <span className="text-white font-semibold">
                                + ₱{milestoneRewardPrice.toLocaleString()}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-sm">
                            <span className="text-neutral-400">Travel Fee</span>
                            <span className="text-white font-semibold">
                              + ₱{travelFee.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-white/[0.06]">
                            <span className="text-xs font-black text-white/40 uppercase tracking-widest">
                              Gross Total
                            </span>
                            <span className="text-white font-bold">
                              ₱{grossTotal.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 rounded-[22px] bg-white/[0.03] border border-white/[0.08] space-y-4">
                          <form.Field name="totalDiscount">
                            {(field) => (
                              <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                  <span className="text-sm text-neutral-300 font-medium">
                                    Manual Discount
                                  </span>
                                  <span className="text-[10px] text-neutral-500 font-medium uppercase">
                                    Subtract from total
                                  </span>
                                </div>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-xs">
                                    ₱
                                  </span>
                                  <Input
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      field.handleChange(
                                        v === "" ? 0 : Number.parseInt(v),
                                      );
                                    }}
                                    className="h-9 w-32 text-right pl-7 pr-3 rounded-xl bg-black/40 border-white/10 text-white text-sm focus:border-[#dc143c]/60 focus:ring-1 focus:ring-[#dc143c]/20 transition-all"
                                  />
                                </div>
                              </div>
                            )}
                          </form.Field>

                          <form.Field name="pointsUsed">
                            {(field) => (
                              <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                  <span className="text-sm text-neutral-300 font-medium">
                                    Use Points
                                  </span>
                                  <span className="text-[10px] text-neutral-500 font-medium uppercase">
                                    Max: {maximumPoints}
                                  </span>
                                </div>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    field.handleChange(
                                      v === "" ? 0 : Number.parseInt(v),
                                    );
                                  }}
                                  className="h-9 w-32 text-right px-3 rounded-xl bg-black/40 border-white/10 text-white text-sm focus:border-[#dc143c]/60 focus:ring-1 focus:ring-[#dc143c]/20 transition-all"
                                />
                              </div>
                            )}
                          </form.Field>

                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-neutral-500">
                                Milestone Discount
                              </span>
                              <span className="text-[#ff6b81] font-bold">
                                - ₱{milestoneDiscount.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-neutral-500">
                                Reservation Down Payment
                              </span>
                              <span className="text-[#ff6b81] font-bold">
                                - ₱{downPayment.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 p-4 rounded-2xl bg-[#dc143c] flex justify-between items-center shadow-lg shadow-[#dc143c]/20 relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                          <div className="flex flex-col relative">
                            <span className="text-white font-black text-xs uppercase tracking-[0.2em] leading-none">
                              Net Balance
                            </span>
                            <span className="text-[10px] text-white/60 mt-1">
                              Final amount due
                            </span>
                          </div>
                          <span className="text-white font-black text-2xl tracking-tighter relative">
                            ₱{netTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                </form.Subscribe>
              </div>
            </div>
          </SectionCard>

          {!transactionId && (
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
                    Processing...
                  </>
                ) : (
                  <>
                    Create Transaction
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
