export const HistorySkeleton = ({ color }: { color: string }) => {
  return (
    <div className="p-5 rounded-3xl bg-[#111111] border border-white/5 flex items-start justify-between shadow-md relative overflow-hidden">
      <div className="absolute inset-0 translate-x-[-100%] animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="flex items-start gap-4 text-left relative z-10 w-full">
        <div className="p-3 rounded-xl bg-white/5 w-11 h-11 shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 bg-white/10 rounded-md w-3/4" />
          <div className="h-3 bg-white/5 rounded-md w-1/2" />
        </div>
      </div>
      <div className="pl-4 pt-0.5 shrink-0">
        <div className={`h-6 bg-[${color}]/20 rounded-lg w-16`} />
      </div>
    </div>
  );
};