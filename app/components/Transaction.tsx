"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
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
import { Check, ChevronDown, User, ArrowRight, Loader2, X } from "lucide-react";
import {
  RewardType,
  TransactionFrom,
  VehicleSize,
  VehicleType,
} from "@/lib/enums";
import {
  getMilestoneRewards,
  IMilestoneRewardResponse,
} from "../actions/getMilestoneRewards";
import { getServices, IServiceResponse } from "../actions/getServices";
import { createTransaction } from "../actions/createTransaction";
import { getCustomers, ICustomerResponse } from "../actions/getCustomers";
import { useSearchParams } from "next/navigation";
import { getBooking } from "../actions/getBooking";
import {
  getVehicleSizes,
  IVehicleSizesResponse,
} from "../actions/getVehicleSizes";

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

export const vehicleSizeSchema = z.object({
  _id: z.string(),
  size: z.enum(VehicleSize),
  type: z.enum(VehicleType),
  description: z.string(),
});

export const milestoneRewardSchema = z.object({
  _id: z.string(),
  service_id: z.string(),
  service: z.string(),
  required_progress_count: z.number(),
  reward_type: z.enum(RewardType),
  discount_percentage: z.number(),
  discount_amount: z.number(),
});

export const customerSchema = z.object({
  _id: z.string(),
  name: z.string(),
  earned_points: z.number(),
  milestone_count: z.array(
    z.object({
      _id: z.string(),
      vehicle: z.object({
        _id: z.string(),
        size: z.enum(VehicleSize),
        type: z.enum(VehicleType),
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
    .min(4, "Vehicle model must be at least 5 characters.")
    .max(250, "Vehicle model must be at most 250 characters."),
  services: z.array(serviceSchema).min(1, "Choose at least one service."),
  travelFee: z.number(),
  downPayment: z.number(),
  totalAmount: z.number(),
  totalDiscount: z.number(),
  maximumPoints: z.number(),
  milestoneReward: z.array(milestoneRewardSchema),
  milestoneDiscount: z.number(),
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
  maximumPoints: 0,
  totalDiscount: 0,
  milestoneReward: [],
  milestoneDiscount: 0,
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
      {/* vertical connector */}
      {step < 4 && (
        <div className="absolute left-5 top-14 bottom-0 w-px bg-gradient-to-b from-[#dc143c]/40 to-transparent z-0" />
      )}

      <div className="relative z-10 flex gap-5">
        {/* step badge */}
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

function Chip({ label }: Readonly<{ label: string }>) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#dc143c]/20 border border-[#dc143c]/40 text-[#ff6b81] text-sm font-medium">
      {label}
    </span>
  );
}

export default function Transaction() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");

  const [services, setServices] = useState<IServiceResponse[]>([]);
  const [milestoneRewards, setMilestoneRewards] = useState<
    IMilestoneRewardResponse[]
  >([]);
  const [vehicleSizes, setVehicleSizes] = useState<IVehicleSizesResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<ICustomerResponse[]>(
    [],
  );
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      getCustomers(customerQuery || "").then(setCustomerResults);
    }, 300);
    return () => clearTimeout(timer);
  }, [customerQuery]);

  const form = useForm({
    defaultValues,
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      setLoading(true);
      let milestone_reward = null;
      if (value.milestoneReward.length > 0) {
        const { service_id } = value.milestoneReward[0];
        const milestoneRewardService = services.find(
          (s) => s._id === service_id,
        );
        const milestoneRewardPrice =
          milestoneRewardService?.pricing_per_sizes.find(
            (p) =>
              p.type === value.vehicleSizes[0].type &&
              p.size === value.vehicleSizes[0].size,
          )?.price ?? 0;
        milestone_reward = {
          _id: value.milestoneReward[0]._id,
          title: value.milestoneReward[0].service,
          required_progress_count:
            value.milestoneReward[0].required_progress_count,
          price: milestoneRewardPrice,
        };
      }
      const result = await createTransaction({
        user_id: value.customer.length > 0 ? value.customer[0]._id : null,
        booking_id: bookingId,
        transaction_from: bookingId ? TransactionFrom.BOOKING : TransactionFrom.WALK_IN,
        vehicle_type: value.vehicleSizes[0].type,
        vehicle_size: value.vehicleSizes[0].size,
        vehicle_model: value.vehicleModel,
        services: value.services.map((s) => ({ _id: s._id, title: s.title })),
        travel_fee: value.travelFee,
        total_amount: value.totalAmount,
        total_discount: value.totalDiscount,
        milestone_reward,
        milestone_discount: value.milestoneDiscount,
      });
      setLoading(false);
      toast(result.message, { position: "bottom-right", duration: 5000 });
    },
  });

  useEffect(() => {
    const init = async () => {
      const [s, m, c, v] = await Promise.all([
        getServices(),
        getMilestoneRewards(),
        getCustomers(),
        getVehicleSizes(),
      ]);
      setServices(s);
      setMilestoneRewards(m);
      setCustomerResults(c);
      setVehicleSizes(v);
      form.setFieldValue("vehicleSizes", [v[0]]);
    };
    init();
  }, [form]);

  useEffect(() => {
    const init = async () => {
      if (bookingId) {
        const bookingData = await getBooking(bookingId.toString());
        form.setFieldValue("vehicleModel", bookingData?.vehicle_model ?? "");
        form.setFieldValue("travelFee", bookingData?.travel_fee ?? 0);
        form.setFieldValue("downPayment", bookingData?.reservation_fee ?? 0);
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
        (p) =>
          p.type === form.getFieldValue("vehicleSizes")[0].type &&
          p.size === form.getFieldValue("vehicleSizes")[0].size,
      );

      if (pricing) {
        total += pricing.price;
      }
    });

    form.setFieldValue("totalAmount", total);
    form.setFieldValue("maximumPoints", total * 0.4);
    form.setFieldValue("services", newServices);
  };

  const onSelectMilestoneReward = (mr: IMilestoneRewardResponse) => {
    const current = form.getFieldValue("milestoneReward");
    const isSelected = current.some((item) => item._id === mr._id);
    form.setFieldValue("milestoneReward", isSelected ? [] : [mr]);

    const mrService = services.find((s) => s._id === mr.service_id);
    const mrPrice =
      mrService?.pricing_per_sizes.find(
        (p) =>
          p.type === form.getFieldValue("vehicleSizes")[0].type &&
          p.size === form.getFieldValue("vehicleSizes")[0].size,
      )?.price ?? 0;

    let discountAmount = 0;
    if (!isSelected) {
      discountAmount =
        mr.reward_type === RewardType.DISCOUNT
          ? mr.discount_amount === 0
            ? mrPrice * (mr.discount_percentage / 100)
            : mr.discount_amount
          : mrPrice;
    }
    form.setFieldValue("milestoneDiscount", discountAmount);
  };

  const onSelectVehicleSize = (vehicleSize: IVehicleSizesResponse) => {
    const current = form.getFieldValue("vehicleSizes");
    const isSelected = current.some((item) => item._id === vehicleSize._id);
    form.setFieldValue("vehicleSizes", isSelected ? [] : [vehicleSize]);
    form.setFieldValue("totalAmount", 0);
    form.setFieldValue("services", []);
    form.setFieldValue("milestoneReward", []);
    form.setFieldValue("milestoneDiscount", 0);
    form.setFieldValue("maximumPoints", 0);
  };

  const selectedCustomer = form.getFieldValue("customer")[0];

  return (
    <section className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[#dc143c]/[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#dc143c]/[0.04] blur-[100px]" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        {/* ── Header ── */}
        <div className="mb-14 text-center">
          <h2 className="font-russo text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Create{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff6b81]">
              Transaction
            </span>
          </h2>
          <p className="mt-4 text-gray-500 text-base max-w-md mx-auto">
            Fill in the details below to log a new service transaction.
          </p>
        </div>

        {/* ── Customer FAB ── */}
        {selectedCustomer && (
          <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {/* slide-up panel */}
            <div
              className={`transition-all duration-300 origin-bottom-right ${
                isFabOpen
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-95 translate-y-4 pointer-events-none"
              }`}
            >
              <div className="w-72 rounded-2xl border border-white/10 bg-[#111]/90 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden">
                {/* header */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.08]">
                  <div className="w-10 h-10 rounded-full bg-[#dc143c]/20 border border-[#dc143c]/40 flex items-center justify-center text-[#ff6b81] font-bold text-sm flex-shrink-0">
                    {selectedCustomer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {selectedCustomer.name}
                    </p>
                    <p className="text-gray-500 text-xs">
                      <span className="text-[#ff6b81] font-semibold">
                        {selectedCustomer.earned_points}
                      </span>{" "}
                      pts earned
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFabOpen(false)}
                    className="ml-auto flex-shrink-0 w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>

                {/* milestone grid */}
                {selectedCustomer.milestone_count.length > 0 ? (
                  <div className="px-4 py-3">
                    <p className="text-gray-600 text-[10px] uppercase tracking-widest mb-2">
                      Milestone Progress
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {selectedCustomer.milestone_count.map((m) => (
                        <div
                          key={m._id}
                          className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-2 text-center"
                        >
                          <p className="text-gray-600 text-[10px] leading-tight">
                            {m.vehicle.type.toUpperCase()}
                            <br />
                            {m.vehicle.size.toUpperCase()}
                          </p>
                          <p className="text-white font-bold text-lg mt-1 leading-none">
                            {m.progress}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3">
                    <p className="text-gray-600 text-xs text-center py-1">
                      No milestone progress yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* FAB button */}
            <button
              type="button"
              onClick={() => setIsFabOpen((v) => !v)}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 active:scale-95
                ${
                  isFabOpen
                    ? "bg-white/10 border border-white/20 text-white"
                    : "bg-[#dc143c] shadow-[#dc143c]/40 text-white hover:bg-[#c01236]"
                }`}
            >
              {isFabOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </button>
          </div>
        )}

        {/* ── Form ── */}
        <form
          id="booking-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-0"
        >
          {/* STEP 1 — Customer */}
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
                                onSelect={() =>
                                  isSelected
                                    ? field.setValue([])
                                    : field.setValue([customer])
                                }
                                className="flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
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

          {/* STEP 2 — Vehicle */}
          <SectionCard
            step={2}
            title="Vehicle Details"
            subtitle="What are we working on today?"
          >
            <div className="space-y-4">
              <form.Field name="vehicleSizes">
                {(field) => (
                  <Field>
                    <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest mb-1.5 flex items-center gap-2">
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
                  </Field>
                )}
              </form.Field>

              {/* Vehicle Model */}
              <form.Field name="vehicleModel">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest mb-1.5 block">
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
            </div>
          </SectionCard>

          {/* STEP 3 — Services */}
          <SectionCard
            step={3}
            title="Services & Rewards"
            subtitle="Select what's being performed."
          >
            <div className="space-y-4">
              {/* Availed Services */}
              <form.Field name="services">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field>
                      <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest mb-1.5 flex items-center gap-2">
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

              {/* Milestone Reward */}
              <form.Field name="milestoneReward">
                {(field) => (
                  <Field>
                    <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest mb-1.5 flex items-center gap-2">
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
                                    <Chip key={item._id} label={item.service} />
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
                                  className="flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                                >
                                  <span className="text-sm">{mr.service}</span>
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

          {/* STEP 4 — Summary */}
          <SectionCard
            step={4}
            title="Summary"
            subtitle="Review amounts before submitting."
          >
            <div className="space-y-1">
              <form.Field name="totalAmount">
                {(field) => (
                  <Field>
                    <FieldLabel className="text-gray-500 text-xs uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      Availed Services Total Amount
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

              {/* Discount Tiers */}
              <form.Subscribe selector={(s) => s.values.totalAmount}>
                {(total) => {
                  const tiers = [
                    { off: 50, min: 125 },
                    { off: 100, min: 250 },
                    { off: 150, min: 375 },
                  ];
                  const next = tiers.find((t) => (total as number) < t.min);

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
                              {next.min - (total as number)}
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
                            width: `${Math.min(100, ((total as number) / 375) * 100)}%`,
                          }}
                        />
                        {/* tier markers */}
                        {tiers.map((t) => (
                          <div
                            key={t.min}
                            className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/40"
                            style={{ left: `${(t.min / 375) * 100}%` }}
                          />
                        ))}
                      </div>

                      {/* tier chips */}
                      <div className="grid grid-cols-3 gap-2">
                        {tiers.map((t) => {
                          const unlocked = (total as number) >= t.min;
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

              {/* Read-only summary rows */}
              <div className="mt-4 space-y-1 rounded-xl overflow-hidden">
                <form.Subscribe
                  selector={(s) => ({
                    maxPts: s.values.maximumPoints,
                    discount: s.values.totalDiscount,
                    milestoneDiscount: s.values.milestoneDiscount,
                    total: s.values.totalAmount,
                    milestoneReward: s.values.milestoneReward,
                    vehicleSizes: s.values.vehicleSizes,
                    travelFee: s.values.travelFee,
                    downPayment: s.values.downPayment,
                  })}
                >
                  {({
                    maxPts,
                    discount,
                    milestoneDiscount,
                    total,
                    milestoneReward,
                    vehicleSizes,
                    travelFee,
                    downPayment,
                  }) => {
                    // Price of the milestone reward service based on current vehicle type + size
                    const milestoneRewardPrice = (() => {
                      if (!milestoneReward.length) return 0;
                      const rewardService = services.find(
                        (s) => s._id === milestoneReward[0].service_id,
                      );
                      return (
                        rewardService?.pricing_per_sizes.find(
                          (p) =>
                            p.type === vehicleSizes[0].type &&
                            p.size === vehicleSizes[0].size,
                        )?.price ?? 0
                      );
                    })();

                    const grossTotal = total + milestoneRewardPrice + travelFee;
                    const netTotal = Math.max(
                      0,
                      grossTotal - discount - milestoneDiscount - downPayment,
                    );

                    return (
                      <>
                        <div className="flex justify-between items-center py-2 px-3">
                          <span className="text-gray-500 text-sm">
                            Points Redemption Limit
                          </span>
                          <span className="text-white font-medium">
                            {maxPts.toLocaleString()}
                          </span>
                        </div>

                        {milestoneRewardPrice > 0 && (
                          <div className="flex justify-between items-center py-2 px-3">
                            <span className="text-gray-500 text-sm">
                              Milestone Service Price
                            </span>
                            <span className="text-white font-medium">
                              + ₱{milestoneRewardPrice.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-2 px-3">
                          <span className="text-gray-500 text-sm">
                            Travel Fee
                          </span>
                          <span className="text-white font-medium">
                            + ₱{travelFee.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 px-3 border-t border-white/[0.06]">
                          <span className="text-gray-500 text-sm">
                            Gross Total
                          </span>
                          <span className="text-white font-medium">
                            ₱{grossTotal.toLocaleString()}
                          </span>
                        </div>

                        <form.Field name="totalDiscount">
                          {(field) => (
                            <div className="flex justify-between items-center py-2 px-3">
                              <span className="text-gray-500 text-sm">
                                Total Discount
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
                                className="h-8 w-28 text-right px-3 rounded-lg bg-white/[0.04] border-white/10 text-white text-sm focus-visible:border-[#dc143c]/60"
                              />
                            </div>
                          )}
                        </form.Field>

                        <div className="flex justify-between items-center py-2 px-3">
                          <span className="text-gray-500 text-sm">
                            Milestone Discount
                          </span>
                          <span className="text-[#ff6b81] font-medium">
                            - ₱{milestoneDiscount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 px-3">
                          <span className="text-gray-500 text-sm">
                            Down Payment
                          </span>
                          <span className="text-white font-medium">
                            - ₱{downPayment.toLocaleString()}
                          </span>
                        </div>

                        <div className="mt-2 flex justify-between items-center py-3 px-3 rounded-xl bg-[#dc143c]/10 border border-[#dc143c]/20">
                          <span className="text-white font-semibold">
                            Net Total
                          </span>
                          <span className="text-[#ff6b81] font-bold text-xl">
                            ₱{netTotal.toLocaleString()}
                          </span>
                        </div>
                      </>
                    );
                  }}
                </form.Subscribe>
              </div>
            </div>
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
        </form>
      </div>
    </section>
  );
}
