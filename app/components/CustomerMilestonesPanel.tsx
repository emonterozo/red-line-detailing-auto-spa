import { useState } from "react";
import { X, User } from "lucide-react";
import { BookingCustomerResponse } from "../actions/getBooking";

interface CustomerMilestonesPanelProps {
  customer: BookingCustomerResponse & {
    name: string
  };
  isVisible?: boolean;
}

export const CustomerMilestonesPanel = ({
  customer,
  isVisible = true,
}: CustomerMilestonesPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <div
        className={`transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="w-72 rounded-2xl border border-white/10 bg-[#111]/90 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.08]">
            <div className="w-10 h-10 rounded-full bg-[#dc143c]/20 border border-[#dc143c]/40 flex items-center justify-center text-[#ff6b81] font-bold text-sm flex-shrink-0">
              {customer.name.substring(0,2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {customer.name}
              </p>
              <p className="text-gray-500 text-xs">
                <span className="text-[#ff6b81] font-semibold">
                  {customer.earned_points}
                </span>{" "}
                pts earned
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="ml-auto flex-shrink-0 w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

          {customer.milestone_count.length > 0 ? (
            <div className="px-4 py-3">
              <p className="text-gray-600 text-[10px] uppercase tracking-widest mb-2">
                Milestone Progress
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {customer.milestone_count.map((m) => (
                  <div
                    key={m._id}
                    className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-2 text-center"
                  >
                    <p className="text-gray-600 text-[10px] leading-tight">
                      {m.size_id.type.toUpperCase()}
                      <br />
                      {m.size_id.size.toUpperCase()}
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

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 active:scale-95
          ${
            isOpen
              ? "bg-white/10 border border-white/20 text-white"
              : "bg-[#dc143c] shadow-[#dc143c]/40 text-white hover:bg-[#c01236]"
          }`}
      >
        {isOpen ? <X className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </button>
    </div>
  );
};
