"use client";

import { Bike, Car, Receipt } from "lucide-react";
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
import { TransactionFromDisplay, VehicleType } from "@/lib/enums";
import {
  ITransactionResponse,
  getTransactions,
  IPaginatedTransactions,
} from "../actions/getTransactions";

const CustomerTransactions = ({ userId }: { userId: string }) => {
  const [transactions, setTransactions] = useState<ITransactionResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState<number | "">(page);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (userId !== "") {
      getTransactions(page, PAGE_LIMIT, userId).then(
        (result: IPaginatedTransactions) => {
          setTransactions(result.data);
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
      {/* header */}
      <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Receipt className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">
              Recent Transactions
            </h2>
            <p className="text-gray-600 text-xs">
              {transactions.length} records shown
            </p>
          </div>
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b border-white/[0.06] hover:bg-transparent">
              {[
                "Transaction Type",
                "Vehicle Description",
                "Vehicle Model",
                "Gross Total",
                "Discount",
                "Net Total",
                "Date",
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
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="px-5 py-12 text-center text-gray-700 text-sm"
                >
                  No transactions available
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow
                  key={transaction._id}
                  onClick={() =>
                    router.push(`/admin/transaction/${transaction._id}`)
                  }
                  className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <TableCell className="px-5 py-4 text-gray-400 text-sm whitespace-nowrap">
                    {TransactionFromDisplay[transaction.transaction_type]}
                  </TableCell>
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    {(() => {
                      const isCar =
                        transaction.vehicle_type.toLowerCase() === "car";
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
                            <Bike className="w-3 h-3 text-sky-400 flex-shrink-0" />
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
                            {transaction.vehicle_size.toUpperCase()}
                          </span>
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="break-words px-5 py-4 text-gray-400 text-sm ">
                    {transaction.vehicle_model}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-white font-medium text-sm whitespace-nowrap">
                    ₱{transaction.total_amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-[#ff6b81] text-sm whitespace-nowrap">
                    {transaction.total_discount > 0 ? (
                      `- ₱${transaction.total_discount.toLocaleString()}`
                    ) : (
                      <span className="text-gray-700">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-emerald-400 font-bold text-sm whitespace-nowrap">
                    ₱{transaction.net_total.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">
                    {new Date(transaction.created_at).toLocaleString(
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

export default CustomerTransactions;
