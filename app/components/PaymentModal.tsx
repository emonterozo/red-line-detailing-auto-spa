import { QrCode, Download, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const PaymentModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const paymentMethods = [
    {
      id: "gcash",
      name: "GCash",
      qr: "/qr/gcash.png",
    },
    {
      id: "maya",
      name: "Maya",
      qr: "/qr/maya.png",
    },
    {
      id: "asd",
      name: "BPI",
      qr: "/qr/bpi.png",
    },
  ];

  const [selectedChannel, setSelectedChannel] = useState(paymentMethods[0]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const fileExtension = selectedChannel.qr.split(".").pop();

    const link = document.createElement("a");
    link.href = selectedChannel.qr;

    link.download = `${selectedChannel.name}_QR_RedLine.${fileExtension}`;

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <button
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-[#0c0c0c] border border-white/10 rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="h-[3px] bg-gradient-to-r from-[#dc143c] via-[#ff6b81] to-transparent flex-shrink-0" />
        <div className="px-7 pt-6 pb-5 border-b border-white/[0.07] flex items-start justify-between gap-4 flex-shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dc143c]/12 border border-[#dc143c]/25 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dc143c]" />
              <span className="text-[10px] font-bold text-[#ff6b81] uppercase tracking-widest">
                Payment Options
              </span>
            </div>
            <h2 className="text-[22px] font-extrabold text-white tracking-tight leading-tight mb-1">
              Payment Channel
            </h2>
            <p className="text-xs text-white/30">
              Here are the available payment channels you can choose from.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-200 group"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-nowrap overflow-x-auto gap-3 custom-scrollbar-thin">
          {paymentMethods.map((item) => (
            <button
              onClick={() => setSelectedChannel(item)}
              key={item.id}
              className={`flex-1 md:flex-1 flex-shrink-0 flex items-center justify-center px-3 py-2.5 rounded-xl border ${selectedChannel.id === item.id ? "bg-[#dc143c]/10 border-[#dc143c]/20" : "bg-white/[0.02] border-white/[0.07]"} hover:bg-[#dc143c]/10 hover:border-[#dc143c]/20 transition-all duration-300 group cursor-pointer min-w-[120px]`}
            >
              <div className="flex items-center gap-5">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  <QrCode
                    className={`w-3.5 h-3.5 ${selectedChannel.id === item.id ? "text-[#ff6b81]" : "text-white/100"} group-hover:text-[#ff6b81] transition-colors`}
                  />
                </div>
                <p
                  className={`text-[12px] font-bold ${selectedChannel.id === item.id ? "text-[#ff6b81]" : "text-white/100"} uppercase tracking-wider group-hover:text-[#ff6b81] transition-colors`}
                >
                  {item.name}
                </p>
              </div>
            </button>
          ))}
        </div>
        <div className="px-7 py-6">
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="relative group mx-auto w-fit">
              <div className="absolute -inset-4 bg-[#dc143c]/10 rounded-full blur-3xl opacity-50" />
              <div className="relative bg-white p-4 rounded-3xl shadow-2xl shadow-black">
                <Image
                  src={selectedChannel.qr}
                  alt={`${selectedChannel.name} Payment QR`}
                  width={500}
                  height={500}
                  priority
                  className="object-contain w-[200px] md:w-[250px] h-auto transition-all duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-7 pb-6 pt-4 border-t border-white/[0.07] bg-[#080808] flex-shrink-0">
          <button
            onClick={handleDownload}
            className="w-full group flex items-center justify-between h-[52px] px-5 bg-[#dc143c] hover:bg-[#c01236] active:scale-[0.98] rounded-2xl transition-all duration-200 shadow-lg shadow-[#dc143c]/25 overflow-hidden relative"
          >
            <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <span className="text-white font-extrabold text-sm tracking-wide relative">
              Download QR Code
            </span>
            <div className="flex items-center gap-3 relative">
              <span className="w-px h-5 bg-white/20" />
              <Download className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
