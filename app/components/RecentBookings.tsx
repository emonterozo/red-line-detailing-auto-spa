"use client";

import { ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getBookings,
  IBookingResponse,
  IPaginatedBookings,
} from "../actions/getBookings";
import { useEffect, useRef, useState } from "react";
import { BookingStatusDisplay } from "@/lib/enums";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const formattedDate = (date: Date) => {
  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
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
    async function loadBookings() {
      const result: IPaginatedBookings = await getBookings(page, limit);
      setBookings(result.data);
      setTotalPages(result.totalPages);
    }

    loadBookings();
  }, [page, limit]);

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <section className="bg-neutral-950 border border-neutral-900 rounded-sm overflow-hidden shadow-2xl mb-12">
      <div className="p-8 border-b border-neutral-900 flex justify-between items-center bg-neutral-950/50 backdrop-blur-sm">
        <h2 className={`text-2xl font-russo text-white`}>Recent Bookings</h2>
        <button className="flex items-center gap-2 text-xs text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors">
          View All Records <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full text-left border-collapse">
          <TableHeader>
            <TableRow className="bg-neutral-900/30 hover:bg-neutral-900/30 border-b border-neutral-900">
              <TableHead className="p-6 font-medium text-neutral-500 text-xs uppercase tracking-[0.15em]">
                Client Name
              </TableHead>
              <TableHead className="p-6 font-medium text-neutral-500 text-xs uppercase tracking-[0.15em]">
                Contact Number
              </TableHead>
              <TableHead className="p-6 font-medium text-neutral-500 text-xs uppercase tracking-[0.15em]">
                Vehicle Model
              </TableHead>
              <TableHead className="p-6 font-medium text-neutral-500 text-xs uppercase tracking-[0.15em]">
                Preferred Date
              </TableHead>
              <TableHead className="p-6 font-medium text-neutral-500 text-xs uppercase tracking-[0.15em]">
                Time Slot
              </TableHead>
              <TableHead className="p-6 font-medium text-neutral-500 text-xs uppercase tracking-[0.15em]">
                Created
              </TableHead>
              <TableHead className="p-6 font-medium text-neutral-500 text-xs uppercase tracking-[0.15em]">
                Last Updated
              </TableHead>
              <TableHead className="p-6 font-medium text-neutral-500 text-xs uppercase tracking-[0.15em]">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="p-6 text-center text-neutral-400 font-medium"
                >
                  No data available right now
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow
                  key={booking._id}
                  className="group hover:bg-neutral-900/30 transition-colors duration-300 border-b border-neutral-900"
                  onClick={() => router.push(`/admin/booking/${booking._id}`)}
                >
                  <TableCell className="p-6 text-[#dc143c] text-lg">
                    {booking.name}
                  </TableCell>
                  <TableCell className="p-6 text-neutral-500 font-light">
                    {booking.contact_number}
                  </TableCell>
                  <TableCell className="p-6 text-neutral-500 font-light">
                    {booking.vehicle_model}
                  </TableCell>
                  <TableCell className="p-6 text-neutral-300 font-light">
                    {new Date(booking.preferred_date.date).toDateString()}
                  </TableCell>
                  <TableCell className="p-6 text-neutral-300 font-light">
                    {booking.time_slot.time}
                  </TableCell>
                  <TableCell className="p-6 text-neutral-500 font-light">
                    {formattedDate(booking.created_at)}
                  </TableCell>
                  <TableCell className="p-6 text-neutral-500 font-light">
                    {formattedDate(booking.updated_at)}
                  </TableCell>
                  <TableCell className="p-6 text-neutral-400 font-light">
                    {BookingStatusDisplay[booking.status]}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex gap-4 justify-end items-center p-4 border-t border-neutral-900 bg-neutral-950/50 backdrop-blur-sm">
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="px-4 py-2 text-sm font-medium text-white bg-neutral-800 rounded hover:bg-neutral-700 disabled:opacity-50"
        >
          Previous
        </button>
        <div className="flex gap-3 items-center text-sm text-neutral-400">
          Page
          <Input
            min={1}
            max={totalPages}
            value={inputPage}
            ref={inputRef}
            onChange={(e) => {
              const val = e.target.value;
              // Allow empty string while typing
              setInputPage(val === "" ? "" : Number(val));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // Remove focus first to trigger onBlur
                inputRef.current?.blur();
                // Do nothing if empty
                if (inputPage === "" || isNaN(inputPage)) return;
                const val = Math.min(Math.max(inputPage, 1), totalPages);
                setPage(val);
                setInputPage(val);
              }
            }}
            onBlur={() => {
              if (inputPage === "" || isNaN(inputPage)) {
                setInputPage(page); // revert to current page if empty
                return;
              }
              const val = Math.min(Math.max(inputPage, 1), totalPages);
              setPage(val);
              setInputPage(val);
            }}
            className="!text-base w-15 rounded border border-neutral-700 backdrop-blur-sm focus-visible:border-[#dc143c] focus-visible:ring-[#dc143c]/20"
          />
          of {totalPages}
        </div>

        <button
          onClick={handleNextPage}
          disabled={page === totalPages}
          className="px-4 py-2 text-sm font-medium text-white bg-neutral-800 rounded hover:bg-neutral-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default RecentBookings;
