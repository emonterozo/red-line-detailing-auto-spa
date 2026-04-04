"use client";

import { useEffect, useState } from "react";
import { X, ChevronRight, ArrowUpRight, Info, Car, Motorbike } from "lucide-react";
import Link from "next/link";

import SectionContainer from "./SectionContainer";
import { getServices, IServiceResponse } from "../actions/getServices";
import { ServiceType, VehicleType } from "@/lib/enums";
import { trackVisit } from "../actions/trackVisit";

const Services = () => {
  const [services, setServices] = useState<IServiceResponse[]>([]);
  const [isAddOnsVisible, setIsAddOnsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] =
    useState<IServiceResponse | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      await trackVisit();
      const response = await getServices();
      setServices(response);
    };

    fetchServices();
  }, []);

  return (
    <SectionContainer
      id="services"
      title="Our"
      secondaryTitle="Signature Services"
      description="Experience the pinnacle of automotive care with our meticulously crafted detailing packages."
    >
      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mx-4 md:mx-10">
        {services
          .filter((service) => service.type === ServiceType.SERVICE)
          .map((service, index) => (
            <div
              key={service._id}
              className="group relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 lg:p-10 hover:border-[#dc143c]/50 transition-all duration-700 hover:-translate-y-3"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#dc143c]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-[#dc143c]/10 border border-[#dc143c]/20 flex items-center justify-center">
                <span className="text-[#dc143c] font-bold text-lg">
                  {index + 1}
                </span>
              </div>

              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#dc143c] to-[#8b0000] flex items-center justify-center shadow-lg shadow-[#dc143c]/30 group-hover:shadow-[#dc143c]/50 transition-shadow duration-500">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>

              <h3 className="relative text-xl lg:text-xl font-bold text-white mb-4 group-hover:text-[#dc143c] transition-colors duration-300">
                {service.title}
              </h3>
              <p className="relative text-gray-400 text-base leading-relaxed mb-8">
                {service.description}
              </p>

              <button
                onClick={() => {
                  setSelectedService(service);
                  setIsModalOpen(true);
                }}
                className="relative inline-flex items-center justify-between w-full sm:w-auto sm:min-w-[180px] py-4 px-6 bg-white/5 hover:bg-[#dc143c] text-white font-bold rounded-xl transition-all duration-3₀₀ group-hover:shadow-[rgba(22₀,₂₀,₆₀,₀₃)] cursor-pointer"
              >
                <span>View Pricing</span>
                <ChevronRight className="w_₅ h_₅ group-hover:translate-x₁ transition-transform" />
              </button>
            </div>
          ))}
      </div>

      <div className="text-center mt-16">
        <div className="inline-flex flex-col sm:flex-row items-center gap-4">
          {!isAddOnsVisible && (
            <span className="text-gray-500 text-sm">Looking for more?</span>
          )}
          <button
            onClick={() => setIsAddOnsVisible(!isAddOnsVisible)}
            className="group inline-flex items-center gap-2 px-6 py-3 bg-transparent border border-[#dc143c]/50 hover:border-[#dc143c] text-[#dc143c] hover:text-white font-bold rounded-full transition-all duration-300"
          >
            {isAddOnsVisible
              ? "Hide Add Ons Services"
              : "View Add Ons Services"}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {isAddOnsVisible && (
        <div className="grid mt-16 grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mx-4 md:mx-10">
          {services
            .filter((service) => service.type === ServiceType.ADD_ONS)
            .map((service, index) => (
              <div
                key={service._id}
                className="group relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 lg:p-10 hover:border-[#dc143c]/50 transition-all duration-700 hover:-translate-y-3"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#dc143c]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-[#dc143c]/10 border border-[#dc143c]/20 flex items-center justify-center">
                  <span className="text-[#dc143c] font-bold text-lg">
                    {services.filter((s) => s.type === "service").length +
                      index +
                      1}
                  </span>
                </div>

                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#dc143c] to-[#8b0000] flex items-center justify-center shadow-lg shadow-[#dc143c]/30 group-hover:shadow-[#dc143c]/50 transition-shadow duration-500">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                </div>

                <h3 className="relative text-xl lg:text-xl font-bold text-white mb-4 group-hover:text-[#dc143c] transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="relative text-gray-400 text-base leading-relaxed mb-8">
                  {service.description}
                </p>

                <button
                  onClick={() => {
                    setSelectedService(service);
                    setIsModalOpen(true);
                  }}
                  className="relative inline-flex items-center justify-between w-full sm:w-auto sm:min-w-[180px] py-4 px-6 bg-white/5 hover:bg-[#dc143c] text-white font-bold rounded-xl transition-all duration-3₀₀ group-hover:shadow-[rgba(22₀,₂₀,₆₀,₀₃)] cursor-pointer"
                >
                  <span>View Pricing</span>
                  <ChevronRight className="w_₅ h_₅ group-hover:translate-x₁ transition-transform" />
                </button>
              </div>
            ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <button
            className="absolute inset-0 bg-black/88 backdrop-blur-xl"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-[#0c0c0c] border border-white/10 rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Top red line accent */}
            <div className="h-[3px] bg-gradient-to-r from-[#dc143c] via-[#ff6b81] to-transparent flex-shrink-0" />

            {/* Header */}
            <div className="px-7 pt-6 pb-5 border-b border-white/[0.07] flex items-start justify-between gap-4 flex-shrink-0">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dc143c]/12 border border-[#dc143c]/25 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#dc143c]" />
                  <span className="text-[10px] font-bold text-[#ff6b81] uppercase tracking-widest">
                    Service Pricing
                  </span>
                </div>
                <h2 className="text-[22px] font-extrabold text-white tracking-tight leading-tight mb-1">
                  {selectedService?.title}
                </h2>
                <p className="text-xs text-white/30">
                  Rates tailored to your vehicle size
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-200 group"
              >
                <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-7 py-5 space-y-2 custom-scrollbar scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {/* Column labels */}
              <div className="flex justify-between px-1 mb-3">
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                  Vehicle Class
                </span>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                  Price
                </span>
              </div>

              {selectedService && !selectedService.pricing_options ? (
                selectedService.pricing_per_sizes
                  .filter(item => item.type === VehicleType.CAR)
                  .map((item, idx) => {
                    const isFirst = false
                    return (
                      <div
                        key={item._id}
                        style={{ animationDelay: `${idx * 50}ms` }}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all duration-200 animate-in fade-in slide-in-from-left-3 group
                    ${
                      isFirst
                        ? "bg-[#dc143c]/8 border-[#dc143c]/25 hover:bg-[#dc143c]/12"
                        : "bg-white/[0.02] border-white/[0.07] hover:bg-white/[0.04] hover:border-white/15"
                    }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* icon box */}
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border
                      ${
                        isFirst
                          ? "bg-[#dc143c]/15 border-[#dc143c]/30"
                          : "bg-white/[0.04] border-white/[0.08]"
                      }`}
                          >
                            {item.type === VehicleType.CAR ? <Car
                              className={`w-4 h-4 ${isFirst ? "text-[#ff6b81]" : "text-white/35"}`}
                            /> : <Motorbike
                              className={`w-4 h-4 ${isFirst ? "text-[#ff6b81]" : "text-white/35"}`}
                            />}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-bold leading-none mb-0.5 ${isFirst ? "text-white" : "text-white/75"}`}
                            >
                              {item.description.toUpperCase()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isFirst && (
                            <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-[#dc143c]/15 border border-[#dc143c]/30 text-[#ff6b81]">
                              Popular
                            </span>
                          )}
                          <span
                            className={`text-lg font-extrabold tabular-nums ${isFirst ? "text-[#ff6b81]" : "text-white/75"}`}
                          >
                            ₱{item.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="py-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                  <span className="text-4xl font-extrabold text-white mb-2 tabular-nums">
                    ₱{selectedService?.price.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                    {selectedService?.pricing_options}
                  </span>
                </div>
              )}

              {/* Note */}
              {selectedService?.notes && (
                <div className="flex gap-3 items-start p-4 rounded-xl bg-[#dc143c]/5 border border-[#dc143c]/15 mt-2">
                  <Info className="w-3.5 h-3.5 text-[#dc143c] flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-white/35 leading-relaxed">
                    {selectedService.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="px-7 pb-6 pt-4 border-t border-white/[0.07] bg-[#080808] flex-shrink-0">
              <Link
                href="/booking"
                className="group flex items-center justify-between h-[52px] px-5 bg-[#dc143c] hover:bg-[#c01236] active:scale-[0.98] rounded-2xl transition-all duration-200 shadow-lg shadow-[#dc143c]/25 overflow-hidden relative"
              >
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <span className="text-white font-extrabold text-sm tracking-wide relative">
                  Book This Service
                </span>
                <div className="flex items-center gap-3 relative">
                  <span className="w-px h-5 bg-white/20" />
                  <ArrowUpRight className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </SectionContainer>
  );
};

export default Services;
