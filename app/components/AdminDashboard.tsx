"use client";

import { useEffect, useState } from "react";
import StatisticsCard from "./StatisticsCard";
import { getStatistics, StatisticsResponse } from "../actions/getStatistics";

const AdminDashboard = () => {
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  useEffect(() => {
    const init = async () => {
      const result = await getStatistics();
      setStatistics(result);
    };
    init();
  }, []);

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* Visit Count */}
      <StatisticsCard
        title="Total Visits"
        count={statistics?.visit.total ?? 0}
        breakdown={[{ label: "Today Visit", value: statistics?.visit.today ?? 0 }]}
      />

      {/* Inquiries Count */}
      <StatisticsCard
        title="Inquiries"
        count={statistics?.inquiry.total ?? 0}
        breakdown={[
          { label: "New", value: statistics?.inquiry.new ?? 0 },
          { label: "Completed", value: statistics?.inquiry.completed ?? 0 },
          { label: "Rejected", value: statistics?.inquiry.rejected ?? 0 },
        ]}
      />

      {/* Booking Count */}
      <StatisticsCard
        title="Bookings"
        count={statistics?.booking.total ?? 0}
        breakdown={[
          {
            label: "For Checking",
            value: statistics?.booking.for_checking ?? 0,
          },
          { label: "Pending", value: statistics?.booking.pending_payment ?? 0 },
          { label: "Reserved", value: statistics?.booking.reserved ?? 0 },
          { label: "Completed", value: statistics?.booking.completed ?? 0 },
          { label: "Cancelled", value: statistics?.booking.cancelled ?? 0 },
          { label: "Rejected", value: statistics?.booking.rejected ?? 0 },
          { label: "Refunded", value: statistics?.booking.refunded ?? 0 },
        ]}
      />
    </section>
  );
};

export default AdminDashboard;
