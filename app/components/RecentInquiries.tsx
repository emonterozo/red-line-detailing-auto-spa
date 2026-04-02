"use client";

import { ChevronRight, MessageSquare } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useRef, useState } from "react";
import { InquiryStatus, InquiryStatusDisplay } from "@/lib/enums";
import { useRouter } from "next/navigation";
import { Pagination } from "./Pagination";
import { PAGE_LIMIT, TABLE_DATE_FORMAT } from "@/lib/constants";
import {
  getInquiries,
  IInquiriesResponse,
  IPaginatedInquiries,
} from "../actions/getInquiries";

const statusStyle: Record<string, string> = {
  [InquiryStatus.NEW]: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  [InquiryStatus.COMPLETED]:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  [InquiryStatus.REJECTED]: "bg-red-500/10 text-[#ff6b81] border-red-500/20",
};

const RecentInquiries = () => {
  const [inquiries, setInquiries] = useState<IInquiriesResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState<number | "">(page);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    getInquiries(page, PAGE_LIMIT).then((result: IPaginatedInquiries) => {
      setInquiries(result.data);
      setTotalPages(result.totalPages);
    });
  }, [page]);

  return (
    <section className="mb-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
      {/* header */}
      <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">Recent Inquiries</h2>
            <p className="text-gray-600 text-xs">
              {inquiries.length} records shown
            </p>
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
              {["Client Name", "Contact", "Email", "Created", "Status"].map(
                (h) => (
                  <TableHead
                    key={h}
                    className="px-5 py-3.5 text-gray-600 text-[10px] uppercase tracking-widest font-semibold whitespace-nowrap"
                  >
                    {h}
                  </TableHead>
                ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="px-5 py-12 text-center text-gray-700 text-sm"
                >
                  No inquiries available
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((inquiry) => (
                <TableRow
                  key={inquiry._id}
                  onClick={() => router.push(`/admin/inquiry/${inquiry._id}`)}
                  className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  <TableCell className=" px-5 py-4 text-[#ff6b81] font-semibold text-sm">
                    {inquiry.name}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-500 text-sm whitespace-nowrap">
                    {inquiry.contact_number}
                  </TableCell>
                  <TableCell className="break-words px-5 py-4 text-gray-400 text-sm ">
                    {inquiry.email}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">
                    {new Date(inquiry.created_at).toLocaleString(
                      "en-US",
                      TABLE_DATE_FORMAT,
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold whitespace-nowrap ${statusStyle[inquiry.status] ?? "bg-white/[0.04] text-gray-400 border-white/10"}`}
                    >
                      {InquiryStatusDisplay[inquiry.status]}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        inputPage={inputPage}
        inputRef={inputRef}
        setInputPage={setInputPage}
        setPage={setPage}
      />
    </section>
  );
};

export default RecentInquiries;
