import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  tableHeader: string[];
  rowCount?: number;
  wideColumns?: number[];
  pillColumns?: number[];
}

const TableSkeleton = ({
  tableHeader,
  rowCount = 5,
  wideColumns = [],
  pillColumns = [],
}: TableSkeletonProps) => {
  const skeletonRows = Array.from({ length: rowCount }, (_, i) => `row-${i}`);

  return (
    <Table className="w-full ">
      <TableHeader>
        <TableRow className="border-b border-white/[0.06] hover:bg-transparent">
          {tableHeader.map((header) => (
            <TableHead
              key={header}
              className="px-5 py-3.5 text-gray-600 text-[10px] uppercase tracking-widest font-semibold whitespace-nowrap"
            >
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {skeletonRows.map((rowId) => (
          <TableRow
            key={rowId}
            className="border-b border-white/[0.04] hover:bg-transparent"
          >
            {tableHeader.map((header, colIndex) => (
              <TableCell key={`${rowId}-${header}`} className="px-5 py-4">
                {pillColumns.includes(colIndex) ? (
                  <Skeleton className="h-6 w-20 rounded-full bg-white/[0.08]" />
                ) : (
                  <Skeleton
                    className={`h-4 bg-white/[0.05] ${
                      wideColumns.includes(colIndex) ? "w-48" : "w-24"
                    }`}
                  />
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TableSkeleton;
