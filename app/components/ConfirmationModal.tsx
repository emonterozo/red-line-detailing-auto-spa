import { X } from "lucide-react";

type ConfirmationModalProps = {
  isVisible: boolean;
  chipTitle?: string;
  title: string;
  subTitle: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmationModal = ({
  isVisible,
  chipTitle,
  title,
  subTitle,
  description,
  onCancel,
  onConfirm,
}: ConfirmationModalProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <button onClick={onCancel} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-[#0c0c0c] border border-white/10 rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="h-[3px] bg-gradient-to-r from-[#dc143c] via-[#ff6b81] to-transparent flex-shrink-0" />
        <div className="px-7 pt-6 pb-5 border-b border-white/[0.07] flex items-start justify-between gap-4 flex-shrink-0">
          <div>
            {chipTitle && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dc143c]/12 border border-[#dc143c]/25 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dc143c]" />
                <span className="text-[10px] font-bold text-[#ff6b81] uppercase tracking-widest">
                  {chipTitle}
                </span>
              </div>
            )}
            <h2 className="text-[22px] font-extrabold text-white tracking-tight leading-tight mb-1">
              {title}
            </h2>
            <p className="text-xs text-white/30">{subTitle}</p>
          </div>
          <button onClick={onCancel} className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-200 group">
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
        <div className="p-8">
          <p className="text-white/70 text-[20px] font-medium leading-tight tracking-tight">
            {description}
          </p>
        </div>

        <div className="px-7 pb-6 pt-4 border-t border-white/[0.07] bg-[#080808] flex-shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onCancel}
              className="h-[52px] px-5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white/60 hover:text-white font-bold text-sm rounded-2xl transition-all duration-200 active:scale-[0.98]"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className="group flex items-center justify-center h-[52px] px-5 bg-[#dc143c] hover:bg-[#c01236] active:scale-[0.95] rounded-2xl transition-all duration-200 shadow-lg shadow-[#dc143c]/20 overflow-hidden relative"
            >
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

              <div className="flex items-center gap-2 relative">
                <span className="text-white font-extrabold text-sm tracking-wide">
                  Confirm
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
