"use client";

import {
  ForwardRefExoticComponent,
  RefAttributes,
  useEffect,
  useState,
} from "react";
import { getStatistics, StatisticsResponse } from "../actions/getStatistics";
import {
  Users,
  CalendarCheck,
  MessageSquare,
  Eye,
  Receipt,
  TrendingUp,
  Tag,
  ArrowUpRight,
  Calendar as CalendarIcon,
  LucideProps,
} from "lucide-react";

/* ── Custom Date Picker Trigger ── */
// Note: In a real app, you'd use @/components/ui/popover and @/components/ui/calendar from shadcn
function DateRangePicker({
  active,
  onClick,
}: Readonly<{
  active: boolean;
  onClick: () => void;
}>) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
        ${
          active
            ? "bg-[#dc143c] text-white border-[#dc143c] shadow-lg shadow-[#dc143c]/20"
            : "bg-transparent border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300"
        }`}
    >
      <CalendarIcon size={14} />
      {active ? "Jan 01 - Jan 21" : "Custom Range"}
    </button>
  );
}


function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: Readonly<{
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  label: string;
  value: string | number;
  sub?: { label: string; value: string | number }[];
  accent?: boolean;
}>) {
  return (
    <div
      className={`relative flex flex-col h-full rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 group
        ${
          accent
            ? "bg-gradient-to-br from-[#dc143c]/20 via-[#dc143c]/5 to-transparent border-[#dc143c]/40 shadow-[0_0_20px_rgba(220,20,60,0.1)]"
            : "bg-[#0A0A0A] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]"
        }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-2.5 rounded-xl transition-colors
            ${accent ? "bg-[#dc143c] text-white" : "bg-white/[0.05] text-gray-400 group-hover:text-white"}`}
        >
          <Icon size={18} />
        </div>
        {accent && (
          <ArrowUpRight className="text-[#dc143c] opacity-50" size={16} />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">
          {label}
        </p>
        <p
          className={`text-2xl font-bold tracking-tight ${accent ? "text-white" : "text-gray-100"}`}
        >
          {value}
        </p>
      </div>
      {sub && sub.length > 0 && (
        <div className="mt-auto pt-4 flex flex-col gap-2">
          {sub.map((s) => (
            <div
              key={s.label}
              className="flex justify-between items-center group/item"
            >
              <span className="text-gray-500 text-[11px] group-hover/item:text-gray-400 transition-colors">
                {s.label}
              </span>
              <span className="text-gray-300 text-[11px] font-semibold">
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: Readonly<{
  label: string;
  active: boolean;
  onClick: () => void;
}>) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
        ${
          active
            ? "bg-white text-black border-white shadow-lg shadow-white/10"
            : "bg-transparent border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300"
        }`}
    >
      {label}
    </button>
  );
}

const FILTERS = ["All Time", "Today", "Week", "Month", "Year"];

const AdminDashboard = () => {
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [activeFilter, setActiveFilter] = useState("All Time");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const result = await getStatistics();
        setStatistics(result);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [activeFilter]);

  return (
    <section className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-10 gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white">Analytics Overview</h2>
          <p className="text-gray-500 text-sm font-medium">
            Real-time performance metrics and financial health.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white/[0.02] p-2 rounded-2xl border border-white/[0.05] backdrop-blur-md">
          <div className="flex gap-1 border-r border-white/10 pr-3 mr-1">
            {FILTERS.map((f) => (
              <FilterPill
                key={f}
                label={f}
                active={activeFilter === f}
                onClick={() => setActiveFilter(f)}
              />
            ))}
          </div>

          <DateRangePicker
            active={activeFilter === "Custom"}
            onClick={() => setActiveFilter("Custom")}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...new Array(7)].map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-2xl border border-white/[0.05] bg-white/[0.02] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard
              icon={Eye}
              label="Total Visits"
              value={statistics?.visit.total ?? 0}
              sub={[
                {
                  label: "Today's traffic",
                  value: statistics?.visit.today ?? 0,
                },
              ]}
            />
            <MetricCard
              icon={Users}
              label="Active Customers"
              value={statistics?.customer?.total ?? 0}
              sub={[
                {
                  label: "New this month",
                  value: statistics?.customer?.new_this_month ?? 0,
                },
              ]}
            />
            <MetricCard
              icon={MessageSquare}
              label="Inquiries"
              value={statistics?.inquiry.total ?? 0}
              sub={[
                {
                  label: "New Leads",
                  value: statistics?.inquiry.new_inquiry ?? 0,
                },
                {
                  label: "Completed",
                  value: statistics?.inquiry.completed ?? 0,
                },
              ]}
            />
            <MetricCard
              icon={CalendarCheck}
              label="Total Bookings"
              value={statistics?.booking.total ?? 0}
              sub={[
                { label: "Reserved", value: statistics?.booking.reserved ?? 0 },
                {
                  label: "Completed",
                  value: statistics?.booking.completed ?? 0,
                },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <MetricCard
              icon={Receipt}
              label="Transactions"
              value={statistics?.transaction?.total ?? 0}
              sub={[
                {
                  label: "Walk-ins",
                  value: statistics?.transaction?.walk_ins ?? 0,
                },
                {
                  label: "Bookings",
                  value: statistics?.transaction?.bookings ?? 0,
                },
              ]}
            />
            <MetricCard
              accent
              icon={TrendingUp}
              label="Gross Revenue"
              value={`₱${(statistics?.revenue?.total_gross_amount ?? 0).toLocaleString()}`}
              sub={[
                {
                  label: "Net Revenue",
                  value: `₱${(statistics?.revenue?.total_net_amount ?? 0).toLocaleString()}`,
                },
                {
                  label: "Avg Ticket",
                  value: `₱${(statistics?.revenue?.avg_ticket_net ?? 0).toLocaleString()}`,
                },
              ]}
            />
            <MetricCard
              icon={Tag}
              label="Discount Given"
              value={`₱${(statistics?.discount?.total ?? 0).toLocaleString()}`}
              sub={[
                {
                  label: "Promotions",
                  value: `₱${(statistics?.discount?.promotions ?? 0).toLocaleString()}`,
                },
                {
                  label: "Manual",
                  value: `₱${(statistics?.discount?.manual ?? 0).toLocaleString()}`,
                },
              ]}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;
