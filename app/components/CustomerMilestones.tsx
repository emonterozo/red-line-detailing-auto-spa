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
  getCustomerClaimedMilestones,
  IPaginatedMilestones,
  ClaimedMilestoneTableResponse,
} from "../actions/getCustomerClaimedMilestones";
import { VehicleType } from "@/lib/enums";
import TableSkeleton from "./TableSkeleton";

const TABLE_HEADER = [
  "Service",
  "Vehicle Description",
  "Vehicle Model",
  "Price",
  "Discount",
  "Claimed",
];

const CustomerMilestones = ({ userId }: { userId: string }) => {
  const [milestones, setMilestones] = useState<ClaimedMilestoneTableResponse[]>(
    [],
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState<number | "">(page);
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const init = () => {
      setIsLoading(true);
      getCustomerClaimedMilestones(userId, page, PAGE_LIMIT).then(
        (result: IPaginatedMilestones) => {
          setMilestones(result.data);
          setTotalPages(result.totalPages);
          setIsLoading(false);
        },
      );
    };
    init();
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

      {isLoading ? (
        <TableSkeleton
          tableHeader={TABLE_HEADER}
          wideColumns={[2,5]}
          pillColumns={[1]}
        />
      ) : (
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-white/[0.06] hover:bg-transparent">
                {TABLE_HEADER.map((h) => (
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
                      {item.service_id.title}
                    </TableCell>
                    <TableCell className="px-5 py-4 whitespace-nowrap">
                      {(() => {
                        const isCar = item.size_id.type.toLowerCase() === "car";
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
                              {item.size_id.size.toUpperCase()}
                            </span>
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-sm whitespace-nowrap">
                      {item.vehicle_model}
                    </TableCell>
                    <TableCell className="break-words px-5 py-4 text-white font-medium text-sm ">
                      {`₱${item.price.toLocaleString()}`}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-[#ff6b81] text-sm  whitespace-nowrap">
                      {`- ₱${item.discount.toLocaleString()}`}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">
                      {new Date(item.created_at).toLocaleString(
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
      )}
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


// const customer = {
//   first_name: "Eric",
//   last_name: "Monterozo",
//   contact_number: "09122011108",
//   address: "address",
//   travel_distance: 12,
//   referral_link: "https://ERIC-260410-I2Y4",
//   birth_day: new Date(),
//   verified_at: "2026-04-10T09:13:24.768Z",
//   is_verify: true,
//   earned_points: 100,
//   milestone_count: [
//     {
//       _id: "69d8b1e8f8342c41f0c400f1",
//       size_id: "69cb3b166ef2c54804cead91",
//       vehicle_type: "car",
//       vehicle_size: "sm",
//       progress: 0,
//       sort_order: 1,
//     },
//     {
//       _id: "69d8b1e8f8342c41f0c400f2",
//       size_id: "69cb3b166ef2c54804cead92",
//       vehicle_type: "car",
//       vehicle_size: "md",
//       progress: 0,
//       sort_order: 2,
//     },
//     {
//       _id: "69d8b1e8f8342c41f0c400f3",
//       size_id: "69cb3b166ef2c54804cead93",
//       vehicle_type: "car",
//       vehicle_size: "lg",
//       progress: 0,
//       sort_order: 3,
//     },
//     {
//       _id: "69d8b1e8f8342c41f0c400f4",
//       size_id: "69cb3b166ef2c54804cead94",
//       vehicle_type: "car",
//       vehicle_size: "xl",
//       progress: 0,
//       sort_order: 4,
//     },
//     {
//       _id: "69d8b1e8f8342c41f0c400f5",
//       size_id: "69cb3b166ef2c54804cead95",
//       vehicle_type: "car",
//       vehicle_size: "xxl",
//       progress: 0,
//       sort_order: 5,
//     },
//     {
//       _id: "69d8b1e8f8342c41f0c400f6",
//       size_id: "69cc00256ef2c54804ceadd2",
//       vehicle_type: "motorcycle",
//       vehicle_size: "sm",
//       progress: 0,
//       sort_order: 6,
//     },
//     {
//       _id: "69d8b1e8f8342c41f0c400f7",
//       size_id: "69cc00346ef2c54804ceadd3",
//       vehicle_type: "motorcycle",
//       vehicle_size: "md",
//       progress: 0,
//       sort_order: 7,
//     },
//     {
//       _id: "69d8b1e8f8342c41f0c400f8",
//       size_id: "69cc00436ef2c54804ceadd4",
//       vehicle_type: "motorcycle",
//       vehicle_size: "lg",
//       progress: 0,
//       sort_order: 8,
//     },
//   ],
//   bookings: [
//     {
//       _id: "69d776547994a599d4c7e501",
//       vehicle_model: "Vios",
//       preferred_date: {
//         _id: "69ad052355fa782143e71cc6",
//         date: "2026-04-11T15:59:59.059Z",
//       },
//       time_slot: {
//         _id: "69ad052355fa782143e71cc8",
//         time: "12:00 PM",
//       },
//       status: "completed",
//       created_at: "2026-04-09T09:49:26.260Z",
//     },
//   ],
//   transactions: [
//     {
//       _id: "69d8759151444ef4696ef477",
//       vehicle_model: "Vios",
//       total_service_amount: 480,
//       total_discount: 0,
//       net_total: 480,
//       points_earned: 0,
//       created_at: "2026-04-10T03:58:06.300Z",
//     },
//   ],
//   milestone_claimed: [
//     {
//       _id: "69d653c58676cc55d86ab0a1",
//       service_id: {
//         _id: "6510a1e12d9f1c001234ab14",
//         title: "Hydrophobic Wax Protection",
//       },
//       price: 600,
//       vehicle_model: "Hilux",
//       discount: 250,
//       created_at: "2026-04-08T11:37:18.471Z",
//     },
//   ],
// };
