import { Input } from "@/components/ui/input";

export function Pagination({
  page,
  totalPages,
  inputPage,
  inputRef,
  setInputPage,
  setPage,
}: Readonly<{
  page: number;
  totalPages: number;
  inputPage: number | "";
  inputRef: React.RefObject<HTMLInputElement | null>;
  setInputPage: (v: number | "") => void;
  setPage: (v: number) => void;
}>) {
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
          onChange={(e) =>
            setInputPage(e.target.value === "" ? "" : Number(e.target.value))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              inputRef?.current?.blur();
              if (inputPage === "" || Number.isNaN(inputPage)) return;
              const val = Math.min(Math.max(inputPage, 1), totalPages);
              setPage(val);
              setInputPage(val);
            }
          }}
          onBlur={() => {
            if (inputPage === "" || Number.isNaN(inputPage)) {
              setInputPage(page);
              return;
            }
            const val = Math.min(Math.max(inputPage, 1), totalPages);
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
