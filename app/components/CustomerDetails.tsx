"use client";

import CustomerDetailsHeader from "./CustomerDetailsHeader";
import CustomerInfo from "./CustomerInfo";
import CustomerBookings from "./CustomerBookings";
import CustomerTransactions from "./CustomerTransactions";
import CustomerMilestones from "./CustomerMilestones";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCustomer, CustomerDetailsResponse } from "../actions/getCustomer";
import { Skeleton } from "@/components/ui/skeleton";

const CustomerInfoSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-md space-y-10">
        <div className="flex items-center gap-3">
          <Skeleton className="w-5 h-5 rounded bg-[#dc143c]/20" />
          <Skeleton className="h-4 w-32 bg-white/10" />
        </div>
        <div className="space-y-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="space-y-2">
              <Skeleton className="h-3 w-24 bg-white/5" />
              <Skeleton className="h-5 w-full max-w-[200px] bg-white/10" />
            </div>
          ))}

          <div className="pt-6 border-t border-white/5 space-y-3">
            <Skeleton className="h-3 w-20 bg-white/5" />
            <Skeleton className="h-12 w-full bg-white/5 rounded-xl" />
            <Skeleton className="h-3 w-32 bg-white/5" />
          </div>
        </div>
      </div>
      <div className="lg:col-span-2 p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-10">
          <Skeleton className="w-5 h-5 rounded bg-[#dc143c]/20" />
          <Skeleton className="h-4 w-40 bg-white/10" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div
              key={item}
              className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center"
            >
              <Skeleton className="w-9 h-9 rounded-xl bg-white/5 mb-3" />
              <Skeleton className="h-3 w-12 bg-white/5 mb-2" />
              <Skeleton className="h-8 w-10 bg-white/10 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProfileHeaderSkeleton = () => {
  return (
    <div className="relative border-b border-white/10 bg-white/[0.01] py-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[#dc143c]/[0.03] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6">
          <Skeleton className="w-20 h-20 rounded-[2rem] bg-white/[0.08]" />

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 md:h-16 w-48 md:w-80 bg-white/10" />

              <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500/10" />
            </div>

            <Skeleton className="h-3 w-40 bg-white/5" />
          </div>
        </div>

        <div className="px-10 py-5 rounded-[2.5rem] bg-white/[0.03] border border-white/10 flex flex-col items-center">
          <Skeleton className="h-3 w-24 bg-white/5 mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded bg-yellow-500/20" />
            <Skeleton className="h-9 w-16 bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CustomerDetails() {
  const params = useParams();
  const customerId = params.id;
  const [customer, setCustomer] = useState<CustomerDetailsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (customerId) {
        setIsLoading(true);
        const customerData = await getCustomer(customerId as string);
        setCustomer(customerData);
        setIsLoading(false)
      }
    };
    init();
  }, [customerId]);
  return (
    <section className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {isLoading ? (
        <ProfileHeaderSkeleton />
      ) : (
        <CustomerDetailsHeader
          firstName={customer?.first_name ?? ""}
          lastName={customer?.last_name ?? ""}
          isVerified={customer?.is_verify ?? false}
          verifiedAt={customer?.verified_at ?? new Date()}
          points={customer?.earned_points ?? 0}
        />
      )}
      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-12">
        {isLoading ? (
          <CustomerInfoSkeleton />
        ) : (
          <CustomerInfo
            email={customer?.email ?? ""}
            contactNumber={customer?.contact_number ?? ""}
            social={customer?.social ?? ""}
            address={customer?.address ?? ""}
            milestoneCount={
              customer?.milestone_count.sort(
                (a, b) => a.sort_order - b.sort_order,
              ) ?? []
            }
            location={customer?.location}
            addressUpdatedAt={customer?.address_updated_at}
          />
        )}
        <CustomerBookings userId={customer?._id ?? ""} />
        <CustomerTransactions userId={customer?._id ?? ""} />
        <CustomerMilestones userId={customer?._id ?? ""} />
      </div>
    </section>
  );
}
