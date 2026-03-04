import RecentBookings from "../components/RecentBookings";
import RecentInquiries from "../components/RecentInquiries";
import AdminDashboard from "../components/AdminDashboard";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex items-center justify-center gap-4 mt-8">
        <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#dc143c]"></div>
        <div className="w-2 h-2 rotate-45 bg-[#dc143c]"></div>
        <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#dc143c]"></div>
      </div>
      <header className="mb-10 border-b border-[#dc143c] pb-4 flex justify-between items-center">
        <div>
          <h1 className="font-russo text-3xl font-bold uppercase tracking-tight">
            Admin <span className="text-[#dc143c]">Dashboard</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Overview of Red Line Detailing & Auto Spa performance
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-neutral-400">Welcome back,</div>
          <div className="font-bold text-white">Administrator</div>
        </div>
      </header>
      <AdminDashboard />
      <RecentBookings />
      <RecentInquiries />
    </div>
  );
}
