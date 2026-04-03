"use client";

import { CheckCircle2, ChevronRight, Users } from "lucide-react";
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
import {
  getCustomerList,
  ICustomerResponse,
  IPaginatedCustomers,
} from "../actions/getCustomerList";
import { motion } from "framer-motion";

const CustomerTransactions = () => {
  const [customers, setCustomers] = useState<ICustomerResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState<number | "">(page);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    getCustomerList(page, PAGE_LIMIT).then((result: IPaginatedCustomers) => {
      setCustomers(result.data);
      setTotalPages(result.totalPages);
    });
  }, [page]);

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
            <h2 className="text-white font-bold text-base">Transactions</h2>
            <p className="text-gray-600 text-xs">10 records shown</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b border-white/[0.06] hover:bg-transparent">
              {["Client Name", "Contact", "Email", "Created"].map((h) => (
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
            {[1].length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="px-5 py-12 text-center text-gray-700 text-sm"
                >
                  No customers available
                </TableCell>
              </TableRow>
            ) : (
              [1].map((customer) => (
                <TableRow
                  key={customer}
                  onClick={() => {}}
                  className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  <TableCell className=" px-5 py-4 text-[#ff6b81] font-semibold text-sm">
                    asd
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-500 text-sm whitespace-nowrap">
                    asd
                  </TableCell>
                  <TableCell className="break-words px-5 py-4 text-gray-400 text-sm ">
                    asd
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">
                    asd
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
