import React from "react";
import { X } from "lucide-react";
import { TransactionResponse } from "@/app/actions/getTransactionDetails";

interface TransactionReceiptModalProps {
  transaction: TransactionResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionReceiptModal = ({
  transaction,
  isOpen,
  onClose,
}: TransactionReceiptModalProps) => {
  if (!isOpen || !transaction) return null;

  const formattedDate = new Date(transaction.created_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const totalAmountPaid = transaction.net_total + transaction.travel_fee;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-[#0c0c0c] border border-white/10 rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="h-[3px] bg-gradient-to-r from-[#dc143c] via-[#ff6b81] to-transparent flex-shrink-0" />
        <div className="px-7 pt-6 pb-5 border-b border-white/[0.07] flex items-start justify-between gap-4 flex-shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dc143c]/12 border border-[#dc143c]/25 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dc143c]" />
              <span className="text-[10px] font-bold text-[#ff6b81] uppercase tracking-widest">
                Transaction Details
              </span>
            </div>
            <h2 className="text-[22px] font-extrabold text-white tracking-tight leading-tight mb-1">
              Service Receipt
            </h2>
            <p className="text-xs text-white/30">
              {`${transaction.vehicle_model} • ${formattedDate}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-200 group"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
        <div className="p-7 overflow-y-auto custom-scrollbar space-y-6">
          <div className="space-y-3">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-1">
              Services Availed
            </p>
            <div className="space-y-2">
              {transaction.services.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5"
                >
                  <span className="text-sm font-bold text-white/80">
                    {item.title}
                  </span>
                  <span className="text-sm font-black text-white ">
                    {`₱${item.price.toLocaleString()}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col group hover:border-white/10 transition-colors">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-wider">
                Earned
              </p>
              <p className="text-xl font-black text-white mt-1 ">
                {`+${transaction.points?.total} `}
                <span className="text-[10px] text-white/20 not-italic ml-1">
                  PTS
                </span>
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col group hover:border-white/10 transition-colors">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-wider">
                Used
              </p>
              <p className="text-xl font-black text-[#dc143c] mt-1 ">
                {`-${transaction.points_used}`}
                <span className="text-[10px] text-[#dc143c]/40 not-italic ml-1">
                  PTS
                </span>
              </p>
            </div>
          </div>
          <div className="space-y-2.5 px-1">
            <div className="flex justify-between text-[11px] font-bold text-white/40 uppercase tracking-tight">
              <span>Gross Total</span>
              <span className="text-white/60">{`₱${transaction.gross_total.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-white/40 uppercase tracking-tight">
              <span>Travel Fee</span>
              <span className="text-white/60">{`₱${transaction.travel_fee.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-[#dc143c] uppercase tracking-tight">
              <span>Total Discount</span>
              <span className="font-black">{`- ₱${transaction.total_discount.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between items-end pt-6 mt-4 border-t border-white/[0.07]">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                  Amount Paid
                </span>
                <span className="text-4xl font-black text-white leading-none tracking-tighter mt-2">
                  ₱{totalAmountPaid.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
