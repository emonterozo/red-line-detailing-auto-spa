"use client";

import { ChevronRight, CalendarCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBookings, IBookingResponse, IPaginatedBookings } from "../actions/getBookings";
import { useEffect, useRef, useState } from "react";
import { BookingStatus, BookingStatusDisplay } from "@/lib/enums";
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

const statusStyle: Record<string, string> = {
  [BookingStatus.FOR_CHECKING]: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  [BookingStatus.CONFIRMED]:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  [BookingStatus.CANCELLED]:    "bg-red-500/10 text-[#ff6b81] border-red-500/20",
  [BookingStatus.COMPLETED]:    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  [BookingStatus.REJECTED]:     "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  [BookingStatus.REFUNDED]:     "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const RecentBookings = () => {
  const [bookings, setBookings] = useState<IBookingResponse[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState<number | "">(page);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    getBookings(page, limit).then((result: IPaginatedBookings) => {
      setBookings(result.data);
      setTotalPages(result.totalPages);
    });
  }, [page, limit]);

  return (
    <section className="mb-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
      {/* header */}
      <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#dc143c]/15 border border-[#dc143c]/30 flex items-center justify-center">
            <CalendarCheck className="w-4 h-4 text-[#ff6b81]" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">Recent Bookings</h2>
            <p className="text-gray-600 text-xs">{bookings.length} records shown</p>
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
              {["Client Name", "Contact", "Vehicle", "Preferred Date", "Time Slot", "Created", "Updated", "Status"].map((h) => (
                <TableHead key={h} className="px-5 py-3.5 text-gray-600 text-[10px] uppercase tracking-widest font-semibold whitespace-nowrap">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="px-5 py-12 text-center text-gray-700 text-sm">
                  No bookings available
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow
                  key={booking._id}
                  onClick={() => router.push(`/admin/booking/${booking._id}`)}
                  className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  <TableCell className="px-5 py-4 text-[#ff6b81] font-semibold text-sm whitespace-nowrap">
                    {booking.name}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-500 text-sm whitespace-nowrap">
                    {booking.contact_number}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-400 text-sm whitespace-nowrap">
                    {booking.vehicle_model}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-400 text-sm whitespace-nowrap">
                    {new Date(booking.preferred_date.date).toDateString()}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-400 text-sm whitespace-nowrap">
                    {booking.time_slot.time}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">
                    {formattedDate(booking.created_at)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">
                    {formattedDate(booking.updated_at)}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold whitespace-nowrap ${statusStyle[booking.status] ?? "bg-white/[0.04] text-gray-400 border-white/10"}`}>
                      {BookingStatusDisplay[booking.status]}
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

function Pagination({
  page,
  totalPages,
  inputPage,
  inputRef,
  setInputPage,
  setPage,
}: {
  page: number;
  totalPages: number;
  inputPage: number | "";
  inputRef: React.RefObject<HTMLInputElement>;
  setInputPage: (v: number | "") => void;
  setPage: (v: number) => void;
}) {
  return (
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
              setPage(val);
              setInputPage(val);
            }
          }}
          onBlur={() => {
            if (inputPage === "" || isNaN(inputPage as number)) { setInputPage(page); return; }
            const val = Math.min(Math.max(inputPage as number, 1), totalPages);
            setPage(val);
            setInputPage(val);
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
  );
}

export default RecentBookings;