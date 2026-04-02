"use client";

import { ChevronRight, Receipt } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useRef, useState } from "react";
//import { getTransactions, ITransactionResponse, IPaginatedTransactions } from "../actions/getTransactions";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const formattedDate = (date: Date) =>
  new Date(date).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const RecentTransactions = () => {
  const [transactions, setTransactions] = useState<ITransactionResponse[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState<number | "">(page);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  // useEffect(() => {
  //   getTransactions(page, limit).then((result: IPaginatedTransactions) => {
  //     setTransactions(result.data);
  //     setTotalPages(result.totalPages);
  //   });
  // }, [page, limit]);

  return (
    <section className="mb-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
      {/* header */}
      <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Receipt className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">Recent Transactions</h2>
            <p className="text-gray-600 text-xs">{transactions.length} records shown</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-[#ff6b81] hover:text-white uppercase tracking-widest transition-colors font-semibold">
          View All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b border-white/[0.06] hover:bg-transparent">
              {["Customer", "Vehicle", "Services", "Total", "Discount", "Net", "Source", "Date"].map((h) => (
                <TableHead key={h} className="px-5 py-3.5 text-gray-600 text-[10px] uppercase tracking-widest font-semibold whitespace-nowrap">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="px-5 py-12 text-center text-gray-700 text-sm">
                  No transactions available
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow
                  key={tx._id}
                  onClick={() => router.push(`/admin/transaction/${tx._id}`)}
                  className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <TableCell className="px-5 py-4 text-[#ff6b81] font-semibold text-sm whitespace-nowrap">
                    {tx.customer?.name ?? <span className="text-gray-600 italic">Walk-in</span>}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-400 text-sm whitespace-nowrap">
                    <span className="text-gray-500">{tx.vehicle_type}/{tx.vehicle_size}</span>
                    <br />
                    <span className="text-xs">{tx.vehicle_model}</span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-500 text-sm">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {tx.services.map((s) => (
                        <span key={s._id} className="inline-flex px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-gray-500 whitespace-nowrap">
                          {s.title}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-white font-medium text-sm whitespace-nowrap">
                    ₱{tx.total_amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-[#ff6b81] text-sm whitespace-nowrap">
                    {tx.total_discount > 0 ? `- ₱${tx.total_discount.toLocaleString()}` : <span className="text-gray-700">—</span>}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-emerald-400 font-bold text-sm whitespace-nowrap">
                    ₱{(tx.total_amount - tx.total_discount).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold whitespace-nowrap
                      ${tx.transaction_from === "booking"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                      {tx.transaction_from === "booking" ? "Booking" : "Walk-in"}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">
                    {formattedDate(tx.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* pagination */}
      <div className="flex gap-3 justify-end items-center px-5 py-4 border-t border-white/[0.06]">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-3 py-1.5 text-xs font-semibold text-gray-400 bg-white/[0.04] border border-white/[0.08] rounded-lg hover:border-white/20 hover:text-white disabled:opacity-30 transition-all"
        >
          Previous
        </button>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          Page
          <Input
            min={1}
            max={totalPages}
            value={inputPage}
            ref={inputRef}
            onChange={(e) => setInputPage(e.target.value === "" ? "" : Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                inputRef.current?.blur();
                if (inputPage === "" || isNaN(inputPage as number)) return;
                const val = Math.min(Math.max(inputPage as number, 1), totalPages);
                setPage(val); setInputPage(val);
              }
            }}
            onBlur={() => {
              if (inputPage === "" || isNaN(inputPage as number)) { setInputPage(page); return; }
              const val = Math.min(Math.max(inputPage as number, 1), totalPages);
              setPage(val); setInputPage(val);
            }}
            className="w-12 h-7 text-center text-xs rounded-lg bg-white/[0.04] border-white/10 text-white focus-visible:border-[#dc143c]/60 focus-visible:ring-[#dc143c]/20"
          />
          <span>of {totalPages}</span>
        </div>
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-3 py-1.5 text-xs font-semibold text-gray-400 bg-white/[0.04] border border-white/[0.08] rounded-lg hover:border-white/20 hover:text-white disabled:opacity-30 transition-all"
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default RecentTransactions;