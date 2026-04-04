"use client";

import { Car, Motorbike, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useRef, useState } from "react";
import { Pagination } from "./Pagination";
import { PAGE_LIMIT, TABLE_DATE_FORMAT } from "@/lib/constants";

import { motion } from "framer-motion";
import {
  getCustomerMilestones,
  IPaginatedMilestones,
  IMilestonesResponse,
} from "../actions/getCustomerMilestones";
import { VehicleType } from "@/lib/enums";

const CustomerMilestones = ({ userId }: { userId: string }) => {
  const [milestones, setMilestones] = useState<IMilestonesResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState<number | "">(page);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    getCustomerMilestones(userId, page, PAGE_LIMIT).then(
      (result: IPaginatedMilestones) => {
        setMilestones(result.data);
        setTotalPages(result.totalPages);
      },
    );
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
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">
              Claimed Milestones
            </h2>
            <p className="text-gray-600 text-xs">{`${milestones.length} records shown`}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b border-white/[0.06] hover:bg-transparent">
              {[
                "Service",
                "Vehicle Description",
                "Vehicle Model",
                "Price",
                "Discount",
                "Claimed",
              ].map((h) => (
                <TableHead
                  key={h}
                  className="px-5 py-3.5 text-gray-600 text-[12px] uppercase tracking-widest font-semibold whitespace-nowrap"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {milestones.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="px-5 py-12 text-center text-gray-700 text-sm"
                >
                  No milestones available
                </TableCell>
              </TableRow>
            ) : (
              milestones.map((item) => (
                <TableRow
                  key={item._id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  <TableCell className=" px-5 py-4 text-[#ff6b81] font-semibold text-sm">
                    {item.service}
                  </TableCell>
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    {(() => {
                      const isCar = item.vehicle_type.toLowerCase() === "car";
                      return (
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border
        ${
          isCar
            ? "bg-[#dc143c]/10 border-[#dc143c]/25"
            : "bg-sky-500/10 border-sky-500/20"
        }`}
                        >
                          {isCar ? (
                            <Car className="w-3 h-3 text-[#ff6b81] flex-shrink-0" />
                          ) : (
                            <Motorbike className="w-3 h-3 text-sky-400 flex-shrink-0" />
                          )}
                          <span
                            className={`text-xs font-bold ${isCar ? "text-[#ff6b81]" : "text-sky-400"}`}
                          >
                            {isCar
                              ? VehicleType.CAR.toUpperCase()
                              : VehicleType.MOTORCYCLE.toUpperCase()}
                          </span>
                          <span
                            className={`w-px h-3 ${isCar ? "bg-[#dc143c]/30" : "bg-sky-500/25"}`}
                          />
                          <span
                            className={`text-xs font-bold ${isCar ? "text-[#ff6b81]" : "text-sky-400"}`}
                          >
                            {item.vehicle_size.toUpperCase()}
                          </span>
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-500 text-sm whitespace-nowrap">
                    {item.vehicle_model}
                  </TableCell>
                  <TableCell className="break-words px-5 py-4 text-gray-400 text-sm ">
                    {`₱${item.price.toLocaleString()}`}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">
                    {`₱${item.discount.toLocaleString()}`}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">
                    {new Date(item.claimed_at).toLocaleString(
                      "en-US",
                      TABLE_DATE_FORMAT,
                    )}
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

export default CustomerMilestones;
