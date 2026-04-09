"use client";

import { CheckCircle2, Users } from "lucide-react";
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
  CustomerTableResponse,
  getCustomerList,
  IPaginatedCustomers,
} from "../actions/getCustomerList";
import TableSkeleton from "./TableSkeleton";

const TABLE_HEADER = ["Client Name", "Contact", "Email", "Created", "Status"];

const RecentCustomers = () => {
  const [customers, setCustomers] = useState<CustomerTableResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState<number | "">(page);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = () => {
      setIsLoading(true);
      getCustomerList(page, PAGE_LIMIT).then((result: IPaginatedCustomers) => {
        setCustomers(result.data);
        setTotalPages(result.totalPages);
        setIsLoading(false)
      });
    };
    init();
  }, [page]);

  return (
    <section className="mb-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">Customer List</h2>
            <p className="text-gray-600 text-xs">
              {customers.length} records shown
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton tableHeader={TABLE_HEADER} wideColumns={[0]} pillColumns={[4]} />
      ) : (
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-white/[0.06] hover:bg-transparent">
                {TABLE_HEADER.map((h) => (
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
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="px-5 py-12 text-center text-gray-700 text-sm"
                  >
                    No customers available
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow
                    key={customer._id}
                    onClick={() =>
                      router.push(`/admin/customer/${customer._id}`)
                    }
                    className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <TableCell className=" px-5 py-4 text-[#ff6b81] font-semibold text-sm">
                      {customer.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-sm whitespace-nowrap">
                      {customer.contact_number}
                    </TableCell>
                    <TableCell className="break-words px-5 py-4 text-gray-400 text-sm ">
                      {customer.email ?? "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 text-sm whitespace-nowrap">
                      {new Date(customer.created_at).toLocaleString(
                        "en-US",
                        TABLE_DATE_FORMAT,
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {customer.is_verify ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                            Verified
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-500/10 border border-gray-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            Pending
                          </span>
                        </div>
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
    </section>
  );
};

export default RecentCustomers;
