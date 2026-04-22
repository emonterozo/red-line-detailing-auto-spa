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
import { BookingStatusDisplay, VehicleType } from "@/lib/enums";
import {
  getTransactions,
  CustomerTransactionResponse,
} from "../../actions/customer/getTransactions";

import { CustomerBadge } from "../CustomerBadge";
import ConfirmationModal from "../ConfirmationModal";
import { logout } from "../../actions/logout";

import { updateCustomerProfile } from "../../actions/updateCustomerProfile";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { CONFIG } from "../../config/config";
import {
  getTransactionDetails,
  TransactionResponse,
} from "../../actions/getTransactionDetails";
import { UpdatePasswordModal } from "./UpdatePasswordModal";
import UpdateAddressModal, { LocationProps } from "./UpdateAddressModal";
import { TransactionReceiptModal } from "./TransactionReceiptModal";
import {
  CustomerProfileResponse,
  getCustomerProfile,
} from "../../actions/customer/getCustomerProfile";
import {
  CustomerBookingResponse,
  getCustomerBooking,
} from "../../actions/customer/getCustomerBooking";
import {
  ClaimedMilestoneResponse,
  getClaimedMilestones,
} from "../../actions/customer/getClaimedMilestones";
import { HistoryEmpty } from "./HistoryEmpty";
import { Pagination } from "./Pagination";
import { HistorySkeleton } from "./HistorySkeleton";
import { MilestoneGridSkeleton } from "./MilestoneGridSkeleton";

const glassCard =
  "bg-[#111111] border border-white/15 rounded-[2.5rem] p-6 md:p-8 shadow-2xl";

const sectionHeader =
  "text-[11px] uppercase tracking-[0.2em] font-black text-neutral-300 mb-6 flex items-center gap-3";

const LIMIT = 4;

export default function CustomerProfile({
  customerId,
}: Readonly<{
  customerId: string;
}>) {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerProfileResponse | null>(
    null,
  );
  const [booking, setBooking] = useState<CustomerBookingResponse | null>(null);
  const [transactions, setTransactions] = useState<
    CustomerTransactionResponse[]
  >([]);
  const [milestones, setMilestones] = useState<ClaimedMilestoneResponse[]>([]);

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isUpdateAddressVisible, setIsUpdateAddressVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    transactionPage: 1,
    transactionTotalPage: 1,
    milestonePage: 1,
    milestoneTotalPage: 1,
  });
  const [transaction, setTransaction] = useState<TransactionResponse | null>(
    null,
  );
  const [isUpdatePasswordVisible, setIsUpdatePasswordVisible] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    customer: true,
    booking: true,
    transactions: true,
    milestones: true,
  });

  const fetchTransactions = async (page: number) => {
    setLoadingStates((prev) => ({ ...prev, transactions: true }));
    const res = await getTransactions(page, LIMIT, customerId);
    setTransactions(res.data);
    setPagination((prev) => ({
      ...prev,
      transactionPage: page,
      transactionTotalPage: res.totalPages,
    }));
    setLoadingStates((prev) => ({ ...prev, transactions: false }));
  };

  const fetchMilestones = async (page: number) => {
    setLoadingStates((prev) => ({ ...prev, milestones: true }));
    const res = await getClaimedMilestones(customerId, page, LIMIT);
    setMilestones(res.data);
    setPagination((prev) => ({
      ...prev,
      milestonePage: page,
      milestoneTotalPage: res.totalPages,
    }));
    setLoadingStates((prev) => ({ ...prev, milestones: false }));
  };

  const handleFetchBooking = async (id: string) => {
    try {
      setLoadingStates((prev) => ({ ...prev, booking: true }));
      const data = await getCustomerBooking(id);
      setBooking(data);
    } finally {
      setLoadingStates((p) => ({ ...p, booking: false }));
    }
  };

  const handleFetchCustomerProfile = async (id: string) => {
    try {
      setLoadingStates((prev) => ({ ...prev, customer: true }));
      const data = await getCustomerProfile(id);
      setCustomer(data);
    } finally {
      setLoadingStates((p) => ({ ...p, customer: false }));
    }
  };

  useEffect(() => {
    if (!customerId || typeof customerId !== "string") return;

    const init = async () => {
      handleFetchCustomerProfile(customerId);
      handleFetchBooking(customerId);
      fetchTransactions(1);
      fetchMilestones(1);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      handleFetchCustomerProfile(customerId);
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

  const handlePageChange = async (
    newPage: number,
    type: "transaction" | "milestone",
  ) => {
    if (type === "transaction") {
      await fetchTransactions(newPage);
    } else {
      await fetchMilestones(newPage);
    }
  };

  const toggleTransactionModal = () => setTransaction(null);

  const handleShowTransactionDetail = async (id: string) => {
    const transactionData = await getTransactionDetails(id);
    setTransaction(transactionData);
  };

  const toggleUpdatePassword = () =>
    setIsUpdatePasswordVisible((prev) => !prev);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#dc143c]/50 relative pb-20">
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
      <UpdatePasswordModal
        isOpen={isUpdatePasswordVisible}
        onClose={toggleUpdatePassword}
        customerId={customerId || ""}
      />
      <TransactionReceiptModal
        isOpen={!!transaction}
        transaction={transaction}
        onClose={toggleTransactionModal}
      />
      <div>
        <header className="relative pt-20 pb-10 px-6">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[350px] bg-[#dc143c]/[0.12] blur-[100px] pointer-events-none" />
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <div className="relative mb-6 group cursor-pointer">
              {loadingStates.customer ? (
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2rem] bg-neutral-900 border-2 border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 translate-x-[-100%] animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </div>
              ) : (
                <>
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2rem] bg-neutral-900 border-2 border-white/20 flex items-center justify-center text-4xl font-black shadow-2xl overflow-hidden relative">
                    {customer?.first_name?.[0]}
                    {customer?.last_name?.[0]}
                  </div>
                  {customer?.is_verify && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-2 rounded-xl border-4 border-[#050505] shadow-lg">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-col items-center">
              {loadingStates.customer ? (
                <div className="space-y-3 flex flex-col items-center">
                  <div className="h-10 md:h-14 w-64 md:w-96 bg-white/10 rounded-2xl animate-pulse" />
                </div>
              ) : (
                <h1 className="font-russo text-4xl md:text-6xl uppercase tracking-tighter leading-none">
                  {customer?.first_name}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff6b81]">
                    {customer?.last_name}
                  </span>
                </h1>
              )}
            </div>
            <div className="flex gap-4 mt-8">
              {loadingStates.customer ? (
                <div className="px-6 py-3 rounded-2xl bg-[#1a1a1a] border border-white/10 w-32 h-[52px] animate-pulse" />
              ) : (
                <div className="px-6 py-3 rounded-2xl bg-[#1a1a1a] border border-white/10 shadow-lg flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-black text-lg">
                    {customer?.earned_points?.toLocaleString() ?? 0}{" "}
                    <span className="text-[10px] text-neutral-400 ml-1 tracking-widest uppercase">
                      pts
                    </span>
                  </span>
                </div>
              )}
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
                {loadingStates.customer ? (
                  <div className="w-28 h-8 rounded-full bg-white/5 border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 translate-x-[-100%] animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  </div>
                ) : (
                  <button
                    onClick={toggleUpdatePassword}
                    className="flex items-center gap-2 text-[11px] font-black text-white bg-[#dc143c] px-4 py-2 rounded-full shadow-lg shadow-[#dc143c]/20 active:scale-95 transition-all"
                  >
                    <Settings className="w-3 h-3" />
                    Update Password
                  </button>
                )}
              </div>
              <div className="mb-6">
                {loadingStates.customer && (
                  <div className="p-5 rounded-[2rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10 shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 translate-x-[-100%] animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="bg-white/10 p-3 rounded-2xl w-12 h-12 shrink-0 animate-pulse" />
                      </div>
                      <div className="text-left space-y-2">
                        <div className="h-3 w-20 bg-white/20 rounded-full animate-pulse" />
                        <div className="h-2 w-32 bg-white/5 rounded-full" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
                      <div className="w-3 h-3 bg-white/10 rounded-full shrink-0" />
                      <div className="h-2 w-24 bg-white/10 rounded-full" />
                    </div>
                  </div>
                )}
                {!loadingStates.customer && !customer?.badge && (
                  <CustomerBadge type="locked" />
                )}
                {customer?.badge && (
                  <CustomerBadge
                    type={customer.badge.title}
                    points={customer.badge.points}
                    count={customer.badge.count}
                    limit={customer.badge.limit}
                  />
                )}
              </div>

              <div className="space-y-4 text-left">
                <div className="p-4 bg-gradient-to-br from-white/10 to-transparent rounded-2xl border border-white/10 overflow-hidden relative">
                  <p className="text-[10px] text-neutral-400 font-black uppercase mb-2 tracking-widest">
                    Your Referral Link
                  </p>
                  {loadingStates.customer && (
                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/5 relative overflow-hidden">
                      <div className="absolute inset-0 translate-x-[-100%] animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                      <div className="flex-1 pl-2">
                        <div className="h-3 w-3/4 bg-white/10 rounded font-mono animate-pulse" />
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg w-[30px] h-[30px] shrink-0" />
                    </div>
                  )}
                  {!loadingStates.customer && !customer?.badge && (
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
                  {customer?.badge && (
                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <code className="flex-1 text-xs text-neutral-300 truncate pl-2 font-mono">
                        {`${CONFIG.BASE_URL}/register?referral=${customer.referral_code}`}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${CONFIG.BASE_URL}/register?referral=${customer.referral_code}`,
                          );
                          showToast(
                            "Referral link copied to clipboard!",
                            "success",
                          );
                        }}
                        className="p-2 bg-white/10 hover:bg-white/20 active:scale-90 rounded-lg transition-all group"
                        title="Copy Link"
                      >
                        <Copy className="w-3.5 h-3.5 text-white group-hover:text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-neutral-400 font-black uppercase mb-1 tracking-widest">
                      Member Since
                    </p>
                    {loadingStates.customer && (
                      <div className="h-5 w-28 bg-white/10 rounded animate-pulse mt-0.5" />
                    )}
                    {!loadingStates.customer && (
                      <p className="font-bold text-white text-sm">
                        {customer?.verified_at
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
                    )}
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-neutral-400 font-black uppercase mb-1 tracking-widest">
                      Contact Number
                    </p>
                    {loadingStates.customer ? (
                      <div className="h-5 w-28 bg-white/10 rounded animate-pulse mt-0.5" />
                    ) : (
                      <p className="font-bold text-white text-sm">
                        {customer?.contact_number}
                      </p>
                    )}
                  </div>
                </div>

                <div className="group relative p-4 bg-white/5 rounded-2xl border border-white/5 transition-all hover:bg-white/[0.07]">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">
                      Primary Address
                    </p>
                    {!loadingStates.customer && (
                      <button
                        onClick={toggleAddressModal}
                        className="text-[10px] text-neutral-500 hover:text-white font-bold flex items-center gap-1 transition-colors"
                      >
                        <PencilLine className="w-3 h-3" /> EDIT
                      </button>
                    )}
                  </div>

                  <div className="flex items-end justify-between gap-4">
                    {loadingStates.customer && (
                      <>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                          <div className="h-4 w-[60%] bg-white/10 rounded animate-pulse" />
                        </div>
                        <div className="w-16 h-6 bg-white/5 border border-white/10 rounded-lg shrink-0 mb-0.5 animate-pulse" />
                      </>
                    )}

                    {!loadingStates.customer && (
                      <a
                        href={`https://www.google.com/maps?q=${customer?.location?.coordinates[1]},${customer?.location?.coordinates[0]}`}
                        target="_blank"
                        className="text-sm text-white leading-snug font-medium line-clamp-2 flex-1 hover:text-[#ff6b81] hover:underline"
                      >
                        {customer?.address ?? "No available data"}
                      </a>
                    )}
                    {!loadingStates.customer && !!customer?.travel_distance && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 shrink-0 mb-0.5">
                        <MapPin className="w-3 h-3 text-[#dc143c]" />
                        <span className="text-[11px] font-bold text-neutral-300 whitespace-nowrap">
                          {`${customer.travel_distance / 1000} km`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {loadingStates.customer ? (
                  <div className="w-full mt-4 py-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 translate-x-[-100%] animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    <div className="h-4 w-32 bg-white/10 rounded-md animate-pulse" />
                  </div>
                ) : (
                  <button
                    onClick={toggleModal}
                    className="w-full mt-4 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center gap-3 text-red-400 font-black text-xs transition-all"
                  >
                    <LogOut className="w-4 h-4" /> LOGOUT ACCOUNT
                  </button>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className={sectionHeader}>
                <CalendarDays className="w-4 h-4" /> Scheduled Service
              </h3>
              {loadingStates.booking && (
                <div className="p-6 rounded-[2.5rem] bg-[#1a1a1a] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between h-[212px]">
                  <div className="absolute inset-0 translate-x-[-100%] animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-3 flex-1">
                      <div className="h-7 w-40 bg-white/10 rounded-lg" />
                      <div className="h-4 w-32 bg-white/5 rounded-md" />
                    </div>
                    <div className="w-16 h-6 bg-white/10 rounded-lg" />
                  </div>
                  <div className="w-full h-14 bg-white/5 rounded-2xl animate-pulse" />
                </div>
              )}
              {!loadingStates.booking && !booking && (
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
              {booking && (
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
                        {`${new Date(booking.preferred_date.date).toDateString()} • ${booking.time_slot.time}`}
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
              )}
            </section>
          </div>
          <div className="lg:col-span-8 space-y-8">
            <section>
              <h3 className={sectionHeader}>
                <Target className="w-4 h-4" /> Your Milestones
              </h3>
              {loadingStates.customer ? (
                <MilestoneGridSkeleton />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                  {customer?.milestone_count
                    .toSorted((a, b) => a.sort_order - b.sort_order)
                    .map((m) => (
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
              )}
            </section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-5">
                <h3 className={sectionHeader}>
                  <History className="w-4 h-4" /> Recent Transactions
                </h3>
                <div className="space-y-3">
                  {loadingStates.transactions &&
                    [1, 2, 3, 4].map((item) => (
                      <HistorySkeleton key={item} color="#ffffff" />
                    ))}
                  {transactions.length > 0
                    ? transactions.map((transaction) => (
                        <button
                          onClick={() =>
                            handleShowTransactionDetail(transaction._id)
                          }
                          key={transaction._id}
                          className="w-full group p-5 rounded-3xl bg-[#111111] border border-white/10 flex items-start justify-between shadow-md transition-all duration-300 cursor-pointer hover:bg-white/[0.03] hover:border-white/20 active:scale-[0.98]"
                        >
                          <div className="flex items-start gap-4 text-left">
                            <div className="p-3 rounded-xl bg-[#dc143c]/10 text-[#dc143c] border border-[#dc143c]/20 shrink-0 group-hover:bg-[#dc143c]/20 transition-colors">
                              <Zap className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-white leading-tight break-words">
                                {transaction.vehicle_model}
                              </p>
                              <p className="text-[11px] text-neutral-400 font-bold uppercase mt-1">
                                {transaction.created_at.toDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="pl-4 pt-0.5 shrink-0">
                            <p className="text-lg font-black text-white whitespace-nowrap leading-none group-hover:text-[#dc143c] transition-colors">
                              {`₱${transaction.net_total.toLocaleString()}`}
                            </p>
                          </div>
                        </button>
                      ))
                    : !loadingStates.transactions && (
                        <HistoryEmpty title="No Transactions" icon={Zap} />
                      )}
                  <Pagination
                    currentPage={pagination.transactionPage}
                    totalPages={pagination.transactionTotalPage}
                    onPageChange={(page) =>
                      handlePageChange(page, "transaction")
                    }
                  />
                </div>
              </div>

              <div className="space-y-5">
                <h3 className={sectionHeader}>
                  <Award className="w-4 h-4" /> Claimed Milestones
                </h3>
                <div className="space-y-3">
                  {loadingStates.milestones &&
                    [1, 2, 3, 4].map((item) => (
                      <HistorySkeleton key={item} color="#dc143c" />
                    ))}
                  {milestones.length > 0
                    ? milestones.map((item) => (
                        <div
                          key={item._id}
                          className="p-5 rounded-3xl bg-[#111111] border border-[#dc143c]/30 flex items-start justify-between shadow-md relative overflow-hidden"
                        >
                          <div className="flex items-start gap-4 text-left relative z-10">
                            <div className="p-3 rounded-xl bg-[#dc143c] text-white shadow-lg shrink-0">
                              <Gift className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-white leading-tight break-words">
                                {item.service_id.title}
                              </p>
                              <p className="text-[11px] text-neutral-400 font-bold uppercase mt-1">
                                {`${item.created_at.toDateString()} • ${item.vehicle_model}`}
                              </p>
                            </div>
                          </div>
                          <div className="pl-4 pt-0.5 shrink-0">
                            <p className="text-lg font-black text-[#dc143c] whitespace-nowrap">
                              {`- ₱${item.discount.toLocaleString()}`}
                            </p>
                          </div>
                        </div>
                      ))
                    : !loadingStates.milestones && (
                        <HistoryEmpty title="No Rewards Claimed" icon={Gift} />
                      )}
                  <Pagination
                    currentPage={pagination.milestonePage}
                    totalPages={pagination.milestoneTotalPage}
                    onPageChange={(page) => handlePageChange(page, "milestone")}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
