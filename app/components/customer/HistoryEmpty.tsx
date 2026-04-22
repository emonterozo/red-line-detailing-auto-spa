import { LucideIcon } from "lucide-react";

interface HistoryEmptyProps {
  title: string;
  icon: LucideIcon;
}

export const HistoryEmpty = ({ title, icon: Icon }: HistoryEmptyProps) => {
  return (
    <div className="p-5 rounded-3xl bg-[#111111] border border-dashed border-white/10 flex items-center justify-between shadow-md relative overflow-hidden">
      <div className="flex items-center gap-4 text-left relative z-10 opacity-50">
        <div className="p-3 rounded-xl bg-neutral-800 text-neutral-600">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-black text-neutral-400 leading-tight uppercase tracking-tighter">
            {title}
          </p>
          <p className="text-[10px] text-neutral-500 font-bold uppercase mt-0.5 tracking-widest">
            History is empty
          </p>
        </div>
      </div>
      <div className="text-right relative z-10">
        <p className="text-lg font-black text-neutral-800">₱0.00</p>
      </div>
    </div>
  );
};