import { ChevronDown } from "lucide-react";

export function SelectTrigger({
  hasValue,
  children,
}: Readonly<{
  hasValue: boolean;
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`w-full h-12 px-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 group
        ${
          hasValue
            ? "bg-white/[0.06] border-white/20 text-white"
            : "bg-white/[0.02] border-white/10 text-gray-500 hover:border-white/20"
        }`}
    >
      <div className="flex-1 min-w-0 overflow-hidden flex items-center">
        {children}
      </div>
      <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors flex-shrink-0 ml-2" />
    </div>
  );
}