"use client";

import { CalendarCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "./Pagination";
import { PAGE_LIMIT, TABLE_DATE_FORMAT } from "@/lib/constants";
import { motion } from "framer-motion";
import {
  getBookings,
  IBookingResponse,
  IPaginatedBookings,
} from "../actions/getBookings";
import { BookingStatus, BookingStatusDisplay } from "@/lib/enums";

const statusStyle: Record<string, string> = {
  [BookingStatus.FOR_CHECKING]:
    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  [BookingStatus.RESERVED]:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  [BookingStatus.CANCELLED]: "bg-red-500/10 text-[#ff6b81] border-red-500/20",
  [BookingStatus.COMPLETED]: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  [BookingStatus.REJECTED]:
    "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  [BookingStatus.REFUNDED]:
    "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const CustomerBookings = ({ userId }: { userId: string }) => {
  const [bookings, setBookings] = useState<IBookingResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState<number | "">(page);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (userId !== "") {
      getBookings(page, PAGE_LIMIT, userId).then(
        (result: IPaginatedBookings) => {
          setBookings(result.data);
          setTotalPages(result.totalPages);
        },
      );
    }
  }, [page, userId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#dc143c]/15 border border-[#dc143c]/30 flex items-center justify-center">
            <CalendarCheck className="w-4 h-4 text-[#ff6b81]" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">Bookings History</h2>
            <p className="text-gray-600 text-xs">{`${bookings.length} records shown`}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b border-white/[0.06] hover:bg-transparent">
              {[
                "Client Name",
                "Contact",
                "Vehicle Model",
                "Preferred Date",
                "Time Slot",
                "Created",
                "Status",
              ].map((h) => (
                <TableHead
                  key={h}
                  className="px-5 py-3.5 text-gray-600 text-[10px] uppercase tracking-widest font-semibold whitespace-nowrap"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="px-5 py-12 text-center text-gray-700 text-sm"
                >
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
                  <TableCell className=" px-5 py-4 text-[#ff6b81] font-semibold text-sm">
                    {booking.name}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-500 text-sm whitespace-nowrap">
                    {booking.contact_number}
                  </TableCell>
                  <TableCell className="break-words px-5 py-4 text-gray-400 text-sm ">
                    {booking.vehicle_model}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-400 text-sm whitespace-nowrap">
                    {new Date(booking.preferred_date.date).toDateString()}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-400 text-sm whitespace-nowrap">
                    {booking.time_slot.time}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">
                    {new Date(booking.created_at).toLocaleString(
                      "en-US",
                      TABLE_DATE_FORMAT,
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold whitespace-nowrap ${statusStyle[booking.status] ?? "bg-white/[0.04] text-gray-400 border-white/10"}`}
                    >
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
    </motion.div>
  );
};

export default CustomerBookings;
