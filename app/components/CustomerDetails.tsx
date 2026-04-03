"use client";

import CustomerDetailsHeader from "./CustomerDetailsHeader";
import CustomerInfo from "./CustomerInfo";
import CustomerBookings from "./CustomerBookings";
import CustomerTransactions from "./CustomerTransactions";
import CustomerMilestones from "./CustomerMilestones";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCustomer, ICustomerResponse } from "../actions/getCustomer";

export default function CustomerDetails() {
  const params = useParams();
  const customerId = params.id;
  const [customer, setCustomer] = useState<ICustomerResponse | null>(null);

  useEffect(() => {
    const init = async () => {
      if (customerId) {
        const customerData = await getCustomer(customerId as string);
        setCustomer(customerData);
      }
    };
    init();
  }, [customerId]);
  return (
    <section className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      <CustomerDetailsHeader
        firstName={customer?.first_name ?? ""}
        lastName={customer?.last_name ?? ""}
        isVerified={customer?.is_verify ?? false}
        verifiedAt={customer?.verify_at ?? new Date()}
        points={customer?.earned_points ?? 0}
      />

      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-12">
        {/* ── VERTICAL INFO GRID ── */}
        <CustomerInfo
          email={customer?.email ?? ""}
          contactNumber={customer?.contact_number ?? ""}
          social={customer?.social ?? ""}
          address={customer?.address ?? ""}
          milestoneCount={customer?.milestone_count ?? []}
        />
        <CustomerBookings userId={customer?._id ?? ''}  />
        <CustomerTransactions  userId={customer?._id ?? ''} />
        <CustomerMilestones userId={customer?._id ?? ''} />
      </div>
    </section>
  );
}
