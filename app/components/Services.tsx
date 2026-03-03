"use client";

import { useEffect, useState } from "react";
import { X, ChevronRight } from "lucide-react";
import Link from "next/link";

import SectionContainer from "./SectionContainer";
import { getServices, IServiceResponse } from "../actions/getServices";
import { ServiceType } from "@/lib/enums";

const Services = () => {
  const [services, setServices] = useState<IServiceResponse[]>([]);
  const [isAddOnsVisible, setIsAddOnsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] =
    useState<IServiceResponse | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <button
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></button>

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#dc143c]/5 via-transparent to-transparent pointer-events-none"></div>

            {/* Header */}
            <div className="relative p-8 pb-4 flex justify-between items-center border-b border-white/[0.08]">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Service Pricing
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Prices by vehicle size and type
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Table Content */}
            <div className="relative p-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="pb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="pb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Vehicle Type
                    </th>
                    <th className="pb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">
                      Price
                    </th>
                  </tr>
                </thead>
                {selectedService && selectedService.pricing_per_sizes.length > 0 ? (
                  <tbody className="divide-y divide-white/[0.05]">
                    {selectedService.pricing_per_sizes.map((item) => (
                      <tr
                        key={item._id}
                        className="group hover:bg-white/[0.02] transition-colors duration-300"
                      >
                        <td className="py-5 pl-2">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#dc143c]/10 text-[#dc143c] font-bold text-sm border border-[#dc143c]/20">
                            {item.size.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-5">
                          <span className="text-sm md:text-base text-white font-medium group-hover:text-[#dc143c] transition-colors duration-300">
                            {item.vehicle.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-5 pr-2 text-right">
                          <span className="text-lg font-bold text-white group-hover:text-[#dc143c] transition-colors duration-300">
                            {`₱${item.price.toLocaleString()}`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <tbody className="divide-y divide-white/[0.05]">
                    <tr className="group hover:bg-white/[0.02] transition-colors duration-300">
                      <td colSpan={3} className="py-5 text-center">
                        <span className="inline-flex items-center justify-center w-full text-sm md:text-base text-white font-medium group-hover:text-[#dc143c] transition-colors duration-300">
                          {`Uniform rate of ₱${selectedService?.price.toLocaleString()} ${selectedService?.pricing_options} across all vehicles sizes`}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>

            {/* Footer */}
            <div className="relative p-6 pt-0 mt-2">
              <Link
                href="/booking"
                className="w-full py-4 px-6 rounded-xl bg-[#dc143c] hover:bg-red-700 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(220,20,60,0.3)] hover:shadow-[0_0_40px_rgba(220,20,60,0.5)] hover:-translate-y-0.5 flex items-center justify-center"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </SectionContainer>
  );
};

export default Services;
