"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import {
  Field,
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
  Check,
  ChevronDown,
  User,
  Car,
  MapPin,
  Calendar,
  Clock,
  Wrench,
  PlusCircle,
  FileText,
  CreditCard,
  ArrowRight,
  Loader2,
  ClipboardList,
  Bike,
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

const vehicleTypes = [VehicleType.CAR, VehicleType.MOTORCYCLE];
const vehicleSizes = [
  VehicleSize.SM,
  VehicleSize.MD,
  VehicleSize.LG,
  VehicleSize.XL,
  VehicleSize.XXL,
];

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

export const formSchema = z.object({
  vehicleSizes: z.array(vehicleSizeSchema),
  services: z.array(serviceSchema).min(1, "Choose at least one service."),
  reservationFee: z.number(),
  travelFee: z.number(),
  totalAmount: z.number(),
  notes: z.string(),
  status: z.string(),
});

export type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  vehicleSizes: [],
  services: [],
  reservationFee: 0,
  totalAmount: 0,
  travelFee: 0,
  notes: "",
  status: "",
};

/* ─── Status color map ─── */
const statusColors: Record<
  string,
  { bg: string; border: string; text: string; dot: string }
> = {
  [BookingStatus.FOR_CHECKING]: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  [BookingStatus.RESERVED]: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  [BookingStatus.CANCELLED]: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-[#ff6b81]",
    dot: "bg-[#ff6b81]",
  },
};

const defaultStatus = {
  bg: "bg-white/10",
  border: "border-white/20",
  text: "text-gray-400",
  dot: "bg-gray-400",
};

/* ─── Shared design components ─── */
function SectionCard({
  icon,
  title,
  subtitle,
  children,
  last,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className="relative">
      {!last && (
        <div className="absolute left-5 top-14 bottom-0 w-px bg-gradient-to-b from-[#dc143c]/40 to-transparent z-0" />
      )}
      <div className="relative z-10 flex gap-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#dc143c] flex items-center justify-center text-white shadow-lg shadow-[#dc143c]/40">
          <span className="w-4 h-4">{icon}</span>
        </div>

        <div className="flex-1 pb-10">
          <div className="mb-4">
            <h3 className="text-white font-semibold text-lg leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>
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

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5 min-w-0 w-full">
      <label className="text-gray-500 text-xs uppercase tracking-widest block">
        {label}
      </label>

      <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm min-w-0 w-full">
        <p className="break-all w-full">
          {value || <span className="text-gray-600 italic">—</span>}
        </p>
      </div>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#dc143c]/20 border border-[#dc143c]/40 text-[#ff6b81] text-sm font-medium whitespace-nowrap">
      {label}
    </span>
  );
}

function ChipRow({ items }: { items: { _id: string; title: string }[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="h-12 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center text-gray-600 text-sm italic">
        None selected
      </div>
    );
  }
  return (
    <div className="h-12 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center min-w-0 overflow-hidden">
      <div className="overflow-x-auto scrollbar-services w-0 min-w-0 flex-1 py-2">
        <div className="flex gap-2 flex-nowrap min-w-max items-center">
          {items.map((item) => (
            <Chip key={item._id} label={item.title} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SelectTrigger({
  hasValue,
  children,
}: {
  hasValue: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`w-full h-12 px-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 group
        ${
          hasValue
            ? "bg-white/[0.06] border-white/20 text-white"
            : "bg-white/[0.02] border-white/10 text-gray-500 hover:border-white/20"
        }`}
    >
      <div className="flex-1 overflow-hidden min-w-0">{children}</div>
      <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors flex-shrink-0 ml-2" />
    </div>
  );
}

function ChipTest({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#dc143c]/20 border border-[#dc143c]/40 text-[#ff6b81] text-sm font-medium">
      {label}
    </span>
  );
}

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
    onSubmit: async ({ value }) => {
      setLoading(true);
      const result = await updateBooking({
        bookingId: booking?._id ?? "",
        scheduleId: booking?.preferred_date._id ?? "",
        timeSlotId: booking?.time_slot._id ?? "",
        reservationFee: value.reservationFee,
        travelFee: value.travelFee,
        totalAmount: value.totalAmount,
        notes: value.notes,
        status: value.status,
      });
      setLoading(false);
      if (result.success && value.status === BookingStatus.COMPLETED) {
        router.push(`/admin/transaction?id=${booking?._id}`);
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

  const currentStatus = form.getFieldValue("status") as BookingStatus;
  const statusStyle = statusColors[currentStatus] ?? defaultStatus;

  return (
    <section className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[#dc143c]/[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#dc143c]/[0.04] blur-[100px]" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        {/* ── Header ── */}
        <div className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#dc143c]/30 bg-[#dc143c]/10 text-[#ff6b81] text-xs font-semibold tracking-widest uppercase mb-6">
            <ClipboardList className="w-3 h-3" />
            Booking Management
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Booking
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff6b81]">
              Details
            </span>
          </h1>
          <p className="mt-4 text-gray-500 text-base max-w-md mx-auto">
            Review booking information and update status or financials.
          </p>

          {/* live status badge */}
          <form.Subscribe selector={(s) => s.values.status}>
            {(status) => {
              const style =
                statusColors[status as BookingStatus] ?? defaultStatus;
              return (
                <div
                  className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border ${style.bg} ${style.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  <span className={`text-sm font-semibold ${style.text}`}>
                    {BookingStatusDisplay[status as BookingStatus] ?? status}
                  </span>
                </div>
              );
            }}
          </form.Subscribe>
        </div>

        <form
          id="booking-form"
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
                  return (
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
                                <div className="overflow-x-auto  flex-1 py-2 flex-1">
                                  <div className="flex gap-2 flex-nowrap min-w-max items-center">
                                    {field.state.value.map((item) => (
                                      <ChipTest
                                        key={item._id}
                                        label={item.description}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <span className="flex-1 text-left block">
                                  Choose vehicle type & size...
                                </span>
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
                                  }}
                                  className="flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                                >
                                  <span className="text-sm">
                                    {size.description}
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
                  );
                }}
              </form.Field>
              <ReadOnlyField
                label="Vehicle Model"
                value={booking?.vehicle_model ?? ""}
              />
              <div className="space-y-1.5">
                <label className="text-gray-500 text-xs uppercase tracking-widest block">
                  Complete Address
                </label>
                <Textarea
                  readOnly
                  rows={3}
                  value={booking?.address ?? ""}
                  className="px-4 py-3 rounded-xl bg-white/[0.03] border-white/[0.08] text-white text-sm resize-none focus-visible:ring-0"
                />
              </div>
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
            {/* <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-gray-500 text-xs uppercase tracking-widest block">
                  Signature Services
                </label>
                <ChipRow items={booking?.services ?? []} />
              </div>
              <div className="space-y-1.5">
                <label className="text-gray-500 text-xs uppercase tracking-widest block flex items-center gap-1.5">
                  Add-ons
                </label>
                <ChipRow items={booking?.add_ons ?? []} />
              </div>
            </div> */}
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
                              <div className="overflow-x-auto  py-2 flex-1">
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
                  <div className="space-y-1.5">
                    <label className="text-gray-500 text-xs uppercase tracking-widest block">
                      Reservation Fee
                    </label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.handleChange(v === "" ? 0 : parseInt(v));
                      }}
                      className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="travelFee">
                {(field) => (
                  <div className="space-y-1.5">
                    <label className="text-gray-500 text-xs uppercase tracking-widest block">
                      Travel Fee
                    </label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.handleChange(v === "" ? 0 : parseInt(v));
                      }}
                      className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="totalAmount">
                {(field) => (
                  <div className="space-y-1.5">
                    <label className="text-gray-500 text-xs uppercase tracking-widest block">
                      Total Amount
                    </label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.handleChange(v === "" ? 0 : parseInt(v));
                      }}
                      className="h-12 px-4 rounded-xl bg-white/[0.04] border-white/10 text-white text-sm focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20 focus-visible:ring-2"
                    />
                  </div>
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
                        Reservation Deposit (40%)
                      </span>
                      <span className="text-white font-medium text-sm">
                        ₱
                        {Math.max(
                          0,
                          (total + travelFee) * 0.4,
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
                  <div className="space-y-1.5">
                    <label className="text-gray-500 text-xs uppercase tracking-widest block">
                      Notes
                    </label>
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
                  </div>
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
              {(field) => {
                const style =
                  statusColors[field.state.value as BookingStatus] ??
                  defaultStatus;
                return (
                  <div className="space-y-1.5">
                    <label className="text-gray-500 text-xs uppercase tracking-widest block">
                      Current Status
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className="w-full">
                          <SelectTrigger hasValue={!!field.state.value}>
                            {field.state.value ? (
                              <div
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${style.bg} ${style.border}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
                                />
                                <span
                                  className={`text-sm font-semibold ${style.text}`}
                                >
                                  {
                                    BookingStatusDisplay[
                                      field.state.value as BookingStatus
                                    ]
                                  }
                                </span>
                              </div>
                            ) : (
                              <span>Select a status...</span>
                            )}
                          </SelectTrigger>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="bg-[#141414] border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/60 overflow-y-auto">
                        <Command>
                          {Object.entries(BookingStatusDisplay).map(
                            ([statusKey, display]) => {
                              const isSelected =
                                field.state.value === statusKey;
                              const s =
                                statusColors[statusKey] ?? defaultStatus;
                              return (
                                <CommandItem
                                  key={statusKey}
                                  onSelect={() => field.handleChange(statusKey)}
                                  className="flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/[0.06] transition-colors"
                                >
                                  <div
                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${s.bg} ${s.border}`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${s.dot}`}
                                    />
                                    <span
                                      className={`text-sm font-medium ${s.text}`}
                                    >
                                      {display}
                                    </span>
                                  </div>
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
                  </div>
                );
              }}
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
                  Update Booking
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
