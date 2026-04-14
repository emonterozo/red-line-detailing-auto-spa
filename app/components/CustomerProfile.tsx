"use client";

import { useEffect, useState } from "react";
import {
  User,
  Target,
  LogOut,
  CalendarDays,
  ShieldCheck,
  Car,
  Gift,
  Zap,
  Star,
  ChevronRight,
  Camera,
  History,
  Award,
  ExternalLink,
  Motorbike,
  Settings,
  Copy,
  PencilLine,
  MapPin,
  Lock,
} from "lucide-react";
import { BookingStatus, BookingStatusDisplay, VehicleType } from "@/lib/enums";
import { CustomerDetailsResponse, getCustomer } from "../actions/getCustomer";
import { BookingTableResponse, getBookings } from "../actions/getBookings";
import {
  getTransactions,
  TransactionTableResponse,
} from "../actions/getTransactions";
import {
  ClaimedMilestoneTableResponse,
  getCustomerClaimedMilestones,
} from "../actions/getCustomerClaimedMilestones";
import { CustomerBadge } from "./CustomerBadge";
import FullScreenLoader from "./FullScreenLoader";
import ConfirmationModal from "./ConfirmationModal";
import { logout } from "../actions/logout";
import UpdateAddressModal, { LocationProps } from "./UpdateAddressModal";
import { updateCustomerProfile } from "../actions/updateCustomerProfile";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { CONFIG } from "../config/config";

const glassCard =
  "bg-[#111111] border border-white/15 rounded-[2.5rem] p-6 md:p-8 shadow-2xl";

const sectionHeader =
  "text-[11px] uppercase tracking-[0.2em] font-black text-neutral-300 mb-6 flex items-center gap-3";

const HistoryEmpty = ({ title }: { title: string }) => {
  return (
    <div className="p-5 rounded-3xl bg-[#111111] border border-dashed border-white/10 flex items-center justify-between shadow-md relative overflow-hidden">
      <div className="flex items-center gap-4 text-left relative z-10 opacity-50">
        <div className="p-3 rounded-xl bg-neutral-800 text-neutral-600">
          <Gift className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-black text-neutral-400 leading-tight uppercase tracking-tighter">
            {title}
          </p>
          <p className="text-[10px] text-neutral-500 font-bold uppercase mt-0.5 tracking-widest">
            History is empty
          </p>
        </div>
      </div>
      <div className="text-right relative z-10">
        <p className="text-lg font-black text-neutral-800">₱0.00</p>
      </div>
    </div>
  );
};

export default function CustomerProfile({
  customerId,
}: Readonly<{
  customerId: string;
}>) {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetailsResponse | null>(
    null,
  );
  const [bookings, setBookings] = useState<BookingTableResponse[]>([]);
  const [transactions, setTransactions] = useState<TransactionTableResponse[]>(
    [],
  );
  const [milestones, setMilestones] = useState<ClaimedMilestoneTableResponse[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isUpdateAddressVisible, setIsUpdateAddressVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (customerId && typeof customerId === "string") {
        setIsLoading(true);

        const [
          customerData,
          bookingData,
          transactionData,
          milestoneClaimedData,
        ] = await Promise.all([
          getCustomer(customerId),
          getBookings(1, 10, customerId, [
            BookingStatus.FOR_CHECKING,
            BookingStatus.PENDING_PAYMENT,
            BookingStatus.RESERVED,
          ]),
          getTransactions(1, 10, customerId),
          getCustomerClaimedMilestones(customerId, 1, 10),
        ]);

        setCustomer(customerData);
        setBookings(bookingData.data);
        setTransactions(transactionData.data);
        setMilestones(milestoneClaimedData.data);
        setIsLoading(false);
      }
    };
    init();
  }, [customerId]);

  const viewBooking = (reference: string) => {
    window.open(`/booking/${reference}`, "_blank");
  };

  const toggleModal = () => setIsLogoutModalVisible(!isLogoutModalVisible);

  const handleLogout = async () => {
    await logout();
  };

  const toggleAddressModal = () =>
    setIsUpdateAddressVisible(!isUpdateAddressVisible);

  const onUpdateAddress = async (location: LocationProps) => {
    if (customer) {
      setIsSubmitting(true);
      await updateCustomerProfile(customer?._id, {
        address: location.address,
        google_address: location.googleAddress,
        travel_distance: location.distance,
        latitude: location.latitude as number,
        longitude: location.longitude as number,
      });
      toggleAddressModal();
      const data = await getCustomer(customerId);
      setCustomer(data);
      setIsSubmitting(false);
    }
  };

  const handlePressBook = () => {
    if (customer?.address) {
      router.push("/customer/me/booking");
    } else {
      showToast(
        "Oops! You need to set your address before you can book a service.",
        "error",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#dc143c]/50 relative pb-20">
      {isLoading && <FullScreenLoader />}
      <ConfirmationModal
        isVisible={isLogoutModalVisible}
        chipTitle="Account Security"
        title="Log Out Confirmation"
        subTitle="Confirm your request to end session"
        description="Are you sure you want to sign out? You’ll need to log in again to access your account."
        onCancel={toggleModal}
        onConfirm={handleLogout}
      />
      <UpdateAddressModal
        isVisible={isUpdateAddressVisible}
        toggleModal={toggleAddressModal}
        addressLastUpdated={customer?.address_updated_at}
        currentAddress={customer?.address}
        distance={customer?.travel_distance as number}
        currentLocation={{
          latitude: customer?.location?.coordinates[1] ?? 0,
          longitude: customer?.location?.coordinates[0] ?? 0,
        }}
        onSubmit={onUpdateAddress}
        isSubmitting={isSubmitting}
      />

      {customer ? (
        <div>
          <header className="relative pt-20 pb-10 px-6">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[350px] bg-[#dc143c]/[0.12] blur-[100px] pointer-events-none" />
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
              <div className="relative mb-6 group cursor-pointer">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2rem] bg-neutral-900 border-2 border-white/20 flex items-center justify-center text-4xl font-black shadow-2xl overflow-hidden relative">
                  {customer.first_name[0]}
                  {customer.last_name[0]}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                </div>
                {customer.is_verify && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-2 rounded-xl border-4 border-[#050505] shadow-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                )}
              </div>
              <h1 className="font-russo text-4xl md:text-6xl uppercase tracking-tighter leading-none">
                {customer.first_name}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff6b81]">
                  {customer.last_name}
                </span>
              </h1>
              <div className="flex gap-4 mt-8">
                <div className="px-6 py-3 rounded-2xl bg-[#1a1a1a] border border-white/10 shadow-lg flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-black text-lg">
                    {customer.earned_points}{" "}
                    <span className="text-[10px] text-neutral-400 ml-1 tracking-widest uppercase">
                      pts
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
            <div className="lg:col-span-4 space-y-6">
              <section className={glassCard}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className={sectionHeader}>
                    <User className="w-4 h-4" /> Profile Info
                  </h3>
                  <button className="flex items-center gap-2 text-[11px] font-black text-white bg-[#dc143c] px-4 py-2 rounded-full shadow-lg shadow-[#dc143c]/20 active:scale-95 transition-all">
                    <Settings className="w-3 h-3" />
                    Edit Profile
                  </button>
                </div>

                <div className="mb-6">
                  {customer.badge ? (
                    <CustomerBadge
                      type={customer.badge.title}
                      points={customer.badge.points}
                      count={customer.badge.count}
                      limit={customer.badge.limit}
                    />
                  ) : (
                    <CustomerBadge type="locked" />
                  )}
                </div>

                <div className="space-y-4 text-left">
                  <div className="p-4 bg-gradient-to-br from-white/10 to-transparent rounded-2xl border border-white/10 overflow-hidden relative">
                    <p className="text-[10px] text-neutral-400 font-black uppercase mb-2 tracking-widest">
                      Your Referral Link
                    </p>
                    {customer.badge ? (
                      <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <code className="flex-1 text-xs text-neutral-300 truncate pl-2 font-mono">
                          {`${CONFIG.BASE_URL}/register?referral=${customer.referral_code}`}
                        </code>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(
                              `${CONFIG.BASE_URL}/register?referral=${customer.referral_code}`,
                            )
                          }
                          className="p-2 bg-white/10 hover:bg-white/20 active:scale-90 rounded-lg transition-all group"
                          title="Copy Link"
                        >
                          <Copy className="w-3.5 h-3.5 text-white group-hover:text-red-400" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3 bg-white/5 p-3 rounded-xl border border-dashed border-white/10">
                        <div className="flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-neutral-500" />
                          <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-tight">
                            Unlock by earning a badge
                          </p>
                        </div>
                        <div className="h-1.5 w-12 bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full bg-[#dc143c] w-1/3 animate-pulse" />{" "}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-neutral-400 font-black uppercase mb-1 tracking-widest">
                        Member Since
                      </p>
                      <p className="font-bold text-white text-sm">
                        {customer.verified_at
                          ? new Date(customer.verified_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "No data"}
                      </p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-neutral-400 font-black uppercase mb-1 tracking-widest">
                        Contact Number
                      </p>
                      <p className="font-bold text-white text-sm">
                        {customer.contact_number}
                      </p>
                    </div>
                  </div>

                  <div className="group relative p-4 bg-white/5 rounded-2xl border border-white/5 transition-all hover:bg-white/[0.07]">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">
                        Primary Address
                      </p>
                      <button
                        onClick={toggleAddressModal}
                        className="text-[10px] text-neutral-500 hover:text-white font-bold flex items-center gap-1 transition-colors"
                      >
                        <PencilLine className="w-3 h-3" /> EDIT
                      </button>
                    </div>

                    <div className="flex items-end justify-between gap-4">
                      <a
                        href={`https://www.google.com/maps?q=${customer?.location?.coordinates[1]},${customer?.location?.coordinates[0]}`}
                        target="_blank"
                        className="text-sm text-white leading-snug font-medium line-clamp-2 flex-1 hover:text-[#ff6b81] hover:underline"
                      >
                        {customer.address ?? "No available data"}
                      </a>
                      {!!customer.travel_distance && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 shrink-0 mb-0.5">
                          <MapPin className="w-3 h-3 text-[#dc143c]" />
                          <span className="text-[11px] font-bold text-neutral-300 whitespace-nowrap">
                            {`${customer.travel_distance / 1000} km`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={toggleModal}
                    className="w-full mt-4 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center gap-3 text-red-400 font-black text-xs transition-all"
                  >
                    <LogOut className="w-4 h-4" /> LOGOUT ACCOUNT
                  </button>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className={sectionHeader}>
                  <CalendarDays className="w-4 h-4" /> Scheduled Service
                </h3>
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="p-6 rounded-[2.5rem] bg-[#dc143c] text-white shadow-2xl relative overflow-hidden group text-left"
                    >
                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                          <p className="text-2xl font-black">
                            {booking.vehicle_model}
                          </p>
                          <p className="font-bold opacity-90">
                            {`${booking.preferred_date.date.toDateString()}• ${booking.time_slot.time}`}
                          </p>
                        </div>
                        <div className="px-3 py-1 bg-black/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase border border-white/20 tracking-tighter">
                          {BookingStatusDisplay[booking.status]}
                        </div>
                      </div>

                      <button
                        onClick={() => viewBooking(booking.reference_number)}
                        className="w-full relative z-10 py-4 bg-white text-[#dc143c] rounded-2xl flex items-center justify-center gap-2 text-xs font-black tracking-widest shadow-xl active:scale-95 transition-all"
                      >
                        VIEW BOOKING DETAILS
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-6 rounded-[2.5rem] bg-[#111111] border-2 border-dashed border-white/10 shadow-xl relative overflow-hidden text-center">
                    <div className="relative z-10 flex flex-col items-center mb-6 ">
                      <div>
                        <p className="text-xl font-black text-white uppercase tracking-tighter">
                          No Service Found
                        </p>
                        <p className="text-xs font-bold text-neutral-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
                          No scheduled bookings. Ready to book your next detail?
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handlePressBook}
                      className="w-full py-4 bg-[#dc143c] text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-black tracking-widest shadow-[0_10px_20px_rgba(220,20,60,0.2)] active:scale-95 transition-all"
                    >
                      BOOK A SERVICE NOW <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </section>
            </div>
            <div className="lg:col-span-8 space-y-8">
              <section>
                <h3 className={sectionHeader}>
                  <Target className="w-4 h-4" /> Your Milestones
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                  {customer.milestone_count.map((m) => (
                    <div
                      key={m._id}
                      className="p-5 rounded-[2rem] bg-[#111111] border border-white/10 flex flex-col items-center shadow-lg"
                    >
                      <div className="mb-3 p-2 rounded-xl bg-white/5 text-gray-500 group-hover:text-[#dc143c] transition-colors">
                        {m.vehicle_type === VehicleType.CAR ? (
                          <Car className="w-5 h-5 text-white" />
                        ) : (
                          <Motorbike className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter mb-1">
                        {m.vehicle_size}
                      </span>
                      <span className="text-3xl font-russo text-white group-hover:scale-110 transition-transform">
                        {m.progress}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-5">
                  <h3 className={sectionHeader}>
                    <History className="w-4 h-4" /> Recent Transactions
                  </h3>
                  <div className="space-y-3">
                    {transactions.length > 0 ? (
                      transactions.map((transaction) => (
                        <div
                          key={transaction._id}
                          className="p-5 rounded-3xl bg-[#111111] border border-white/10 flex items-center justify-between shadow-md"
                        >
                          <div className="flex items-center gap-4 text-left">
                            <div className="p-3 rounded-xl bg-[#dc143c]/10 text-[#dc143c] border border-[#dc143c]/20">
                              <Zap className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-white">
                                {transaction.vehicle_model}
                              </p>
                              <p className="text-[11px] text-neutral-400 font-bold uppercase mt-0.5">
                                {transaction.created_at.toDateString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-lg font-black text-white">
                            {`₱${transaction.net_total.toLocaleString()}`}
                          </p>
                        </div>
                      ))
                    ) : (
                      <HistoryEmpty title=" No Transactions" />
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className={sectionHeader}>
                    <Award className="w-4 h-4" /> Claimed Milestones
                  </h3>
                  <div className="space-y-3">
                    {milestones.length > 0 ? (
                      milestones.map((item) => (
                        <div
                          key={item._id}
                          className="p-5 rounded-3xl bg-[#111111] border border-[#dc143c]/30 flex items-center justify-between shadow-md relative overflow-hidden"
                        >
                          <div className="flex items-center gap-4 text-left relative z-10">
                            <div className="p-3 rounded-xl bg-[#dc143c] text-white shadow-lg">
                              <Gift className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-white leading-tight">
                                {item.service_id.title}
                              </p>
                              <p className="text-[11px] text-neutral-400 font-bold uppercase mt-0.5">
                                {`${item.created_at.toDateString()} • ${item.vehicle_model}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right relative z-10">
                            <p className="text-lg font-black text-[#dc143c]">
                              {`- ₱${item.discount}`}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <HistoryEmpty title=" No Rewards Claimed" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      ) : null}
    </div>
  );
}
