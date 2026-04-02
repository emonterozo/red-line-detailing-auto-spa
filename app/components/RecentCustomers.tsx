"use client";

import { ChevronRight, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useRef, useState } from "react";
//import { getCustomers, ICustomerResponse, IPaginatedCustomers } from "../actions/getCustomers";
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

const RecentCustomers = () => {
  const [customers, setCustomers] = useState<ICustomerResponse[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState<number | "">(page);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  // useEffect(() => {
  //   getCustomers("", page, limit).then((result: IPaginatedCustomers) => {
  //     setCustomers(result.data);
  //     setTotalPages(result.totalPages);
  //   });
  // }, [page, limit]);

  return (
    <section className="mb-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
      {/* header */}
      <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">Customers</h2>
            <p className="text-gray-600 text-xs">{customers.length} records shown</p>
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
              {["Customer", "Points", "Milestones", "Transactions", "Joined"].map((h) => (
                <TableHead key={h} className="px-5 py-3.5 text-gray-600 text-[10px] uppercase tracking-widest font-semibold whitespace-nowrap">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-5 py-12 text-center text-gray-700 text-sm">
                  No customers available
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow
                  key={customer._id}
                  onClick={() => router.push(`/admin/customer/${customer._id}`)}
                  className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#dc143c]/15 border border-[#dc143c]/30 flex items-center justify-center text-[#ff6b81] font-bold text-xs flex-shrink-0">
                        {customer.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[#ff6b81] font-semibold text-sm">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    <span className="text-amber-400 font-bold text-sm">{customer.earned_points}</span>
                    <span className="text-gray-600 text-xs ml-1">pts</span>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {customer.milestone_count?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {customer.milestone_count.map((m) => (
                          <span key={m._id} className="inline-flex px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-gray-500 whitespace-nowrap">
                            {m.vehicle.type.toUpperCase()} {m.vehicle.size.toUpperCase()} · {m.progress}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-700 text-xs italic">No milestones</span>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-400 text-sm whitespace-nowrap">
                    {customer.transaction_count ?? 0}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">
                    {customer.created_at ? formattedDate(customer.created_at) : "—"}
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

export default RecentCustomers;