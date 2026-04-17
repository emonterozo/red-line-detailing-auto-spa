import { toast } from "sonner";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

const config: Record<
  ToastType,
  {
    icon: React.ReactNode;
    label: string;
    iconBg: string;
    iconBorder: string;
    iconColor: string;
    bar: string;
    labelColor: string;
  }
> = {
  success: {
    icon: <CheckCircle2 className="w-[17px] h-[17px]" />,
    label: "Success",
    iconBg: "bg-emerald-500/10",
    iconBorder: "border-emerald-500/20",
    iconColor: "text-emerald-400",
    bar: "bg-emerald-500",
    labelColor: "text-emerald-400",
  },
  error: {
    icon: <XCircle className="w-[17px] h-[17px]" />,
    label: "Error",
    iconBg: "bg-[#dc143c]/10",
    iconBorder: "border-[#dc143c]/20",
    iconColor: "text-[#ff6b81]",
    bar: "bg-[#dc143c]",
    labelColor: "text-[#ff6b81]",
  },
  info: {
    icon: <Info className="w-[17px] h-[17px]" />,
    label: "Info",
    iconBg: "bg-sky-500/10",
    iconBorder: "border-sky-500/20",
    iconColor: "text-sky-400",
    bar: "bg-sky-400",
    labelColor: "text-sky-400",
  },
  warning: {
    icon: <AlertTriangle className="w-[17px] h-[17px]" />,
    label: "Warning",
    iconBg: "bg-amber-500/10",
    iconBorder: "border-amber-500/20",
    iconColor: "text-amber-400",
    bar: "bg-amber-400",
    labelColor: "text-amber-400",
  },
};

export function showToast(message: string, type: ToastType = "success") {
  const c = config[type];

  toast.custom(
    (t) => (
      <div className="relative flex items-center gap-3 w-[360px] bg-[#0c0c0c] border border-white/[0.09] rounded-[18px] px-4 py-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden animate-in slide-in-from-right-4 duration-300">
        {/* icon */}
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border ${c.iconBg} ${c.iconBorder} ${c.iconColor}`}
        >
          {c.icon}
        </div>

        {/* text */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-[10px] font-black uppercase tracking-[0.25em] mb-1 leading-none ${c.labelColor}`}
          >
            {c.label}
          </p>
          <p className="text-[13px] font-medium text-white/90 leading-tight tracking-tight break-words whitespace-normal">
            {message}
          </p>
        </div>

        {/* close */}
        <button
          onClick={() => toast.dismiss(t)}
          className="flex-shrink-0 w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/30 hover:text-white/60 hover:bg-white/[0.08] flex items-center justify-center transition-all"
        >
          <X className="w-3 h-3" />
        </button>

        {/* progress bar */}
        <div
          className={`absolute bottom-0 left-0 h-[2px] ${c.bar} rounded-r`}
          style={{ animation: "shrinkBar 5s linear forwards" }}
        />
      </div>
    ),
    { position: "bottom-right", duration: 5000 },
  );
}
